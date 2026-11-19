import { $, on } from "../../lib/dom.js"
import { me } from "../../lib/me.js"
import { bufferedEnd } from "../buffered.js"
import { duration } from "../duration.js"
import { video } from "../elements.js"
import { state } from "../state.js"
import { send } from "./socket.js"

const AHEAD = 20
const CHECK_MS = 500

me.then(user => { state.userName = user.name })

// Seconds of picture after the playhead.
function ahead() {
    const end = bufferedEnd(2)
    return end ? end - video.currentTime : 0
}

function waitText() {
    const others = (state.party?.waiting ?? []).filter(name => name !== state.userName)
    if (others.length) return `Waiting for ${others.join(", ")}…`

    const stalled = state.holding || (!video.paused && video.readyState < 3)
    return stalled ? "Loading…" : ""
}

export function paintWait() {
    const text = waitText()

    $("#wait").hidden = !text
    $("#wait").textContent = text
}

const hasEnoughAhead = () =>
    ahead() >= Math.min(AHEAD, duration() - video.currentTime - 1) || video.ended

on(video, "waiting", () => {
    if (state.loaded && state.party?.playing && !state.holding && ahead() < 1) { // the playhead is stalled
        state.holding = true
        send({ type: "wait" })
    }
    paintWait()
})

for (const event of ["playing", "canplay", "seeked"]) on(video, event, paintWait)

setInterval(() => {
    if (state.holding && hasEnoughAhead()) {
        state.holding = false
        send({ type: "ready" })
    } else if (!state.holding && state.party?.waiting?.includes(state.userName)) {
        send({ type: "ready" }) // best effort
    }
    paintWait()
}, CHECK_MS)
