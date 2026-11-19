from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from ..auth.session import admin
from ..db import get_db
from .names import clean
from .tree import check_parent, descendants, find, node, unarchive_up

router = APIRouter()


class NewFolder(BaseModel):
    name: str
    parent_id: int | None = None


@router.post("/folders")
def new_folder(body: NewFolder, _=Depends(admin), db=Depends(get_db)):
    name = clean(body.name)

    check_parent(db, body.parent_id)

    if find(db, body.parent_id, name):
        raise HTTPException(409, "name already used here")

    cursor = db.execute(
        "INSERT INTO node(parent_id,name,is_folder) VALUES(?,?,1)", (body.parent_id, name)
    )
    unarchive_up(db, body.parent_id)
    db.commit()

    return {"id": cursor.lastrowid}


class Edit(BaseModel):
    name: str | None = None
    parent_id: int | None = None  # null = root


@router.patch("/nodes/{node_id}")
def edit(node_id: int, body: Edit, _=Depends(admin), db=Depends(get_db)):
    found_node = node(db, node_id)
    name = clean(body.name) if body.name is not None else found_node["name"]
    moved = "parent_id" in body.model_fields_set
    parent = body.parent_id if moved else found_node["parent_id"]

    check_parent(db, parent)

    if parent in descendants(db, node_id): # is he dumb
        raise HTTPException(400, "cannot move a folder into itself")

    if parent is not None and not found_node["archived"] and node(db, parent)["archived"]:
        raise HTTPException(409, "target is archived")

    same_name = find(db, parent, name)
    if same_name and same_name["id"] != node_id:
        raise HTTPException(409, "name already used here")

    db.execute("UPDATE node SET name=?, parent_id=? WHERE id=?", (name, parent, node_id))
    db.commit()
