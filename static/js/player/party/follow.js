import { video } from "../elements.js"
import { openMedia } from "../media.js"
import { state } from "../state.js"
import { paintWait } from "./buffering.js"
import { playMedia } from "./load.js"
import { connect } from "./socket.js"
import { sync } from "./sync.js"

function requestWantedMedia(party) {
    const id = state.wanted
    if (!id) return false

    state.wanted = null
    history.replaceState(null, "", "/watch")
    if (party.media_id === id) return false

    playMedia(id, false)
    return true
}

function onPartyState(party) {
    document.querySelector("#loading").hidden = true
    state.party = party
    state.partyAt = Date.now()
    paintWait()

    if (Math.abs(party.position - video.currentTime) < 2) state.seekGuard = 0

    if (!party.media_id && !state.wanted) document.querySelector("#idle").hidden = false
    if (requestWantedMedia(party)) return
    if (party.media_id !== state.id) openMedia(party.media_id)
    else sync()
}

export const followParty = () => connect(onPartyState)
