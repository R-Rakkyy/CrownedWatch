import { $, on } from "../../lib/dom.js"
import { player } from "../elements.js"
import { setIcon } from "../icons.js"

// The webkit names are for Safari.
const request = player.requestFullscreen || player.webkitRequestFullscreen
const exit = () => (document.exitFullscreen || document.webkitExitFullscreen).call(document)
const isFullscreen = () => document.fullscreenElement || document.webkitFullscreenElement

export const toggleFullscreen = () => isFullscreen() ? exit() : request?.call(player)

function paintFullscreenButton() {
    setIcon($("#fs"), isFullscreen() ? "fsExit" : "fs")
    $("#fs").setAttribute("aria-label", isFullscreen() ? "Exit fullscreen" : "Fullscreen")
}

$("#fs").hidden = !request
$("#fs").onclick = toggleFullscreen

for (const event of ["fullscreenchange", "webkitfullscreenchange"]) {
    on(document, event, paintFullscreenButton)
}
