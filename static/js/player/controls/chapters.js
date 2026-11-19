import { $ } from "../../lib/dom.js"
import { say } from "../announce.js"
import { video } from "../elements.js"
import { state } from "../state.js"
import { goto } from "./transport.js"

const RESTART_AFTER = 3 // seconds into a chapter after which "previous" restarts it
let shown = -2 // -2 = no chapter shown yet, -1 = no chapter at this time

export const chapterIndex = time => state.chapters.findLastIndex(c => c.start <= time + .5)

export const forgetShownChapter = () => { shown = -2 }

function markCurrent(index) {
    Array.from($("#chap-list").children).forEach((button, i) => {
        if (i === index) button.setAttribute("aria-current", "true")
        else button.removeAttribute("aria-current")
    })
}

export function paintChapter(time) { // next to time
    const index = chapterIndex(time)
    if (index === shown) return

    shown = index
    $("#chapnow").textContent = state.chapters[index]?.title ?? ""
    markCurrent(index)
}

export function chapter(direction) {
    const { chapters } = state
    if (!chapters.length) return

    const current = Math.max(chapterIndex(video.currentTime), 0)
    const restart = video.currentTime - chapters[current].start > RESTART_AFTER
    const target = direction > 0 ? current + 1 : restart ? current : current - 1
    if (target >= chapters.length) return

    const { start, title } = chapters[Math.max(target, 0)]
    goto(start)
    say(`Chapter: ${title}`)
}
