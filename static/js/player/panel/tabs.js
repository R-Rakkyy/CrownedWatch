import { panel } from "../elements.js"
import { $ } from "../../lib/dom.js"

const tabs = Array.from(panel.querySelectorAll("[role=tab]"))
let lastTab = "audio"

export const currentTab = () => lastTab

export function showTab(name, focus) {
    lastTab = name

    for (const tab of tabs) {
        const selected = tab.dataset.tab === name

        tab.setAttribute("aria-selected", selected)
        tab.tabIndex = selected ? 0 : -1
        $(`#p-${tab.dataset.tab}`).hidden = !selected
        if (selected && focus) tab.focus()
    }
}

tabs.forEach(tab => { tab.onclick = () => showTab(tab.dataset.tab, true) })

panel.querySelector("[role=tablist]").onkeydown = event => {
    const shown = tabs.filter(tab => !tab.hidden)
    const i = shown.indexOf(document.activeElement)
    const target = {
        ArrowRight: shown[(i + 1) % shown.length],
        ArrowLeft: shown[(i - 1 + shown.length) % shown.length],
        Home: shown[0],
        End: shown.at(-1),
    }[event.key]
    if (!target) return

    event.preventDefault()
    showTab(target.dataset.tab, true)
}
