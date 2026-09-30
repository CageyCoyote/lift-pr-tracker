<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const KILOGRAM = 2.2046226218488

const amount = ref(1)
const unit = ref('kg') // 'kg' | 'lb'

const toLb = (kg) => kg * KILOGRAM
const toKg = (lb) => lb / KILOGRAM

const result = computed(() =>
  unit.value === 'kg' ? toLb(amount.value) : toKg(amount.value)
)

const resultUnit = computed(() => (unit.value === 'kg' ? 'lb' : 'kg'))
const reset = () => {
  amount.value = 0
}
</script>

<template>
  <div class="page">
    <button class="back-link" @click="router.back()">← Calculators</button>
    <header class="page-header">
      <div class="header-row">
        <div>
          <h1>Lb <-> Kg</h1>
        </div>
      </div>
    </header>
    <div>
      <label>
        <input v-model.number="amount" type="number" step="0.01" min="0" />
        <select v-model="unit">
          <option value="kg">kg</option>
          <option value="lb">lb</option>
        </select>
      </label>
      <button class="btn " @click="reset">Clear</button>
      <span>{{ result }} {{ resultUnit }}</span>
    </div>
  </div>

</template>

<style scoped></style>