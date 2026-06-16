<script setup>
import { ref, computed } from 'vue'
import { useExercisesStore } from '../stores/exercises'

const emit = defineEmits(['select'])
const exercisesStore = useExercisesStore()

const query = ref('')
const equipment = ref('')
const muscle = ref('')

const results = computed(() =>
  exercisesStore.search({ query: query.value, equipment: equipment.value, muscle: muscle.value })
)
</script>

<template>
  <div class="picker">
    <input v-model="query" type="text" placeholder="Search exercises…" class="search-input" />
    <div class="filters">
      <select v-model="equipment">
        <option value="">All equipment</option>
        <option v-for="e in exercisesStore.equipmentOptions" :key="e" :value="e">{{ e }}</option>
      </select>
      <select v-model="muscle">
        <option value="">All muscles</option>
        <option v-for="m in exercisesStore.muscleOptions" :key="m" :value="m">{{ m }}</option>
      </select>
    </div>

    <ul class="results">
      <li v-for="ex in results" :key="ex.id">
        <button class="result-row" @click="emit('select', ex)">
          <span class="result-name">{{ ex.name }}</span>
          <span class="result-meta">{{ ex.equipment }} · {{ ex.primaryMuscles.join(', ') }}</span>
        </button>
      </li>
      <li v-if="results.length === 0" class="empty">No exercises match. Try a different search or filter.</li>
    </ul>
  </div>
</template>

<style scoped>
.picker {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.search-input {
  width: 100%;
}

.filters {
  display: flex;
  gap: 8px;
}

.filters select {
  flex: 1;
}

.results {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 320px;
  overflow-y: auto;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
}

.result-row {
  width: 100%;
  text-align: left;
  background: var(--color-surface);
  border: none;
  border-bottom: 1px solid var(--color-border);
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  color: var(--color-text);
}

.result-row:hover {
  background: var(--color-surface-2);
}

li:last-child .result-row {
  border-bottom: none;
}

.result-meta {
  font-size: 12px;
  color: var(--color-text-dim);
  text-transform: capitalize;
}

.empty {
  padding: 16px;
  color: var(--color-text-dim);
  font-size: 14px;
}
</style>
