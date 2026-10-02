<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const oneRm = ref('')

const UNITS = ['lb', 'kg']
const unit = ref('lb')

// 40% to 95% in 5% steps
const percentages = computed(() => {
  const rows = []
  for (let pct = 40; pct <= 95; pct += 5) {
    rows.push(pct)
  }
  return rows
})

const REPS = [3, 5, 10]

// round to nearest plate-increment so the table shows loadable weights
function roundToIncrement(w) {
  return Math.round(w / 2.5) * 2.5
}

const table = computed(() =>
  percentages.value.map((pct) => {
    const weight = roundToIncrement((pct / 100) * oneRm.value)
    return {
      pct,
      weight,
      reps: REPS.map((r) => ({
        reps: r,
        volume: roundToIncrement(weight * r),
      })),
    }
  })
)
const selectedRow = ref('')
</script>

<template>
  <div class="page">
    <button class="back-link" @click="router.back()">← Calculators</button>
    <header class="page-header">
      <h1>Working Load Table</h1>
    </header>

    <label class="field">
      <span class="eyebrow">One rep max</span>
      <div class="input-row">
        <input v-model.number="oneRm" type="number" inputmode="decimal" min="0" placeholder="0" />
        <select v-model="unit" aria-label="Unit">
          <option v-for="u in UNITS" :key="u" :value="u">{{ u }}</option>
        </select>
      </div>
    </label>

    <div class="table-card">
      <table class="the-table">
        <thead>
          <tr>
            <th>% 1RM</th>
            <th class="num">Weight</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in table"
            :key="row.pct"
            :class="{ highlight: selectedRow === row.pct }"
            @click="selectedRow = row.pct === selectedRow ? '' : row.pct"
          >
            <td class="pct">{{ row.pct }}%</td>
            <td class="num weight">
              <template v-if="oneRm">{{ row.weight }}<span class="unit">{{ unit }}</span></template>
              <span v-else class="dash">—</span>
            </td>
          </tr>
        </tbody>
      </table>
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

/* ── Form ── */
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

/* ── Table ── */
.table-card {
  margin-top: 20px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  overflow: hidden;
}

.the-table {
  width: 100%;
  border-collapse: collapse;
}

.the-table th {
  padding: 10px 14px;
  background: var(--color-surface-2);
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  text-align: left;
  color: var(--color-text-dim);
}

.the-table td {
  padding: 12px 14px;
  border-top: 1px solid var(--color-border);
  font-family: var(--font-mono);
  font-size: 15px;
}

.the-table .num {
  text-align: right;
}

.the-table td.pct {
  color: var(--color-text-dim);
}

.the-table td.weight {
  font-weight: 700;
}

.unit {
  margin-left: 4px;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-dim);
}

.dash {
  color: var(--color-text-dim);
}

.the-table tbody tr {
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.the-table tbody tr.highlight {
  background: color-mix(in srgb, var(--color-accent) 14%, transparent);
}

.the-table tbody tr.highlight td:first-child {
  box-shadow: inset 3px 0 0 var(--color-accent);
  color: var(--color-text);
}
</style>