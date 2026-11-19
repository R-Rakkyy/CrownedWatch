import { pad } from "../lib/format.js"

// 99942 -> "1d 3h 45m 42s"
export function dur(seconds) {
    const s = Math.round(seconds)
    const days = Math.floor(s / 86400)
    const hours = Math.floor(s % 86400 / 3600)
    const minutes = Math.floor(s % 3600 / 60)

    return (days ? `${days}d ` : "") + (hours || days ? `${hours}h ` : "") + `${minutes}m ${s % 60}s`
}

// Always with hours: 67 -> "1:07:00" (*backflip*)
export function clock(seconds) {
    const hours = Math.floor(seconds / 3600)
    return `${hours}:${pad(Math.floor(seconds / 60) % 60)}:${pad(Math.floor(seconds) % 60)}`
}
