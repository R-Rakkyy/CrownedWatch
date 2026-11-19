// wrapper file around hls.js
import { $ } from "../lib/dom.js"
import { video } from "./elements.js"
import { markSelected } from "./panel/choice-list.js"
import { fillQualities, showAutoLevel } from "./settings/quality.js"
import { state } from "./state.js"

const MAX_BUFFER_BYTES = 600e6 // 600 MB, the default for hls.js.
const BACK_BUFFER_SECONDS = 30

// A long buffer rides out a weak connection (hls.js stops at 30 s / 60 MB by default).
const hlsConfig = () => ({
    maxBufferLength: state.buffer,
    maxMaxBufferLength: state.buffer,
    maxBufferSize: MAX_BUFFER_BYTES,
    backBufferLength: BACK_BUFFER_SECONDS,
})

export function startStream(mediaId, audioIndex) {
    const hls = new Hls(hlsConfig())
    state.hls = hls

    hls.once(Hls.Events.MANIFEST_PARSED, (_, data) => fillQualities(data.levels))
    hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => showAutoLevel(hls.levels[data.level].height))

    hls.once(Hls.Events.AUDIO_TRACKS_UPDATED, () => { hls.audioTrack = audioIndex })

    hls.on(Hls.Events.AUDIO_TRACK_SWITCHED, (_, data) => markSelected($("#audio-list"), data.id))

    hls.loadSource(`/media/${mediaId}/master.m3u8`)
    hls.attachMedia(video)
}

export function stopStream() {
    state.hls?.destroy()
    state.hls = null
}
