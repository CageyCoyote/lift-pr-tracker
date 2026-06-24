import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { load, save } from '../utils/storage'

// An entry is one logged lift: { id, personId, exerciseId, exerciseName, weight, reps, unit, date }
export const useRecordsStore = defineStore('records', () => {
  const entries = ref(load('entries', []))

  watch(entries, (v) => save('entries', v), { deep: true })

  function addEntry({ personId, exerciseId, exerciseName, weight, reps, unit, date }) {
    const entry = {
      id: crypto.randomUUID(),
      personId,
      exerciseId,
      exerciseName,
      weight: Number(weight),
      reps: Number(reps) || 1,
      unit: unit || 'lb',
      date: date || new Date().toISOString().slice(0, 10)
    }
    entries.value.push(entry)
    return entry
  }

  function removeEntry(id) {
    entries.value = entries.value.filter((e) => e.id !== id)
  }

  function updateEntry(id, { weight, reps, unit, date }) {
    const entry = entries.value.find((e) => e.id === id)
    if (!entry) return
    entry.weight = unit === 'bodyweight' ? 0 : Number(weight)
    entry.reps = Number(reps) || 1
    entry.unit = unit
    entry.date = date
  }

  function historyFor(personId, exerciseId) {
    return entries.value
      .filter((e) => e.personId === personId && e.exerciseId === exerciseId)
      .sort((a, b) => b.date.localeCompare(a.date))
  }

  // For bodyweight entries the meaningful number is reps (no added weight);
  // for everything else it's weight, tie-broken by reps.
  function metric(e) {
    return e.unit === 'bodyweight' ? e.reps : e.weight
  }

  // Best entry per exercise for a person (highest metric, tie broken by reps)
  function bestFor(personId, exerciseId) {
    const all = entries.value.filter(
      (e) => e.personId === personId && e.exerciseId === exerciseId
    )
    if (all.length === 0) return null
    return all.reduce((best, e) =>
      metric(e) > metric(best) || (metric(e) === metric(best) && e.reps > best.reps) ? e : best
    )
  }

  // List of { exerciseId, exerciseName, best } for every exercise a person has logged
  function bestsForPerson(personId) {
    const ids = [...new Set(entries.value.filter((e) => e.personId === personId).map((e) => e.exerciseId))]
    return ids
      .map((id) => ({ exerciseId: id, best: bestFor(personId, id) }))
      .sort((a, b) => a.best.exerciseName.localeCompare(b.best.exerciseName))
  }

  return { entries, addEntry, removeEntry, updateEntry, historyFor, bestFor, bestsForPerson }
})
