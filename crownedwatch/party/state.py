import time

from fastapi import WebSocket


class Party:
    def __init__(self):
        self.media_id: int | None = None
        self.position = 0.0
        self.playing = False
        self.stamp = time.monotonic()
        self.clients: set[WebSocket] = set()

        # open player pages; other clients only follow the state
        self.players: set[WebSocket] = set()

        # players whose picture is stalled -> user name (for display purposes)
        self.waiting: dict[WebSocket, str] = {}
        self.held = False

    def now(self) -> float:
        elapsed = time.monotonic() - self.stamp

        return self.position + (elapsed if self.playing else 0)

    def state(self) -> dict:
        return {
            "media_id": self.media_id,
            "position": self.now(),
            "playing": self.playing,
            "waiting": sorted(self.waiting.values()),
        }

    def apply(self, message: dict):
        position = self.now()

        match message.get("type"):
            case "load":
                self.media_id = int(message["media_id"])
                self.playing = False
                self._forget_stalls()
                position = max(float(message.get("position", 0)), 0)

            case "unload":
                self.media_id = None
                self.playing = False
                self._forget_stalls()
                position = 0.0

            case "play":
                # with somebody waiting, play starts as soon as they are ready
                self.playing = not self.waiting
                self.held = bool(self.waiting)

            case "pause":
                self.playing = self.held = False

            case "seek":
                position = float(message["position"])

        self.position = position
        self.stamp = time.monotonic()

    def _forget_stalls(self):
        self.waiting.clear()
        self.held = False

    def stall(self, websocket: WebSocket, name: str, is_stalled: bool):
        if is_stalled and websocket in self.players:
            self.waiting[websocket] = name
            self._suspend()
        elif not is_stalled:
            self.waiting.pop(websocket, None)
            self._resume()

    def _suspend(self):
        if self.playing:
            self.position = self.now()
            self.stamp = time.monotonic()
            self.playing = False
            self.held = True

    def _resume(self):
        if self.held and not self.waiting:
            self.stamp = time.monotonic()
            self.playing = True
            self.held = False

    async def broadcast(self):
        data = self.state()

        for websocket in list(self.clients):
            try:
                await websocket.send_json(data)
            except Exception:
                self._drop(websocket)

    def _drop(self, websocket: WebSocket):
        self.clients.discard(websocket)
        self.players.discard(websocket)

    async def join(self, websocket: WebSocket, player: bool):
        self.clients.add(websocket)

        if player:
            self.players.add(websocket)

        await websocket.send_json(self.state())

    async def leave(self, websocket: WebSocket):
        was_player = websocket in self.players

        self._drop(websocket)
        self.waiting.pop(websocket, None)
        self._resume()

        if not was_player:
            return

        if not self.players and (self.playing or self.held): # no more players, stop
            self.apply({"type": "pause"})

        await self.broadcast()


party = Party()  # me asf when car = new car;
