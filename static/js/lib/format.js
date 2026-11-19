export const pad = n => String(n).padStart(2, "0")

// 75 -> "1:15", 3725 -> "1:02:05"
export function fmt(seconds) {
    const s = Math.max(0, Math.floor(seconds || 0))
    const hours = Math.floor(s / 3600)
    const minutes = Math.floor(s / 60) % 60

    return hours ? `${hours}:${pad(minutes)}:${pad(s % 60)}` : `${minutes}:${pad(s % 60)}`
}

export function size(bytes) {
    if (bytes >= 2 ** 40) return `${(bytes / 2 ** 40).toFixed(2)} TB`
    if (bytes >= 2 ** 30) return `${(bytes / 2 ** 30).toFixed(2)} GB`
    if (bytes >= 2 ** 20) return `${(bytes / 2 ** 20).toFixed(1)} MB`
    return `${Math.round(bytes / 1024)} KB`
}
