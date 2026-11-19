import { $ } from "../lib/dom.js"
import { getJson } from "../lib/api.js"
import { forgetShownChapter } from "./controls/chapters.js"
import { poke } from "./controls/idle.js"
import { paintTime } from "./controls/seekbar.js"
import { player, subsBox, video } from "./elements.js"
import { paintEpisodes } from "./episodes.js"
import { fillChapters } from "./panel/chapter-list.js"
import { closePanel } from "./panel/panel.js"
import { state } from "./state.js"
import { startStream, stopStream } from "./stream.js"
import { fillAudioList } from "./tracks/audio.js"
import { ass, destroyAss } from "./tracks/ass.js"
import { initialAudio, initialSub } from "./tracks/labels.js"
import { addTrackElements, removeTrackElements } from "./tracks/subtitle-cues.js"
import { fillSubList, showSub } from "./tracks/subtitles.js"

// reset prev media
function reset(id) {
    state.id = id
    state.loaded = false
    state.holding = false
    state.offset = 0
    state.duration = 0

    forgetShownChapter()
    stopStream()
    destroyAss()
    removeTrackElements()
    subsBox.replaceChildren()
    closePanel(false)

    player.hidden = !id
    $("#idle").hidden = !!id
}

function showNothing() {
    video.removeAttribute("src")
    video.load()
}

function showMedia(node) {
    const { audio, subtitles } = node.meta
    const audioIndex = initialAudio(audio)
    const subIndex = initialSub(subtitles, audio[audioIndex])

    $("#title").textContent = node.name
    document.title = node.name
    paintEpisodes(node)

    state.duration = node.duration || 0
    state.audioTracks = audio
    state.subTracks = subtitles
    state.chapters = node.meta.chapters ?? []
    ass.fonts = node.meta.fonts ?? []

    fillAudioList(audio, audioIndex)
    fillSubList(subtitles, subIndex)
    fillChapters(state.chapters, state.duration)
    addTrackElements(state.id, subtitles)
    showSub(subIndex)

    startStream(state.id, audioIndex)
    paintTime()
    poke()
}

export async function openMedia(id) {
    reset(id)
    if (!id) return showNothing()

    const node = await getJson(`/api/nodes/${id}`)
    if (state.id !== id) return // bug ? media changed

    showMedia(node)
}
