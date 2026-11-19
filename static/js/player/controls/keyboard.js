import { on } from "../../lib/dom.js"
import { panel, player } from "../elements.js"
import { closePanel } from "../panel/panel.js"
import { state } from "../state.js"
import { chapter } from "./chapters.js"
import { toggleFullscreen } from "./fullscreen.js"
import { poke } from "./idle.js"
import { skip, toggle } from "./transport.js"
import { changeVolume, toggleMute } from "./volume.js"

const KEYS = {
    " ": toggle,
    ArrowLeft: event => event.shiftKey ? chapter(-1) : skip(-state.step),
    ArrowRight: event => event.shiftKey ? chapter(1) : skip(state.step),
    ArrowUp: () => changeVolume(5),
    ArrowDown: () => changeVolume(-5),
    f: toggleFullscreen,
    F: toggleFullscreen,
    m: toggleMute,
    M: toggleMute,
}

const keepsItsKeys = target =>
    panel.contains(target) || target.matches("input, select, textarea, [role=slider]")

on(document, "keydown", event => {
    if (player.hidden || event.ctrlKey || event.metaKey || event.altKey) return

    if (event.key === "Escape" && !panel.hidden) {
        closePanel()
        event.preventDefault()
        return
    }
    if (keepsItsKeys(event.target)) return

    poke()
    const action = KEYS[event.key]
    if (!action) return

    if (event.key === " " && event.target.matches("button, a, summary")) return

    action(event)
    event.preventDefault()
})
