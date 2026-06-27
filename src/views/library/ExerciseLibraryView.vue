<script setup>
import { ref, computed } from 'vue'
import { useExercisesStore } from '../../stores/exercises'
import ExerciseCard from '../../components/exercises/ExerciseCard.vue'

const exercisesStore = useExercisesStore()

const searchExpanded = ref(false)
const query = ref('')
const equipment = ref('')
const muscle = ref('')
const category = ref('')

const exercises = computed(() =>
  exercisesStore.search({ query: query.value, equipment: equipment.value, muscle: muscle.value, category: category.value })
)

const hasFilters = computed(() => query.value || equipment.value || muscle.value || category.value)

function toggleSearch() {
  searchExpanded.value = !searchExpanded.value
  if (!searchExpanded.value) {
    query.value = ''
    equipment.value = ''
    muscle.value = ''
    category.value = ''
  }
}
</script>

<template>
  <div class="page">
    <header class="page-header">
      <div class="header-row">
        <div>
          <span v-if="searchExpanded" class="eyebrow">Search</span>
          <span v-else class="eyebrow">Browse</span>
          <h1>Exercise Library</h1>
        </div>
        <button class="search-toggle" :class="{ active: searchExpanded || hasFilters }" @click="toggleSearch"
          aria-label="Toggle search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
            stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </div>

      <div v-if="searchExpanded" class="search-panel">
        <input v-model="query" type="text" placeholder="Search by name…" class="search-input" autofocus />
        <div class="filter-row">
          <select v-model="equipment">
            <option value="">All equipment</option>
            <option v-for="e in exercisesStore.equipmentOptions" :key="e" :value="e">{{ e }}</option>
          </select>
          <select v-model="muscle">
            <option value="">All muscles</option>
            <option v-for="m in exercisesStore.muscleOptions" :key="m" :value="m">{{ m }}</option>
          </select>
          <select v-model="category">
            <option value="">Any category</option>
            <option v-for="c in exercisesStore.categoryOptions" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
        <p v-if="hasFilters" class="result-count">{{ exercises.length }} result{{ exercises.length === 1 ? '' : 's' }}
        </p>
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
