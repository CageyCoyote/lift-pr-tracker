import { usePeopleStore } from '../stores/people'

/**
 * Share a PR via Web Share API, QR, or copy-to-clipboard.
 * Payload is a simple colon-delimited string for QR/paste compatibility.
 *
 * IMPORTANT: the identity in the payload is the PR's *owner* (the person
 * whose PR is being shared — props.personId on PRCard), not the currently
 * active/primary user. Those can differ (e.g. a coach sharing an athlete's
 * PR). The receiving app maps `shareId` -> a local personId, so it must
 * always refer to the same person on every share, hence the on-demand
 * generation below.
 */
export function useSharePR() {
  const peopleStore = usePeopleStore()

  // 7 fields after the prefix: shareId, personName, exerciseId, weight, unit, reps, date
  // (exerciseName intentionally omitted — every install shares the same exercises.json)
  function encodePRPayload(entry, personId) {
    if (!entry || !personId) return null

    const person = peopleStore.people.find((p) => p.id === personId)
    if (!person) return null

    // Secondary people only get a shareId on import or manual edit per spec —
    // but if we're the one sharing them out for the first time, generate one now
    // so the receiver has a stable identity to map against on future shares.
    if (!person.shareId) {
      peopleStore.setShareId(person.id)
    }

    const shareId = person.shareId

    return `PRK:PR:1:${shareId}:${person.name}:${entry.exerciseId}:${entry.weight}:${entry.unit}:${entry.reps}:${entry.date}`
  }

  function buildShareLink(entry, personId) {
    const payload = encodePRPayload(entry, personId)
    if (!payload) return null
    const base = import.meta.env.VITE_BASE_URL || '/'
    const url = new URL(base, window.location.origin)
    url.searchParams.set('d', payload)
    return url.toString()
  }

  /**
   * Attempts Web Share API first. Returns a result the caller (the share
   * sheet UI) uses to decide what to show next:
   *   'shared'        — handed off to the OS share sheet
   *   'unsupported'    — no Web Share API — caller should show the QR code
   *   'cancelled'      — user dismissed the OS share sheet
   */
  async function shareViaWebShare(entry, personId) {
    // update shareViaWebShare to send a tappable link instead of raw text
    const link = buildShareLink(entry, personId)
    if (!link) return 'error'
    if (!navigator.share) return 'unsupported'
    const person = peopleStore.people.find((p) => p.id === personId)
    try {
      await navigator.share({
        title: `PR: ${entry.exerciseName}`,
        text: `${person.name} wants to share a PR with you from PR Tracker`,
        url: link,
      })
      return 'shared'
    } catch (e) {
      if (e.name === 'AbortError') return 'cancelled'
      console.warn('Web Share failed:', e)
      return 'unsupported'
    }
  }

  async function copyToClipboard(entry, personId) {
    const textPayload = encodePRPayload(entry, personId)
    if (!textPayload) return 'error'
    try {
      await navigator.clipboard.writeText(textPayload)
      return 'copied'
    } catch (e) {
      console.error('Clipboard failed:', e)
      return 'failed'
    }
  }

  async function copyLinkToClipboard(entry, personId) {
    const link = buildShareLink(entry, personId)
    if (!link) return 'error'
    try {
      await navigator.clipboard.writeText(link)
      return 'copied'
    } catch (e) {
      console.error('Clipboard failed:', e)
      return 'failed'
    }
  }

  return {
    encodePRPayload,
    shareViaWebShare,
    copyToClipboard,
    copyLinkToClipboard,
  }
}
