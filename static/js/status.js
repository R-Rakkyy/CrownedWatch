import "./shell.js"
import { $, esc } from "./lib/dom.js"
import { getJson } from "./lib/api.js"
import { panel } from "./status/html.js"
import { cpuPanel, diskPanel, memoryPanel, serverPanel } from "./status/host-panels.js"
import { mediasPanel, processingPanel } from "./status/jobs-panels.js"
import { networkPanel } from "./status/network-panel.js"
import { partyPanel } from "./status/party-panel.js"

const REFRESH_MS = 2000
let previous // the last sample (use for CPU, network, etc. deltas)

const render = (status, before) => [
    processingPanel(status),
    partyPanel(status),
    cpuPanel(status, before),
    memoryPanel(status),
    diskPanel(status),
    networkPanel(status, before),
    mediasPanel(status),
    serverPanel(status),
].join("")

async function refresh() {
    if (document.hidden) return

    try {
        const status = await getJson("/api/status")
        $("#out").innerHTML = render(status, previous)
        previous = status
    } catch (error) {
        $("#out").innerHTML = panel("Error", esc(error.message))
    }
}

refresh()
setInterval(refresh, REFRESH_MS)
