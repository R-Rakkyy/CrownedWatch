import { stored } from "../../lib/storage.js"
import { video } from "../elements.js"
import { state } from "../state.js"

// the butt struct ! ASS subtitles are drawn by JASSUB.
export const ass = {
    player: null,
    fonts: [],                              // font files of the current Media
    active: false,                          // is the current subtitle drawn by JASSUB?
    mode: stored("subrender") || "styled",  // "styled" (original) or "plain"
}

const JASSUB_DIR = "/static/vendor/jassub"
const mediaFile = file => `/media/${state.id}/${file}`

function create(url) {
    ass.player = new JASSUB({
        video,
        subUrl: url,
        fonts: ass.fonts.map(mediaFile),
        timeOffset: -state.offset,
        workerUrl: `${JASSUB_DIR}/jassub-worker.js`,
        wasmUrl: `${JASSUB_DIR}/jassub-worker.wasm`,
        modernWasmUrl: `${JASSUB_DIR}/jassub-worker-modern.wasm`,
        availableFonts: { "liberation sans": `${JASSUB_DIR}/default.woff2` },
    })
}

export function startAss(track) { // :o
    const url = mediaFile(track.ass)

    if (ass.player) ass.player.setTrackByUrl(url)
    else create(url)
}

export const freeAssTrack = () => ass.player?.freeTrack()

export function updateAssOffset() {
    if (ass.player) ass.player.timeOffset = -state.offset
}

export function destroyAss() {
    ass.player?.destroy()
    ass.player = null
}
