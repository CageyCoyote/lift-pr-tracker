import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { load, save } from '../utils/storage'

// Item: { id, exerciseId, exerciseName }
export const useWorkoutPlanStore = defineStore('workoutPlan', () => {
  const items = ref(load('workoutPlan', []))

  watch(items, (v) => save('workoutPlan', v), { deep: true })

  function addExercise(exercise) {
    items.value.push({
      id: crypto.randomUUID(),
      exerciseId: exercise.id,
      exerciseName: exercise.name
    })
  }

  function removeItem(id) {
    items.value = items.value.filter((i) => i.id !== id)
  }

  function moveUp(id) {
    const i = items.value.findIndex((x) => x.id === id)
    if (i > 0) {
      const [item] = items.value.splice(i, 1)
      items.value.splice(i - 1, 0, item)
    }
  }

  function moveDown(id) {
    const i = items.value.findIndex((x) => x.id === id)
    if (i !== -1 && i < items.value.length - 1) {
      const [item] = items.value.splice(i, 1)
      items.value.splice(i + 1, 0, item)
    }
  }

  function clear() {
    items.value = []
  }

  return { items, addExercise, removeItem, moveUp, moveDown, clear }
})
