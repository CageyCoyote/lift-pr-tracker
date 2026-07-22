import { ref } from 'vue'
import { useRecordsStore } from '../stores/records'
import { usePeopleStore } from '../stores/people'
import { useContactsStore } from '../stores/contacts'
import { useExercisesStore } from '../stores/exercises'

export function useImportPR() {
  const recordsStore = useRecordsStore()
  const peopleStore = usePeopleStore()
  const contactsStore = useContactsStore()
  const exercisesStore = useExercisesStore()

  const importDialogOpen = ref(false)
  const pendingPayload = ref(null)
  const importOptions = ref([]) // for UI selection

  // Matches useSharePR's encodePRPayload — 7 fields after the prefix:
  // shareId, personName, exerciseId, weight, unit, reps, date
  function decodePRPayload(text) {
    const PREFIX = 'PRK:PR:1:'
    if (typeof text !== 'string' || !text.startsWith(PREFIX)) {
      return { error: 'Not a valid PR Tracker share code.' }
    }

    const parts = text.slice(PREFIX.length).split(':')
    if (parts.length < 7) {
      return { error: 'Malformed PR share code.' }
    }

    const [shareId, personName, exerciseId, weightStr, unit, repsStr, date] = parts

    if (!shareId || !exerciseId || !date) {
      return { error: 'Malformed PR share code.' }
    }

    const exercise = exercisesStore.getById(exerciseId)

    return {
      payload: {
        v: 1,
        shareId,
        personName,
        exerciseId,
        exerciseName: exercise?.name ?? `Unknown exercise (${exerciseId})`,
        weight: Number(weightStr),
        unit,
        reps: Number(repsStr),
        date,
      }
    }
  }

  function startImport(text) {
    const { payload, error } = decodePRPayload(text)
    if (error) {
      return { error }
    }

    pendingPayload.value = payload

    // Check if we already have a mapping for this shareId
    const existingPersonId = contactsStore.getLocalPersonId(payload.shareId)
    if (existingPersonId) {
      // Auto-import — no need to prompt for who this is
      const targetPersonId = finishImport(existingPersonId)
      return { autoImported: true, personId: targetPersonId }
    }

    // No mapping yet — prepare options for the confirmation dialog:
    // existing people + option to create a new one. Flag any existing person
    // who already has their *own* shareId different from the sender's — picking
    // one of those usually means "wrong tap" (e.g. selecting yourself instead of
    // the new contact), since it would fold someone else's PRs into an identity
    // that isn't theirs.
    importOptions.value = [
      ...peopleStore.people.map(p => ({
        id: p.id,
        name: p.name,
        isNew: false,
        identityMismatch: !!p.shareId && p.shareId !== payload.shareId,
      })),
      {
        id: 'new',
        name: `Add "${payload.personName}"`,
        isNew: true,
        identityMismatch: false,
      },
    ]

    importDialogOpen.value = true
    return { needsConfirmation: true }
  }

  function finishImport(personId) {
    if (!pendingPayload.value) return

    const payload = pendingPayload.value
    let targetPersonId = personId

    if (personId === 'new') {
      const newPerson = peopleStore.addPerson(payload.personName)
      if (!newPerson) return
      targetPersonId = newPerson.id
      // Stamp the sender's shareId onto the new person so it stays in sync
      // with the contacts mapping below — addPerson() only auto-generates
      // a shareId for primary users, so secondary imports need this explicitly.
      peopleStore.setShareId(targetPersonId, payload.shareId)
    }

    // Store the mapping so future PRs from this shareId auto-import
    contactsStore.setMapping(payload.shareId, targetPersonId)

    // Add the entry, tagged with the sender's shareId so a wrong tap here
    // can be traced and repaired later via reassignImportedEntries.
    recordsStore.addEntry({
      personId: targetPersonId,
      exerciseId: payload.exerciseId,
      exerciseName: payload.exerciseName,
      weight: payload.weight,
      reps: payload.reps,
      unit: payload.unit,
      date: payload.date,
      importedFrom: payload.shareId,
    })

    // Reset
    importDialogOpen.value = false
    pendingPayload.value = null
    importOptions.value = []

    return targetPersonId
  }

  function cancelImport() {
    importDialogOpen.value = false
    pendingPayload.value = null
    importOptions.value = []
  }

  return {
    importDialogOpen,
    pendingPayload,
    importOptions,
    startImport,
    finishImport,
    cancelImport,
    decodePRPayload,
  }
}
