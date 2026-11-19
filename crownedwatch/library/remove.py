import shutil

from fastapi import APIRouter, Depends

from ..auth.session import admin
from ..config import MEDIA
from ..db import get_db
from ..party.state import party
from .tree import descendants, node

router = APIRouter()


async def stop_party_if_playing(ids):
    if party.media_id in ids:
        party.apply({"type": "unload"})
        await party.broadcast()


def _drop_files(node_id: int):
    shutil.rmtree(MEDIA/str(node_id), ignore_errors=True)


@router.post("/nodes/{node_id}/archive")
async def archive(node_id: int, admin_user=Depends(admin), db=Depends(get_db)):
    node(db, node_id)
    ids = descendants(db, node_id) # archive a folder will archive all its children too

    for descendant_id in ids:
        descendant = node(db, descendant_id)

        if descendant["archived"]:
            continue

        if not descendant["is_folder"]:
            _drop_files(descendant_id)
            db.execute(
                "INSERT INTO history(node_id,event,user) VALUES(?,?,?)",
                (descendant_id, "archived", admin_user["name"]),
            )

        db.execute("UPDATE node SET archived=1, file_path=NULL WHERE id=?", (descendant_id,))

    db.commit()
    await stop_party_if_playing(ids)


@router.delete("/nodes/{node_id}")
async def delete(node_id: int, _=Depends(admin), db=Depends(get_db)):
    node(db, node_id)
    ids = descendants(db, node_id)

    for descendant_id in ids:
        _drop_files(descendant_id)

    # children first, reverse it
    db.executemany("DELETE FROM node WHERE id=?", [(each,) for each in reversed(ids)])
    db.commit()
    await stop_party_if_playing(ids)
