import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { load, save } from '../utils/storage'

export const useFavoritesStore = defineStore('favourites', () => {
  // Stored as an array in IDB, exposed as a Set for O(1) lookup
  const _ids = load('favourites', [])
  const ids = ref(new Set(_ids))

  watch(
    ids,
    (v) => save('favourites', [...v]),
    { deep: true }
  )

  function isFavorite(exerciseId) {
    return ids.value.has(exerciseId)
  }

  function toggle(exerciseId) {
    if (ids.value.has(exerciseId)) {
      ids.value.delete(exerciseId)
    } else {
      ids.value.add(exerciseId)
    }
    // Trigger reactivity — Set mutations aren't tracked automatically
    ids.value = new Set(ids.value)
  }

  return { ids, isFavorite, toggle }
})