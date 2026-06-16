import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import rawExercises from '../data/exercises.json'

export const useExercisesStore = defineStore('exercises', () => {
  const list = ref(rawExercises)

  const byId = computed(() => {
    const map = {}
    for (const ex of list.value) map[ex.id] = ex
    return map
  })

  const equipmentOptions = computed(() =>
    [...new Set(list.value.map((e) => e.equipment).filter(Boolean))].sort()
  )

  const muscleOptions = computed(() =>
    [...new Set(list.value.flatMap((e) => e.primaryMuscles || []))].sort()
  )

  function search({ query = '', equipment = '', muscle = '' } = {}) {
    const q = query.trim().toLowerCase()
    return list.value.filter((e) => {
      if (q && !e.name.toLowerCase().includes(q)) return false
      if (equipment && e.equipment !== equipment) return false
      if (muscle && !(e.primaryMuscles || []).includes(muscle)) return false
      return true
    })
  }

  function getById(id) {
    return byId.value[id]
  }

  return { list, byId, equipmentOptions, muscleOptions, search, getById }
})
