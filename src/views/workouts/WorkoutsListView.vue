<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useWorkoutsStore } from '../../stores/workouts'
import WorkoutCard from '../../components/workouts/WorkoutCard.vue'
import WorkoutQRSheet from '../../components/workouts/WorkoutQRSheet.vue'

const workoutsStore = useWorkoutsStore()
const router = useRouter()

const creating = ref(false)
const newTitle = ref('')
const qrOpen = ref(false)

function createWorkout() {
  const w = workoutsStore.createWorkout(newTitle.value)
  newTitle.value = ''
  creating.value = false
  router.push(`/plan/${w.id}/edit`)
}

function open(id) {
  router.push(`/plan/${id}`)
}

function handleImported(workout) {
  router.push(`/plan/${workout.id}`)
}

const muscles = (wid) => workoutsStore.targetedMuscles(wid)
</script>

<template>
  <div class="page">
    <header class="page-header">
      <h1>Workout Plans</h1>
      <button class="qr-btn" @click="qrOpen = true" aria-label="Scan & import workout">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
        </svg>
      </button>
    </header>

    <div v-if="workoutsStore.workouts.length === 0" class="empty-state">
      No saved workouts yet. Create one below or scan a QR code to import one.
    </div>

    <ul v-else class="workout-list">
      <li v-for="w in workoutsStore.workouts" :key="w.id">
        <button class="workout-link" @click="open(w.id)">
          <WorkoutCard :title="w.title" :muscles="muscles(w.id)" :count="w.items.length" />
        </button>
      </li>
    </ul>

    <form v-if="creating" class="add-form" @submit.prevent="createWorkout">
      <input v-model="newTitle" type="text" placeholder="Workout name, e.g. Push Day" required autofocus />
      <button type="submit" class="btn btn-accent">Create</button>
    </form>
    <button v-else class="btn btn-accent fab" @click="creating = true">+ New Workout</button>

    <!-- Scan-only QR sheet (no workout prop = opens straight to Scan tab) -->
    <WorkoutQRSheet v-model="qrOpen" :workout="null" @imported="handleImported" />
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.page-header h1 { font-size: 28px; }

.qr-btn {
  background: none;
  border: 1px solid var(--color-border);
  color: var(--color-text-dim);
  border-radius: var(--radius);
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: border-color 0.15s, color 0.15s;
}

.qr-btn:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
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

.add-form input { flex: 1; }

.fab {
  width: 100%;
  margin-top: 18px;
}
</style>