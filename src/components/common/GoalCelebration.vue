<script setup>
import { computed } from 'vue'
import { useGoalCelebration } from '../../composables/useGoalCelebration'
import { useSettingsStore } from '../../stores/settings'
import PlateCelebrationAnimation from './PlateCelebrationAnimation.vue'

const { celebration, dismissGoalCelebration } = useGoalCelebration()
const settingsStore = useSettingsStore()

const summary = computed(() => {
  const c = celebration.value
  if (!c) return ''
  return c.unit === 'bodyweight'
    ? `${c.reps} rep${c.reps > 1 ? 's' : ''} (bodyweight)`
    : `${c.weight} ${c.unit}`
})
</script>

<template>
  <Transition name="goal-pop">
    <div v-if="celebration" class="goal-celebration" role="status" @click="dismissGoalCelebration">
      <PlateCelebrationAnimation v-if="celebration" :subtitle="summary" :sound-enabled="settingsStore.soundEnabled" />
    </div>
  </Transition>
</template>

<style scoped>
.goal-celebration {
  position: fixed;
  inset: 0;
  z-index: 65;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--color-deep-dark-blue);
  cursor: pointer;
}

/* ── Enter/leave ── */
.goal-pop-enter-active {
  transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease;
}

.goal-pop-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.goal-pop-enter-from {
  transform: scale(0.9);
  opacity: 0;
}

.goal-pop-leave-to {
  transform: scale(0.96);
  opacity: 0;
}
</style>