import sqlite3

from contextlib import contextmanager

from .config import DATA

SCHEMA = """
CREATE TABLE IF NOT EXISTS node (
    id INTEGER PRIMARY KEY,
    parent_id INTEGER REFERENCES node(id),
    name TEXT NOT NULL,
    is_folder INTEGER NOT NULL,
    file_path TEXT,                         -- original upload; NULL once archived
    status TEXT NOT NULL DEFAULT 'ready',   -- processing | ready | failed
    error TEXT,
    meta TEXT,                              -- ffprobe json: duration, audio/subtitle tracks
    archived INTEGER NOT NULL DEFAULT 0,
    position REAL NOT NULL DEFAULT 0,
    UNIQUE (parent_id, name)
);

CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY,
    node_id INTEGER NOT NULL REFERENCES node(id) ON DELETE CASCADE,
    event TEXT NOT NULL,                    -- uploaded | archived | watched
    user TEXT,
    at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
"""


def connect(path: str = str(DATA/"crownedwatch.db")) -> sqlite3.Connection:
    # one connection per request, never shared
    db = sqlite3.connect(path, check_same_thread=False)

    db.row_factory = sqlite3.Row
    db.execute("PRAGMA foreign_keys = ON")
    db.executescript(SCHEMA)

    return db


@contextmanager
def opened():
    db = connect()

    try:
        yield db
    finally:
        db.close()


# FastAPI dependency: one connection for the length of a request
def get_db():
    with opened() as db:
        yield db
