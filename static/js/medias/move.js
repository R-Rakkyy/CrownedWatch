import { $ } from "../lib/dom.js"
import { alertError, api, getJson, json } from "../lib/api.js"
import { load } from "./list.js"
import { state } from "./state.js"

const dialog = $("#mv")
const select = $("#mvsel")

export async function moveNode(id, parentId) {
    await api(`/api/nodes/${id}`, json("PATCH", { parent_id: parentId })).catch(alertError)
    load()
}

// The "move" button opens a folder picker.
export async function openMove(id, name) {
    const folders = await getJson("/api/folders")
    const options = folders.filter(folder => folder.id != id).map(f => new Option(f.path, f.id))

    $("#mvname").textContent = name
    select.replaceChildren(new Option("Medias (root)", ""), ...options)
    select.value = state.here ?? ""
    dialog.dataset.id = id
    dialog.returnValue = ""
    dialog.showModal()
}

dialog.onclose = () => {
    if (dialog.returnValue === "ok") moveNode(dialog.dataset.id, select.value ? +select.value : null)
}
