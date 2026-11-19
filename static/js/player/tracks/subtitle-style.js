import { $ } from "../../lib/dom.js"
import { store, stored } from "../../lib/storage.js"
import { say } from "../announce.js"
import { subsBox, subtitleForm } from "../elements.js"
import { state } from "../state.js"
import { shiftCues } from "./subtitle-cues.js"

// Base settings.
const FACTORY = {
    on: false,
    font: "",
    size: 100,
    color: "#ffffff",
    bg: "#000000",
    bgAlpha: 0,
    edge: "outline",
    lift: 0,
}

// Base settings.
const EDGES = {
    none: "none",
    outline: "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 0 4px #000",
    shadow: "2px 2px 3px #000",
}

const controls = subtitleForm.elements
const DELAY_AND_RAISE_ONLY = ["on", "offset", "lift"]

function loadLook() {
    try {
        return { ...FACTORY, ...JSON.parse(stored("substyle")) }
    } catch {
        return { ...FACTORY }
    }
}

let look = loadLook()

const rgba = (hex, alpha) => {
    const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16))
    return `rgba(${r},${g},${b},${alpha / 100})`
}

function paintLook(element, applied) {
    element.style.setProperty("--c", applied.color)
    element.style.setProperty("--bg", rgba(applied.bg, applied.bgAlpha))
    element.style.setProperty("--size", applied.size)
    element.style.setProperty("--font", applied.font || "inherit")
    element.style.setProperty("--edge", EDGES[applied.edge])
}

function applyLook() {
    const applied = look.on ? look : FACTORY

    paintLook(subsBox, applied)
    paintLook($("#sspreview"), applied)
    subsBox.style.setProperty("--lift", look.lift)
}

const signed = seconds => `${seconds > 0 ? "+" : ""}${seconds.toFixed(1)} s`

function paintValues() {
    const text = {
        offset: signed(state.offset),
        lift: `${look.lift}%`,
        size: `${look.size}%`,
        bgAlpha: `${look.bgAlpha}%`,
    }

    for (const [name, value] of Object.entries(text)) $(`#o-${name}`).textContent = value
}

function fillForm() {
    for (const [name, value] of Object.entries(look)) {
        const control = controls[name]

        if (control.type === "checkbox") control.checked = value
        else control.value = value
    }
    controls.offset.value = state.offset
    paintValues()
}

const readLook = () => ({
    on: controls.on.checked,
    font: controls.font.value,
    size: +controls.size.value,
    color: controls.color.value,
    bg: controls.bg.value,
    bgAlpha: +controls.bgAlpha.value,
    edge: controls.edge.value,
    lift: +controls.lift.value,
})

subtitleForm.oninput = event => {
    if (!DELAY_AND_RAISE_ONLY.includes(event.target.name)) controls.on.checked = true // any change to the style means "on"

    state.offset = +controls.offset.value
    look = readLook()
    store("substyle", JSON.stringify(look))
    paintValues()
    applyLook()
    shiftCues()
}

$("#ssreset").onclick = () => {
    look = { ...FACTORY }
    state.offset = 0
    store("substyle", null)
    fillForm()
    applyLook()
    shiftCues()
    say("Subtitle settings reset")
}

fillForm()
applyLook()
