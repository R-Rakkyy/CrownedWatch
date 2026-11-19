import { esc } from "../lib/dom.js"
import { fmt } from "../lib/format.js"
import { state } from "./state.js"

const isAdmin = () => state.me.role === "admin"
const isFile = node => !node.is_folder && !node.archived
const canWatch = node => isFile(node) && node.status === "ready"

function info(node) {
    if (node.is_folder) return node.child_count ? `${node.child_count} items` : "wanted"
    if (node.archived) return "archived"
    if (node.status === "failed") return `failed: ${esc(node.error)}`
    if (node.status !== "ready") return "processing…"
    if (node.watched) return "✓ watched"
    if (node.position) return `at ${fmt(node.position)} / ${fmt(node.duration)}`
    return node.duration ? fmt(node.duration) : ""
}

const nameCell = node => node.is_folder
    ? `<a class="name" href="#" data-id="${node.id}">${esc(node.name)}</a>`
    : `<span class="name">${esc(node.name)}</span>`

function progressCell(node) {
    const percent = node.duration ? Math.min(100, 100 * node.position / node.duration) : 0
    return percent && !node.watched ? `<progress max="100" value="${percent}"></progress>` : ""
}

const watchLink = node =>
    canWatch(node) ? `<a class="btn" href="/watch?id=${node.id}">watch</a>` : ""

const menuButton = (node, action, label, extra = "") =>
    `<button data-act="${action}" data-id="${node.id}" data-name="${esc(node.name)}" ${extra}>
        ${label}</button>`

function menuItems(node) {
    const items = []
    const add = (action, label, extra) => items.push(menuButton(node, action, label, extra))

    if (!state.archived) {
        add("rename", "rename")
        add("move", "move")
    }
    if (isFile(node) && node.status === "failed") add("retry", "retry")
    if (isFile(node) && node.status === "ready") add("reencode", "re-encode")
    if (isFile(node) && node.status !== "processing") {
        add("dl", "download", `data-file="${esc(node.name + node.ext)}"`)
    }
    if (!node.archived) add("archive", "archive")
    add("delete", "delete", 'class="danger"')
    return items.join("")
}

const adminMenu = node =>
    `<details class="menu"><summary>⋯</summary><div class="pop">${menuItems(node)}</div></details>`

export function rowHtml(node) {
    return `<li>
        <span class="kind">${node.is_folder ? "folder" : "video"}</span>
        ${nameCell(node)}
        <small>${info(node)}</small>
        <span class="pg">${progressCell(node)}</span>
        <span class="acts">${watchLink(node)}${isAdmin() ? adminMenu(node) : ""}</span>
    </li>`
}
