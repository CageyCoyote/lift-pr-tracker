import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { load, save } from '../utils/storage'
import { useExercisesStore } from './exercises'

// Workout: { id, title, items: [{ id, exerciseId, exerciseName }] }
export const useWorkoutsStore = defineStore('workouts', () => {
  const workouts = ref(load('workouts', []))

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

  // Unique primary muscles across every exercise in the workout
  function targetedMuscles(workoutId) {
    const exercisesStore = useExercisesStore()
    const w = getWorkout(workoutId)
    if (!w) return []
    const muscles = new Set()
    for (const item of w.items) {
      const ex = exercisesStore.getById(item.exerciseId)
      ;(ex?.primaryMuscles || []).forEach((m) => muscles.add(m))
    }
    return [...muscles].sort()
  }

  return {
    workouts,
    getWorkout,
    createWorkout,
    removeWorkout,
    renameWorkout,
    addExercise,
    removeItem,
    moveUp,
    moveDown,
    targetedMuscles
  }
})
