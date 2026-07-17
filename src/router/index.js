import { createRouter, createWebHistory } from 'vue-router'
import RecordsView from '../views/records/RecordsView.vue'
import WorkoutsListView from '../views/workouts/WorkoutsListView.vue'
import WorkoutEditView from '../views/workouts/WorkoutEditView.vue'
import WorkoutDetailView from '../views/workouts/WorkoutDetailView .vue'
import PeopleView from '../views/people/PeopleView.vue'
import ExerciseLibraryView from '../views/library/ExerciseLibraryView.vue'
import ExerciseDetailView from '../views/library/ExerciseDetailView.vue'
import AccountView from '../views/account/AccountView.vue'
import WelcomeView from '../views/account/WelcomeView.vue'

export const router = createRouter({
  history: createWebHistory(import.meta.env.VUE_APP_BASE_URL || ''),
  base: import.meta.env.VUE_APP_BASE_URL || '/',
  routes: [
    { path: '/welcome', name: 'welcome', component: WelcomeView, meta: { skipGuard: true } },
    { path: '/', name: 'records', component: RecordsView },
    { path: '/plan', name: 'workouts', component: WorkoutsListView },
    { path: '/plan/:id', name: 'plan-detail', component: WorkoutDetailView },
    { path: '/plan/:id/edit', name: 'edit-plan', component: WorkoutEditView },
    { path: '/people', name: 'people', component: PeopleView },
    { path: '/library', name: 'library', component: ExerciseLibraryView },
    { path: '/library/:id', name: 'exercise-detail', component: ExerciseDetailView },
    { path: '/account', name: 'account', component: AccountView },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (to.name === 'library') return savedPosition
    return { top: 0 }
  }
})

// Guard: redirect to /welcome on first launch (no people added yet).
// Skipped for /welcome itself and /account so users can still manage settings.
router.beforeEach((to) => {
  if (to.meta.skipGuard || to.name === 'account' || to.name === 'people') return true

  // Lazy import to avoid circular dependency with main.js
  return import('../stores/people').then(({ usePeopleStore }) => {
    const peopleStore = usePeopleStore()
    if (peopleStore.people.length === 0) {
      return { name: 'welcome' }
    }
  })
})