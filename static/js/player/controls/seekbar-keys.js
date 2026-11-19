import { duration } from "../duration.js"
import { seekbar } from "../elements.js"
import { state } from "../state.js"
import { chapter } from "./chapters.js"
import { goto, skip, toggle } from "./transport.js"

const deltas = () => ({
    ArrowLeft: -state.step,
    ArrowRight: state.step,
    PageDown: -60,
    PageUp: 60,
})

function handle(event) {
    const delta = deltas()[event.key]

    if (delta && event.shiftKey && event.key.startsWith("Arrow")) chapter(delta)
    else if (delta) skip(delta)
    else if (event.key === "Home") goto(0)
    else if (event.key === "End") goto(duration())
    else if (event.key === " ") toggle()
    else return false
    return true
}

seekbar.onkeydown = event => {
    if (!handle(event)) return

    event.preventDefault()
    event.stopPropagation()
}
