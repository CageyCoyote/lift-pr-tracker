<script setup>
import { ref, computed } from 'vue'
import { useExercisesStore } from '../stores/exercises'

const exercisesStore = useExercisesStore()

const searchExpanded = ref(false)
const query = ref('')
const equipment = ref('')
const muscle = ref('')

const exercises = computed(() =>
  exercisesStore.search({ query: query.value, equipment: equipment.value, muscle: muscle.value })
)

const hasFilters = computed(() => query.value || equipment.value || muscle.value)

function toggleSearch() {
  searchExpanded.value = !searchExpanded.value
  if (!searchExpanded.value) {
    query.value = ''
    equipment.value = ''
    muscle.value = ''
  }
}
</script>

<template>
  <div class="page">
    <header class="page-header">
      <div class="header-row">
        <div>
          <span class="eyebrow">Browse</span>
          <h1>Exercise Library</h1>
        </div>
        <button class="search-toggle" :class="{ active: searchExpanded || hasFilters }" @click="toggleSearch" aria-label="Toggle search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </button>
      </div>

      <div v-if="searchExpanded" class="search-panel">
        <input
          v-model="query"
          type="text"
          placeholder="Search by name…"
          class="search-input"
          autofocus
        />
        <div class="filter-row">
          <select v-model="equipment">
            <option value="">All equipment</option>
            <option v-for="e in exercisesStore.equipmentOptions" :key="e" :value="e">{{ e }}</option>
          </select>
          <select v-model="muscle">
            <option value="">All muscles</option>
            <option v-for="m in exercisesStore.muscleOptions" :key="m" :value="m">{{ m }}</option>
          </select>
        </div>
        <p v-if="hasFilters" class="result-count">{{ exercises.length }} result{{ exercises.length === 1 ? '' : 's' }}</p>
      </div>
    </header>
  </div>

  <div class="the-list">
    <ul v-for="exercise in exercises" :key="exercise.id" class="exercise-card">
      <div class="card-top width-100">{{ exercise.name }}</div>
      <div class="card-meta width-100">
        <span>Primary: </span>
        <span class="primary">{{ exercise.primaryMuscles.join(', ') }}</span>
      </div>
      <div v-if="exercise.secondaryMuscles.length > 0" class="card-meta width-100">
        <span>Secondary: </span>
        <span class="secondary">{{ exercise.secondaryMuscles.join(', ') }}</span>
      </div>
    </ul>

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
  gap: 8px;
}

.filter-row select {
  flex: 1;
}

.result-count {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--color-text-dim);
}

.the-list {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-evenly;
  align-items: flex-start;
  padding: 0 12px 32px;
}

.exercise-card {
  list-style: none;
  margin: 8px;
  padding: 5px 0 0 5px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  overflow: hidden;
  width: 180px;
  height: 150px;
}

.card-top {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  background: none;
  border: none;
  color: var(--color-text);
  text-align: left;
  font-weight: 600;
  font-size: 13px;
  line-height: 1.3;
  padding-right: 6px;
  margin-bottom: 6px;
}

.card-meta {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-dim);
  margin-bottom: 2px;
  padding-right: 4px;
}

.width-100 {
  width: 100%;
}

.primary {
  color: var(--color-accent);
  text-transform: capitalize;
}

.secondary {
  color: var(--color-steel);
  text-transform: capitalize;
}

.empty-state {
  color: var(--color-text-dim);
  font-size: 14px;
  margin-top: 32px;
  text-align: center;
  width: 100%;
}
</style>