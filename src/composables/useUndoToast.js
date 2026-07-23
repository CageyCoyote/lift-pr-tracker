import { ref } from 'vue'

// Module-level singleton (same pattern as usePrCelebration) — a delete can
// happen from anywhere (a PR card, a workout's menu, an item row) and the
// undo window needs to survive a route change (e.g. deleting a workout
// navigates back to the list), so this can't live on a per-component ref.
const toast = ref(null) // null | { message, onUndo }

export const UNDO_DISPLAY_MS = 5000

const DISPLAY_MS = UNDO_DISPLAY_MS

let timer = null

// Showing a new toast immediately commits whatever was pending before it —
// its undo window closes the moment another delete happens, rather than
// trying to stack multiple undoable actions at once.
function showUndoToast(message, onUndo) {
  clearTimeout(timer)
  toast.value = { message, onUndo }
  timer = setTimeout(() => {
    toast.value = null
  }, DISPLAY_MS)
}

function undo() {
  if (!toast.value) return
  clearTimeout(timer)
  toast.value.onUndo()
  toast.value = null
}

function dismissUndoToast() {
  clearTimeout(timer)
  toast.value = null
}

export function useUndoToast() {
  return { toast, showUndoToast, undo, dismissUndoToast }
}
