import json

from pathlib import Path

from fastapi import APIRouter, Depends

from .. import pipeline
from ..auth.session import admin, user
from ..config import MEDIA
from ..db import get_db
from .names import natural
from .tree import node
from .view import breadcrumbs, load_meta, neighbours, public_node

router = APIRouter()


def _where(parent_id, archived: bool) -> tuple[str, tuple]:
    if not archived:
        return "parent_id IS ? AND archived=0", (parent_id,)

    if parent_id is None:
        # top of the Archive: archived things whose Folder is not itself archived
        return (
            "archived=1 AND (parent_id IS NULL OR parent_id NOT IN "
            "(SELECT id FROM node WHERE archived=1))",
            (),
        )

    return "parent_id=?", (parent_id,)


@router.get("/medias")
def listing(parent_id: int | None = None, archived: bool = False, _=Depends(user), db=Depends(get_db)):
    where, args = _where(parent_id, archived)
    nodes = db.execute(f"SELECT * FROM node WHERE {where}", args)
    ordered = sorted(
        nodes, key=lambda node_row: (not node_row["is_folder"], natural(node_row["name"]))
    )

    return {
        "path": breadcrumbs(db, parent_id),
        "items": [public_node(node_row, db) for node_row in ordered],
    }


async def _backfill(db, found_node, meta: dict) -> dict:
    hls = MEDIA/str(found_node["id"])/"hls"

    try:
        await pipeline.backfill(Path(found_node["file_path"]), hls, meta)
    except Exception:
        meta.setdefault("chapters", [])
        meta["fonts"] = []  # don't retry on every visit

    db.execute("UPDATE node SET meta=? WHERE id=?", (json.dumps(meta), found_node["id"]))
    db.commit()

    return meta


@router.get("/nodes/{node_id}")
async def detail(node_id: int, _=Depends(user), db=Depends(get_db)):
    found_node = node(db, node_id)
    public = public_node(found_node, db)
    meta = load_meta(found_node)

    if meta and "fonts" not in meta and found_node["file_path"]:
        meta = await _backfill(db, found_node, meta)

    public["meta"] = meta

    if not found_node["is_folder"]:
        public.update(neighbours(db, found_node))

    return public


@router.get("/folders")
def folders(_=Depends(admin), db=Depends(get_db)): # every folder in the system, with its path from the root
    folder_rows = {
        folder["id"]: folder
        for folder in db.execute(
            "SELECT id, parent_id, name FROM node WHERE is_folder=1 AND archived=0"
        )
    }

    def path(folder_id) -> str:
        parent_id = folder_rows[folder_id]["parent_id"]
        prefix = path(parent_id) + "/" if parent_id in folder_rows else ""

        return prefix + folder_rows[folder_id]["name"]

    entries = ({"id": folder_id, "path": path(folder_id)} for folder_id in folder_rows)

    return sorted(entries, key=lambda folder: folder["path"].lower())
