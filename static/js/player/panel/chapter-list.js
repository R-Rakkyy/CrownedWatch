import { $, esc } from "../../lib/dom.js"
import { fmt } from "../../lib/format.js"
import { goto } from "../controls/transport.js"
import { choiceButton } from "./choice-list.js"
import { closePanel } from "./panel.js"

function tick(chapter, duration) {
    const mark = document.createElement("i")

    mark.style.left = `${100 * chapter.start / (duration || 1)}%`
    return mark
}

function chapterButton(chapter) {
    const label = `<span class="t">${fmt(chapter.start)}</span>${esc(chapter.title)}`

    return choiceButton(label, () => {
        goto(chapter.start)
        closePanel()
    })
}

export function fillChapters(chapters, duration) {
    $("#chap-list").replaceChildren(...chapters.map(chapterButton))
    $("#t-chapters").hidden = !chapters.length
    $("#ticks").replaceChildren(...chapters.slice(1).map(c => tick(c, duration)))
}
