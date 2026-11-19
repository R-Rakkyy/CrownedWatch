import { video, subsBox } from "../elements.js"
import { state } from "../state.js"
import { updateAssOffset } from "./ass.js"
import { label } from "./labels.js"

const currentTrack = () => state.trackEls[state.currentSub]?.track

// Those subtitles (Plain) are drawn my me. (This is default WebVTT)
export function renderCues() {
    subsBox.replaceChildren()

    const track = currentTrack()
    if (!track?.activeCues) return

    for (const cue of track.activeCues) {
        const line = document.createElement("div")

        line.className = "cue"
        line.append(cue.getCueAsHTML())
        subsBox.append(line)
    }
}

export function shiftCues() {
    updateAssOffset()

    const track = currentTrack()
    if (!track?.cues) return

    for (const cue of track.cues) {
        cue.original ??= [cue.startTime, cue.endTime]
        cue.startTime = Math.max(0, cue.original[0] + state.offset)
        cue.endTime = Math.max(0, cue.original[1] + state.offset)
    }
    renderCues()
}

function trackElement(mediaId, subtitle) {
    const element = document.createElement("track")

    element.kind = "subtitles"
    element.label = label(subtitle)
    element.srclang = subtitle.lang
    element.src = `/media/${mediaId}/${subtitle.file}`
    element.onload = shiftCues
    element.track.oncuechange = renderCues
    return element
}

export function addTrackElements(mediaId, subtitles) {
    state.trackEls = subtitles.map(subtitle => trackElement(mediaId, subtitle))
    video.append(...state.trackEls)
}

export function removeTrackElements() {
    state.trackEls.forEach(element => element.remove())
    state.trackEls = []
    state.currentSub = -1
}
