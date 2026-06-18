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
    people.value = people.value.filter((p) => p.id !== id)
    if (activePersonId.value === id) {
      activePersonId.value = people.value[0]?.id ?? null
    }
  }

  function setActivePerson(id) {
    activePersonId.value = id
  }

  function getActivePerson() {
    if (activePersonId.value == null) { return }
    let one = people?.value?.filter(p => p?.id === activePersonId?.value)[0]
    return one
  }

  return { people, activePersonId, addPerson, removePerson, setActivePerson, getActivePerson }
})
