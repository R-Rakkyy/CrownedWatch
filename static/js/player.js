// general
import "./shell.js"
import "./player/icons.js"

// controls
import "./player/controls/keyboard.js"
import "./player/controls/picture-click.js"
import "./player/controls/seekbar-keys.js"
import "./player/controls/seekbar.js"
import "./player/controls/volume.js"
import "./player/controls/fullscreen.js"

// settings panel
import "./player/panel/panel.js"
import "./player/settings/other.js"
import "./player/tracks/subtitle-style.js"
import "./player/tracks/subtitles.js"
import "./player/episodes.js"

// Watch Party
import "./player/progress.js"
import "./player/party/buffering.js"
import "./player/party/local-events.js"

import { followParty } from "./player/party/follow.js"
followParty()
