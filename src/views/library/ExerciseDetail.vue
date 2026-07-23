<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useExercisesStore } from '../../stores/exercises'
import { useWorkoutsStore } from '../../stores/workouts'
import { useRecordsStore } from '../../stores/records'
import PRNewForm from '../../components/records/PRNewForm.vue'
import FavoriteStar from '../../components/common/FavoriteStar.vue'
import { useFavoritesStore } from '../../stores/favourites'
import { useCurrentUser } from "../../composables/useCurrentUser.js"
import { usePrCelebration } from '../../composables/usePrCelebration'

// Base URL for exercise images — update this to wherever your images are hosted
// const IMAGE_BASE = '/images/exercises/'
const IMAGE_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/'

const route = useRoute()
const router = useRouter()
const exercisesStore = useExercisesStore()
const workoutsStore = useWorkoutsStore()
const favouritesStore = useFavoritesStore()
const recordsStore = useRecordsStore()
const { userId } = useCurrentUser()
const { celebrateNewPr } = usePrCelebration()

const exercise = computed(() => exercisesStore.getById(route.params.id))

const levelColor = {
  beginner: 'var(--color-green)',
  intermediate: 'var(--color-accent)',
  expert: 'var(--color-danger)'
}

const meta = computed(() => [
  { label: 'Equipment', value: exercise.value?.equipment },
  { label: 'Category', value: exercise.value?.category },
  { label: 'Mechanic', value: exercise.value?.mechanic },
  { label: 'Force', value: exercise.value?.force },
].map(m => ({ ...m, value: m.value ?? 'None' })))

// Add to workout sheet
const sheetOpen = ref(false)
const addedToId = ref(null)

function addToWorkout(workout) {
  workoutsStore.addExercise(workout.id, exercise.value)
  addedToId.value = workout.id
  setTimeout(() => {
    sheetOpen.value = false
    addedToId.value = null
  }, 800)
}

// Log PR
const prFormOpen = ref(false)

function handleSaved(payload) {
  const { entry, isNewBest } = recordsStore.addEntry({ personId: userId.value, ...payload })
  if (isNewBest) celebrateNewPr(entry)
}
</script>

<template>
  <div v-if="!exercise" class="page">
    <p class="empty-state">Exercise not found.</p>
    <button class="btn" @click="router.push('/library')">← Back to Library</button>
  </div>

  <div v-else class="page">

    <!-- Back -->
    <button class="back-link" @click="router.back()">← Library</button>

    <!-- Title + level -->
    <header class="detail-header">
      <h1 class="detail-title">{{ exercise.name }}</h1>
      <span class="level-badge" :style="{ color: levelColor[exercise.level] ?? 'var(--color-text-dim)' }">{{
        exercise.level }}</span>
    </header>

    <!-- Add to workout -->
    <div class="add-row">
      <button class="add-button-outline fav-btn" :class="{ 'is-fav': favouritesStore.isFavorite(exercise?.id) }"
        @click="favouritesStore.toggle(exercise?.id)"
        :aria-label="favouritesStore.isFavorite(exercise?.id) ? 'Remove from favourites' : 'Add to favourites'">
        <FavoriteStar :active="favouritesStore.isFavorite(exercise?.id)" :size="13" />
      </button>
      <button v-if="userId" class="add-button-outline steel" @click="prFormOpen = true">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
          stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Add PR
      </button>
      <button v-if="workoutsStore.workouts.length" class="add-button-outline accent" @click="sheetOpen = true">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
          stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Add to workout
      </button>
    </div>
    <p v-if="!workoutsStore.workouts.length" class="no-workouts-note">
      <router-link to="/plan">Create a workout</router-link> to add this exercise.
    </p>

    <!-- Metadata grid -->
    <div class="meta-grid">
      <div v-for="m in meta" :key="m.label" class="meta-cell">
        <span class="meta-label">{{ m.label }}</span>
        <span class="meta-value">{{ m.value }}</span>
      </div>
    </div>

    <!-- Muscles -->
    <section class="section">
      <h2 class="section-title">Muscles</h2>
      <div class="muscle-block">
        <div class="muscle-group">
          <span class="muscle-heading">Primary</span>
          <div class="chip-row">
            <span v-for="m in exercise.primaryMuscles" :key="m" class="muscle-chip primary">{{ m }}</span>
          </div>
        </div>
        <div v-if="exercise.secondaryMuscles?.length" class="muscle-group">
          <span class="muscle-heading">Secondary</span>
          <div class="chip-row">
            <span v-for="m in exercise.secondaryMuscles" :key="m" class="muscle-chip secondary">{{ m }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Images -->
    <section v-if="exercise.images?.length" class="section">
      <h2 class="section-title">Images</h2>
      <div class="image-row">
        <img v-for="(img, i) in exercise.images" :key="i" :src="IMAGE_BASE + img"
          :alt="`${exercise.name} — step ${i + 1}`" class="exercise-img" loading="lazy" />
      </div>
    </section>

    <!-- Instructions -->
    <section class="section">
      <h2 class="section-title">Instructions</h2>
      <ol class="instructions">
        <li v-for="(step, i) in exercise.instructions" :key="i" class="step">
          <span class="step-num">{{ i + 1 }}</span>
          <p class="step-text">{{ step }}</p>
        </li>
      </ol>
    </section>

    <!-- Workout picker sheet -->
    <div v-if="sheetOpen" class="overlay" @click.self="sheetOpen = false">
      <div class="sheet">
        <header class="sheet-header">
          <h3>Add to Workout</h3>
          <button class="close-btn" @click="sheetOpen = false" aria-label="Close">×</button>
        </header>
        <ul class="workout-list">
          <li v-for="w in workoutsStore.workouts" :key="w.id">
            <button class="workout-row" :class="{ added: addedToId === w.id }" @click="addToWorkout(w)">
              <span class="workout-row-title">{{ w.title }}</span>
              <span class="workout-row-count">{{ w.items.length }} exercise{{ w.items.length === 1 ? '' : 's' }}</span>
              <span v-if="addedToId === w.id" class="added-tick">✓</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
    <PRNewForm v-model="prFormOpen" :initial-exercise="exercise" @saved="handleSaved" />
  </div>
</template>

<style scoped>
.steel {
  color: var(--color-steel);
}

.back-link {
  margin-bottom: 14px;
}

/* ── Header ── */
.detail-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.detail-title {
  font-size: 24px;
  line-height: 1.2;
  flex: 1;
}

.level-badge {
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: capitalize;
  padding-top: 6px;
  flex-shrink: 0;
}

/* ── Meta grid ── */
.meta-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1px;
  background: var(--color-border);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  overflow: hidden;
  margin-bottom: 24px;
}

.meta-cell {
  background: var(--color-surface);
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.meta-label {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-dim);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.meta-value {
  font-size: 13px;
  font-weight: 600;
  text-transform: capitalize;
  color: var(--color-text);
}

/* ── Sections ── */
.section {
  margin-bottom: 28px;
}

.section-title {
  font-size: 14px;
  color: var(--color-text-dim);
  margin-bottom: 12px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--color-border);
}

/* ── Muscles ── */
.muscle-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.muscle-group {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.muscle-heading {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-dim);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  width: 56px;
  flex-shrink: 0;
}

.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.muscle-chip {
  font-size: 11px;
  padding: 3px 10px;
}

.exercise-img {
  height: 180px;
  width: auto;
  border-radius: var(--radius);
  border: 1px solid var(--color-border);
  background: var(--color-surface-2);
  flex-shrink: 0;
  object-fit: cover;
}

.empty-state {
  margin-bottom: 16px;
}

/* ── Add to workout ── */
.add-row {
  margin-bottom: 20px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-start;
}

.add-row button {
  margin-right: 10px;
  margin-top: 5px;
}

.add-button-outline {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: 1px solid var(--color-accent);
  color: var(--color-accent);
  border-radius: var(--radius);
  padding: 7px 12px;
  font-size: 13px;
  font-family: var(--font-body);
  transition: border-color 0.15s ease, color 0.15s ease;
}

.add-button-outline.accent:hover {
  border-color: var(--color-border);
  color: var(--color-bg);
  background-color: var(--color-accent);
}

.add-button-outline.steel:hover {
  border-color: var(--color-border);
  color: #fff;
  background-color: var(--color-steel);
}

.add-button-outline.steel {
  border-color: var(--color-steel);
  color: var(--color-steel)
}

.add-button-outline.accent {
  border-color: var(--color-accent);
  color: var(--color-accent)
}

.no-workouts-note {
  font-size: 13px;
  color: var(--color-text-dim);
  margin-bottom: 20px;
}

.no-workouts-note a {
  color: var(--color-accent);
}

/* ── Sheet ── */
.sheet {
  max-height: 60vh;
}

.workout-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.workout-row {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 12px 14px;
  text-align: left;
  color: var(--color-text);
  transition: border-color 0.15s ease;
}

.workout-row:hover {
  border-color: var(--color-accent);
}

.workout-row.added {
  border-color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 10%, transparent);
}

.workout-row-title {
  font-family: var(--font-display);
  font-size: 15px;
  flex: 1;
}

.workout-row-count {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-dim);
}

.added-tick {
  color: var(--color-accent);
  font-size: 16px;
  font-weight: 700;
}

.fav-btn {
  border-color: var(--color-border);
  color: var(--color-text-dim);
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.fav-btn.is-fav {
  border-color: var(--color-accent);
  color: var(--color-accent);
}
</style>