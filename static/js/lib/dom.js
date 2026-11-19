export const $ = selector => document.querySelector(selector)

export const on = (target, event, handler) => target.addEventListener(event, handler)

export const esc = text => String(text).replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`)
