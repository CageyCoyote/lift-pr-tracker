<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  exerciseName: { type: String, default: '' },
  // 'lb' | 'kg' | 'bodyweight' — matches the unit the person's best entry
  // for this exercise is logged in, so the goal compares like-for-like.
  unit: { type: String, default: 'lb' },
  // Existing goal for this person/exercise, or null if none set yet.
  initialGoal: { type: Object, default: null }
})
const emit = defineEmits(['update:modelValue', 'saved', 'removed'])

const targetWeight = ref('')
const targetReps = ref('')

const isBodyweight = computed(() => props.unit === 'bodyweight')

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return
    targetWeight.value = props.initialGoal?.targetWeight ?? ''
    targetReps.value = props.initialGoal?.targetReps ?? ''
  }
)

function close() {
  emit('update:modelValue', false)
}

function save() {
  if (isBodyweight.value) {
    if (!targetReps.value) return
  } else if (!targetWeight.value) {
    return
  }

  emit('saved', {
    unit: props.unit,
    targetWeight: isBodyweight.value ? null : targetWeight.value,
    targetReps: isBodyweight.value ? targetReps.value : null
  })
  close()
}

function remove() {
  emit('removed')
  close()
}
</script>

<template>
  <div v-if="modelValue" class="overlay" @click.self="close">
    <div class="sheet">
      <header class="sheet-header">
        <h3>Goal: {{ exerciseName }}</h3>
        <button class="close-btn" @click="close" aria-label="Close">×</button>
      </header>

      <form class="entry-form" @submit.prevent="save">
        <label v-if="isBodyweight" class="field">
          <span class="eyebrow">Target Reps</span>
          <input v-model="targetReps" type="number" min="1" step="1" required autofocus />
        </label>
        <label v-else class="field">
          <span class="eyebrow">Target Weight ({{ unit }})</span>
          <input v-model="targetWeight" type="number" min="0" step="0.5" required autofocus />
        </label>

        <div class="actions">
          <button v-if="initialGoal" type="button" class="btn btn-danger" @click="remove">
            Remove Goal
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