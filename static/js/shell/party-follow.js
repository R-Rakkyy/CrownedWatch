import { setPlaying } from "./header.js"

const RETRY_MS = 2000

function connect() {
    const scheme = location.protocol === "https:" ? "wss" : "ws"
    const socket = new WebSocket(`${scheme}://${location.host}/ws/party`)

    socket.onmessage = event => {
        const party = JSON.parse(event.data)
        setPlaying(!!(party.media_id && party.playing))
    }
    socket.onclose = () => setTimeout(connect, RETRY_MS)
}

// Follow the Party read-only. The player page has its own connection.
if (location.pathname !== "/watch") connect()
