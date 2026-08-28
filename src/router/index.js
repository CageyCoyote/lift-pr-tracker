import { createRouter, createWebHistory } from 'vue-router'
import Records from '../views/records/Records.vue'
import PRTimeline from '../views/records/PRTimeline.vue'
import WorkoutsList from '../views/workouts/WorkoutsList.vue'
import WorkoutEdit from '../views/workouts/WorkoutEdit.vue'
import WorkoutDetail from '../views/workouts/WorkoutDetail.vue'
import People from '../views/people/People.vue'
import ExerciseLibrary from '../views/library/ExerciseLibrary.vue'
import ExerciseDetail from '../views/library/ExerciseDetail.vue'
import Account from '../views/account/Account.vue'
import Welcome from '../views/account/Welcome.vue'

export const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE_URL || ''),
  base: import.meta.env.VITE_BASE_URL || '/',
  routes: [
    { path: '/welcome', name: 'welcome', component: Welcome, meta: { skipGuard: true } },
    { path: '/', name: 'records', component: Records },
    { path: '/records/:exerciseId/timeline', name: 'pr-timeline', component: PRTimeline },
    { path: '/plans', name: 'workouts', component: WorkoutsList },
    { path: '/plans/:id', name: 'plan-detail', component: WorkoutDetail },
    { path: '/plans/:id/edit', name: 'edit-plan', component: WorkoutEdit },
    { path: '/people', name: 'people', component: People },
    { path: '/library', name: 'library', component: ExerciseLibrary },
    { path: '/library/:id', name: 'exercise-detail', component: ExerciseDetail },
    { path: '/account', name: 'account', component: Account },
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