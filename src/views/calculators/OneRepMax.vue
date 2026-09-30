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
    <div class="calc-form">
      <div class="max-result">
        <span>Estimated 1 Rep Max: <span class="color-green bolder larger" v-if="max">{{ `${max} lbs` }}</span></span>
      </div>
      <div>
        <div class="form-line">
          <label for="weight" class="label-left">Weight:</label>
          <input name="weight" v-model="weight" type="number" min="0" step="0.5">
        </div>
        <div class="form-line">
          <label for="reps" class="label-left">Reps: </label>
          <input name="reps" v-model="reps" type="number" min="0" step="0.5">
        </div>
        <div class="btn-group">
          <div class="spacer"></div>
          <button class="btn btn-clear" @click="reset">Clear</button>
          <button class="btn btn-accent" @click="bestOneRm">Estimate</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.max-result {
  margin-bottom: 15px;
}

.calc-form {
  margin-top: 15px;
}

.form-line {
  margin: 5px 0;
}

.label-left {
  display: inline-block;
  width: 65px;
}


.btn-group {
  display: flex;
  margin-top: 10px;
}
.btn-group>div.spacer {
  width: 65px;
}
.btn-clear{
  margin-right: 65px;
}
</style>