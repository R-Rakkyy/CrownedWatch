import { $, on } from "../../lib/dom.js"
import { poke } from "../controls/idle.js"
import { panel, player } from "../elements.js"
import { currentTab, showTab } from "./tabs.js"

const gear = $("#gear")

export function openPanel(tab = currentTab()) {
    if ($(`#t-${tab}`).hidden) tab = "subs" // the chapters tab is hidden for a Media without chapters

    panel.hidden = false
    player.classList.add("paneled")
    gear.setAttribute("aria-expanded", "true")
    showTab(tab, true)
    poke()
}

export function closePanel(refocus = true) {
    if (panel.hidden) return

    panel.hidden = true
    player.classList.remove("paneled")
    gear.setAttribute("aria-expanded", "false")
    if (refocus) gear.focus()
    poke()
}

gear.onclick = () => panel.hidden ? openPanel() : closePanel()
$("#pclose").onclick = () => closePanel()

on(panel, "keydown", event => {
    if (event.key !== "Tab") return

    const focusable = Array.from(panel.querySelectorAll("button, input, select"))
        .filter(el => el.offsetParent && el.tabIndex >= 0)
    const first = focusable[0]
    const last = focusable.at(-1)

    if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
    }
})
