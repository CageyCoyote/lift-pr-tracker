<script setup>
import { computed } from 'vue'

const props = defineProps({
  weight: { type: [Number, String], required: true },
  unit: { type: String, default: 'lb' },
  size: { type: Number, default: 64 },
  // Goal progress as a ratio (1 = goal met, 1.32 = 132% of goal).
  // null/undefined = no goal set for this exercise.
  progress: { type: Number, default: null }
})

// This ring replaces the plate's border entirely (the plate itself has no
// CSS border) — there is only ever one ring, not a border plus a separate
// progress ring stacked outside it.
const RING_WIDTH = 5
const ringRadius = computed(() => (props.size - RING_WIDTH) / 2)
const circumference = computed(() => 2 * Math.PI * ringRadius.value)

const hasGoal = computed(() => props.progress !== null && props.progress !== undefined)
const overshoot = computed(() => hasGoal.value && props.progress > 1)
// Clamp for drawing the arc — the actual percentage (which can exceed
// 100%) is shown as text elsewhere, the ring itself just closes at 100%.
const clampedProgress = computed(() => Math.max(0, Math.min(props.progress ?? 0, 1)))
const dashOffset = computed(() => circumference.value * (1 - clampedProgress.value))
</script>

<template>
  <div class="plate-wrap" :style="{ width: size + 'px', height: size + 'px' }">
    <svg
      class="goal-ring"
      :width="size"
      :height="size"
      :viewBox="`0 0 ${size} ${size}`"
      aria-hidden="true"
    >
      <!-- Track: always visible, doubles as the plate's border. This alone
           is what shows when there's no goal — a plain solid black ring. -->
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="ringRadius"
        class="ring-track"
        :stroke-width="RING_WIDTH"
        fill="none"
      />
      <!-- Progress arc: only drawn once a goal exists, grows clockwise from
           the top, drawn directly on top of the track at the same radius. -->
      <circle
        v-if="hasGoal"
        :cx="size / 2"
        :cy="size / 2"
        :r="ringRadius"
        class="ring-progress"
        :class="{ overshoot }"
        :stroke-width="RING_WIDTH"
        fill="none"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        :transform="`rotate(-90 ${size / 2} ${size / 2})`"
      />
    </svg>
    <div class="plate" :style="{ width: size + 'px', height: size + 'px' }">
      <span class="plate-weight">{{ weight }}</span>
      <span class="plate-unit">{{ unit }}</span>
    </div>
  </div>
</template>

<style scoped>
.plate-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.goal-ring {
  position: absolute;
  inset: 0;
}

.ring-track {
  stroke: #000;
}

.ring-progress {
  stroke: var(--color-accent);
  transition: stroke-dashoffset 0.4s ease, stroke 0.3s ease;
}

.ring-progress.overshoot {
  stroke: var(--color-green);
}

.plate {
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, var(--color-surface-2), var(--color-surface));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.plate-weight {
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 18px;
  color: var(--color-text);
  line-height: 1;
}

.plate-unit {
  font-family: var(--font-mono);
  font-size: 9px;
  color: var(--color-text-dim);
  text-transform: uppercase;
}
</style>