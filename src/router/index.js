import { createRouter, createWebHistory } from 'vue-router'
import RecordsView from '../views/RecordsView.vue'
import PlanWorkoutView from '../views/PlanWorkoutView.vue'
import PeopleView from '../views/PeopleView.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'records', component: RecordsView },
    { path: '/plan', name: 'plan', component: PlanWorkoutView },
    { path: '/people', name: 'people', component: PeopleView }
  ]
})
