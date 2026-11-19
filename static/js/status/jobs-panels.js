import { esc } from "../lib/dom.js"
import { clock, dur } from "./format.js"
import { bar, kv, panel } from "./html.js"

function runningJob(job) {
    const percent = job.total ? `${(100 * job.done / job.total).toFixed(1)}%` : "starting…"
    const detail = `${clock(job.done)} / ${clock(job.total)} · running ${dur(job.elapsed)}`

    return `<div>${kv(esc(job.name), percent)}${bar(job.done, job.total || 1, detail)}</div>`
}

const jobRow = job =>
    job.state === "queued" ? kv(esc(job.name), `queued ${dur(job.elapsed)}`) : runningJob(job)

const failedRow = media =>
    `<div class="kv"><span>${esc(media.name)}</span><small>${esc(media.error || "")}</small></div>`

export function processingPanel(status) {
    const jobs = status.jobs.length
        ? status.jobs.map(jobRow).join("")
        : "<small>Nothing is being processed.</small>"
    const failed = status.failed.map(failedRow).join("")

    return panel("Processing", jobs + (failed ? `<h3>Failed</h3>${failed}` : ""))
}

export function mediasPanel(status) {
    const c = status.counts

    return panel("Medias",
        kv("Ready", c.ready) +
        kv("Processing", c.processing) +
        kv("Failed", c.failed) +
        kv("Archived", c.archived) +
        kv("Folders", c.folders) +
        kv("Users", status.users))
}
