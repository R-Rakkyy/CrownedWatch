import { $, esc } from "../lib/dom.js"
import { me } from "../lib/me.js"

let playing = false

const adminLinks = `<a href="/users">Users</a> <a href="/status">Status</a>`

const headerHtml = user => `
    <a href="/">Medias</a> <a href="/watch" id="playerlink">Player</a>
    ${user.role === "admin" ? adminLinks : ""}
    <span id="who">${esc(user.name)}</span>
    <form method="post" action="/logout"><button>Leave</button></form>`

function paint() {
    const link = $("#playerlink")
    if (link) link.textContent = playing ? "Player (playing)" : "Player"
}

export function setPlaying(value) {
    playing = value
    paint()
}

me.then(user => {
    $("header").innerHTML = headerHtml(user)
    paint()
})
