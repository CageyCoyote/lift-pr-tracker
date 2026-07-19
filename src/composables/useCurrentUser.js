import { computed } from 'vue'
import { usePeopleStore } from '../stores/people'

/**
 * Single source of truth for "who is the current user."
 *
 * TODAY (local-only):
 *   - Primary user = people[0] (first person added, never deletable)
 *   - Active user  = whoever is selected in the person switcher
 *
 * WHEN AUTH ARRIVES:
 *   Replace the two computed definitions below with reads from your
 *   auth store (Supabase, Auth0, etc). Everything consuming this
 *   composable stays untouched.
 *
 *   Example post-auth swap:
 *     const authStore = useAuthStore()
 *     const currentUser = computed(() => authStore.user)
 *     const activeUser  = computed(() => authStore.user)
 */
export function useCurrentUser() {
  const peopleStore = usePeopleStore()

  /** The primary/owner account on this device — identified by isPrimary flag
  * set at first launch via WelcomeView. Falls back to people[0] for existing
  * users who were created before this flag existed.
  */
  const currentUser = computed(() => peopleStore.getPrimaryUser())

  /**  The person currently selected in the switcher — may differ from
  *  currentUser when tracking multiple people (e.g. a coach logging
  *  PRs for several athletes).
  */
  const activeUser = computed(() => peopleStore.getActivePerson() ?? null)

  /** shorthand for activeUser.id
   *  Convenience: the ID used to key all store lookups (PRs, settings, etc.)
  */
  const userId = computed(() => activeUser.value?.id ?? null)

  // Post-auth this becomes "is the user authenticated"
  // For now: true once at least one person exists
  const isLoggedIn = computed(() => !!currentUser.value)

  return {
    currentUser,   // primary account holder
    activeUser,    // currently selected person (use this for PR/workout lookups)
    userId,        // shorthand for activeUser.id
    isLoggedIn,    // gates auth-protected views
  }
}