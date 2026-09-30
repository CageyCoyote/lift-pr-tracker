<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { estimateOneRepMax } from '../../utils/oneRepMax';

const router = useRouter()

const weight = ref(0)
const reps = ref(0)
const max = ref()

const bestOneRm = () => {
  max.value = estimateOneRepMax(weight.value, reps.value, 'lb')
}

const reset = () => {
  weight.value = 0
  reps.value = 0
  unit.value = 0
  max.value = ''
}
</script>

<template>
  <div class="page">
    <button class="back-link" @click="router.back()">← Calculators</button>
    <header class="page-header">
      <div class="header-row">
        <div>
          <h1>1 Rep Max Calculator</h1>
        </div>
      </div>
    </header>
    <div>
      <span>Estimated 1 Rep Max: <span class="color-steel bolder" v-if="max">{{ `${max} lbs` }}</span></span>
    </div>
    <div>
      <div>
        <label for="weight">weight</label>
        <input name="weight" v-model="weight" type="number" min="0" step="0.5">
      </div>
      <div>
        <label for="reps">reps</label>
        <input name="reps" v-model="reps" type="number" min="0" step="0.5">
      </div>
      <button class="btn btn-accent" @click="bestOneRm">Estimate</button>
      <button class="btn " @click="reset">Clear</button>
    </div>
  </div>
</template>

<style scoped></style>