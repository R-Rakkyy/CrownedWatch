import os
import secrets

from pathlib import Path

DATA = Path(os.environ.get("CROWNED_DATA", "data"))
DATA.mkdir(parents=True, exist_ok=True)

MEDIA = DATA/"media"

# unset for local http dev.
HTTPS_ONLY = bool(os.environ.get("CROWNED_HTTPS"))


def secret_key() -> str:
    path = DATA/"secret.key"

    if not path.exists():
        path.write_text(secrets.token_hex(32))

    return path.read_text()
