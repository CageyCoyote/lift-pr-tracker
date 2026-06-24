<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
defineProps({
  exercise: { type: Object, required: true }
})

const levelColor = { beginner: '#4a9e6b', intermediate: '#c9a227', expert: '#c1443c' }
</script>

<template>
  <div class="exercise-card" role="button" @click="router.push(`/library/${exercise.id}`)">

    <div class="card-header">
      <span class="exercise-name">{{ exercise.name }}</span>
    </div>

    <div class="badges">
      <span v-if="exercise.equipment" class="badge badge-equipment">{{ exercise.equipment }}</span>
    </div>

    <div class="muscle-section">
      <div class="muscle-row">
        <span v-for="m in exercise.primaryMuscles" :key="m" class="muscle-chip primary">{{ m }}</span>
      </div>
      <div v-if="exercise.secondaryMuscles?.length" class="muscle-row secondary-row">
        <span v-for="m in exercise.secondaryMuscles" :key="m" class="muscle-chip secondary">{{ m }}</span>
      </div>
    </div>

    <div class="card-footer">
      <span class="mechanic">{{ exercise.category }}</span>
      <span class="level-badge" :style="{ color: levelColor[exercise.level] ?? 'var(--color-text-dim)' }">
        {{ exercise.level }}
      </span>
    </div>

  </div>
</template>

<style scoped>
.exercise-card {
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

.exercise-card:hover {
  border-color: var(--color-accent);
}

/* ── Header ── */
.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.exercise-name {
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 13px;
  line-height: 1.35;
  color: var(--color-text);
}

.level-pip {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 4px;
}

/* ── Equipment badge ── */
.badges {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.badge {
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 2px 7px;
  border-radius: revert;
  text-transform: capitalize;
  white-space: nowrap;
}

.badge-equipment {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  color: var(--color-text-dim);
}

/* ── Muscle chips ── */
.muscle-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.muscle-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.secondary-row {
  opacity: 0.7;
}

.muscle-chip {
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 999px;
  text-transform: capitalize;
  white-space: nowrap;
}

.muscle-chip.primary {
  background: color-mix(in srgb, var(--color-accent) 15%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-accent) 40%, transparent);
  color: var(--color-accent);
}

.muscle-chip.secondary {
  background: color-mix(in srgb, var(--color-steel) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-steel) 35%, transparent);
  color: var(--color-steel);
}

/* ── Footer ── */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 8px;
  border-top: 1px solid var(--color-border);
}

.mechanic {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-dim);
  text-transform: capitalize;
}

.level-badge {
  font-family: var(--font-mono);
  font-size: 10px;
  text-transform: capitalize;
}
</style>