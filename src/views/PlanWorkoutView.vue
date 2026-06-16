<script setup>
import { ref } from 'vue'
import { useWorkoutPlanStore } from '../stores/workoutPlan'
import { useExercisesStore } from '../stores/exercises'
import { useRecordsStore } from '../stores/records'
import { usePeopleStore } from '../stores/people'
import ExercisePicker from '../components/ExercisePicker.vue'
import PRForm from '../components/PRForm.vue'

const planStore = useWorkoutPlanStore()
const exercisesStore = useExercisesStore()
const recordsStore = useRecordsStore()
const peopleStore = usePeopleStore()

const pickerOpen = ref(false)
const formOpen = ref(false)
const logExercise = ref(null)

function addExercise(ex) {
  planStore.addExercise(ex)
  pickerOpen.value = false
}

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
</script>

<template>
  <div class="page">
    <header class="page-header">
      <span class="eyebrow">Today's Session</span>
      <h1>Plan Workout</h1>
    </header>

    <div v-if="planStore.items.length === 0" class="empty-state">
      Your workout list is empty. Add exercises below to plan today's session.
    </div>

    <ul v-else class="plan-list">
      <li v-for="(item, idx) in planStore.items" :key="item.id" class="plan-row">
        <div class="plan-info">
          <span class="plan-index">{{ idx + 1 }}</span>
          <div class="plan-text">
            <span class="plan-name">{{ item.exerciseName }}</span>
            <span v-if="bestNote(item.exerciseId)" class="plan-best">
              PR: {{ bestNote(item.exerciseId).weight }}{{ bestNote(item.exerciseId).unit }} ×
              {{ bestNote(item.exerciseId).reps }}
            </span>
          </div>
        </div>
        <div class="plan-actions">
          <button class="icon-btn" :disabled="idx === 0" @click="planStore.moveUp(item.id)" aria-label="Move up">↑</button>
          <button
            class="icon-btn"
            :disabled="idx === planStore.items.length - 1"
            @click="planStore.moveDown(item.id)"
            aria-label="Move down"
          >↓</button>
          <button
            v-if="peopleStore.activePersonId"
            class="btn log-btn"
            @click="openLog(item)"
          >Log</button>
          <button class="icon-btn danger" @click="planStore.removeItem(item.id)" aria-label="Remove">×</button>
        </div>
      </li>
    </ul>

    <div class="bottom-actions">
      <button class="btn btn-accent" @click="pickerOpen = !pickerOpen">
        {{ pickerOpen ? 'Close picker' : '+ Add exercise' }}
      </button>
      <button v-if="planStore.items.length" class="btn btn-danger" @click="planStore.clear()">
        Clear list
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

.page-header h1 {
  font-size: 28px;
  margin-top: 2px;
}

.empty-state {
  margin-top: 24px;
  color: var(--color-text-dim);
  font-size: 14px;
  line-height: 1.5;
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

.bottom-actions .btn {
  flex: 1;
}

.picker-panel {
  margin-top: 14px;
}
</style>
