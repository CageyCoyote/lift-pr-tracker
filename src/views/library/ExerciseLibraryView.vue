<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useExercisesStore } from '../../stores/exercises'
import ExerciseCard from '../../components/exercises/ExerciseCard.vue'

const exercisesStore = useExercisesStore()
const route = useRoute()
const router = useRouter()

// All search state lives in the URL — back button restores it for free
const query     = computed(() => route.query.q         || '')
const equipment = computed(() => route.query.equipment || '')
const muscle    = computed(() => route.query.muscle    || '')
const category  = computed(() => route.query.category  || '')

const searchExpanded = computed(() =>
  !!(query.value || equipment.value || muscle.value || category.value)
)

const exercises = computed(() =>
  exercisesStore.search({
    query: query.value,
    equipment: equipment.value,
    muscle: muscle.value,
    category: category.value,
  })
)

const hasFilters = computed(() =>
  !!(query.value || equipment.value || muscle.value || category.value)
)

// Push a single query param update without blowing away the others
function setParam(key, value) {
  router.replace({ query: { ...route.query, [key]: value || undefined } })
}

function clearAll() {
  router.replace({ query: {} })
}

// Toggling the panel: if already open and has filters, clear them + close
// if already open and no filters, just close; if closed, open
const panelOpen = computed({
  get: () => searchExpanded.value || route.query._open === '1',
  set: (val) => {
    if (!val) {
      router.replace({ query: {} })
    } else {
      router.replace({ query: { ...route.query, _open: '1' } })
    }
  }
})

function toggleSearch() {
  if (panelOpen.value) {
    clearAll()
  } else {
    router.replace({ query: { _open: '1' } })
  }
}
</script>

<template>
  <div class="page">
    <header class="page-header">
      <div class="header-row">
        <div>
          <span v-if="panelOpen" class="eyebrow">Search</span>
          <span v-else class="eyebrow">Browse</span>
          <h1>Exercise Library</h1>
        </div>
        <button class="search-toggle" :class="{ active: panelOpen || hasFilters }" @click="toggleSearch"
          aria-label="Toggle search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
            stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </div>

      <div v-if="panelOpen" class="search-panel">
        <input
          :value="query"
          type="text"
          placeholder="Search by name…"
          class="search-input"
          autofocus
          @input="setParam('q', $event.target.value)"
        />
        <div class="filter-row">
          <select :value="equipment" @change="setParam('equipment', $event.target.value)">
            <option class="capitalize" value="">All equipment</option>
            <option class="capitalize" v-for="e in exercisesStore.equipmentOptions" :key="e" :value="e">{{ e }}</option>
          </select>
          <select :value="muscle" @change="setParam('muscle', $event.target.value)">
            <option class="capitalize" value="">All muscles</option>
            <option class="capitalize" v-for="m in exercisesStore.muscleOptions" :key="m" :value="m">{{ m }}</option>
          </select>
          <select :value="category" @change="setParam('category', $event.target.value)">
            <option class="capitalize" value="">Any category</option>
            <option class="capitalize" v-for="c in exercisesStore.categoryOptions" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
        <p v-if="hasFilters" class="result-count">{{ exercises.length }} result{{ exercises.length === 1 ? '' : 's' }}</p>
      </div>
    </header>
  </div>

  <div class="exercise-grid">
    <ExerciseCard v-for="exercise in exercises" :key="exercise.id" :exercise="exercise" />
    <p v-if="exercises.length === 0" class="empty-state">No exercises match your search.</p>
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: 16px;
}

.header-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}

.page-header h1 {
  font-size: 28px;
  margin-top: 2px;
}

.search-toggle {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  color: var(--color-text-dim);
  border-radius: var(--radius);
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-bottom: 2px;
}

.search-toggle.active {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.search-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 12px;
}

.search-input {
  width: 100%;
}

.capitalize {
  text-transform: capitalize;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-row select {
  flex: 1 1 calc(50% - 4px);
  min-width: 120px;
}

.result-count {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--color-text-dim);
}

.exercise-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 10px;
  padding: 0 16px 32px;
}

.empty-state {
  grid-column: 1 / -1;
  color: var(--color-text-dim);
  font-size: 14px;
  margin-top: 24px;
  text-align: center;
}
</style>