import { $ } from "../../lib/dom.js"
import { store, stored } from "../../lib/storage.js"
import { state } from "../state.js"

const select = $("#quality")
const levelOption = (level, i) =>
    new Option(`${level.height}p · ${(level.bitrate / 1e6).toFixed(1)} Mbps`, i)

// -1 is Auto (adaptive bitrate).
export function fillQualities(levels) {
    const wanted = +(stored("quality") ?? -1)
    const known = wanted >= 0 && wanted < levels.length

    select.replaceChildren(new Option("Auto", -1), ...levels.map(levelOption))
    select.disabled = levels.length < 2
    if (known) state.hls.currentLevel = wanted
    select.value = known ? wanted : -1
}

// Auto shows what it picked.
export function showAutoLevel(height) {
    if (select.options[0]) select.options[0].textContent = `Auto (${height}p)`
}

select.onchange = event => {
    if (state.hls) state.hls.currentLevel = +event.target.value
    store("quality", event.target.value)
}
