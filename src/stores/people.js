import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { load, save } from '../utils/storage'
import { uniqueNamesGenerator, adjectives, animals, NumberDictionary } from 'unique-names-generator'
import { useContactsStore } from './contacts'
import { useRecordsStore } from './records'
import { useSettingsStore } from './settings'

// Simple shareId generator using the installed library
function generateShareId() {
  // generate a number 001 - 999
  const numberDictionary = NumberDictionary.generate({ min: 1, max: 999 });
  const num = numberDictionary[0].padStart(3, '0')

  const config = {
    dictionaries: [adjectives, animals, [num]],
    separator: '_',
    length: 3,
    style: 'lowerCase',
  }
  let id = uniqueNamesGenerator(config)

  return id
}

export const usePeopleStore = defineStore('people', () => {
  const people = ref(load('people', []))
  const activePersonId = ref(load('activePersonId', null))

  // One-time migrations
  // 1. isPrimary for existing users
  if (people.value.length > 0 && !people.value.some(p => p.isPrimary)) {
    people.value[0].isPrimary = true
  }

  // 2. shareId for primary user Only (one-time)
  const primaryUser = getPrimaryUser()
  const hasShareId = primaryUser?.shareId
  if (primaryUser && !hasShareId) {
    primaryUser.shareId = generateShareId()
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
      shareId: primary ? generateShareId() : null,
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

    // Cross-store cleanup — nothing should reference a deleted personId.
    // Pulled in lazily (rather than at module scope) since Pinia stores
    // need an active app instance to instantiate.
    useContactsStore().removeMappingsForPerson(id)
    useRecordsStore().removeEntriesForPerson(id)
    useSettingsStore().clearIconColor(id)
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

  function getShareId(personId) {
    const person = people.value.find(p => p.id === personId)
    return person?.shareId || null
  }

  /** Updates a Persons `shareId`
   * 
   * If no `shareId` is provided it will generate one
   * 
   * @param { UUID = uuid } personId 
   * @param { ShareCode = String } newShareId 
   */
  function setShareId(personId, newShareId = null) {
    const person = people.value.find(p => p.id === personId)
    if (!person) return

    const oldShareId = person.shareId
    const shareid = newShareId || generateShareId()
    person.shareId = shareid.trim()

    // If this person's old shareId was the key for an existing contacts
    // mapping (i.e. they were originally created via import), rekey it so
    // the mapping doesn't silently point at a shareId that no longer exists.
    useContactsStore().rekeyMapping(oldShareId, person.shareId, personId)
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
    getShareId,
    setShareId,
  }
})