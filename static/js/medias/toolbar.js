import { $ } from "../lib/dom.js"
import { alertError, api, json } from "../lib/api.js"
import { load } from "./list.js"
import { state } from "./state.js"

$("#archbtn").onclick = () => {
    state.archived = !state.archived
    load(null)
}

$("#newfolder").onclick = async () => {
    const name = prompt("Folder name")
    if (!name) return

    await api("/api/folders", json("POST", { name, parent_id: state.here })).catch(alertError)
    load()
}
