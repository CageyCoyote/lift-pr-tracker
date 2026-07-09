<script setup>
import { useSettingsStore, ICON_COLORS } from '../../stores/settings'
import { useRecordsStore } from '../../stores/records'
import { useWorkoutsStore } from '../../stores/workouts'
import { usePeopleStore } from '../../stores/people'

const settingsStore = useSettingsStore()
const recordsStore = useRecordsStore()
const workoutsStore = useWorkoutsStore()
const peopleStore = usePeopleStore()

// ── CSV helpers ──────────────────────────────────────────────
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
  <div class="page">
    <router-link to="/" class="back-link">← Back</router-link>

    <header class="page-header">
      <span class="eyebrow">Preferences</span>
      <h1>Account</h1>
    </header>

    <!-- Icon colour -->
    <section class="section">
      <h2 class="section-title">Icon Color</h2>
      <div class="swatch-grid">
        <button
          v-for="c in ICON_COLORS"
          :key="c.hex"
          class="swatch"
          :class="{ selected: settingsStore.iconColor === c.hex }"
          :style="{ '--swatch': c.hex }"
          :aria-label="c.label"
          :title="c.label"
          @click="settingsStore.setIconColor(c.hex)"
        >
          <span class="swatch-dot" />
          <span class="swatch-label">{{ c.label }}</span>
        </button>
      </div>
    </section>

    <!-- Data export -->
    <section class="section">
      <h2 class="section-title">Export Data</h2>
      <p class="section-note">
        Download your data as CSV files.
      </p>
      <div class="export-row">
        <button class="export-btn" @click="exportPRs" :disabled="recordsStore.entries.length === 0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export PRs
          <span class="export-count">{{ recordsStore.entries.length }} entries</span>
        </button>
        <button class="export-btn" @click="exportWorkouts" :disabled="workoutsStore.workouts.length === 0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export Workouts
          <span class="export-count">{{ workoutsStore.workouts.length }} workouts</span>
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.back-link {
  display: inline-block;
  color: var(--color-text-dim);
  text-decoration: none;
  font-size: 13px;
  margin-bottom: 10px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 28px;
  margin-top: 2px;
}

/* ── Sections ── */
.section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 13px;
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-dim);
  margin-bottom: 12px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--color-border);
}

.section-note {
  font-size: 13px;
  color: var(--color-text-dim);
  margin: 0 0 14px;
  line-height: 1.5;
}

/* ── Swatches ── */
.swatch-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.swatch {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 10px 12px;
  cursor: pointer;
  transition: border-color 0.15s ease;
}

.swatch.selected {
  border-color: var(--swatch);
}

.swatch-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--swatch);
  flex-shrink: 0;
  border: 1px solid color-mix(in srgb, var(--swatch) 60%, var(--color-border));
}

.swatch-label {
  font-size: 12px;
  font-family: var(--font-mono);
  color: var(--color-text);
  flex: 1;
  text-align: left;
}

.swatch-check {
  font-size: 11px;
  color: var(--swatch);
}

/* ── Export ── */
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