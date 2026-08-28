<script setup>
import { ref, computed, watch } from 'vue'
import ExercisePicker from '../exercises/ExercisePicker.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  personId: { type: String, default: null },
})
const emit = defineEmits(['update:modelValue', 'saved'])

const step = ref('pick')
const exercise = ref(null)
const unit = ref('lb')
const targetWeight = ref('')
const targetReps = ref('')

const isBodyweight = computed(() => unit.value === 'bodyweight')

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return
    exercise.value = null
    step.value = 'pick'
    unit.value = 'lb'
    targetWeight.value = ''
    targetReps.value = ''
  }
)

function pick(ex) {
  exercise.value = ex
  step.value = 'goal'
  unit.value = ex.equipment === 'body only' ? 'bodyweight' : 'lb'
}

function close() {
  emit('update:modelValue', false)
}

function save() {
  if (!exercise.value) return
  if (isBodyweight.value) {
    if (!targetReps.value) return
  } else if (!targetWeight.value) {
    return
  }

  emit('saved', {
    exerciseId: exercise.value.id,
    exerciseName: exercise.value.name,
    unit: unit.value,
    targetWeight: isBodyweight.value ? null : targetWeight.value,
    targetReps: isBodyweight.value ? targetReps.value : null
  })
  close()
}
</script>

<template>
  <div v-if="modelValue" class="overlay" @click.self="close">
    <div class="sheet">
      <header class="sheet-header">
        <h3>{{ step === 'pick' ? 'Choose Exercise' : `Goal: ${exercise.name}` }}</h3>
        <button class="close-btn" @click="close" aria-label="Close">×</button>
      </header>

      <ExercisePicker v-if="step === 'pick'" @select="pick" />

      <form v-else class="entry-form" @submit.prevent="save">
        <!--<p class="hint">
          This starts a fresh PR for {{ exercise.name }} at 0, then tracks your
          progress toward the target below.
        </p>-->

        <label v-if="isBodyweight" class="field">
          <span class="eyebrow">Target Reps</span>
          <input v-model="targetReps" type="number" min="1" step="1" required autofocus />
        </label>
        <label v-else class="field">
          <span class="eyebrow">Target Weight ({{ unit }})</span>
          <input v-model="targetWeight" type="number" min="0" step="0.5" required autofocus />
        </label>

        <div class="actions">
          <button type="button" class="btn" @click="step = 'pick'">
            Back
          </button>
          <button type="submit" class="btn btn-accent">Save Goal</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.entry-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.hint {
  font-size: 13px;
  color: var(--color-text-dim);
  line-height: 1.4;
  margin: 0;
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