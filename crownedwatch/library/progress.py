from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from ..auth.session import user
from ..db import get_db
from .tree import node
from .view import WATCHED, load_meta

router = APIRouter()


class Progress(BaseModel):
    position: float


@router.post("/nodes/{node_id}/progress")
def progress(node_id: int, body: Progress, current_user=Depends(user), db=Depends(get_db)):
    found_node = node(db, node_id)

    if found_node["is_folder"]:
        raise HTTPException(400)

    duration = (load_meta(found_node) or {}).get("duration") or 0

    if duration and found_node["position"] < WATCHED * duration <= body.position:
        db.execute(
            "INSERT INTO history(node_id,event,user) VALUES(?,?,?)",
            (node_id, "watched", current_user["name"]),
        )

    db.execute("UPDATE node SET position=? WHERE id=?", (max(body.position, 0), node_id))
    db.commit()


@router.get("/history")
def history(node_id: int | None = None, _=Depends(user), db=Depends(get_db)):
    query = """SELECT h.at, h.event, h.user, n.name, n.id AS node_id
               FROM history h JOIN node n ON n.id = h.node_id"""
    args = ()

    if node_id:
        query += " WHERE n.id=?"
        args = (node_id,)

    rows = db.execute(query + " ORDER BY h.id DESC LIMIT 200", args)

    return [dict(event) for event in rows]
