import "./shell.js"

import { me } from "./lib/me.js"
import { load } from "./medias/list.js"
import { state } from "./medias/state.js"

import "./medias/actions.js"
import "./medias/toolbar.js"
import "./medias/upload.js"

me.then(user => {
    state.me = user
    load()
})
