<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWorkoutsStore } from '../stores/workouts'
import { useExercisesStore } from '../stores/exercises'
import { useRecordsStore } from '../stores/records'
import { usePeopleStore } from '../stores/people'
import ExercisePicker from '../components/ExercisePicker.vue'
import PRForm from '../components/PRForm.vue'

const route = useRoute()
const router = useRouter()
const workoutsStore = useWorkoutsStore()
const exercisesStore = useExercisesStore()
const recordsStore = useRecordsStore()
const peopleStore = usePeopleStore()

const formOpen = ref(false)
const logExercise = ref(null)

const workout = computed(() => workoutsStore.getWorkout(route.params.id))
const currentPerson = computed(() => peopleStore.getActivePerson())

function bestNote(exerciseId) {
  if (!peopleStore.activePersonId) return null
  return recordsStore.bestFor(peopleStore.activePersonId, exerciseId)
}

function openLog(item) {
  logExercise.value = exercisesStore.getById(item.exerciseId)
  formOpen.value = true
}

function handleSaved(payload) {
  recordsStore.addEntry({ personId: peopleStore.activePersonId, ...payload })
}

function open(id) {
  router.push(`/plan/${id}/edit`)
}

function openExerciseHint(exercise) {
  // opens a pop up window with the exercise image and instructions
  console.log(exercise.exerciseId)
}
</script>

<template>
  <div v-if="!workout" class="page">
    <p class="empty-state">Workout not found.</p>
    <router-link to="/plan" class="btn">Back to Workouts</router-link>
  </div>

  <div v-else class="page">
    <router-link to="/plan" class="back-link">← Workouts</router-link>

    <header class="page-header flex">
      <div>
        <h1 class="title-row">{{ workout.title }}</h1>
        <span v-if="currentPerson" class="subtitle">Recording for {{ currentPerson.name }}</span>
      </div>
      <div>
        <button class="action-btn edit-btn" @click="open(workout.id)" aria-label="Edit Workout">
          <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
      </div>
    </header>

    <div v-if="workout.items.length === 0" class="empty-state">
      This workout is empty. Add exercises below.
    </div>

    <ul v-else class="plan-list">
      <li v-for="(item, idx) in workout.items" :key="item.id" class="plan-row">
        <div class="plan-info">
          <span class="plan-index">{{ idx + 1 }}</span>
          <div class="plan-text">
            <button class="exercise-link" @click="openExerciseHint(item)">
              <span class="plan-name">{{ item.exerciseName }}</span>
            </button>
            <span v-if="bestNote(item.exerciseId)" class="plan-best">
              <template v-if="bestNote(item.exerciseId).unit === 'bodyweight'">
                PR: {{ bestNote(item.exerciseId).reps }} reps (bodyweight)
              </template>
              <template v-else>
                PR: {{ bestNote(item.exerciseId).weight }}{{ bestNote(item.exerciseId).unit }} ×
                {{ bestNote(item.exerciseId).reps }}
              </template>
            </span>
          </div>
        </div>
        <div class="plan-actions">
          <button v-if="peopleStore.activePersonId" class="btn log-btn" @click="openLog(item)"
            aria-label="Add a PR for item.exerciseName">+ PR</button>
        </div>
      </li>
    </ul>

    <PRForm v-model="formOpen" :initial-exercise="logExercise" @saved="handleSaved" />
  </div>
</template>

<style scoped>
.back-link {
  display: inline-block;
  color: var(--color-text-dim);
  text-decoration: none;
  font-size: 13px;
  margin-bottom: 10px;
}

.page-header {
  margin-bottom: 16px;
}

.page-header.flex {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
}

.subtitle {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--color-text-dim);
}

.page-header h1 {
  font-size: 28px;
  margin-top: 2px;
}

.title-row {}

.action-btn {
  background: none;
  border: none;
  line-height: 1;
  padding: 4px 6px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-btn {
  color: var(--color-steel);
}

.empty-state {
  margin-top: 24px;
  color: var(--color-text-dim);
  font-size: 14px;
  line-height: 1.5;
}

.plan-list {
  list-style: none;
  margin: 16px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.plan-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 10px 12px;
}

.plan-info {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.plan-index {
  font-family: var(--font-mono);
  color: var(--color-accent);
  font-size: 13px;
  width: 18px;
  flex-shrink: 0;
}

.plan-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.plan-name {
  font-weight: 600;
  font-size: 14px;
}

.exercise-link {
  display: block;
  width: 100%;
  background: none;
  border: none;
  padding: 0;
  color: inherit;
}

.plan-best {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-dim);
}

.plan-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.icon-btn {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  color: var(--color-text-dim);
  width: 30px;
  height: 30px;
  border-radius: 8px;
  font-size: 14px;
}

.icon-btn.danger {
  color: var(--color-danger);
}

.icon-btn:disabled {
  opacity: 0.35;
}

.log-btn {
  padding: 6px 12px;
  font-size: 13px;
  background: var(--color-steel);
  color: #fff;
  border: none;
}

.bottom-actions {
  display: flex;
  gap: 10px;
  margin-top: 18px;
}

.bottom-actions .btn {
  flex: 1;
}

.picker-panel {
  margin-top: 14px;
}

.chip {
  flex-shrink: 0;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  color: var(--color-text-dim);
  border-radius: 999px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  text-decoration: none;
}

.chip.active {
  background: var(--color-accent);
  color: #1a1500;
  border-color: var(--color-accent);
}
</style>
