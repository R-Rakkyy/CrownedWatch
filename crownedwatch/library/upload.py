import asyncio
import re
import shutil

from pathlib import Path

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request

from ..auth.session import admin
from ..config import MEDIA
from ..db import get_db
from .jobs import process
from .names import clean
from .tree import check_parent, find, unarchive_up

router = APIRouter()


def _extension(name: str) -> str:
    return re.sub(r"[^a-z0-9]", "", Path(name).suffix.lower()) or "bin"


def _slot(db, parent_id, stem: str):
    old = find(db, parent_id, stem)

    if old and (not old["archived"] or old["is_folder"]):
        raise HTTPException(409, "name already used here")

    return old


def _create(db, parent_id, stem: str) -> int:
    cursor = db.execute(
        "INSERT INTO node(parent_id,name,is_folder,status) VALUES(?,?,0,'processing')",
        (parent_id, stem),
    )

    return cursor.lastrowid


async def _write(request: Request, dest: Path):
    dest.parent.mkdir(parents=True, exist_ok=True)

    with dest.open("wb") as file:
        async for chunk in request.stream():
            await asyncio.to_thread(file.write, chunk) # off the event loop: a slow disk don't stall


@router.put("/upload")
async def upload(request: Request, background: BackgroundTasks, name: str, parent_id: int | None = None, admin_user=Depends(admin), db=Depends(get_db)):
    check_parent(db, parent_id)

    name = clean(name)
    stem = clean(Path(name).stem)
    old = _slot(db, parent_id, stem)
    node_id = old["id"] if old else _create(db, parent_id, stem)
    dest = MEDIA/str(node_id)/f"source.{_extension(name)}"

    try:
        await _write(request, dest)
    except BaseException:
        shutil.rmtree(dest.parent, ignore_errors=True)

        if not old:
            db.execute("DELETE FROM node WHERE id=?", (node_id,))
            db.commit()

        raise

    db.execute(
        "UPDATE node SET file_path=?, status='processing', error=NULL, archived=0 WHERE id=?",
        (str(dest), node_id),
    )
    unarchive_up(db, parent_id)
    db.execute(
        "INSERT INTO history(node_id,event,user) VALUES(?,?,?)",
        (node_id, "uploaded", admin_user["name"]),
    )
    db.commit()
    background.add_task(process, node_id)

    return {"id": node_id}
