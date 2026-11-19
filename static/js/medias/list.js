import { $, esc } from "../lib/dom.js"
import { getJson } from "../lib/api.js"
import { rowHtml } from "./row.js"
import { state } from "./state.js"

const POLL_MS = 3000
const EMPTY = `<li class="empty"><small>Empty ...</small></li>`

function paintCrumbs(path) {
    const root = `<a href="#" data-id="">${state.archived ? "Archive" : "Medias"}</a>`
    const folders = path.map(p => `<a href="#" data-id="${p.id}">${esc(p.name)}</a>`)

    $("#crumbs").innerHTML = [root, ...folders].join(" / ")
}

function paintToolbar() {
    $("#archbtn").textContent = state.archived ? "Medias" : "archive"
    $("#tools").hidden = state.me.role !== "admin" || state.archived
}

// Something is being processed: look again in a few seconds.
function pollWhileProcessing(items) {
    clearTimeout(state.timer)
    if (items.some(node => node.status === "processing")) {
        state.timer = setTimeout(() => load(), POLL_MS)
    }
}

// load() refreshes the folder being shown, load(id) opens another one, load(null) the root.
export async function load(id = state.here) {
    state.here = id

    const query = new URLSearchParams({ ...(id && { parent_id: id }), archived: state.archived })
    const data = await getJson(`/api/medias?${query}`)

    paintCrumbs(data.path)
    paintToolbar()

    $("#list").innerHTML = data.items.map(rowHtml).join("") || EMPTY
    pollWhileProcessing(data.items)
}
