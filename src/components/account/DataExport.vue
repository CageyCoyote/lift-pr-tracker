<script setup>
import { useRecordsStore } from '../../stores/records'
import { useWorkoutsStore } from '../../stores/workouts'
import { usePeopleStore } from '../../stores/people'
import SettingsSection from '../common/SettingsSection.vue'

const recordsStore = useRecordsStore()
const workoutsStore = useWorkoutsStore()
const peopleStore = usePeopleStore()

function downloadCsv(filename, rows) {
  const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function exportPRs() {
  const header = ['Person', 'Exercise', 'Weight', 'Unit', 'Reps', 'Date']
  const rows = recordsStore.entries.map(e => {
    const person = peopleStore.people.find(p => p.id === e.personId)
    const isBodyweight = e.unit === 'bodyweight'
    return [
      person?.name ?? 'Unknown',
      e.exerciseName,
      isBodyweight ? '' : e.weight,
      e.unit,
      e.reps,
      e.date
    ]
  })
  downloadCsv('pr-tracker-records.csv', [header, ...rows])
}

function exportWorkouts() {
  const header = ['Workout', 'Order', 'Exercise']
  const rows = workoutsStore.workouts.flatMap(w =>
    w.items.map((item, idx) => [w.title, idx + 1, item.exerciseName])
  )
  downloadCsv('pr-tracker-workouts.csv', [header, ...rows])
}
</script>

<template>
  <SettingsSection title="Export Data">
    <p class="section-note">
      Download your data as CSV files.
    </p>
    <div class="export-row">
      <button class="export-btn" @click="exportPRs" :disabled="recordsStore.entries.length === 0">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
          stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Export PRs
        <span class="export-count">{{ recordsStore.entries.length }} entries</span>
      </button>
      <button class="export-btn" @click="exportWorkouts" :disabled="workoutsStore.workouts.length === 0">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
          stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Export Workouts
        <span class="export-count">{{ workoutsStore.workouts.length }} workouts</span>
      </button>
    </div>
  </SettingsSection>
</template>

<style scoped>
.section-note {
  font-size: 13px;
  color: var(--color-text-dim);
  margin: 0 0 14px;
  line-height: 1.5;
}

.export-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 12px 14px;
  color: var(--color-text);
  font-size: 14px;
  font-family: var(--font-body);
  font-weight: 500;
  text-align: left;
  transition: border-color 0.15s ease;
}

.export-btn:hover:not(:disabled) {
  border-color: var(--color-accent);
}

.export-btn:disabled {
  opacity: 0.4;
}

.export-count {
  margin-left: auto;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-text-dim);
}
</style>
