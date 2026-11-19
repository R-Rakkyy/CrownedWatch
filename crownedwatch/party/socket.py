from urllib.parse import urlsplit

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from ..auth.session import current
from ..library.tree import is_ready
from .state import party

router = APIRouter()

MALFORMED = (KeyError, ValueError, TypeError, AttributeError)


def allowed(websocket: WebSocket) -> bool:
    if not current(websocket.session):
        return False

    origin = websocket.headers.get("origin")

    return not origin or urlsplit(origin).netloc == websocket.headers.get("host")


async def handle(websocket: WebSocket, message: dict):
    kind = message.get("type")

    if kind in ("wait", "ready"): # ask to wait or ready
        party.stall(websocket, websocket.session["user"]["name"], kind == "wait")

    elif kind == "load" and not is_ready(int(message["media_id"])):
        return  # unknown, archived or still processing: nothing to play

    else:
        party.apply(message)

    await party.broadcast()


async def receive(websocket: WebSocket):
    try:
        await handle(websocket, await websocket.receive_json())
    except MALFORMED:
        pass  # malformed message, ignore for now


@router.websocket("/ws/party")
async def party_socket(websocket: WebSocket):
    if not allowed(websocket):
        await websocket.close(code = 1008)
        return

    await websocket.accept()
    await party.join(websocket, websocket.query_params.get("player") == "1")

    try:
        while True:
            await receive(websocket)
    except WebSocketDisconnect:
        await party.leave(websocket)
