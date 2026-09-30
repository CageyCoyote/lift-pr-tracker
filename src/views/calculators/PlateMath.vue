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
</script>

<template>
  <div class="page">
    <button class="back-link" @click="router.back()">← Calculators</button>
    <header class="page-header">
      <div class="header-row">
        <div>
          <h1>Plate Math</h1>
        </div>
      </div>
    </header>
    <div class="plate-grid">
      <div class="round-plate" v-for="p in PLATES" :key="p" @click="addPlate(p)">
        <div>{{ p }}</div>
      </div>
    </div>
    <div class="btn-group">
      <button class="btn" @click="clearAll">Clear</button>
      <button class="btn" @click="removeLast">Undo</button>
    </div>

    <p>Plates: {{ sidePlates.join(', ') || '' }}</p>

    <p>
      Bar:
    <div v-if="editingBar">
      <input v-model="barInput" type="number" step="0.5" min="0" @keyup.enter="saveBar" />
      <div class="btn-group">
        <button @click="saveBar" class="save-btn">Save</button>
        <button @click="editingBar = false" class="icon-btn btn-danger" aria-label="Cancel">×</button>
      </div>
    </div>
    <div v-else>
      <strong>{{ barWeight }} lb</strong>
      <div @click="editBar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
          stroke-linecap="round" stroke-linejoin="round">
          <path data-v-ef282811="" d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path data-v-ef282811="" d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
      </div>
    </div>
    </p>

    <label>
      <input type="checkbox" v-model="doubled" />
      x2 (double for both sides of bar)
    </label>

    <p>Total: <span class="color-green bolder larger">{{ total }} lbs</span></p>
  </div>
</template>

<style scoped>
.plate-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}

.round-plate {
  background-color: var(--color-surface);
  width: 50px;
  height: 50px;
  border: 1px solid var(--color-border);
  border-radius: 27px;
  margin: 17px;
  padding: 13px 12px;
}
.btn-group{
  display: flex;
}

.icon-btn {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  width: 30px;
  height: 30px;
  border-radius: 8px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.save-btn {
  background: var(--color-accent);
  color: #1a1500;
  border: none;
  padding: 8px 16px;
  border-radius: var(--radius);
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}
</style>
