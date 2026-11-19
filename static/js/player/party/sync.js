import { $ } from "../../lib/dom.js"
import { video } from "../elements.js"
import { state } from "../state.js"

const RESYNC_MS = 5000
export const DRIFT = 1.5 // maximum drift (sec)

export const expected = () =>
    state.party.position + (state.party.playing ? (Date.now() - state.partyAt) / 1000 : 0)

const askToJoin = () => { $("#join").hidden = false }

export function sync() {
    const party = state.party
    if (!state.loaded || !party || Date.now() < state.seekGuard) return

    if (Math.abs(video.currentTime - expected()) > DRIFT) video.currentTime = expected()
    if (party.playing && video.paused) video.play().catch(askToJoin)
    if (!party.playing && !video.paused) video.pause()
}

setInterval(sync, RESYNC_MS)
