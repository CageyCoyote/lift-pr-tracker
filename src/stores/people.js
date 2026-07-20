import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { load, save } from '../utils/storage'

export const usePeopleStore = defineStore('people', () => {
  const people = ref(load('people', []))
  const activePersonId = ref(load('activePersonId', null))

  // One-time migration: existing users have no isPrimary flag.
  // Set it on people[0] if nobody has it yet — runs once, then
  // the watch below persists the updated shape to IDB.
  if (people.value.length > 0 && !people.value.some(p => p.isPrimary)) {
    people.value[0].isPrimary = true
  }

  watch(people, (v) => save('people', v), { deep: true })
  watch(activePersonId, (v) => save('activePersonId', v))

  function addPerson(name, { primary = false } = {}) {
    const trimmed = name.trim()
    if (!trimmed) return
    const person = {
      id: crypto.randomUUID(),
      name: trimmed,
      // isPrimary marks the account owner created at first launch.
      // Only one person should ever have this flag — set via WelcomeView.
      isPrimary: primary,
    }
    people.value.push(person)
    if (!activePersonId.value) activePersonId.value = person.id
    return person
  }

  function removePerson(id) {
    const person = people.value.find((p) => p.id === id)
    // Cannot delete the primary user or the last remaining person
    if (!person || person.isPrimary || people.value.length <= 1) return
    people.value = people.value.filter((p) => p.id !== id)
    if (activePersonId.value === id) {
      activePersonId.value = people.value[0]?.id ?? null
    }
  }

  function renamePerson(id, newName) {
    const trimmed = newName?.trim()
    if (!trimmed) return
    const person = people.value.find((p) => p.id === id)
    if (person) person.name = trimmed
  }

  function setActivePerson(id) {
    activePersonId.value = id
  }

  function getActivePerson() {
    if (activePersonId.value == null) return
    return people.value.find((p) => p.id === activePersonId.value)
  }

  // The account owner — stable regardless of array order or deletions
  function getPrimaryUser() {
    return people.value.find((p) => p.isPrimary) ?? people.value[0] ?? null
  }

  return {
    people,
    activePersonId,
    addPerson,
    removePerson,
    renamePerson,
    setActivePerson,
    getActivePerson,
    getPrimaryUser,
  }
})