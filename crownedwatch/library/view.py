import json

from pathlib import Path

from .names import natural
from .tree import node

WATCHED = 0.85  # past this share of the duration a Media counts as watched

PLAIN_FIELDS = ("id", "parent_id", "name", "archived", "status", "error", "position")


def load_meta(node_row) -> dict | None:
    return json.loads(node_row["meta"]) if node_row["meta"] else None


def public_node(node_row, db) -> dict:
    duration = (load_meta(node_row) or {}).get("duration")
    public = {field: node_row[field] for field in PLAIN_FIELDS}

    public["is_folder"] = bool(node_row["is_folder"])
    public["archived"] = bool(node_row["archived"])
    public["duration"] = duration
    public["ext"] = Path(node_row["file_path"]).suffix if node_row["file_path"] else ""

    # follows Progress, not the History
    public["watched"] = bool(duration) and node_row["position"] >= WATCHED * duration

    if node_row["is_folder"]:
        public["child_count"] = child_count(db, node_row)

    return public


def child_count(db, folder) -> int:
    return db.execute(
        "SELECT COUNT(*) FROM node WHERE parent_id=? AND archived=?",
        (folder["id"], folder["archived"]),
    ).fetchone()[0] # get the count from the first column of the first row


def breadcrumbs(db, parent_id) -> list[dict]:
    path = []

    while parent_id is not None:
        folder = node(db, parent_id)
        path.insert(0, {"id": folder["id"], "name": folder["name"]})
        parent_id = folder["parent_id"]

    return path


def neighbours(db, current) -> dict:
    siblings = sorted(
        db.execute(
            """SELECT id, name FROM node
               WHERE parent_id IS ? AND is_folder=0 AND archived=0 AND status='ready'""",
            (current["parent_id"],),
        ),
        key=lambda sibling: natural(sibling["name"]),
    )
    index = next(
        (position for position, sibling in enumerate(siblings) if sibling["id"] == current["id"]),
        None
    )
    has_next = index is not None and index + 1 < len(siblings)

    return {
        "prev": dict(siblings[index - 1]) if index else None,
        "next": dict(siblings[index + 1]) if has_next else None,
    }
