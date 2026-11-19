import { $ } from "../lib/dom.js"
import { alertError } from "../lib/api.js"
import { load } from "./list.js"
import { state } from "./state.js"
import { hideTransfer, showTransfer } from "./transfer.js"

function uploadUrl(file) {
    const parent = state.here ? `&parent_id=${state.here}` : ""
    return `/api/upload?name=${encodeURIComponent(file.name)}${parent}`
}

// XMLHttpRequest, because fetch cannot report upload progress.
function put(url, file) {
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest()
        const startedAt = Date.now()

        request.open("PUT", url)
        request.upload.onprogress = e => showTransfer(`↑ ${file.name}`, e.loaded, e.total, startedAt)
        request.onload = () => request.status < 300 ? resolve() : reject(new Error(request.responseText))
        request.onerror = () => reject(new Error("network error"))
        request.send(file)
    })
}

$("#file").onchange = async event => {
    for (const file of event.target.files) {
        await put(uploadUrl(file), file).catch(alertError)
    }

    event.target.value = ""
    hideTransfer()
    load()
}
