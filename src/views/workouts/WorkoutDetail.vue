<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWorkoutsStore } from '../../stores/workouts'
import { useExercisesStore } from '../../stores/exercises'
import { useRecordsStore } from '../../stores/records'
import PRNewForm from '../../components/records/PRNewForm.vue'
import FavoriteStar from '../../components/common/FavoriteStar.vue'
import { useFavoritesStore } from '../../stores/favourites'
import WorkoutQRSheet from '../../components/workouts/WorkoutQRSheet.vue'
import { useCurrentUser } from "../../composables/useCurrentUser.js";
import { usePrCelebration } from '../../composables/usePrCelebration'
import { useUndoToast } from '../../composables/useUndoToast'

const IMAGE_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/'

const route = useRoute()
const router = useRouter()
const workoutsStore = useWorkoutsStore()
const exercisesStore = useExercisesStore()
const recordsStore = useRecordsStore()
const favouritesStore = useFavoritesStore()
const { userId } = useCurrentUser()
const { celebrateNewPr } = usePrCelebration()
const { showUndoToast } = useUndoToast()

const workout = computed(() => workoutsStore.getWorkout(route.params.id))

// PR form
const formOpen = ref(false)
const logExercise = ref(null)

// Exercise hint sheet
const hintOpen = ref(false)
const hintExercise = ref(null)

// 3-dot menu
const menuOpen = ref(false)

// QR sheet
const qrOpen = ref(false)

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

function openExerciseHint(item) {
  hintExercise.value = exercisesStore.getById(item.exerciseId)
  hintOpen.value = true
}

function goEdit() {
  menuOpen.value = false
  router.push(`/plan/${workout.value.id}/edit`)
}

function openQR() {
  menuOpen.value = false
  qrOpen.value = true
}

function deleteWorkout() {
  menuOpen.value = false
  const removed = workout.value
  const removedIndex = workoutsStore.workouts.findIndex((w) => w.id === removed.id)
  workoutsStore.removeWorkout(removed.id)
  router.push('/plan')
  showUndoToast(`Deleted "${removed.title}"`, () => workoutsStore.restoreWorkout(removed, removedIndex))
}
</script>

<template>
  <div v-if="!workout" class="page">
    <p class="empty-state">Workout not found.</p>
    <router-link to="/plan" class="btn">Back to Workouts</router-link>
  </div>

  <div v-else class="page">
    <router-link to="/plan" class="back-link">← Workouts</router-link>

    <header class="page-header">
      <h1>{{ workout.title }}</h1>
      <!-- 3-dot menu button -->
      <button class="dots-btn" @click="menuOpen = true" aria-label="Workout options">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>
    </header>

    <div v-if="workout.items.length === 0" class="empty-state">
      This workout is empty.
      <router-link class="accent-link" :to="{ name: 'edit-plan', params: { id: workout.id } }">
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
          <button v-if="userId" class="btn log-btn" @click="openLog(item)">+ PR</button>
        </div>
      </li>
    </ul>

    <!-- PR Form -->
    <PRNewForm v-model="formOpen" :initial-exercise="logExercise" @saved="handleSaved" />

    <!-- QR Sheet -->
    <WorkoutQRSheet v-model="qrOpen" :workout="workout" />

    <!-- 3-dot menu sheet -->
    <div v-if="menuOpen" class="overlay" @click.self="menuOpen = false">
      <div class="sheet menu-sheet">
        <button class="menu-item" @click="goEdit">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Edit workout
        </button>
        <button class="menu-item" @click="openQR">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
            stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <path d="M14 14h.01M14 17h.01M17 14h.01M17 17h.01M20 14h.01M20 17h.01M20 20h.01M17 20h.01M14 20h.01" />
          </svg>
          Share / Scan QR
        </button>
        <button class="menu-item danger" @click="deleteWorkout">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
            stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4h6v2" />
          </svg>
          Delete workout
        </button>
        <button class="menu-cancel" @click="menuOpen = false">Cancel</button>
      </div>
    </div>

    <!-- Exercise hint sheet -->
    <div v-if="hintOpen && hintExercise" class="overlay" @click.self="hintOpen = false">
      <div class="sheet">
        <header class="sheet-header">
          <h3 class="sheet-title">
            {{ hintExercise.name }}
            <div class="hint-fav-btn"
              :aria-label="favouritesStore.isFavorite(hintExercise.id) ? 'Remove favorite' : 'Add to favourites'"
              @click="favouritesStore.toggle(hintExercise.id)">
              <FavoriteStar :active="favouritesStore.isFavorite(hintExercise.id)" :size="20" />
            </div>
          </h3>
          <div class="sheet-header-actions">
            <button class="close-btn" @click="hintOpen = false" aria-label="Close">×</button>
          </div>
        </header>
        <div v-if="hintExercise.images?.length" class="image-row">
          <img v-for="(img, i) in hintExercise.images" :key="i" :src="IMAGE_BASE + img"
            :alt="`${hintExercise.name} step ${i + 1}`" class="hint-img" loading="lazy" />
        </div>
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
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.page-header h1 {
  font-size: 28px;
  margin-top: 2px;
  text-transform: capitalize;
  flex: 1;
}

.dots-btn {
  background: none;
  border: none;
  color: var(--color-text-dim);
  padding: 4px;
  margin-top: 6px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  border-radius: 6px;
}

.dots-btn:hover {
  color: var(--color-text);
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

/* ── Overlay / sheet ── */
.sheet {
  max-height: 78vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ── 3-dot menu sheet ── */
.menu-sheet {
  gap: 4px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  background: none;
  border: none;
  color: var(--color-text);
  font-size: 15px;
  font-family: var(--font-body);
  padding: 14px 12px;
  border-radius: var(--radius);
  text-align: left;
}

.menu-item:hover {
  background: var(--color-surface-2);
}

.menu-item.danger {
  color: var(--color-danger);
}

.menu-cancel {
  width: 100%;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  color: var(--color-text-dim);
  border-radius: var(--radius);
  padding: 12px;
  font-size: 14px;
  font-family: var(--font-body);
  margin-top: 6px;
}

/* ── Hint sheet ── */
.sheet-header {
  gap: 12px;
}

.sheet-title {
  font-size: 16px;
  line-height: 1.3;
  flex: 1;
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

.sheet-header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.hint-fav-btn {
  background: none;
  border: none;
  color: var(--color-text-dim);
  padding: 0;
  margin: 0;
  display: inline-block;
  position: relative;
  top: 2px;
}
</style>