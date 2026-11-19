import { $, on } from "../../lib/dom.js"
import { fmt } from "../../lib/format.js"
import { clamp } from "../../lib/math.js"
import { say } from "../announce.js"
import { duration } from "../duration.js"
import { video } from "../elements.js"
import { setIcon } from "../icons.js"
import { state } from "../state.js"
import { poke } from "./idle.js"

export const toggle = () => video.paused ? video.play().catch(() => {}) : video.pause()

export function goto(time) {
    if (state.loaded) video.currentTime = clamp(time, 0, duration())
}

export function skip(delta) {
    goto(video.currentTime + delta)
    say(fmt(video.currentTime))
}

function paintPlayButton() {
    const button = $("#play")

    setIcon(button, video.paused ? "play" : "pause")
    button.setAttribute("aria-label", video.paused ? "Play" : "Pause")
    say(video.paused ? "Paused" : "Playing")
    poke()
}

on(video, "play", () => {
    paintPlayButton()
    $("#join").hidden = true
})
on(video, "pause", paintPlayButton)

$("#play").onclick = toggle
$("#join").onclick = () => video.play().catch(() => {})
