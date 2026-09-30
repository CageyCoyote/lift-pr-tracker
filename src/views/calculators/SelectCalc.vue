<script setup>
import { useRouter } from "vue-router"
const router = useRouter()

</script>

<template>
  <div class="page">
    <header class="page-header">
      <div class="header-row">
        <div>
          <h1>Calculators</h1>
        </div>
      </div>
    </header>
    <div class="calc-grid-list">
      <div class="card" role="button" @click="router.push(`/calculators/1repmax`)">
        <div class="calc-icon"></div>
        <span class="cal-label">One Rep Max</span>
      </div>
      <div class="card" role="button" @click="router.push(`/calculators/platemath`)">
        <div class="calc-icon"></div>
        <span class="cal-label">Plate Math</span>
      </div>
      <div class="card" role="button" @click="router.push(`/calculators/lbsconverter`)">
        <div class="calc-icon"></div>
        <span class="cal-label">Lbs -> Kg</span>
      </div>
      <div class="card" role="button" @click="router.push(`/calculators/workingloadtable`)">
        <div class="calc-icon"></div>
        <span class="cal-label">Load Table</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calc-grid-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 10px;
  padding: 0 16px 32px;
}

.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: border-color 0.15s ease;
  cursor: pointer;
}

.card:hover {
  border-color: var(--color-accent);
}
</style>
