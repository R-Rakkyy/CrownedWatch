import { api } from "../lib/api.js"
import { hideTransfer, showTransfer } from "./transfer.js"

async function streamToDisk(url, name) {
    const handle = await showSaveFilePicker({ suggestedName: name })
    const response = await api(url)
    const writable = await handle.createWritable()
    const reader = response.body.getReader()
    const total = +response.headers.get("content-length")
    const startedAt = Date.now()
    let received = 0

    for (;;) {
        const { done, value } = await reader.read()
        if (done) break

        await writable.write(value)
        received += value.length
        showTransfer(`↓ ${name}`, received, total, startedAt)
    }
    await writable.close()
}

// Streams to a file chosen by the user (Chromium).
// Elsewhere: a plain link, the browser shows its own progress.
export async function download(id, name) {
    const url = `/api/nodes/${id}/download`
    if (!window.showSaveFilePicker) return location.assign(url) // fallback for non-Chromium browsers

    try {
        await streamToDisk(url, name)
    } catch (error) {
        if (error.name !== "AbortError") alert(error.message)
    }
    hideTransfer()
}
