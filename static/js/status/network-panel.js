import { esc } from "../lib/dom.js"
import { size } from "../lib/format.js"
import { kv, panel } from "./html.js"

// Bytes per second since the previous sample (0 for the first one).
const rate = (now, before, seconds) => before ? (now - before) / seconds : 0

function interfaceRows(name, counters, previous, seconds) {
    const before = previous?.host.net[name]
    const down = rate(counters.rx, before?.rx, seconds)
    const up = rate(counters.tx, before?.tx, seconds)

    return `<div>${kv(`<b>${esc(name)}</b>`, "")}` +
        kv("↓ now", `${size(down)}/s`) +
        kv("↑ now", `${size(up)}/s`) +
        kv("received since boot", size(counters.rx)) +
        kv("sent since boot", size(counters.tx)) +
        "</div>"
}

export function networkPanel(status, previous) {
    const seconds = previous ? status.now - previous.now : 0
    const rows = Object.entries(status.host.net)
        .map(([name, counters]) => interfaceRows(name, counters, previous, seconds))
        .join("")

    return panel("Network", rows || "<small>No interface.</small>")
}
