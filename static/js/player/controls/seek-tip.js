import { $ } from "../../lib/dom.js"
import { fmt } from "../../lib/format.js"
import { clamp } from "../../lib/math.js"
import { seekbar } from "../elements.js"
import { state } from "../state.js"
import { chapterIndex } from "./chapters.js"
import { timeAt } from "./seek-position.js"

export function showTip(event) {
    const rect = seekbar.getBoundingClientRect()
    const time = timeAt(event)
    const chapter = state.chapters[chapterIndex(time)]
    const tip = $("#tip")

    tip.hidden = false
    tip.style.left = `${clamp(event.clientX - rect.left, 0, rect.width)}px`
    tip.textContent = fmt(time) + (chapter ? ` · ${chapter.title}` : "")
}

export const hideTip = () => { $("#tip").hidden = true }
