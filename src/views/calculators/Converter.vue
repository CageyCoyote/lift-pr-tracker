<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const KILOGRAM = 2.2046226218488

const amount = ref(1)
const unit = ref('kg') // 'kg' | 'lb'



const toLb = (kg) => (kg * KILOGRAM).toFixed(2)
const toKg = (lb) => (lb / KILOGRAM).toFixed(2)

const result = computed(() =>
  unit.value === 'kg' ? toLb(amount.value) : toKg(amount.value)
)

const resultUnit = computed(() => (unit.value === 'kg' ? 'lbs' : 'kg'))
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
          <h1>Convert lb/kg</h1>
        </div>
      </div>
    </header>
    <div class="form-div">
      <label>
        <input v-model.number="amount" type="number" step="0.5" min="0" />
        <select v-model="unit">
          <option value="kg">kg</option>
          <option value="lb">lbs</option>
        </select>
      </label>
      <div class="btn-group">
        <button class="btn " @click="reset">Clear</button>
        <span class="result-text">{{ result }} {{ resultUnit }}</span>
      </div>
    </div>
  </div>

</template>

<style scoped>
.form-div {
  padding: 15px;
}

.form-div>label>input {
  width: 150px;
  margin-right: 3px;
  margin-bottom: 10px;
}

.form-div button {
  margin-right: 15px;
}
.result-text{
  font-size: larger;
}
</style>