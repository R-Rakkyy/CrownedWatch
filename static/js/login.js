import { $ } from "./lib/dom.js"

const error = $("#err")
const params = new URLSearchParams(location.search)

if (params.has("error")) error.hidden = false
if (params.get("error") === "2") error.textContent = "Too many attempts. Try again in a few minutes."
