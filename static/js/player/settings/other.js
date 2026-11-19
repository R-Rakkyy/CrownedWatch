import { $ } from "../../lib/dom.js"
import { store, stored } from "../../lib/storage.js"
import { video } from "../elements.js"
import { state } from "../state.js"

// Picture fit
const fit = $("#fit")

fit.value = stored("fit") || "contain"
video.style.objectFit = fit.value
fit.onchange = event => {
    video.style.objectFit = event.target.value
    store("fit", event.target.value)
}

// Arrow-key step
$("#step").value = state.step
$("#step").onchange = event => {
    state.step = +event.target.value
    store("step", state.step)
}

// Buffer: seconds of video loaded ahead.
$("#buffer").value = state.buffer
$("#buffer").onchange = event => {
    state.buffer = +event.target.value
    store("buffer", state.buffer)

    if (state.hls) state.hls.config.maxBufferLength = state.hls.config.maxMaxBufferLength = state.buffer
}
