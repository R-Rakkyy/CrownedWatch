import { $ } from "../../lib/dom.js"
import { store } from "../../lib/storage.js"
import { say } from "../announce.js"
import { subtitleForm } from "../elements.js"
import { fillList, markSelected } from "../panel/choice-list.js"
import { state } from "../state.js"
import { ass, freeAssTrack, startAss } from "./ass.js"
import { label, preferred, rememberSub } from "./labels.js"
import { renderCues, shiftCues } from "./subtitle-cues.js"

function useAss(index) {
    ass.active = index >= 0 && !!state.subTracks[index].ass && ass.mode === "styled"
    if (!ass.active) return

    try {
        startAss(state.subTracks[index])
    } catch (error) {
        console.error(error)
        ass.active = false
    }
}

function paintRendering() {
    const track = state.subTracks[state.currentSub]

    $("#rendering").hidden = !track?.ass
    $("#subrender").value = ass.mode
    for (const control of subtitleForm.elements) {
        if (control.name !== "offset" && control.type !== "button") control.disabled = ass.active
    }
}

export function showSub(index) {
    useAss(index)
    if (!ass.active) freeAssTrack()

    // "hidden" = loaded and firing cuechange, but not drawn by the browser
    state.trackEls.forEach((element, i) => {
        element.track.mode = i === index && !ass.active ? "hidden" : "disabled"
    })

    state.currentSub = index
    if (index >= 0) state.lastSub = index
    markSelected($("#sub-list"), index + 1)
    $("#cc").setAttribute("aria-pressed", index >= 0)
    
    paintRendering() // ass
    shiftCues() // cue times
    renderCues() // cue content when not ass
}

function pickSub(index) {
    const track = state.subTracks[index]

    showSub(index)
    rememberSub(track)
    say(track ? `Subtitles: ${label(track)}` : "Subtitles off")
}

function toggleSubs() {
    if (state.currentSub >= 0) return pickSub(-1)
    pickSub(state.lastSub >= 0 ? state.lastSub : preferred(state.subTracks))
}

export function fillSubList(subtitles, selected) {
    fillList($("#sub-list"), ["Off", ...subtitles.map(label)], selected + 1, i => pickSub(i - 1))
}

$("#cc").onclick = toggleSubs

$("#subrender").onchange = event => {
    ass.mode = event.target.value
    store("subrender", ass.mode)
    showSub(state.currentSub)
}
