import asyncio
import json
import shutil
import time

from pathlib import Path

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException

from .. import pipeline
from ..auth.session import admin
from ..config import MEDIA
from ..db import get_db, opened
from ..party.state import party
from .remove import stop_party_if_playing
from .tree import node

router = APIRouter()

ONE_AT_A_TIME = asyncio.Semaphore(1)

# node id -> {name, state: queued|running, since, done, total}; read by the status page
active: dict[int, dict] = {}


def fail_interrupted():
    with opened() as db: # restart killed it
        db.execute(
            "UPDATE node SET status='failed', error='interrupted by restart' "
            "WHERE status='processing'"
        )
        db.commit()


async def _encode(db, node_id: int):
    node_row = db.execute(
        "SELECT name, file_path FROM node WHERE id=?", (node_id,)
    ).fetchone()
    job = active[node_id] = {"name": node_row["name"], "state": "queued", "since": time.time(), "done": 0, "total": 0,}

    def progress(done, total):
        job.update(done=done, total=total)

    async with ONE_AT_A_TIME: # enconding with one semaphore only
        job.update(state="running", since=time.time())
        meta = await pipeline.process(Path(node_row["file_path"]), MEDIA/str(node_id)/"hls", progress)

    db.execute(
        "UPDATE node SET status='ready', error=NULL, meta=? WHERE id=?", (json.dumps(meta), node_id)
    )


async def process(node_id: int):
    with opened() as db:
        try:
            await _encode(db, node_id)
        except Exception as error:
            db.execute(
                "UPDATE node SET status='failed', error=? WHERE id=?", (str(error)[-500:], node_id)
            )

        active.pop(node_id, None)
        db.commit()


@router.post("/nodes/{node_id}/retry")
async def retry(node_id: int, background: BackgroundTasks, _=Depends(admin), db=Depends(get_db)):
    found_node = node(db, node_id)

    if found_node["is_folder"] or found_node["status"] == "processing" or node_id in active:
        raise HTTPException(409, "nothing to retry")

    if not found_node["file_path"] or not Path(found_node["file_path"]).exists():
        raise HTTPException(409, "source file is gone, upload again")

    await stop_party_if_playing([node_id])  # a Media being re-encoded cannot play
    shutil.rmtree(MEDIA/str(node_id)/"hls", ignore_errors=True)  # rm -r partial or old output

    db.execute("UPDATE node SET status='processing', error=NULL WHERE id=?", (node_id,))
    db.commit()
    background.add_task(process, node_id)
