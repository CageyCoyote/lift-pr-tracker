<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useWorkoutsStore } from '../stores/workouts'
import WorkoutCard from '../components/WorkoutCard.vue'

const workoutsStore = useWorkoutsStore()
const router = useRouter()

const creating = ref(false)
const newTitle = ref('')

function createWorkout() {
  const w = workoutsStore.createWorkout(newTitle.value)
  newTitle.value = ''
  creating.value = false
  router.push(`/plan/${w.id}`)
}

function open(id) {
  router.push(`/plan/${id}`)
}
</script>

<template>
  <div class="page">
    <header class="page-header">
      <span class="eyebrow">Sessions</span>
      <h1>Workouts</h1>
    </header>

    <div v-if="workoutsStore.workouts.length === 0" class="empty-state">
      No saved workouts yet. Create one below to start building a session.
    </div>

    <ul v-else class="workout-list">
      <li v-for="w in workoutsStore.workouts" :key="w.id">
        <button class="workout-link" @click="open(w.id)">
          <WorkoutCard :title="w.title" :muscles="workoutsStore.targetedMuscles(w.id)" :count="w.items.length" />
        </button>
      </li>
    </ul>

    <form v-if="creating" class="add-form" @submit.prevent="createWorkout">
      <input v-model="newTitle" type="text" placeholder="Workout name, e.g. Push Day" required autofocus />
      <button type="submit" class="btn btn-accent">Create</button>
    </form>
    <button v-else class="btn btn-accent fab" @click="creating = true">+ New Workout</button>
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: 16px;
}

.page-header h1 {
  font-size: 28px;
  margin-top: 2px;
}

.empty-state {
  margin-top: 24px;
  color: var(--color-text-dim);
  font-size: 14px;
  line-height: 1.5;
}

.workout-list {
  list-style: none;
  margin: 16px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.workout-link {
  display: block;
  width: 100%;
  background: none;
  border: none;
  padding: 0;
  color: inherit;
}

.add-form {
  display: flex;
  gap: 8px;
  margin-top: 18px;
}

.add-form input {
  flex: 1;
}

.fab {
  width: 100%;
  margin-top: 18px;
}
</style>
