import time

MAX_FAILS = 5 # tries
WINDOW = 300  # seconds

_fails: dict[str, list[float]] = {}


def _recent(client_ip: str) -> list[float]:
    now = time.time()

    attempts = _fails.get(client_ip, [])

    _fails[client_ip] = [attempt for attempt in attempts if now - attempt < WINDOW]

    return _fails[client_ip]


def blocked(client_ip: str) -> bool:
    return len(_recent(client_ip)) >= MAX_FAILS


def failed(client_ip: str):
    _recent(client_ip).append(time.time())


def forget(client_ip: str):
    _fails.pop(client_ip, None)
