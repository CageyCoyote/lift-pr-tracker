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
  amount.value = ''
}
</script>

<template>
  <div class="page">
    <button class="back-link" @click="router.back()">← Calculators</button>
    <header class="page-header">
      <h1>Convert lb/kg</h1>
    </header>

    <div class="result" aria-live="polite">
      <span class="eyebrow">{{ amount || 0 }} {{ unit === 'lb' ? 'lbs' : unit }} equals</span>
      <div class="result-value">
        {{ result }}<span class="result-unit">{{ resultUnit }}</span>
      </div>
    </div>

    <div class="calc-form">
      <label class="field">
        <span class="eyebrow">Amount</span>
        <div class="input-row">
          <input v-model.number="amount" type="number" inputmode="decimal" step="0.5" min="0" placeholder="0" />
          <select v-model="unit" aria-label="Unit">
            <option value="kg">kg</option>
            <option value="lb">lbs</option>
          </select>
        </div>
      </label>
      <button class="btn" @click="reset">Clear</button>
    </div>
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
  margin-bottom: 20px;
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
  overflow-wrap: anywhere;
}

.result-unit {
  margin-left: 6px;
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-dim);
}

/* ── Form ── */
.calc-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-row {
  display: flex;
  gap: 8px;
}

.input-row input {
  flex: 1;
  min-width: 0;
}

.input-row select {
  width: 80px;
}
</style>