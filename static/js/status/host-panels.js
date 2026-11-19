import { esc } from "../lib/dom.js"
import { size } from "../lib/format.js"
import { dur } from "./format.js"
import { bar, kv, panel } from "./html.js"

// CPU usage is delta, first is 0
function cpuPercent(host, previous) {
    if (!previous) return 0

    const idle = host.cpu.idle - previous.host.cpu.idle
    const total = host.cpu.total - previous.host.cpu.total
    return 100 * (1 - idle / (total || 1))
}

export function cpuPanel(status, previous) {
    const host = status.host
    const percent = cpuPercent(host, previous)
    const load = host.load.map(x => x.toFixed(2)).join(" / ")

    return panel("CPU",
        bar(percent, 100, `${percent.toFixed(0)}% of ${host.cores} cores`) +
        kv("Load 1 / 5 / 15 min", load))
}

export function memoryPanel(status) {
    const mem = status.host.mem
    const used = mem.total - mem.available
    const swapUsed = mem.swap_total - mem.swap_free
    const swap = mem.swap_total ? kv("Swap used", `${size(swapUsed)} / ${size(mem.swap_total)}`) : ""

    return panel("Memory", bar(used, mem.total, `${size(used)} / ${size(mem.total)}`) + swap)
}

export function diskPanel(status) {
    const disk = status.disk
    const text = `${size(disk.used)} / ${size(disk.total)} · ${size(disk.free)} free`

    return panel("Disk", bar(disk.used, disk.total, text) + kv("Medias on disk", size(disk.media)))
}

export function serverPanel(status) {
    const { host, app } = status

    return panel("Server",
        kv("Host", esc(host.os)) +
        kv("Host uptime", dur(host.uptime)) +
        kv("App uptime", dur(app.uptime)) +
        kv("App memory", size(app.rss)) +
        kv("App threads", app.threads) +
        kv("Python", app.python))
}
