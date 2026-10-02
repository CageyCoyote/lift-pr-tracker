<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { estimateOneRepMax } from '../../utils/oneRepMax'

const router = useRouter()

const weight = ref('')
const reps = ref('')
const max = ref(null)
const estimated = ref(false)

const estimate = () => {
  max.value = estimateOneRepMax(weight.value, reps.value, 'lb')
  estimated.value = true
}

const reset = () => {
  weight.value = ''
  reps.value = ''
  max.value = null
  estimated.value = false
}
</script>

<template>
  <div class="page">
    <button class="back-link" @click="router.back()">← Calculators</button>
    <header class="page-header">
      <h1>1 Rep Max Calculator</h1>
    </header>

    <div class="result" :class="{ empty: !max }" aria-live="polite">
      <span class="eyebrow">Estimated 1RM</span>
      <div class="result-value">
        {{ max ?? '—' }}<span v-if="max" class="result-unit">lbs</span>
      </div>
      <span v-if="estimated && !max" class="result-hint">
        Enter a weight and 2 or more reps.
      </span>
    </div>

    <form class="calc-form" @submit.prevent="estimate">
      <label class="field">
        <span class="eyebrow">Weight</span>
        <input v-model.number="weight" type="number" inputmode="decimal" min="0" step="0.5" placeholder="0" />
      </label>
      <label class="field">
        <span class="eyebrow">Reps</span>
        <input v-model.number="reps" type="number" inputmode="numeric" min="0" step="1" placeholder="0" />
      </label>
      <div class="actions">
        <button type="button" class="btn" @click="reset">Clear</button>
        <button type="submit" class="btn btn-accent">Estimate</button>
      </div>
    </form>
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

.result.empty {
  border-left-color: var(--color-border);
}

.result-value {
  font-family: var(--font-mono);
  font-size: 40px;
  font-weight: 800;
  line-height: 1.15;
}

.result.empty .result-value {
  color: var(--color-text-dim);
}

.result-unit {
  margin-left: 6px;
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-dim);
}

.result-hint {
  font-size: 13px;
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

.field input {
  width: 100%;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 6px;
}

.actions .btn {
  flex: 1;
}
</style>