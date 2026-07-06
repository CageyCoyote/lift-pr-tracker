import { createRouter, createWebHistory } from 'vue-router'
import RecordsView from '../views/records/RecordsView.vue'
import WorkoutsListView from '../views/workouts/WorkoutsListView.vue'
import WorkoutEditView from '../views/workouts/WorkoutEditView.vue'
import WorkoutDetailView from '../views/workouts/WorkoutDetailView .vue'
import PeopleView from '../views/people/PeopleView.vue'
import ExerciseLibraryView from '../views/library/ExerciseLibraryView.vue'
import ExerciseDetailView from '../views/library/ExerciseDetailView.vue'

export const router = createRouter({
  history: createWebHistory(import.meta.env.VUE_APP_BASE_URL || ''),
  base: import.meta.env.VUE_APP_BASE_URL || "/",
  routes: [
    { path: '/', name: 'records', component: RecordsView },
    { path: '/plan', name: 'workouts', component: WorkoutsListView },
    { path: '/plan/:id', name: 'plan-detail', component: WorkoutDetailView },
    { path: '/plan/:id/edit', name: 'edit-plan', component: WorkoutEditView },
    { path: '/people', name: 'people', component: PeopleView },
    { path: '/library', name: 'library', component: ExerciseLibraryView },
    { path: '/library/:id', name: 'exercise-detail', component: ExerciseDetailView }
  ],
  scrollBehavior (to, from, savedPosition) {
    if(to.name === 'library'){
      return savedPosition
    } else {
      // always scroll to top
      return { top: 0 }
    }
  }
})
