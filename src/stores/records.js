import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { load, save } from '../utils/storage'
import { useExercisesStore } from "./exercises";

// An entry is one logged lift:
// { id, personId, exerciseId, exerciseName, weight, reps, unit, date, importedFrom? }
// `importedFrom` — when set, holds the sender's shareId. Only present on
// entries created via useImportPR, so a bad mapping/import can be traced
// and repaired later (see reassignImportedEntries below).
export const useRecordsStore = defineStore('records', () => {
  const entries = ref(load('entries', []))

  watch(entries, (v) => save('entries', v), { deep: true })

  function addEntry({ personId, exerciseId, exerciseName, weight, reps, unit, date, importedFrom }) {
    let exName = exerciseName
    if(!exerciseName){
      const exerciseStore = useExercisesStore()
      const ex = exerciseStore.getById(exerciseId)
      exName = ex.name
    }
    const entry = {
      id: crypto.randomUUID(),
      personId,
      exerciseId,
      exerciseName: exName,
      weight: Number(weight),
      reps: Number(reps) || 1,
      unit: unit || 'lb',
      date: date || new Date().toISOString().slice(0, 10),
      ...(importedFrom ? { importedFrom } : {}),
    }

    // Snapshot the previous best BEFORE pushing, so we can tell whether
    // this entry just became the new best for this person/exercise.
    const previousBest = bestFor(personId, exerciseId)
    entries.value.push(entry)

    const isNewBest =
      !previousBest ||
      metric(entry) > metric(previousBest) ||
      (metric(entry) === metric(previousBest) && entry.reps > previousBest.reps)

    return { entry, isNewBest, previousBest }
  }

  function removeEntry(id) {
    entries.value = entries.value.filter((e) => e.id !== id)
  }

  // Puts a previously-removed entry back exactly as it was (same id, date,
  // etc.) — used by the undo toast. Deliberately NOT addEntry: this must
  // not regenerate an id or re-trigger new-PR detection for something the
  // person is simply putting back, not logging.
  function restoreEntry(entry) {
    entries.value.push(entry)
  }

  // Used when a person is deleted — strips every PR entry that belonged to them.
  function removeEntriesForPerson(personId) {
    entries.value = entries.value.filter((e) => e.personId !== personId)
  }

  // Repair path for a mis-imported PR: moves every entry that (a) came from
  // this specific shareId and (b) is currently sitting on the wrong local
  // person, over onto the correct person. Scoped by shareId so it only
  // touches entries from that one sender, not everything toPersonId owns.
  function reassignImportedEntries(shareId, fromPersonId, toPersonId) {
    let moved = 0
    for (const e of entries.value) {
      if (e.importedFrom === shareId && e.personId === fromPersonId) {
        e.personId = toPersonId
        moved++
      }
    }
    return moved
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

  return { entries, addEntry, removeEntry, restoreEntry, removeEntriesForPerson, reassignImportedEntries, updateEntry, historyFor, bestFor, bestsForPerson }
})
