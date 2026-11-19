from fastapi import HTTPException

from ..db import opened


def node(db, node_id: int):
    found_node = db.execute("SELECT * FROM node WHERE id=?", (node_id,)).fetchone()

    if not found_node:
        raise HTTPException(404)

    return found_node


def find(db, parent_id, name):
    return db.execute(
        "SELECT * FROM node WHERE parent_id IS ? AND name=?", (parent_id, name)
    ).fetchone()


def check_parent(db, parent_id):
    if parent_id is not None and not node(db, parent_id)["is_folder"]:
        raise HTTPException(400, "parent is not a folder")


def unarchive_up(db, node_id):
    while node_id is not None:
        db.execute("UPDATE node SET archived=0 WHERE id=?", (node_id,))
        node_id = node(db, node_id)["parent_id"]


def descendants(db, node_id: int) -> list[int]:
    rows = db.execute(
        """WITH RECURSIVE subtree(id) AS (
               SELECT ?
               UNION ALL
               SELECT child.id FROM node child JOIN subtree ON child.parent_id = subtree.id
           )
           SELECT id FROM subtree""",
        (node_id,),
    )

    return [row[0] for row in rows] # it also returns the node itself btw


def is_ready(node_id: int) -> bool:
    with opened() as db:
        found_node = db.execute(
            "SELECT 1 FROM node WHERE id=? AND is_folder=0 AND status='ready' AND archived=0",
            (node_id,),
        ).fetchone()

    return bool(found_node)
