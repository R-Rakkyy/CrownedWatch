import { esc } from "../lib/dom.js"
import { clock } from "./format.js"
import { kv, panel } from "./html.js"

function currentMedia(party) {
    if (!party.media) return "<small>Nothing loaded.</small>"

    return kv("Media", esc(party.media)) +
        kv("State", party.playing ? "playing" : "paused") +
        kv("Position", clock(party.position))
}

export function partyPanel(status) {
    const party = status.party

    return panel("Watch Party",
        currentMedia(party) +
        kv("Player pages open", party.watching) +
        kv("Connections", party.connected))
}
