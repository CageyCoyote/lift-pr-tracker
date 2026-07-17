import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { load, save } from '../utils/storage'

export const usePeopleStore = defineStore('people', () => {
  const people = ref(load('people', []))
  const activePersonId = ref(load('activePersonId', null))

  watch(people, (v) => save('people', v), { deep: true })
  watch(activePersonId, (v) => save('activePersonId', v))

  function addPerson(name) {
    const trimmed = name.trim()
    if (!trimmed) return
    const person = { id: crypto.randomUUID(), name: trimmed }
    people.value.push(person)
    if (!activePersonId.value) activePersonId.value = person.id
    return person
  }

  function removePerson(id) {
    // Guard — must always have at least one person
    if (people.value.length <= 1) return
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

  return { people, activePersonId, addPerson, removePerson, renamePerson, setActivePerson, getActivePerson }
})