<script setup>
import { ref } from 'vue'
import PlateBadge from './PlateBadge.vue'
import { useRecordsStore } from '../stores/records'
import { useExercisesStore } from '../stores/exercises'
import PRForm from './PRForm.vue'
import PREditForm from './PREditForm.vue'
import PRNewForm from './PRNewForm.vue'

const props = defineProps({
  personId: { type: String, required: true },
  exerciseId: { type: String, required: true },
  best: { type: Object, required: true }
})

const recordsStore = useRecordsStore()
const exercisesStore = useExercisesStore()
const expanded = ref(false)

// New PR form state
const formOpen = ref(false)
const logExercise = ref(null)

// Edit form state
const editFormOpen = ref(false)
const editEntry = ref(null)
const editExercise = ref(null)

function history() {
  return recordsStore.historyFor(props.personId, props.exerciseId)
}

function remove(id) {
  recordsStore.removeEntry(id)
}

function openLog() {
  logExercise.value = exercisesStore.getById(props.exerciseId)
  formOpen.value = true
}

function openEdit(entry) {
  editEntry.value = entry
  editExercise.value = exercisesStore.getById(props.exerciseId)
  editFormOpen.value = true
}

function handleSaved(payload) {
  recordsStore.addEntry({ personId: props.personId, ...payload })
}

function handleUpdated(payload) {
  recordsStore.updateEntry(payload.id, payload)
}
</script>

<template>
  <div class="card">
    <button class="card-top" @click="expanded = !expanded">
      <PlateBadge v-if="best.unit === 'bodyweight'" :weight="best.reps" unit="reps" />
      <PlateBadge v-else :weight="best.weight" :unit="best.unit" />
      <div class="card-info">
        <span class="card-name">{{ best.exerciseName }}</span>
        <span class="card-meta">
          <template v-if="best.unit === 'bodyweight'">Bodyweight · {{ best.date }}</template>
          <template v-else>{{ best.reps }} rep{{ best.reps > 1 ? 's' : '' }} · {{ best.date }}</template>
        </span>
      </div>
      <span class="chevron" :class="{ open: expanded }">⌄</span>
    </button>

    <div v-if="expanded" class="history">
      <div class="log-row">
        <button v-if="props.personId" class="btn log-btn" @click="openLog()">+ New PR</button>
        <button v-if="props.personId && history().length" class="action-btn edit-btn" @click="openEdit(history()[0])"
          aria-label="Edit most recent entry">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
      </div>

      <div v-for="h in history()" :key="h.id" class="history-row">
        <span class="history-text">
          <template v-if="h.unit === 'bodyweight'">{{ h.reps }} reps (bodyweight) — {{ h.date }}</template>
          <template v-else>{{ h.weight }}{{ h.unit }} × {{ h.reps }} — {{ h.date }}</template>
        </span>
        <button class="action-btn remove-btn" @click="remove(h.id)" aria-label="Delete entry">×</button>
      </div>
    </div>

    <!-- Add a New PR for this Exercise -->
    <PRNewForm v-model="formOpen" :initial-exercise="logExercise" @saved="handleSaved" />

    <!-- Edit the Most Recent PR -->
    <PREditForm v-model="editFormOpen" :initial-exercise="editExercise" :edit-entry="editEntry"
      @updated="handleUpdated" />
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

.edit-btn:hover {
  color: var(--color-text);
  background: var(--color-surface-2);
}

.remove-btn {
  color: var(--color-danger);
  font-size: 18px;
}

.log-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 3px 0 9px 0;
  border-bottom: 1px solid var(--color-border);
}

.log-btn {
  padding: 5px 10px;
  font-size: 12px;
  background: var(--color-steel);
  color: #fff;
  border: none;
}
</style>
