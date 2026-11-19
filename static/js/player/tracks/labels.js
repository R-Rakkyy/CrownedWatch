import { store, stored } from "../../lib/storage.js"

export const label = track => track.lang + (track.title ? ` - ${track.title}` : "")

// specific ranking where i get eng first by default (<3 N)
const rank = lang => /^en/.test(lang) ? 0 : /^fr/.test(lang) ? 1 : 2

export function preferred(tracks) {
    const ranked = tracks.map((track, i) => [rank(track.lang), i])
    ranked.sort((a, b) => a[0] - b[0] || a[1] - b[1])

    return ranked[0]?.[1] ?? -1
}

const remembered = (key, tracks) => tracks.findIndex(track => track.lang === stored(key))

export function initialAudio(audio) {
    const index = remembered("audio", audio)
    return index < 0 ? preferred(audio) : index
}

// Subtitles are on by default, except when the audio is French.
export function initialSub(subtitles, audioTrack) {
    if (stored("sub") === "off") return -1

    const index = remembered("sub", subtitles)
    if (index >= 0) return index
    return audioTrack?.lang.startsWith("fr") ? -1 : preferred(subtitles)
}

export const rememberAudio = track => store("audio", track.lang)
export const rememberSub = track => store("sub", track ? track.lang : "off")
