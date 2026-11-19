import "./shell.js"
import { $ } from "./lib/dom.js"
import { alertError, api, getJson, json } from "./lib/api.js"

async function removeUser(user) {
    if (!confirm(`Remove ${user.name}?`)) return

    await api(`/api/users/${encodeURIComponent(user.name)}`, { method: "DELETE" }).catch(alertError)
    loadUsers()
}

function userRow(user) {
    const row = document.createElement("li")
    const button = document.createElement("button")

    button.textContent = "remove"
    button.onclick = () => removeUser(user)
    row.append(`${user.name} (${user.role}) `, button)
    return row
}

async function loadUsers() {
    const users = await getJson("/api/users")
    $("#userlist").replaceChildren(...users.map(userRow))
}

async function addUser(event) {
    event.preventDefault()

    const form = event.target
    const body = { name: form.name.value, role: form.role.value }
    const response = await api("/api/users", json("POST", body)).catch(alertError)

    if (response) prompt(`Key for ${body.name} (shown once):`, (await response.json()).key)
    form.reset()
    loadUsers()
}

$("#adduser").onsubmit = addUser
loadUsers()
