// exerciseIdMigration.js — shared helper for remapping legacy slug-based
// exerciseIds (e.g. 'Barbell_Bench_Press_-_Medium_Grip') to the current
// short IDs (e.g. 'ex_002') used throughout the app.
//
// The bridge lives on new-exercises.json itself: each entry carries an
// `oldExId` pointing back to the id it used to have under the old scheme.
// (Previously this was built from data/exercises.json, which doesn't
// actually have an oldExId field — that map was always empty.)

import currentExercises from '../data/new-exercises.json'

let cachedMap = null

export function getOldToNewExerciseIdMap() {
  if (cachedMap) return cachedMap
  const map = {}
  for (const ex of currentExercises) {
    if (ex.oldExId && ex.id) map[ex.oldExId] = ex.id
  }
  cachedMap = map
  return map
}

// Returns the current id for a possibly-legacy exerciseId, or the id
// unchanged if it's already current (or unrecognized).
export function migrateExerciseId(exerciseId) {
  const map = getOldToNewExerciseIdMap()
  return map[exerciseId] || exerciseId
}