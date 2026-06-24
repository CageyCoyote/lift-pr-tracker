import { createRouter, createWebHistory } from 'vue-router'
import RecordsView from '../views/RecordsView.vue'
import WorkoutsListView from '../views/WorkoutsListView.vue'
import PlanWorkoutView from '../views/PlanWorkoutView.vue'
import PeopleView from '../views/PeopleView.vue'
import ExerciseLibraryView from '../views/ExerciseLibraryView.vue'

export const router = createRouter({
  history: createWebHistory(import.meta.env.VUE_APP_BASE_URL || ''),
  base: import.meta.env.VUE_APP_BASE_URL || "/",
  routes: [
    { path: '/', name: 'records', component: RecordsView },
    { path: '/plan', name: 'workouts', component: WorkoutsListView },
    { path: '/plan/:id', name: 'plan-detail', component: PlanWorkoutView },
    { path: '/people', name: 'people', component: PeopleView },
    { path: '/library', name: 'library', component: ExerciseLibraryView }
    // { path: '/library/:id', name: 'exercise-detail', component: ExerciseDetailView }
  ]
})
