import os
import platform
import shutil
import time

from fastapi import APIRouter, Depends

from ..auth import users
from ..auth.session import admin
from ..db import opened
from ..library.jobs import active
from ..party.state import party
from . import library_stats, proc
from .media_size import media_bytes

router = APIRouter(prefix="/api")

STARTED = time.time()


def _host() -> dict:
    return {
        "os": platform.platform(),
        "cores": os.cpu_count(),
        "load": os.getloadavg(),
        "uptime": proc.uptime(),
        "cpu": proc.cpu(),
        "mem": proc.memory(),
        "net": proc.network(),
    }


def _disk() -> dict:
    return {**shutil.disk_usage(".")._asdict(), "media": media_bytes()}


def _app(now: float) -> dict:
    return {
        "pid": os.getpid(),
        "python": platform.python_version(),
        "uptime": now - STARTED,
        **proc.this_process(),
    }


def _party(playing: str | None) -> dict:
    return {
        "media": playing,
        "playing": party.playing,
        "position": party.now(),
        "watching": len(party.players),
        "connected": len(party.clients),
    }


def _jobs(now: float) -> list[dict]:
    return [
        {"id": node_id, **job, "elapsed": now - job["since"]}
        for node_id, job in list(active.items())
    ]


@router.get("/status")
def status(_=Depends(admin)):
    with opened() as db:
        counts = library_stats.counts(db)
        failed = library_stats.failed(db)
        playing = library_stats.name_of(db, party.media_id)

    now = time.time()

    return {
        "now": now,
        "host": _host(),
        "disk": _disk(),
        "app": _app(now),
        "party": _party(playing),
        "jobs": _jobs(now),
        "counts": counts,
        "users": len(users.listing()),
        "failed": failed,
    }
