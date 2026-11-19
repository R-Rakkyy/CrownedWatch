import { on } from "../../lib/dom.js"
import { panel, player, video } from "../elements.js"

const HIDE_MS = 2000
let timer

function hideControls() {
    const focused = player.querySelector(".ui :focus-visible")

    if (!video.paused && panel.hidden && !focused) player.classList.add("idle")
}

export function poke() { // movement poke the timer until no movement
    player.classList.remove("idle")
    clearTimeout(timer)
    timer = setTimeout(hideControls, HIDE_MS)
}

on(player, "pointermove", poke)
on(player, "pointerdown", poke)
