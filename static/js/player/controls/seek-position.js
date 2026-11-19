import { clamp } from "../../lib/math.js"
import { duration } from "../duration.js"
import { seekbar } from "../elements.js"

export function timeAt(event) {
    const rect = seekbar.getBoundingClientRect()
    const ratio = clamp((event.clientX - rect.left) / rect.width, 0, 1)

    return ratio * duration()
}
