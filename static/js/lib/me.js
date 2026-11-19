import { getJson } from "./api.js"

// The logged-in user: { name, role }. Basically, me.
export const me = getJson("/api/me")
