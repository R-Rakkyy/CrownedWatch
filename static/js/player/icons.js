import { PATHS } from "./icon-paths.js"

export const svg = name =>
    `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${PATHS[name]}"/></svg>`

export const setIcon = (element, name) => {
    element.innerHTML = svg(name)
}

document.querySelectorAll("[data-icon]").forEach(el => setIcon(el, el.dataset.icon))
