import { $ } from "../lib/dom.js"
import { fmt, size } from "../lib/format.js"

function transferText(label, loaded, total, speed) {
    const left = total && speed ? ` · ${fmt((total - loaded) / speed)} left` : ""
    return `${label} ${size(loaded)} / ${size(total)} · ${size(speed)}/s${left}`
}

// The progress line shared by uploads and downloads.
export function showTransfer(label, loaded, total, startedAt) {
    const speed = loaded / ((Date.now() - startedAt) / 1000 || 1)

    $("#xfer").hidden = false
    $("#xbar").max = total || 1
    $("#xbar").value = loaded
    $("#xtext").textContent = transferText(label, loaded, total, speed)
}

export function hideTransfer() {
    $("#xfer").hidden = true
}
