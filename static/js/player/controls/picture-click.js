import { $, on } from "../../lib/dom.js"
import { clamp } from "../../lib/math.js"
import { panel, player, video } from "../elements.js"
import { closePanel } from "../panel/panel.js"
import { state } from "../state.js"
import { toggleFullscreen } from "./fullscreen.js"
import { skip, toggle } from "./transport.js"
import { setVolume } from "./volume.js"

// Click or tap on the picture.
// Mouse: play/pause (double click: fullscreen).
// Touch: show/hide the controls (double tap: skip on the sides, play/pause in the middle).
// Touch swipe up/down: brightness on the left half, volume on the right half

const DOUBLE_TAP_MS = 300
let lastType = "mouse"
let lastTap = 0

function doubleTap(x) {
    if (x < .33) skip(-state.step)
    else if (x > .66) skip(state.step)
    else toggle()
}

function tap(event) {
    const now = Date.now()
    const x = (event.clientX - video.getBoundingClientRect().left) / video.clientWidth

    if (now - lastTap < DOUBLE_TAP_MS) doubleTap(x)
    else player.classList.toggle("idle")
    lastTap = now
}

let swipe = null    // { y, left, from, moved } while a finger is down
let swiped = false  // the click that follows a swipe is not a tap
let brightness = 100
let hideTimer

function toast(text) {
    const box = $("#gesture")

    box.textContent = text
    box.hidden = false
    clearTimeout(hideTimer)
    hideTimer = setTimeout(() => { box.hidden = true }, 800)
}

on(video, "pointerdown", event => {
    swiped = false
    if (event.pointerType !== "touch") return

    const left = event.clientX < video.getBoundingClientRect().left + video.clientWidth / 2
    swipe = { y: event.clientY, left, from: left ? brightness : Math.round(video.volume * 100), moved: false }
})

on(video, "pointermove", event => {
    if (!swipe) return

    const delta = (swipe.y - event.clientY) / video.clientHeight * 100
    if (!swipe.moved && Math.abs(delta) < 3) return // still a tap
    swipe.moved = true

    if (swipe.left) {
        brightness = clamp(Math.round(swipe.from + delta), 20, 150)
        video.style.filter = `brightness(${brightness / 100})`
        toast(`Brightness ${brightness}%`)
    } else {
        setVolume(swipe.from + delta)
        toast(`Volume ${Math.round(video.volume * 100)}%`)
    }
})

on(video, "pointerup", event => {
    lastType = event.pointerType
    swiped = swipe?.moved ?? false
    swipe = null
})

on(video, "pointercancel", () => { swipe = null })

on(video, "click", event => {
    if (swiped) return
    if (!panel.hidden) return closePanel(false)
    if (lastType === "touch") tap(event)
    else toggle()
})

on(video, "dblclick", () => lastType !== "touch" && toggleFullscreen())
