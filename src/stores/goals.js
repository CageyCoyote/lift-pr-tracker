import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { load, save } from '../utils/storage'
import { getOldToNewExerciseIdMap } from '../utils/exerciseIdMigration'

// A goal is one target per person/exercise:
// { id, personId, exerciseId, unit, targetWeight, targetReps }
// For weighted exercises (unit: 'lb' | 'kg') targetWeight is the goal;
// for bodyweight exercises (unit: 'bodyweight') targetReps is the goal.
// Only one goal per (personId, exerciseId) pair — setting a new one
// replaces the old.

// Same legacy-exerciseId issue as entries/workouts can affect goals too
// (e.g. a goal set before the exercise-data migration, or restored from
// an old backup) — apply the same fix so a goal doesn't silently stop
// resolving against the current exercises store.
function migrateGoalExerciseIds(goalList) {
  const oldToNew = getOldToNewExerciseIdMap()
  let migrated = 0

  for (const goal of goalList) {
    if (oldToNew[goal.exerciseId]) {
      goal.exerciseId = oldToNew[goal.exerciseId]
      migrated++
    }
  }

  if (migrated > 0) {
    console.info(`[goals] Remapped ${migrated} exercise ID(s) to new scheme.`)
  }
  return migrated
}

export const useGoalsStore = defineStore('goals', () => {
  const loadedGoals = load('goals', [])
  const migratedCount = migrateGoalExerciseIds(loadedGoals)
  const goals = ref(loadedGoals)

  if (migratedCount > 0) save('goals', goals.value)

  watch(goals, (v) => save('goals', v), { deep: true })

  function getGoal(personId, exerciseId) {
    return goals.value.find((g) => g.personId === personId && g.exerciseId === exerciseId) || null
  }

  // unit: 'lb' | 'kg' | 'bodyweight'. Pass targetWeight for weighted
  // exercises, targetReps for bodyweight ones — setGoal only stores the
  // one that matters for the given unit.
  function setGoal({ personId, exerciseId, unit, targetWeight, targetReps }) {
    const existing = getGoal(personId, exerciseId)
    const value = {
      id: existing?.id || crypto.randomUUID(),
      personId,
      exerciseId,
      unit,
      targetWeight: unit === 'bodyweight' ? null : Number(targetWeight),
      targetReps: unit === 'bodyweight' ? Number(targetReps) : null,
    }

    if (existing) {
      Object.assign(existing, value)
    } else {
      goals.value.push(value)
    }
    return value
  }

  function removeGoal(personId, exerciseId) {
    goals.value = goals.value.filter((g) => !(g.personId === personId && g.exerciseId === exerciseId))
  }

  // Used when a person is deleted — strips every goal that belonged to them.
  function removeGoalsForPerson(personId) {
    goals.value = goals.value.filter((g) => g.personId !== personId)
  }

  // The single number a goal targets, regardless of unit — mirrors
  // recordsStore's metric() so goal progress and PR bests compare cleanly.
  function targetMetric(goal) {
    return goal.unit === 'bodyweight' ? goal.targetReps : goal.targetWeight
  }

  return { goals, getGoal, setGoal, removeGoal, removeGoalsForPerson, targetMetric }
})