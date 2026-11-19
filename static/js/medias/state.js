export const state = {
    me: null,       // { name, role }
    here: null,     // id of the folder being shown, null for the root
    archived: false,
    timer: null,    // polling while something is being processed
}
