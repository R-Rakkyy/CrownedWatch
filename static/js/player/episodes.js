import { $ } from "../lib/dom.js"
import { playMedia } from "./party/load.js"

let siblings = {} // { prev, next }: the neighbours of the current Media, or null

const goTo = sibling => sibling && playMedia(sibling.id, true)

function paintButton(button, sibling, text) {
    button.disabled = !sibling
    button.setAttribute("aria-label", sibling ? `${text}: ${sibling.name}` : text)
    button.title = sibling?.name ?? ""
}

export function paintEpisodes(node) {
    siblings = { prev: node.prev, next: node.next }

    $("#prev").hidden = $("#next").hidden = !(node.prev || node.next)
    paintButton($("#prev"), node.prev, "Previous episode")
    paintButton($("#next"), node.next, "Next episode")
}

$("#prev").onclick = () => goTo(siblings.prev)
$("#next").onclick = () => goTo(siblings.next)
