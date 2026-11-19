import os
import time

from ..config import MEDIA

REFRESH = 60  # seconds

_cache = {"at": 0.0, "bytes": 0}


def _walk() -> int:
    total = 0

    for folder, _, files in os.walk(MEDIA):
        for name in files:
            try:
                total += os.path.getsize(os.path.join(folder, name))
            except OSError:
                pass

    return total


def media_bytes() -> int:
    if time.time() - _cache["at"] > REFRESH: # since it's expensive, do it once in a while
        _cache.update(at=time.time(), bytes=_walk())

    return _cache["bytes"]
