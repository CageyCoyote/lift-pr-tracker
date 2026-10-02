<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const PLATES = [2.5, 5, 10, 25, 35, 45, 50, 100]

const BAR_PRESETS = [
  { label: '45 lb', value: 45 },
  { label: '35 lb', value: 35 },
]

const barWeight = ref(45)
const editingBar = ref(false)
const barInput = ref(45)

// plates read from one side of the bar
const sidePlates = ref([])

// when on, total = (bar + plates on one side) * 2
const doubled = ref(false)

function editBar() {
  barInput.value = barWeight.value
  editingBar.value = true
}

function saveBar() {
  const w = Number(barInput.value)
  if (!Number.isNaN(w) && w > 0) {
    barWeight.value = w
  }
  editingBar.value = false
}

function addPlate(p) {
  sidePlates.value.push(p)
}

function removeLast() {
  sidePlates.value.pop()
}

function clearAll() {
  sidePlates.value = []
  doubled.value = false
}

const sideTotal = computed(() =>
  sidePlates.value.reduce((sum, p) => sum + p, 0)
)

const total = computed(() =>
  doubled.value
    ? (sideTotal.value * 2) + barWeight.value
    : barWeight.value + sideTotal.value
)

const breakdown = computed(() =>
  doubled.value
    ? `${barWeight.value} bar + ${sideTotal.value} × 2`
    : `${barWeight.value} bar + ${sideTotal.value} plates`
)
</script>

<template>
  <div class="page">
    <button class="back-link" @click="router.back()">← Calculators</button>
    <header class="page-header">
      <h1>Plate Math</h1>
    </header>

    <div class="result" aria-live="polite">
      <span class="eyebrow">Total</span>
      <div class="result-value">{{ total }}<span class="result-unit">lbs</span></div>
      <span class="result-breakdown">{{ breakdown }}</span>
    </div>

    <section class="block">
      <span class="eyebrow">Tap to add · one side</span>
      <div class="plate-grid">
        <button
          v-for="p in PLATES"
          :key="p"
          class="round-plate"
          :aria-label="`Add ${p} lb plate`"
          @click="addPlate(p)"
        >
          {{ p }}
        </button>
      </div>
    </section>

    <section class="block">
      <div class="block-head">
        <span class="eyebrow">On the bar</span>
        <div class="btn-group">
          <button class="btn btn-sm" :disabled="!sidePlates.length" @click="removeLast">Undo</button>
          <button class="btn btn-sm btn-danger" :disabled="!sidePlates.length && !doubled" @click="clearAll">Clear</button>
        </div>
      </div>
      <div class="chip-row">
        <span v-for="(p, i) in sidePlates" :key="i" class="plate-chip">{{ p }}</span>
        <span v-if="!sidePlates.length" class="empty-hint">No plates added yet</span>
      </div>
    </section>

    <section class="block">
      <div class="bar-card">
        <div v-if="!editingBar" class="bar-row">
          <span class="eyebrow">Bar</span>
          <div class="bar-value-wrap">
            <strong class="bar-value">{{ barWeight }} lb</strong>
            <button class="icon-btn" aria-label="Edit bar weight" @click="editBar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
                stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
          </div>
        </div>
        <div v-else class="bar-edit">
          <span class="eyebrow">Bar weight</span>
          <div class="chip-row">
            <button
              v-for="b in BAR_PRESETS"
              :key="b.value"
              class="chip"
              :class="{ active: Number(barInput) === b.value }"
              @click="barInput = b.value"
            >
              {{ b.label }}
            </button>
          </div>
          <div class="bar-input-row">
            <input v-model="barInput" type="number" inputmode="decimal" step="0.5" min="0" @keyup.enter="saveBar" />
            <button class="btn btn-accent" @click="saveBar">Save</button>
            <button class="icon-btn btn-danger" aria-label="Cancel" @click="editingBar = false">×</button>
          </div>
        </div>
      </div>
    </section>

    <label class="toggle-row">
      <input type="checkbox" v-model="doubled" />
      <span class="toggle-text">
        <strong>Both sides (×2)</strong>
        <small>If the Plates above are on one side only, Double for Total</small>
      </span>
    </label>
  </div>
</template>

<style scoped>
.back-link {
  margin-bottom: 14px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  font-size: 28px;
  margin-top: 2px;
}

/* ── Result ── */
.result {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 16px;
  margin-bottom: 24px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--color-accent);
  border-radius: var(--radius);
}

.result-value {
  font-family: var(--font-mono);
  font-size: 40px;
  font-weight: 800;
  line-height: 1.15;
}

.result-unit {
  margin-left: 6px;
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-dim);
}

.result-breakdown {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--color-text-dim);
}

/* ── Blocks ── */
.block {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;
}

.block-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* ── Plate buttons ── */
.plate-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.round-plate {
  position: relative;
  width: 100%;
  max-width: 76px;
  aspect-ratio: 1;
  justify-self: center;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border-radius: 50%;
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  color: var(--color-text);
  font-family: var(--font-mono);
  font-size: 15px;
  font-weight: 700;
  touch-action: manipulation;
  transition: border-color 0.15s ease, transform 0.12s ease;
}

/* inner ring echoes the plate logo */
.round-plate::after {
  content: '';
  position: absolute;
  inset: 7px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  pointer-events: none;
}

@media (hover: hover) {
  .round-plate:hover {
    border-color: var(--color-accent);
  }
}

.round-plate:active {
  transform: scale(0.92);
  border-color: var(--color-accent);
}

/* ── Plates on the bar ── */
.btn-group {
  display: flex;
  gap: 8px;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 13px;
}

.btn:disabled {
  opacity: 0.4;
  pointer-events: none;
}

.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-height: 26px;
  align-items: center;
}

.plate-chip {
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-accent) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-accent) 38%, transparent);
  color: var(--color-text);
}

.empty-hint {
  font-size: 13px;
  color: var(--color-text-dim);
}

/* ── Bar weight ── */
.bar-card {
  padding: 12px 14px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
}

.bar-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.bar-value-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.bar-value {
  font-family: var(--font-mono);
  font-size: 16px;
}

.bar-edit {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.bar-input-row {
  display: flex;
  gap: 8px;
}

.bar-input-row input {
  flex: 1;
  min-width: 0;
}

.icon-btn {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  color: var(--color-text-dim);
  width: 38px;
  height: 38px;
  border-radius: 8px;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: 0;
  transition: border-color 0.15s ease, color 0.15s ease;
}

.bar-row .icon-btn {
  width: 30px;
  height: 30px;
}

.icon-btn:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.icon-btn.btn-danger {
  background: transparent;
  color: var(--color-danger);
  border-color: var(--color-danger);
}

.chip {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  color: var(--color-text-dim);
  border-radius: 999px;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 600;
}

.chip.active {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #1a1500;
}

/* ── Double toggle ── */
.toggle-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  cursor: pointer;
}

.toggle-row input {
  width: 20px;
  height: 20px;
  margin: 1px 0 0;
  padding: 0;
  flex-shrink: 0;
  accent-color: var(--color-accent);
}

.toggle-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.toggle-text strong {
  font-size: 14px;
}

.toggle-text small {
  font-size: 12px;
  line-height: 1.4;
  color: var(--color-text-dim);
}
</style>