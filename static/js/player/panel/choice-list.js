import { esc } from "../../lib/dom.js"
import { svg } from "../icons.js"

export function choiceButton(html, onclick) {
    const button = document.createElement("button")

    button.type = "button"
    button.innerHTML = `<span>${html}</span>${svg("check")}`
    button.onclick = onclick
    return button
}

export function fillList(list, labels, selected, onPick) {
    list.replaceChildren(...labels.map((text, i) => {
        const button = choiceButton(esc(text), () => onPick(i))

        button.setAttribute("role", "radio")
        button.setAttribute("aria-checked", i === selected)
        return button
    }))
}

export function markSelected(list, selected) {
    Array.from(list.children).forEach((button, i) => {
        button.setAttribute("aria-checked", i === selected)
    })
}
