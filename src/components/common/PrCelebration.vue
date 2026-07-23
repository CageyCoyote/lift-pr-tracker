<script setup>
import { computed } from 'vue'
import { usePrCelebration } from '../../composables/usePrCelebration'

const { celebration, dismissCelebration } = usePrCelebration()

// A handful of confetti pieces with randomized fall paths. Regenerated
// each time a celebration fires (keyed below) so the burst never repeats
// the exact same pattern twice in a row.
const COLORS = ['var(--color-accent)', 'var(--color-green)', 'var(--color-steel)', 'var(--color-accent-light)', '#fff']
const PIECE_COUNT = 26

function makePieces() {
  return Array.from({ length: PIECE_COUNT }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.25,
    duration: 1.4 + Math.random() * 0.9,
    rotate: Math.round(Math.random() * 360),
    drift: Math.round((Math.random() - 0.5) * 140),
    size: 6 + Math.round(Math.random() * 6),
    color: COLORS[i % COLORS.length],
    round: Math.random() > 0.5,
  }))
}

// Re-rolled every time `celebration` flips from null -> object.
const pieces = computed(() => {
  if (!celebration.value) return []
  return makePieces()
})

const summary = computed(() => {
  const c = celebration.value
  if (!c) return ''
  return c.unit === 'bodyweight'
    ? `${c.reps} rep${c.reps > 1 ? 's' : ''} (bodyweight)`
    : `${c.weight}${c.unit} × ${c.reps}`
})
</script>

<template>
  <Transition name="toast-pop">
    <div v-if="celebration" class="pr-celebration" role="status" @click="dismissCelebration">
      <div class="confetti-layer" aria-hidden="true">
        <span
          v-for="p in pieces"
          :key="p.id"
          class="confetti-piece"
          :class="{ round: p.round }"
          :style="{
            left: p.left + '%',
            animationDelay: p.delay + 's',
            animationDuration: p.duration + 's',
            '--drift': p.drift + 'px',
            '--rotate': p.rotate + 'deg',
            width: p.size + 'px',
            height: p.size + 'px',
            background: p.color,
          }"
        />
      </div>

      <div class="toast">
        <span class="toast-trophy">🏆</span>
        <div class="toast-text">
          <span class="toast-title">New PR!</span>
          <span class="toast-sub">{{ celebration.exerciseName }} — {{ summary }}</span>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.pr-celebration {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: max(18px, env(safe-area-inset-top, 0px));
  pointer-events: none;
}

.toast {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--color-surface);
  border: 1px solid var(--color-accent);
  border-radius: var(--radius);
  padding: 12px 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35);
  max-width: min(90vw, 360px);
}

.toast-trophy {
  font-size: 22px;
  line-height: 1;
}

.toast-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.toast-title {
  font-family: var(--font-display);
  font-size: 15px;
  color: var(--color-accent);
}

.toast-sub {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--color-text-dim);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Toast enter/leave ── */
.toast-pop-enter-active {
  transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease;
}

.toast-pop-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.toast-pop-enter-from {
  transform: translateY(-16px) scale(0.9);
  opacity: 0;
}

.toast-pop-leave-to {
  transform: translateY(-8px) scale(0.96);
  opacity: 0;
}

/* ── Confetti ── */
.confetti-layer {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.confetti-piece {
  position: absolute;
  top: -12px;
  opacity: 0.95;
  animation-name: confetti-fall;
  animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  animation-fill-mode: forwards;
}

.confetti-piece.round {
  border-radius: 50%;
}

@keyframes confetti-fall {
  0% {
    transform: translate3d(0, 0, 0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translate3d(var(--drift), 70vh, 0) rotate(var(--rotate));
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .confetti-piece {
    display: none;
  }
}
</style>
