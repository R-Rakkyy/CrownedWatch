import { getJson } from "../../lib/api.js"
import { saveProgress } from "../progress.js"
import { state } from "../state.js"
import { send } from "./socket.js"

export async function playMedia(id, keepPlaying) {
    saveProgress()

    const node = await getJson(`/api/nodes/${id}`)
    const wasPlaying = state.party?.playing

    send({ type: "load", media_id: id, position: node.watched ? 0 : node.position })
    if (keepPlaying && wasPlaying) send({ type: "play" })
}
