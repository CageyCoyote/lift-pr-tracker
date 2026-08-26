import { ref } from 'vue'

// Module-level (not per-component) so any component can fire a celebration
// and a single global <GoalCelebration /> (mounted once in App.vue) can
// react to it, regardless of which screen the goal-crossing PR was logged
// from. Mirrors usePrCelebration's pattern — kept as a separate module
// (rather than folded into it) since this is a visually distinct, rarer
// event: it only fires on the specific entry that crosses a goal from
// under-target to at/over-target, never on ordinary new PRs.
const celebration = ref(null) // null | { exerciseName, weight, reps, unit }

const DISPLAY_MS = 2600

let clearTimer = null

function celebrateGoalMet(entry) {
  if (!entry) return

  celebration.value = {
    exerciseName: entry.exerciseName,
    weight: entry.weight,
    reps: entry.reps,
    unit: entry.unit,
  }

  if (navigator.vibrate) navigator.vibrate([20, 40, 20, 40, 20])

  clearTimeout(clearTimer)
  clearTimer = setTimeout(() => {
    celebration.value = null
  }, DISPLAY_MS)
}

function dismissGoalCelebration() {
  clearTimeout(clearTimer)
  celebration.value = null
}

export function useGoalCelebration() {
  return { celebration, celebrateGoalMet, dismissGoalCelebration }
}