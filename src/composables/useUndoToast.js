import { ref } from 'vue'

// Module-level singleton (same pattern as usePrCelebration) — a toast can
// be triggered from anywhere (a PR card, a workout's menu, an imported
// share link) and needs to survive a route change (e.g. deleting a
// workout navigates back to the list), so this can't live on a
// per-component ref.
//
// This one ref/timer backs BOTH undoable toasts (delete + undo) and plain
// info/success toasts (PR imported, goal achieved) — showing any new toast
// commits/dismisses whatever was pending before it, rather than trying to
// stack multiple toasts on screen at once.
const toast = ref(null) // null | { message, onUndo?, variant }

export const UNDO_DISPLAY_MS = 5000
export const TOAST_DISPLAY_MS = 3500

let timer = null

// Generic toast — no undo action. `variant` drives styling (e.g. 'success'
// for the goal-achieved toast, matching the green used elsewhere for
// overshoot/goal-met states).
function showToast(message, { variant = 'default', durationMs = TOAST_DISPLAY_MS } = {}) {
  clearTimeout(timer)
  toast.value = { message, onUndo: null, variant, durationMs }
  timer = setTimeout(() => {
    toast.value = null
  }, durationMs)
}

// Showing a new toast immediately commits whatever was pending before it —
// its undo window closes the moment another delete happens, rather than
// trying to stack multiple undoable actions at once.
function showUndoToast(message, onUndo) {
  clearTimeout(timer)
  toast.value = { message, onUndo, variant: 'default', durationMs: UNDO_DISPLAY_MS }
  timer = setTimeout(() => {
    toast.value = null
  }, UNDO_DISPLAY_MS)
}

function undo() {
  if (!toast.value?.onUndo) return
  clearTimeout(timer)
  toast.value.onUndo()
  toast.value = null
}

function dismissUndoToast() {
  clearTimeout(timer)
  toast.value = null
}

export function useUndoToast() {
  return { toast, showToast, showUndoToast, undo, dismissUndoToast }
}