import { state } from "../state.js"

const RETRY_MS = 2000
let socket

export const send = message => socket?.readyState === 1 && socket.send(JSON.stringify(message))

export function connect(onState) {
    const scheme = location.protocol === "https:" ? "wss" : "ws"
    socket = new WebSocket(`${scheme}://${location.host}/ws/party?player=1`)

    socket.onmessage = event => onState(JSON.parse(event.data))
    socket.onclose = () => {
        state.holding = false
        setTimeout(() => connect(onState), RETRY_MS)
    }
}
