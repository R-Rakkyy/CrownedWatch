import { video } from "./elements.js"
import { state } from "./state.js"

export const duration = () =>
    Number.isFinite(video.duration) && video.duration > 0 ? video.duration : state.duration
