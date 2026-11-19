import { video } from "./elements.js"

export function bufferedEnd(gap) {
    const now = video.currentTime

    for (let i = 0; i < video.buffered.length; i++) {
        if (video.buffered.start(i) <= now + gap && now <= video.buffered.end(i)) {
            return video.buffered.end(i) // the end of the buffered range that holds the playhead
        }
    }
    return 0
}
