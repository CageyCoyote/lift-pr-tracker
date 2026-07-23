<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWorkoutsStore } from '../../stores/workouts'
import { useExercisesStore } from '../../stores/exercises'
import { useRecordsStore } from '../../stores/records'
import ExercisePicker from '../../components/exercises/ExercisePicker.vue'
import PRForm from '../../components/records/PRForm.vue'
import { useCurrentUser } from "../../composables/useCurrentUser.js";
import { usePrCelebration } from '../../composables/usePrCelebration'

const route = useRoute()
const router = useRouter()
const workoutsStore = useWorkoutsStore()
const exercisesStore = useExercisesStore()
const recordsStore = useRecordsStore()
const { userId } = useCurrentUser()
const { celebrateNewPr } = usePrCelebration()

const workout = computed(() => workoutsStore.getWorkout(route.params.id))

const pickerOpen = ref(false)
const formOpen = ref(false)
const logExercise = ref(null)
const renaming = ref(false)
const titleDraft = ref('')

function addExercise(ex) {
  workoutsStore.addExercise(workout.value.id, ex)
  pickerOpen.value = false
}

function bestNote(exerciseId) {
  if (!userId.value) return null
  return recordsStore.bestFor(userId.value, exerciseId)
}

function openLog(item) {
  logExercise.value = exercisesStore.getById(item.exerciseId)
  formOpen.value = true
}

function handleSaved(payload) {
  const { entry, isNewBest } = recordsStore.addEntry({ personId: userId.value, ...payload })
  if (isNewBest) celebrateNewPr(entry)
}

function startRename() {
  titleDraft.value = workout.value.title
  renaming.value = true
}

function saveRename() {
  workoutsStore.renameWorkout(workout.value.id, titleDraft.value)
  renaming.value = false
}
</script>

<template>
  <div v-if="!workout" class="page">
    <p class="empty-state">Workout not found.</p>
    <router-link to="/plans" class="btn">Back to Workouts</router-link>
  </div>

  <div v-else class="page">
    <router-link :to="{ name: 'plan-detail', params: { id: workout.id } }" class="back-link">← Back</router-link>

    <header class="page-header">
      <form v-if="renaming" class="rename-form" @submit.prevent="saveRename">
        <input v-model="titleDraft" type="text" placeholder="Workout name, e.g. Push Day" required autofocus />
        <button type="submit" class="btn btn-accent">Save</button>
      </form>

      <h1 v-else class="title-row" @click="startRename">{{ workout.title }}</h1>
    </header>

    <div v-if="workout.items.length === 0" class="empty-state">
      This workout is empty. Add exercises below.
    </div>

    <ul v-else class="plan-list">
      <li v-for="(item, idx) in workout.items" :key="item.id" class="plan-row">
        <div class="plan-info">
          <span class="plan-index">{{ idx + 1 }}</span>
          <div class="plan-text">
            <span class="plan-name">{{ item.exerciseName }}</span>
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
          <button class="icon-btn" :disabled="idx === 0" @click="workoutsStore.moveUp(workout.id, item.id)"
            aria-label="Move up">↑</button>
          <button class="icon-btn" :disabled="idx === workout.items.length - 1"
            @click="workoutsStore.moveDown(workout.id, item.id)" aria-label="Move down">↓</button>
          <button class="icon-btn danger" @click="workoutsStore.removeItem(workout.id, item.id)"
            aria-label="Remove">×</button>
        </div>
      </li>
    </ul>

    <div class="bottom-actions">
      <button class="btn btn-accent" @click="pickerOpen = !pickerOpen">
        {{ pickerOpen ? 'Close' : '+ Add Exercise' }}
      </button>
      <button class="btn add-button-outline steel" @click="router.push({ name: 'plan-detail', params: { id: workout.id } })">
        Save
      </button>
    </div>

    <div v-if="pickerOpen" class="picker-panel">
      <ExercisePicker @select="addExercise" />
    </div>

    <PRForm v-model="formOpen" :initial-exercise="logExercise" @saved="handleSaved" />
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: 16px;
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

.title-row {
  cursor: pointer;
  text-transform: capitalize;
}

.rename-form {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.rename-form input {
  flex: 1;
  font-family: var(--font-display);
  font-size: 20px;
  /* text-transform: uppercase; */
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

.add-button-outline.steel  {
  background: var(--color-bg);
  border-color: var(--color-steel);
  color: var(--color-steel);
  border-width: 2px;
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