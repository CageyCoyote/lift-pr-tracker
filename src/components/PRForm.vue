<script setup>
import { ref, watch } from 'vue'
import ExercisePicker from './ExercisePicker.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  personId: { type: String, default: null },
  initialExercise: { type: Object, default: null }
})
const emit = defineEmits(['update:modelValue', 'saved'])

const step = ref('pick')
const exercise = ref(null)
const weight = ref('')
const reps = ref('')
const date = ref(new Date().toISOString().slice(0, 10))
const unit = ref('lb')

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      exercise.value = props.initialExercise || null
      step.value = exercise.value ? 'entry' : 'pick'
      weight.value = ''
      reps.value = ''
      date.value = new Date().toISOString().slice(0, 10)
    }
  }
)

function pick(ex) {
  exercise.value = ex
  step.value = 'entry'
}

function close() {
  emit('update:modelValue', false)
}

function save() {
  if (!weight.value || !exercise.value) return
  emit('saved', {
    exerciseId: exercise.value.id,
    exerciseName: exercise.value.name,
    weight: weight.value,
    reps: reps.value || 1,
    unit: unit.value,
    date: date.value
  })
  close()
}
</script>

<template>
  <div v-if="modelValue" class="overlay" @click.self="close">
    <div class="sheet">
      <header class="sheet-header">
        <h3>{{ step === 'pick' ? 'Choose Exercise' : exercise.name }}</h3>
        <button class="close-btn" @click="close" aria-label="Close">×</button>
      </header>

      <ExercisePicker v-if="step === 'pick'" @select="pick" />

      <form v-else class="entry-form" @submit.prevent="save">
        <label class="field">
          <span class="eyebrow">Weight</span>
          <div class="weight-row">
            <input v-model="weight" type="number" min="0" step="0.5" required autofocus />
            <select v-model="unit">
              <option value="lb">lb</option>
              <option value="kg">kg</option>
            </select>
          </div>
        </label>
        <label class="field">
          <span class="eyebrow">Reps</span>
          <input v-model="reps" type="number" min="1" step="1" placeholder="1" />
        </label>
        <label class="field">
          <span class="eyebrow">Date</span>
          <input v-model="date" type="date" />
        </label>
        <div class="actions">
          <button v-if="!initialExercise" type="button" class="btn" @click="step = 'pick'">
            Back
          </button>
          <button type="submit" class="btn btn-accent">Save PR</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: flex-end;
  z-index: 20;
}

.sheet {
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  background: var(--color-surface);
  border-radius: 16px 16px 0 0;
  padding: 18px 16px calc(24px + env(safe-area-inset-bottom, 0px));
  border-top: 1px solid var(--color-border);
}

.sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.sheet-header h3 {
  font-size: 16px;
}

.close-btn {
  background: none;
  border: none;
  color: var(--color-text-dim);
  font-size: 24px;
  line-height: 1;
}

.entry-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field input,
.field select {
  width: 100%;
}

.weight-row {
  display: flex;
  gap: 8px;
}

.weight-row input {
  flex: 1;
}

.weight-row select {
  width: 80px;
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
