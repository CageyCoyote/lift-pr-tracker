<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const oneRm = ref(0)

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
      <div class="header-row">
        <div>
          <h1>Working Load Table</h1>
        </div>
      </div>
    </header>
    <div class="form">
      <label>
        1RM:
        <input class="one-rep-input" v-model.number="oneRm" type="number" min="0" />
      </label>
      <select v-model="unit">
        <option v-for="u in UNITS" :key="u" :value="u">{{ u }}</option>
      </select>
    </div>

    <div>
      <table class="the-table">
        <thead>
          <tr>
            <th>%1RM</th>
            <th class="weight-tltle">Weight</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in table" :key="row.pct" :class="{ highlight: selectedRow === row.pct }"
            @click="selectedRow = row.pct === selectedRow ? '' : row.pct">
            <td class="pct">{{ row.pct }}%</td>
            <td class="weight">{{ row.weight }} {{ unit }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<style scoped>
.one-rep-input {
  width: 55%;
}
.form{
  margin: 10px 0;
}
.form >label{
  margin-right: 10px;
}
.the-table {
  width: 100%;
  border: 1px solid var(--color-border);
  margin-top:15px;
}
thead{
  background-color: var(--color-surface-2);
}
.weight-tltle{
  text-align: start;
}
td.pct{
  text-align: center;
}
/* .the-table>tbody tr:nth-child(even) {
  background-color: var(--color-surface-2);
} */

.highlight {
  background-color: var(--color-accent);
  color: var();
}

/* .the-table>tbody tr:hover{
  background-color: var(--color-surface);
} */
</style>