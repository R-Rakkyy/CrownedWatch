import { $ } from "../../lib/dom.js"
import { say } from "../announce.js"
import { fillList } from "../panel/choice-list.js"
import { state } from "../state.js"
import { label, rememberAudio } from "./labels.js"

function pickAudio(index) {
    if (!state.hls) return

    const track = state.audioTracks[index]
    state.hls.audioTrack = index
    rememberAudio(track)
    say(`Audio: ${label(track)}`)
}

export function fillAudioList(tracks, selected) {
    fillList($("#audio-list"), tracks.map(label), selected, pickAudio)
}
