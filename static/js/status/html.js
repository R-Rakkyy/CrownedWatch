export const kv = (key, value) => `<div class="kv"><span>${key}</span><span>${value}</span></div>`

export const bar = (value, max, text) =>
    `<progress class="wide" max="${max}" value="${value}"></progress>${kv("", text)}`

export const panel = (title, body) => `<section class="panel"><h3>${title}</h3>${body}</section>`
