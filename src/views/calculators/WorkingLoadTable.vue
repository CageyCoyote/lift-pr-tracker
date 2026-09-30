<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const oneRm = ref(225)

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
    <div>
      <label>
        1RM:
        <input class="one-rep-input" v-model.number="oneRm" type="number" min="0" />
      </label>
      <select v-model="unit">
        <option v-for="u in UNITS" :key="u" :value="u">{{ u }}</option>
      </select>

      <table>
        <thead>
          <tr>
            <th>%1RM</th>
            <th>Weight</th>
            <th v-for="r in REPS" :key="r">× {{ r }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in table" :key="row.pct">
            <td>{{ row.pct }}%</td>
            <td>{{ row.weight }} {{ unit }}</td>
            <td v-for="c in row.reps" :key="c.reps">{{ c.volume }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<style scoped>
.one-rep-input { width: 55%;}
</style>