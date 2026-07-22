import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { load, save } from '../utils/storage'

export const useContactsStore = defineStore('contacts', () => {
  const mappings = ref(load('contacts', {})) // remoteShareId → localPersonId

  watch(mappings, (v) => save('contacts', v), { deep: true })

  function getLocalPersonId(shareId) {
    return mappings.value[shareId] || null
  }

  function setMapping(shareId, localPersonId) {
    if (!shareId || !localPersonId) return
    mappings.value[shareId] = localPersonId
  }

  function removeMapping(shareId) {
    delete mappings.value[shareId]
  }

  // Keeps a mapping in sync when the person's shareId changes (e.g. a manual
  // regenerate). Only rekeys if the OLD shareId currently maps to this exact
  // person — never blindly overwrites an unrelated mapping that happens to
  // share the same key or personId.
  function rekeyMapping(oldShareId, newShareId, personId) {
    if (!oldShareId || !newShareId || oldShareId === newShareId) return
    if (mappings.value[oldShareId] === personId) {
      delete mappings.value[oldShareId]
      mappings.value[newShareId] = personId
    }
  }

  // Used when a person is deleted — a mapping is keyed by the *remote*
  // shareId, so we have to scan values (the local personId) to find it.
  function removeMappingsForPerson(personId) {
    for (const [shareId, localId] of Object.entries(mappings.value)) {
      if (localId === personId) delete mappings.value[shareId]
    }
  }

  return {
    mappings,
    getLocalPersonId,
    setMapping,
    removeMapping,
    removeMappingsForPerson,
    rekeyMapping,
  }
})
