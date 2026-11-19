import { stored } from "../lib/storage.js"

export const state = {
    // Party: the server owns playback, every client follows it
    party: null,        // last state sent by the server
    partyAt: 0,
    seekGuard: 0,

    wanted: +new URLSearchParams(location.search).get("id") || null, // from the Medias link
    holding: false,     // our buffer ran dry, the party waits for us
    userName: "",

    // the Media being played
    id: null,
    loaded: false,
    duration: 0,
    chapters: [],
    hls: null,

    // its tracks
    audioTracks: [],
    subTracks: [],
    trackEls: [],       // <track> elements, one per subtitle track
    currentSub: -1,
    lastSub: -1,        // what the CC button brings back
    offset: 0,          // subtitle delay in seconds

    // remembered choices
    step: +stored("step") || 10,
    buffer: +stored("buffer") || 120,
}
