import { ref } from 'vue'

// Module-level (not per-component) so any component can fire a celebration
// and a single global <PrCelebration /> (mounted once in App.vue) can react
// to it, regardless of which screen the PR was logged from.
const celebration = ref(null) // null | { exerciseName, weight, reps, unit }

const DISPLAY_MS = 2600

let clearTimer = null

function celebrateNewPr(entry) {
  if (!entry) return

  celebration.value = {
    exerciseName: entry.exerciseName,//<- todo: some names are really long, consider removing
    weight: entry.weight,
    reps: entry.reps,
    unit: entry.unit,
  }

  if (navigator.vibrate) navigator.vibrate([15, 40, 15])

  clearTimeout(clearTimer)
  clearTimer = setTimeout(() => {
    celebration.value = null
  }, DISPLAY_MS)
}

function dismissCelebration() {
  clearTimeout(clearTimer)
  celebration.value = null
}

export function usePrCelebration() {
  return { celebration, celebrateNewPr, dismissCelebration }
}
