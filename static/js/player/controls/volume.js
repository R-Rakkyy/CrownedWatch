import { $, on } from "../../lib/dom.js"
import { clamp } from "../../lib/math.js"
import { store, stored } from "../../lib/storage.js"
import { say } from "../announce.js"
import { video } from "../elements.js"
import { setIcon } from "../icons.js"

// Volume and mute are remembered by the browser.
video.volume = clamp((stored("vol") ?? 100) / 100, 0, 1)
video.muted = stored("muted") === "1"

const percent = () => Math.round(video.volume * 100)

function saveMuted() {
    store("muted", video.muted ? "1" : "0")
}

export function setVolume(n) {
    n = clamp(Math.round(n), 0, 100)
    video.volume = n / 100
    if (n) video.muted = false

    store("vol", n)
    saveMuted()
    say(`Volume ${n}%`)
}

export const changeVolume = delta => setVolume(percent() + delta)

export function toggleMute() {
    video.muted = !video.muted
    saveMuted()
    say(video.muted ? "Muted" : "Unmuted")
}

function paintVolume() {
    const silent = video.muted || percent() === 0
    const button = $("#mute")

    setIcon(button, silent ? "mute" : "volume")
    button.setAttribute("aria-label", silent ? "Unmute" : "Mute")
    button.setAttribute("aria-pressed", silent)
    $("#vol").value = silent ? 0 : percent()
}

on(video, "volumechange", paintVolume)
$("#mute").onclick = toggleMute
$("#vol").oninput = event => setVolume(+event.target.value)
paintVolume()
