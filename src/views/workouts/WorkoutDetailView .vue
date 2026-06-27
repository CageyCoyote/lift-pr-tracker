<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWorkoutsStore } from '../../stores/workouts'
import { useExercisesStore } from '../../stores/exercises'
import { useRecordsStore } from '../../stores/records'
import { usePeopleStore } from '../../stores/people'
import PRNewForm from '../../components/records/PRNewForm.vue'

const IMAGE_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/'

const route = useRoute()
const router = useRouter()
const workoutsStore = useWorkoutsStore()
const exercisesStore = useExercisesStore()
const recordsStore = useRecordsStore()
const peopleStore = usePeopleStore()

const formOpen = ref(false)
const logExercise = ref(null)

// Exercise hint sheet
const hintOpen = ref(false)
const hintExercise = ref(null)

const workout = computed(() => workoutsStore.getWorkout(route.params.id))

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

function openExerciseHint(item) {
  hintExercise.value = exercisesStore.getById(item.exerciseId)
  hintOpen.value = true
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
        <h1>{{ workout.title }}</h1>
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
      This workout is empty.
      <router-link class="accent-link" :to="{ name: 'edit-plan', params: { id: workout.id } }"
        aria-label="Edit Workout">
        Add exercises here.
      </router-link>
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

    <PRNewForm v-model="formOpen" :initial-exercise="logExercise" @saved="handleSaved" />

    <!-- Exercise hint sheet -->
    <div v-if="hintOpen && hintExercise" class="overlay" @click.self="hintOpen = false">
      <div class="sheet">
        <header class="sheet-header">
          <h3 class="sheet-title">{{ hintExercise.name }}</h3>
          <button class="close-btn" @click="hintOpen = false" aria-label="Close">×</button>
        </header>

        <!-- Images -->
        <div v-if="hintExercise.images?.length" class="image-row">
          <img v-for="(img, i) in hintExercise.images" :key="i" :src="IMAGE_BASE + img"
            :alt="`${hintExercise.name} step ${i + 1}`" class="hint-img" loading="lazy" />
        </div>

        <!-- Instructions -->
        <ol class="instructions">
          <li v-for="(step, i) in hintExercise.instructions" :key="i" class="step">
            <span class="step-num">{{ i + 1 }}</span>
            <p class="step-text">{{ step }}</p>
          </li>
        </ol>
      </div>
    </div>
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
  text-transform: capitalize;
}

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

.accent-link {
  color: var(--color-accent);
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

.exercise-link {
  display: block;
  background: none;
  border: none;
  padding: 0;
  color: inherit;
  text-align: left;
  cursor: pointer;
}

.exercise-link:hover .plan-name {
  color: var(--color-accent);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.plan-name {
  font-weight: 600;
  font-size: 14px;
  transition: color 0.15s ease;
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

.log-btn {
  padding: 6px 12px;
  font-size: 13px;
  background: var(--color-steel);
  color: #fff;
  border: none;
}

/* ── Hint sheet ── */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: flex-end;
  z-index: 20;
}

.sheet {
  width: 100%;
  max-height: 78vh;
  overflow-y: auto;
  background: var(--color-surface);
  border-radius: 16px 16px 0 0;
  padding: 18px 16px calc(28px + env(safe-area-inset-bottom, 0px));
  border-top: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sheet-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.sheet-title {
  font-size: 16px;
  line-height: 1.3;
  flex: 1;
}

.close-btn {
  background: none;
  border: none;
  color: var(--color-text-dim);
  font-size: 24px;
  line-height: 1;
  flex-shrink: 0;
}

/* ── Images ── */
.image-row {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  flex-shrink: 0;
}

.hint-img {
  height: 160px;
  width: auto;
  border-radius: var(--radius);
  border: 1px solid var(--color-border);
  background: var(--color-surface-2);
  flex-shrink: 0;
  object-fit: cover;
}

/* ── Instructions ── */
.instructions {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.step {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.step-num {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--color-accent);
  font-weight: 700;
  width: 18px;
  flex-shrink: 0;
  padding-top: 2px;
}

.step-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text);
}
</style>