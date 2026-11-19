// localStorage is where settings lives.

export function store(key, value) {
    try {
        if (value == null) localStorage.removeItem(key)
        else localStorage.setItem(key, value)
    } catch {}
}

export function stored(key) {
    try {
        return localStorage.getItem(key)
    } catch {}
}
