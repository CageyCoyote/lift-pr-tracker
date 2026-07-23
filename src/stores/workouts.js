import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { load, save } from '../utils/storage'
import { useExercisesStore } from './exercises'
import exerciseList from '../data/exercises.json'

// One-time migration: remap old slug-based exerciseIds (e.g. 'Barbell_Bench_Press_-_Medium_Grip')
// to new short IDs (e.g. 'ex_002S'). Uses oldExId field as the bridge.
// Safe to run on every boot — skips items already on the new scheme.
function buildOldToNewMap() {
  const map = {}
  for (const ex of exerciseList) {
    if (ex.oldExId && ex.id) map[ex.oldExId] = ex.id
  }
  return map
}

function migrateExerciseIds(workoutList) {
  const oldToNew = buildOldToNewMap()
  let migrated = 0

  for (const workout of workoutList) {
    for (const item of workout.items ?? []) {
      if (oldToNew[item.exerciseId]) {
        item.exerciseId = oldToNew[item.exerciseId]
        migrated++
      }
    }
  }

  if (migrated > 0) {
    console.info(`[workouts] Remapped ${migrated} exercise ID(s) to new scheme.`)
  }
  return workoutList
}

// Workout: { id, shareId, title, items: [{ id, exerciseId, exerciseName }], createdAt, updatedAt }
export const useWorkoutsStore = defineStore('workouts', () => {
  const raw = load('workouts', [])
  const workouts = ref(migrateExerciseIds(raw))

  watch(workouts, (v) => save('workouts', v), { deep: true })

  function getWorkout(id) {
    return workouts.value.find((w) => w.id === id) || null
  }

  function createWorkout(title) {
    const workout = {
      id: crypto.randomUUID(),
      title: title?.trim() || 'Untitled Workout',
      items: []
    }
    workouts.value.push(workout)
    return workout
  }

  function removeWorkout(id) {
    workouts.value = workouts.value.filter((w) => w.id !== id)
  }

  // Puts a previously-removed workout back at its original position —
  // used by the undo toast. Falls back to the end of the list if the
  // original index is no longer valid (e.g. other workouts were removed
  // in the meantime).
  function restoreWorkout(workout, atIndex) {
    if (typeof atIndex === 'number' && atIndex >= 0 && atIndex <= workouts.value.length) {
      workouts.value.splice(atIndex, 0, workout)
    } else {
      workouts.value.push(workout)
    }
  }

  function renameWorkout(id, title) {
    const w = getWorkout(id)
    if (w && title?.trim()) w.title = title.trim()
  }

  function addExercise(workoutId, exercise) {
    const w = getWorkout(workoutId)
    if (!w) return
    w.items.push({ id: crypto.randomUUID(), exerciseId: exercise.id, exerciseName: exercise.name })
  }

  function removeItem(workoutId, itemId) {
    const w = getWorkout(workoutId)
    if (!w) return
    w.items = w.items.filter((i) => i.id !== itemId)
  }

  // Puts a previously-removed item back at its original position within
  // the workout — used by the undo toast. Order matters here (it's a
  // sequence of exercises), so unlike restoreEntry this needs an index.
  function restoreItem(workoutId, item, atIndex) {
    const w = getWorkout(workoutId)
    if (!w) return
    if (typeof atIndex === 'number' && atIndex >= 0 && atIndex <= w.items.length) {
      w.items.splice(atIndex, 0, item)
    } else {
      w.items.push(item)
    }
  }

  function moveUp(workoutId, itemId) {
    const w = getWorkout(workoutId)
    if (!w) return
    const i = w.items.findIndex((x) => x.id === itemId)
    if (i > 0) {
      const [item] = w.items.splice(i, 1)
      w.items.splice(i - 1, 0, item)
    }
  }

  function moveDown(workoutId, itemId) {
    const w = getWorkout(workoutId)
    if (!w) return
    const i = w.items.findIndex((x) => x.id === itemId)
    if (i !== -1 && i < w.items.length - 1) {
      const [item] = w.items.splice(i, 1)
      w.items.splice(i + 1, 0, item)
    }
  }

  // Import a workout from a scanned QR payload { v, title, items }
  function importWorkout(payload) {
    const now = new Date().toISOString()
    const workout = {
      id: crypto.randomUUID(),
      shareId: null,
      title: payload.title?.trim() || 'Imported Workout',
      items: (payload.items ?? []).map(i => ({
        id: crypto.randomUUID(),
        exerciseId: i.exerciseId,
        exerciseName: i.exerciseName
      })),
      createdAt: now,
      updatedAt: now,
    }
    workouts.value.push(workout)
    return workout
  }
  // Secondary muscles are filtered to exclude any that appear in the primary set.
  function targetedMuscles(workoutId) {
    const exercisesStore = useExercisesStore()
    const w = getWorkout(workoutId)
    if (!w) return { primary: new Set(), secondary: new Set() }

    const primaryMuscles = new Set()
    const secondaryMuscles = new Set()

    for (const item of w.items) {
      const ex = exercisesStore.getById(item.exerciseId)
        ; (ex?.primaryMuscles || []).forEach((m) => primaryMuscles.add(m))
        ; (ex?.secondaryMuscles || []).forEach((sm) => secondaryMuscles.add(sm))
    }
    // reconcile difference of the 2 Sets
    for (const m of secondaryMuscles) {
      if (primaryMuscles.has(m)) {
        secondaryMuscles.delete(m)
      }
    }

    return {
      primary: primaryMuscles,
      secondary: secondaryMuscles
    }
  }

  return {
    workouts,
    getWorkout,
    createWorkout,
    importWorkout,
    removeWorkout,
    restoreWorkout,
    renameWorkout,
    addExercise,
    removeItem,
    restoreItem,
    moveUp,
    moveDown,
    targetedMuscles
  }
})