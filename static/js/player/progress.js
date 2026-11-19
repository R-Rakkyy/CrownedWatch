import { api, json } from "../lib/api.js"
import { video } from "./elements.js"
import { state } from "./state.js"

const SAVE_MS = 10000

export function saveProgress() {
    if (!state.loaded || !state.id) return

    const options = { ...json("POST", { position: video.currentTime }), keepalive: true }
    api(`/api/nodes/${state.id}/progress`, options).catch(() => {})
}

setInterval(() => !video.paused && saveProgress(), SAVE_MS)
addEventListener("pagehide", saveProgress) // leaving the page keeps where we got to
