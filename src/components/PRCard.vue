<script setup>
import { ref } from 'vue'
import PlateBadge from './PlateBadge.vue'
import { useRecordsStore } from '../stores/records'

const props = defineProps({
  personId: { type: String, required: true },
  exerciseId: { type: String, required: true },
  best: { type: Object, required: true }
})

const recordsStore = useRecordsStore()
const expanded = ref(false)

function history() {
  return recordsStore.historyFor(props.personId, props.exerciseId)
}

function remove(id) {
  recordsStore.removeEntry(id)
}
</script>

<template>
  <div class="card">
    <button class="card-top" @click="expanded = !expanded">
      <PlateBadge :weight="best.weight" :unit="best.unit" />
      <div class="card-info">
        <span class="card-name">{{ best.exerciseName }}</span>
        <span class="card-meta">{{ best.reps }} rep{{ best.reps > 1 ? 's' : '' }} · {{ best.date }}</span>
      </div>
      <span class="chevron" :class="{ open: expanded }">⌄</span>
    </button>

    <div v-if="expanded" class="history">
      <div v-for="h in history()" :key="h.id" class="history-row">
        <span class="history-text">{{ h.weight }}{{ h.unit }} × {{ h.reps }} — {{ h.date }}</span>
        <button class="remove-btn" @click="remove(h.id)" aria-label="Delete entry">×</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  overflow: hidden;
}

.card-top {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px;
  background: none;
  border: none;
  color: var(--color-text);
  text-align: left;
}

.card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.card-name {
  font-weight: 600;
  font-size: 15px;
}

.card-meta {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--color-text-dim);
}

.chevron {
  color: var(--color-text-dim);
  transition: transform 0.15s ease;
}

.chevron.open {
  transform: rotate(180deg);
}

.history {
  border-top: 1px solid var(--color-border);
  padding: 6px 12px 10px;
}

.history-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--color-text-dim);
}

.remove-btn {
  background: none;
  border: none;
  color: var(--color-danger);
  font-size: 18px;
  line-height: 1;
  padding: 0 4px;
}
</style>
