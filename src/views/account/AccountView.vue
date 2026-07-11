<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSettingsStore, ICON_COLORS } from '../../stores/settings'
import { useRecordsStore } from '../../stores/records'
import { useWorkoutsStore } from '../../stores/workouts'
import { usePeopleStore } from '../../stores/people'

const route = useRoute()
const router = useRouter()
const settingsStore = useSettingsStore()
const recordsStore = useRecordsStore()
const workoutsStore = useWorkoutsStore()
const peopleStore = usePeopleStore()

const switcherOpen = ref(false)

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
    <button class="back-link" @click="router.back()">← Back</button>

    <header class="page-header">
      <span class="eyebrow">Preferences</span>
      <h1>Account</h1>
    </header>

    <!-- Active person -->
    <button v-if="peopleStore.getActivePerson()" class="active-person" @click="switcherOpen = true">
      <div
        class="person-avatar"
        :style="{ background: settingsStore.effectiveIconColor(peopleStore.activePersonId) }"
      >
        {{ peopleStore.getActivePerson().name.charAt(0).toUpperCase() }}
      </div>
      <div class="person-info">
        <span class="eyebrow">Active lifter</span>
        <span class="person-name">{{ peopleStore.getActivePerson().name }}</span>
      </div>
      <svg class="chevron-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </button>
    <div v-else class="no-person-note">
      No active person selected. <router-link to="/people">Add one →</router-link>
    </div>

    <!-- Theme -->
    <section class="section">
      <h2 class="section-title">Theme</h2>
      <div class="theme-toggle">
        <button
          class="theme-btn"
          :class="{ active: settingsStore.theme === 'dark' }"
          @click="settingsStore.setTheme('dark')"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
          Dark
        </button>
        <button
          class="theme-btn"
          :class="{ active: settingsStore.theme === 'light' }"
          @click="settingsStore.setTheme('light')"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
          Light
        </button>
        <button
          class="theme-btn"
          :class="{ active: settingsStore.theme === 'steel' }"
          @click="settingsStore.setTheme('steel')"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/>
            <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/>
            <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
            <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/>
            <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
          </svg>
          Steel
        </button>
      </div>
    </section>

    <!-- Icon colour -->
    <section class="section">
      <h2 class="section-title">
        Icon Color
        <span v-if="peopleStore.getActivePerson()" class="section-person">
          — {{ peopleStore.getActivePerson().name }}
        </span>
      </h2>
      <div class="swatch-grid">
        <button
          v-for="c in ICON_COLORS"
          :key="c.hex"
          class="swatch"
          :class="{ selected: settingsStore.getIconColor(peopleStore.activePersonId) === c.hex }"
          :style="{ '--swatch': c.hex }"
          :aria-label="c.label"
          :title="c.label"
          :disabled="!peopleStore.activePersonId"
          @click="settingsStore.setIconColor(peopleStore.activePersonId, c.hex)"
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

    <!-- Person switcher sheet -->
    <div v-if="switcherOpen" class="overlay" @click.self="switcherOpen = false">
      <div class="sheet">
        <header class="sheet-header">
          <h3>Switch Lifter</h3>
          <button class="close-btn" @click="switcherOpen = false" aria-label="Close">×</button>
        </header>
        <ul class="switcher-list">
          <li v-for="p in peopleStore.people" :key="p.id">
            <button
              class="switcher-row"
              :class="{ active: p.id === peopleStore.activePersonId }"
              @click="peopleStore.setActivePerson(p.id); switcherOpen = false"
            >
              <div
                class="switcher-avatar"
                :style="{ background: settingsStore.effectiveIconColor(p.id) }"
              >
                {{ p.name.charAt(0).toUpperCase() }}
              </div>
              <span class="switcher-name">{{ p.name }}</span>
              <svg v-if="p.id === peopleStore.activePersonId"
                width="16" height="16" viewBox="0 0 24 24" fill="none"
                :stroke="settingsStore.effectiveIconColor(p.id)"
                stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </button>
          </li>
        </ul>
        <router-link to="/people" class="manage-link" @click="switcherOpen = false">
          Manage people →
        </router-link>
      </div>
    </div>

  </div>
</template>

<style scoped>
.active-person {
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 14px;
  margin-bottom: 28px;
  width: 100%;
  text-align: left;
  transition: border-color 0.15s ease;
}

.active-person:hover {
  border-color: var(--color-text-dim);
}

.chevron-icon {
  color: var(--color-text-dim);
  flex-shrink: 0;
  margin-left: auto;
}

/* ── Switcher sheet ── */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: flex-end;
  z-index: 20;
}

.sheet {
  width: 100%;
  background: var(--color-surface);
  border-radius: 16px 16px 0 0;
  border-top: 1px solid var(--color-border);
  padding: 18px 16px calc(28px + env(safe-area-inset-bottom, 0px));
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sheet-header h3 { font-size: 16px; }

.close-btn {
  background: none;
  border: none;
  color: var(--color-text-dim);
  font-size: 24px;
  line-height: 1;
}

.switcher-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.switcher-row {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 12px 14px;
  color: var(--color-text);
  transition: border-color 0.15s ease;
}

.switcher-row.active {
  border-color: var(--color-accent);
}

.switcher-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 17px;
  color: #fff;
  flex-shrink: 0;
}

.switcher-name {
  font-family: var(--font-display);
  font-size: 16px;
  flex: 1;
  text-align: left;
}

.manage-link {
  font-size: 13px;
  color: var(--color-text-dim);
  text-decoration: none;
  text-align: center;
  padding-top: 4px;
}

.manage-link:hover {
  color: var(--color-accent);
}

.person-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 20px;
  color: #fff;
  flex-shrink: 0;
  mix-blend-mode: normal;
}

.person-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.person-name {
  font-family: var(--font-display);
  font-size: 18px;
  color: var(--color-text)
}

.no-person-note {
  font-size: 13px;
  color: var(--color-text-dim);
  margin-bottom: 28px;
}

.no-person-note a {
  color: var(--color-accent);
  text-decoration: none;
}

.section-person {
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
  color: var(--color-text-dim);
}

.back-link {
  all: unset;
  display: inline-block;
  color: var(--color-text-dim);
  text-decoration: none;
  font-size: 13px;
  margin-bottom: 14px;
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

.theme-toggle {
  display: flex;
  gap: 8px;
  background: var(--color-surface-2);
  border-radius: var(--radius);
  padding: 4px;
}

.theme-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  background: none;
  border: none;
  border-radius: 7px;
  padding: 10px;
  font-size: 13px;
  font-family: var(--font-body);
  font-weight: 600;
  color: var(--color-text-dim);
  transition: background 0.15s ease, color 0.15s ease;
}

.theme-btn.active {
  background: var(--color-surface);
  color: var(--color-text);
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
  transition: border-color 0.15s ease, background 0.15s ease;
}

.swatch.selected {
  background: var(--swatch);
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

/* Hide dot when selected — the whole card is already the colour */
.swatch.selected .swatch-dot {
  background: rgba(255, 255, 255, 0.35);
  border-color: rgba(255, 255, 255, 0.5);
}

.swatch-label {
  font-size: 12px;
  font-family: var(--font-mono);
  color: var(--color-text);
  flex: 1;
  text-align: left;
}

.swatch.selected .swatch-label {
  color: #fff;
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