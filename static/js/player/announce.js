import { $ } from "../lib/dom.js"

export function say(text) {
    const region = $("#live")

    region.textContent = ""
    setTimeout(() => { region.textContent = text }, 50)
}
