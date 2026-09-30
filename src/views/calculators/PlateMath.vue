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
    <div>
      <button v-for="p in PLATES" :key="p" @click="addPlate(p)">
        {{ p }}
      </button>
      <button @click="removeLast">Undo</button>
      <button @click="clearAll">Clear</button>
    </div>

    <p>Plates: {{ sidePlates.join(', ') || 'none' }}</p>

    <p>
      Bar:
    <div v-if="editingBar">
      <input v-model="barInput" type="number" step="0.5" min="0" @keyup.enter="saveBar" />
      <button @click="saveBar">Save</button>
      <button @click="editingBar = false">Cancel</button>
    </div>
    <div v-else>
      <strong>{{ barWeight }} lb</strong>
      <button @click="editBar">Edit</button>
    </div>
    </p>

    <label>
      <input type="checkbox" v-model="doubled" />
      x2 (double for both sides of bar)
    </label>

    <p>Total: {{ total }} lb</p>
  </div>
</template>

<style scoped></style>
