<script setup>
import { computed, watch, onBeforeUnmount } from 'vue'
import { usePrCelebration } from '../../composables/usePrCelebration'
import { useSettingsStore } from '../../stores/settings'

const { celebration, dismissCelebration } = usePrCelebration()
const settingsStore = useSettingsStore()

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
    : `${c.weight}${c.unit}`
})

// --- Web Audio API: Low-Register "Ta-Da" Fanfare ---
let audioCtx = null
let activeNodes = []

function getAudioContext() {
  if (!audioCtx && typeof window !== 'undefined') {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

function stopActiveAudio() {
  activeNodes.forEach(node => {
    try {
      node.stop()
      node.disconnect()
    } catch (_) {}
  })
  activeNodes = []
}

// Simple brass-ish voice: sawtooth through a lowpass, quick punchy envelope.
function createBrassVoice(actx, freq, startTime, duration, vol) {
  const osc = actx.createOscillator()
  const gain = actx.createGain()
  const filter = actx.createBiquadFilter()

  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(freq, startTime)

  filter.type = 'lowpass'
  filter.Q.setValueAtTime(1.2, startTime)
  filter.frequency.setValueAtTime(1800, startTime)
  filter.frequency.exponentialRampToValueAtTime(600, startTime + duration)

  gain.gain.setValueAtTime(0.001, startTime)
  gain.gain.linearRampToValueAtTime(vol, startTime + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)

  osc.connect(filter)
  filter.connect(gain)
  gain.connect(actx.destination)

  osc.start(startTime)
  osc.stop(startTime + duration + 0.03)
  activeNodes.push(osc)
}

function playTaDaFanfare() {
  if (!settingsStore.soundEnabled) return
  const actx = getAudioContext()
  if (!actx) return

  stopActiveAudio()
  const now = actx.currentTime

  // "Ta" — short low pickup note
  createBrassVoice(actx, 130.81, now + 0.00, 0.11, 0.32) // C3
  // "Da" — jumps up a 4th, still low register
  createBrassVoice(actx, 174.61, now + 0.11, 0.14, 0.36) // F3

  // "-daa!" — resolving low-register chord (root position, no high octaves)
  const tChord = now + 0.26
  const chordDuration = 0.9

  // Sub anchor
  const subOsc = actx.createOscillator()
  const subGain = actx.createGain()
  subOsc.type = 'sine'
  subOsc.frequency.setValueAtTime(65.41, tChord) // C2
  subGain.gain.setValueAtTime(0.001, tChord)
  subGain.gain.linearRampToValueAtTime(0.4, tChord + 0.015)
  subGain.gain.exponentialRampToValueAtTime(0.0001, tChord + chordDuration)
  subOsc.connect(subGain)
  subGain.connect(actx.destination)
  subOsc.start(tChord)
  subOsc.stop(tChord + chordDuration + 0.05)
  activeNodes.push(subOsc)

  // F major chord kept low: F2 / C3 / F3 / A3
  createBrassVoice(actx, 87.31, tChord, chordDuration, 0.34)  // F2
  createBrassVoice(actx, 130.81, tChord, chordDuration, 0.30) // C3
  createBrassVoice(actx, 174.61, tChord, chordDuration, 0.26) // F3
  createBrassVoice(actx, 220.00, tChord, chordDuration, 0.20) // A3

  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate([20, 30, 30])
  }
}

watch(celebration, (newVal) => {
  if (newVal) {
    playTaDaFanfare()
  }
})

onBeforeUnmount(() => {
  stopActiveAudio()
  if (audioCtx && audioCtx.state !== 'closed') {
    audioCtx.close()
  }
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
          <span class="toast-sub">{{ summary }}</span>
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