import { video } from "../elements.js"
import { saveProgress } from "../progress.js"
import { state } from "../state.js"
import { send } from "./socket.js"
import { DRIFT, expected, sync } from "./sync.js"

const SEEK_GUARD_MS = 4000

// Local actions only speak when they differ from the server state,

video.onplay = () => state.loaded && !state.party.playing && send({ type: "play" })

video.onpause = () => {
    if (!state.loaded) return
    if (state.party.playing && !video.ended) send({ type: "pause" })
    saveProgress()
}

video.onended = () => state.party?.playing && send({ type: "pause" })

video.onseeking = () => {
    if (!state.loaded || Math.abs(video.currentTime - expected()) <= DRIFT) return

    state.seekGuard = Date.now() + SEEK_GUARD_MS
    send({ type: "seek", position: video.currentTime })
}

video.onloadedmetadata = () => {
    state.loaded = true
    video.currentTime = expected()
    sync()
}
