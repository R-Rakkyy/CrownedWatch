import { on } from "../lib/dom.js"
import { alertError, api, json } from "../lib/api.js"
import { download } from "./download.js"
import { load } from "./list.js"
import { openMove } from "./move.js"

const nodeUrl = id => `/api/nodes/${id}`
const post = url => api(url, { method: "POST" })

const CONFIRMATIONS = {
    delete: "Delete FOREVER AND EVER (<3), including history?",
    archive: "Archive: remove files, keep metadata and progress?",
    reencode: "Re-encode from the source? (debug purpose)",
}

async function rename({ id, name }) {
    const newName = prompt("New name", name)
    if (newName && newName !== name) await api(nodeUrl(id), json("PATCH", { name: newName }))
}

const ACTIONS = {
    retry: ({ id }) => post(`${nodeUrl(id)}/retry`),
    reencode: ({ id }) => post(`${nodeUrl(id)}/retry`),
    archive: ({ id }) => post(`${nodeUrl(id)}/archive`),
    delete: ({ id }) => api(nodeUrl(id), { method: "DELETE" }),
    rename,
}

async function run(action, data) {
    if (action === "dl") return download(data.id, data.file)
    if (action === "move") return openMove(data.id, data.name)
    if (CONFIRMATIONS[action] && !confirm(CONFIRMATIONS[action])) return

    await ACTIONS[action](data).catch(alertError)
    load()
}

function closeOtherMenus(target) {
    for (const menu of document.querySelectorAll("details.menu[open]")) {
        if (!menu.querySelector("summary").contains(target)) menu.removeAttribute("open")
    }
}

on(document, "click", event => {
    const target = event.target

    closeOtherMenus(target)
    if (target.dataset.act) {
        run(target.dataset.act, target.dataset)
    } else if (target.matches("a[data-id]")) {
        event.preventDefault()
        load(target.dataset.id ? +target.dataset.id : null)
    }
})
