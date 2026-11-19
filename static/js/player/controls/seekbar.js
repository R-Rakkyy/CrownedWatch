import { $, on } from "../../lib/dom.js"
import { fmt } from "../../lib/format.js"
import { bufferedEnd } from "../buffered.js"
import { duration } from "../duration.js"
import { seekbar, video } from "../elements.js"
import { paintChapter } from "./chapters.js"
import { timeAt } from "./seek-position.js"
import { hideTip, showTip } from "./seek-tip.js"
import { goto } from "./transport.js"

// Drag or click, committed on release: one seek sent to the party, not a stream of them.
const drag = { active: false, time: 0 }
let lastSecond = -1

const percent = (value, total) => `${total ? 100 * value / total : 0}%`

// Screen readers hear the position, but not ten times a second.
function paintAria(time, total) {
    if (Math.floor(time) === lastSecond) return

    lastSecond = Math.floor(time)
    seekbar.setAttribute("aria-valuemax", Math.round(total))
    seekbar.setAttribute("aria-valuenow", Math.round(time))
    seekbar.setAttribute("aria-valuetext", `${fmt(time)} of ${fmt(total)}`)
}

export function paintTime() {
    const time = drag.active ? drag.time : video.currentTime
    const total = duration()

    $("#time").textContent = `${fmt(time)} / ${fmt(total)}`
    seekbar.style.setProperty("--p", percent(time, total))
    seekbar.style.setProperty("--b", percent(bufferedEnd(.5), total))
    paintAria(time, total)
    paintChapter(time)
}

function stopDrag() {
    drag.active = false
    seekbar.classList.remove("drag")
}

seekbar.onpointerdown = event => {
    if (!duration()) return

    drag.active = true
    drag.time = timeAt(event)
    seekbar.classList.add("drag")
    seekbar.setPointerCapture(event.pointerId)
    paintTime()
    showTip(event)
}

seekbar.onpointermove = event => {
    showTip(event)
    if (!drag.active) return

    drag.time = timeAt(event)
    paintTime()
}

seekbar.onpointerup = event => {
    if (!drag.active) return

    stopDrag()
    goto(timeAt(event))
}

seekbar.onpointercancel = () => {
    stopDrag()
    paintTime()
}

seekbar.onpointerleave = () => {
    if (!drag.active) hideTip()
}

for (const event of ["timeupdate", "seeking", "durationchange", "progress"]) {
    on(video, event, paintTime)
}
