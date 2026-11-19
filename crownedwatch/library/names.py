import re

from fastapi import HTTPException


def natural(name: str) -> list:
    parts = re.split(r"(\d+)", name)

    return [int(part) if part.isdigit() else part.lower() for part in parts]


def clean(name: str) -> str:
    name = name.strip()

    if not name or name in (".", "..") or re.search(r"[/\\\x00]", name):
        raise HTTPException(400, "bad name")

    return name
