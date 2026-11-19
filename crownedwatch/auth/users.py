import hashlib
import hmac
import json
import secrets

from ..config import DATA

USERS = DATA/"users.json"
ROLES = ("admin", "guest")


# keys are stored as scrypt hashes
def _hash(key: str, salt: bytes) -> str:
    return hashlib.scrypt(key.encode(), salt=salt, n=2**14, r=8, p=1).hex()


def _load() -> dict:
    return json.loads(USERS.read_text()) if USERS.exists() else {}


def _save(users: dict):
    USERS.write_text(json.dumps(users, indent=2))


def _admins(users: dict) -> int:
    return sum(user["role"] == "admin" for user in users.values())


def _is_last_admin(users: dict, name: str) -> bool:
    is_admin = users.get(name, {}).get("role") == "admin"

    return is_admin and _admins(users) == 1


def verify(name: str, key: str) -> str | None:
    user = _load().get(name)

    if not user:
        # keep the timing similar for unknown names
        _hash(key, b"\0" * 16)
        return None

    hashed = _hash(key, bytes.fromhex(user["salt"]))

    return user["role"] if hmac.compare_digest(hashed, user["hash"]) else None


def role(name: str) -> str | None:
    user = _load().get(name)

    return user and user["role"]


def listing() -> list[dict]:
    return [{"name": name, "role": user["role"]} for name, user in _load().items()]


def add(name: str, role: str) -> str:
    name = name.strip()

    if role not in ROLES or not name:
        raise ValueError(f"need a name and a role in {ROLES}")

    users = _load()

    if role != "admin" and _is_last_admin(users, name):
        raise ValueError("cannot demote the last admin")

    key = secrets.token_urlsafe(24)
    salt = secrets.token_bytes(16)

    users[name] = {"role": role, "salt": salt.hex(), "hash": _hash(key, salt)}
    _save(users)

    return key


def remove(name: str):
    users = _load()

    if name not in users:
        raise KeyError(name)

    if _is_last_admin(users, name):
        raise ValueError("cannot remove the last admin")

    del users[name]
    _save(users)
