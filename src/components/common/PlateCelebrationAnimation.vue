<template>
  <div class="celebration-container">
    <div ref="stageRef" class="stage">
      <!-- Chalk Dust Particle Canvas -->
      <canvas ref="canvasRef" class="chalk-canvas" />

      <!-- Dramatic Goal Text Banner -->
      <div
        ref="goalBannerRef"
        class="goal-banner"
        :class="{ show: showBanner }"
      >
        <div class="goal-glow" />
        <div class="goal-title">{{ title }}</div>
        <div class="goal-subtitle">{{ subtitle }}</div>
      </div>

      <!-- Ground Shadow -->
      <div ref="shadowRef" class="shadow" />

      <!-- Impact Shockwave -->
      <div
        ref="shockwaveRef"
        class="shockwave"
        :class="{ active: isShockwaveActive }"
      />

      <!-- Weight Plate Object -->
      <div ref="plateWrapperRef" class="plate-wrapper">
        <div ref="plateMeshRef" class="plate">
          <svg viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" stroke-width="7" :stroke="plateColor" />
            <circle cx="50" cy="50" r="38" stroke-width="2.5" :stroke="plateColor" />
            <circle cx="50" cy="50" r="29" stroke-width="7" :stroke="plateColor" />
            <circle cx="50" cy="50" r="10" stroke-width="5" :stroke="plateColor" />
          </svg>
        </div>
      </div>

      <!-- Gym Mat Floor -->
      <div class="floor" />
    </div>

    <!-- Optional Replay Button -->
    <div v-if="showControls" class="controls">
      <button type="button" @click="triggerDrop">
        {{ buttonText }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: 'GOAL ACHIEVED!'
  },
  subtitle: {
    type: String,
    default: '300 LBS'
  },
  plateColor: {
    type: String,
    default: '#5b7a8c'
  },
  autoPlay: {
    type: Boolean,
    default: true
  },
  soundEnabled: {
    type: Boolean,
    default: true
  },
  hapticsEnabled: {
    type: Boolean,
    default: true
  },
  showControls: {
    type: Boolean,
    default: false
  },
  buttonText: {
    type: String,
    default: 'Drop Plate Again'
  }
})

const emit = defineEmits(['start', 'impact', 'settle', 'complete'])

// Template Refs
const stageRef = ref(null)
const canvasRef = ref(null)
const goalBannerRef = ref(null)
const shadowRef = ref(null)
const shockwaveRef = ref(null)
const plateWrapperRef = ref(null)
const plateMeshRef = ref(null)

// Reactive State
const showBanner = ref(false)
const isShockwaveActive = ref(false)

// Physics Parameters
const START_Y = -220
const TARGET_Y = 310
const GRAVITY = 2300
const RESTITUTION = 0.28
const SQUASH_INTENSITY = 0.14

// Runtime State
let posY = START_Y
let velocityY = 0
let bounceCount = 0
let isSettled = false
let lastTime = null
let animFrameId = null
let timeoutIds = []
let chalkParticles = []
let ctx = null
let audioCtx = null
let activeAudioNodes = []

// --- Web Audio API: Synchronized Zelda Fanfare (Starts at t=0, Resolves on Impact) ---
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
  activeAudioNodes.forEach(node => {
    try {
      node.stop()
      node.disconnect()
    } catch (_) {}
  })
  activeAudioNodes = []
}

function playZeldaDeepSynth() {
  if (!props.soundEnabled) return
  const actx = getAudioContext()
  if (!actx) return

  stopActiveAudio()
  const now = actx.currentTime

  // 1. Rising Chromatic Build (Plays during the fall: t = 0.00s to 0.55s)
  const risingNotes = [
    { freq: 49.00, time: 0.00, dur: 0.10, vol: 0.32 }, // G1
    { freq: 51.91, time: 0.11, dur: 0.10, vol: 0.35 }, // G#1
    { freq: 55.00, time: 0.22, dur: 0.10, vol: 0.38 }, // A1
    { freq: 58.27, time: 0.33, dur: 0.10, vol: 0.42 }, // A#1
    { freq: 61.74, time: 0.44, dur: 0.10, vol: 0.46 }, // B1
    { freq: 65.41, time: 0.55, dur: 0.12, vol: 0.50 }  // C2
  ]

  risingNotes.forEach(({ freq, time, dur, vol }) => {
    const tStart = now + time
    const osc = actx.createOscillator()
    const gain = actx.createGain()
    const filter = actx.createBiquadFilter()

    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(freq, tStart)

    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(340, tStart)
    filter.frequency.exponentialRampToValueAtTime(120, tStart + dur)

    gain.gain.setValueAtTime(vol, tStart)
    gain.gain.exponentialRampToValueAtTime(0.001, tStart + dur)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(actx.destination)

    osc.start(tStart)
    osc.stop(tStart + dur + 0.02)
    activeAudioNodes.push(osc)
  })

  // 2. Final Grand Resolution Hit (Hits precisely at t = 0.68s when plate strikes floor)
  const resolveTime = now + 0.68

  // Deep Sub-bass 808 Boom
  const subOsc = actx.createOscillator()
  const subGain = actx.createGain()
  subOsc.type = 'sine'
  subOsc.frequency.setValueAtTime(45, resolveTime)
  subOsc.frequency.exponentialRampToValueAtTime(30, resolveTime + 1.2)

  subGain.gain.setValueAtTime(0.001, resolveTime)
  subGain.gain.linearRampToValueAtTime(0.85, resolveTime + 0.04)
  subGain.gain.exponentialRampToValueAtTime(0.0001, resolveTime + 1.8)

  subOsc.connect(subGain)
  subGain.connect(actx.destination)
  subOsc.start(resolveTime)
  subOsc.stop(resolveTime + 1.9)
  activeAudioNodes.push(subOsc)

  // Full Analog Power Chord: D1 / D2 / F#2 / A2 / D3
  const chordNotes = [
    { freq: 36.71, detune: -0.3, vol: 0.32 }, // D1
    { freq: 73.42, detune: 0.4, vol: 0.28 },  // D2
    { freq: 92.50, detune: 0.0, vol: 0.24 },  // F#2 (Major 3rd)
    { freq: 110.00, detune: -0.4, vol: 0.22 }, // A2 (5th)
    { freq: 146.83, detune: 0.3, vol: 0.16 }  // D3
  ]

  const chordFilter = actx.createBiquadFilter()
  chordFilter.type = 'lowpass'
  chordFilter.Q.setValueAtTime(2.4, resolveTime)
  chordFilter.frequency.setValueAtTime(160, resolveTime)
  chordFilter.frequency.linearRampToValueAtTime(480, resolveTime + 0.2)
  chordFilter.frequency.exponentialRampToValueAtTime(90, resolveTime + 1.7)

  const chordMasterGain = actx.createGain()
  chordMasterGain.gain.setValueAtTime(0.001, resolveTime)
  chordMasterGain.gain.linearRampToValueAtTime(0.9, resolveTime + 0.03)
  chordMasterGain.gain.exponentialRampToValueAtTime(0.0001, resolveTime + 1.8)

  chordFilter.connect(chordMasterGain)
  chordMasterGain.connect(actx.destination)

  chordNotes.forEach(({ freq, detune, vol }) => {
    const osc = actx.createOscillator()
    const voiceGain = actx.createGain()

    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(freq + detune, resolveTime)
    voiceGain.gain.setValueAtTime(vol, resolveTime)

    osc.connect(voiceGain)
    voiceGain.connect(chordFilter)

    osc.start(resolveTime)
    osc.stop(resolveTime + 1.9)
    activeAudioNodes.push(osc)
  })
}

// --- Chalk Particle System ---
class ChalkParticle {
  constructor(originX, originY, side) {
    this.x = originX + (Math.random() - 0.5) * 40
    this.y = originY + (Math.random() - 0.5) * 6

    const speedX = (Math.random() * 240 + 60) * side
    const speedY = -(Math.random() * 120 + 30)
    this.vx = speedX + (Math.random() - 0.5) * 50
    this.vy = speedY

    this.radius = Math.random() * 8 + 4
    this.growth = Math.random() * 18 + 12
    this.alpha = Math.random() * 0.5 + 0.45
    this.decay = Math.random() * 0.65 + 0.55
    this.drag = 0.94
  }

  update(dt) {
    this.vx *= Math.pow(this.drag, dt * 60)
    this.vy *= Math.pow(this.drag, dt * 60)
    this.vy += 40 * dt

    this.x += this.vx * dt
    this.y += this.vy * dt
    this.radius += this.growth * dt
    this.alpha -= this.decay * dt
  }

  draw(context) {
    if (this.alpha <= 0) return
    context.save()
    context.beginPath()
    const gradient = context.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, Math.max(1, this.radius)
    )
    gradient.addColorStop(0, `rgba(255, 255, 255, ${this.alpha * 0.9})`)
    gradient.addColorStop(0.5, `rgba(240, 246, 252, ${this.alpha * 0.5})`)
    gradient.addColorStop(1, 'rgba(220, 230, 242, 0)')

    context.fillStyle = gradient
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    context.fill()
    context.restore()
  }
}

function resizeCanvas() {
  if (!stageRef.value || !canvasRef.value) return
  const rect = stageRef.value.getBoundingClientRect()
  canvasRef.value.width = rect.width
  canvasRef.value.height = rect.height
}

function emitChalkPuff() {
  if (!canvasRef.value) return
  const originX = canvasRef.value.width / 2
  const originY = TARGET_Y + 200
  const particleCount = 48

  chalkParticles = []
  for (let i = 0; i < particleCount; i++) {
    const side = i % 2 === 0 ? 1 : -1
    chalkParticles.push(new ChalkParticle(originX, originY, side))
  }
}

function updateAndRenderChalk(dt) {
  if (!ctx || !canvasRef.value) return
  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  for (let i = chalkParticles.length - 1; i >= 0; i--) {
    const p = chalkParticles[i]
    p.update(dt)
    if (p.alpha <= 0) {
      chalkParticles.splice(i, 1)
    } else {
      p.draw(ctx)
    }
  }
}

function triggerShockwave() {
  isShockwaveActive.value = false
  nextTick(() => {
    isShockwaveActive.value = true
  })

  if (stageRef.value) {
    stageRef.value.classList.remove('shake')
    void stageRef.value.offsetWidth
    stageRef.value.classList.add('shake')
  }
}

function triggerGoalText() {
  showBanner.value = false
  nextTick(() => {
    showBanner.value = true
  })
}

function updatePhysics(timestamp) {
  if (!lastTime) lastTime = timestamp
  const dt = Math.min((timestamp - lastTime) / 1000, 0.05)
  lastTime = timestamp

  if (!isSettled) {
    velocityY += GRAVITY * dt
    posY += velocityY * dt

    if (posY >= TARGET_Y) {
      posY = TARGET_Y

      if (bounceCount === 0) {
        // First contact: squash, chalk puff, shockwave, text slam & haptics
        velocityY = -velocityY * RESTITUTION
        bounceCount++

        if (plateMeshRef.value) {
          plateMeshRef.value.style.transform = `scale(${1 + SQUASH_INTENSITY}, ${1 - SQUASH_INTENSITY})`
          const t1 = setTimeout(() => {
            if (plateMeshRef.value) plateMeshRef.value.style.transform = 'scale(1, 1)'
          }, 75)
          timeoutIds.push(t1)
        }

        emitChalkPuff()
        triggerShockwave()
        triggerGoalText()

        if (props.hapticsEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate([45, 30, 20])
        }

        emit('impact')
      } else {
        // Second contact: settle cleanly
        velocityY = 0
        isSettled = true
        if (plateMeshRef.value) {
          plateMeshRef.value.style.transform = 'scale(1.02, 0.98)'
          const t2 = setTimeout(() => {
            if (plateMeshRef.value) plateMeshRef.value.style.transform = 'scale(1, 1)'
          }, 60)
          timeoutIds.push(t2)
        }

        if (props.hapticsEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate(15)
        }

        emit('settle')
        emit('complete')
      }
    }

    if (plateWrapperRef.value) {
      plateWrapperRef.value.style.transform = `translateY(${posY}px)`
    }

    if (shadowRef.value) {
      const dropProgress = Math.max(0, Math.min(1, (posY - START_Y) / (TARGET_Y - START_Y)))
      shadowRef.value.style.transform = `scale(${0.2 + 0.8 * dropProgress})`
      shadowRef.value.style.opacity = (0.1 + 0.7 * dropProgress).toString()
    }
  }

  updateAndRenderChalk(dt)

  if (!isSettled || chalkParticles.length > 0) {
    animFrameId = requestAnimationFrame(updatePhysics)
  }
}

function triggerDrop() {
  if (animFrameId) cancelAnimationFrame(animFrameId)
  timeoutIds.forEach(clearTimeout)
  timeoutIds = []

  posY = START_Y
  velocityY = 0
  bounceCount = 0
  isSettled = false
  lastTime = null
  chalkParticles = []
  showBanner.value = false
  isShockwaveActive.value = false

  if (ctx && canvasRef.value) {
    ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  }
  if (plateMeshRef.value) {
    plateMeshRef.value.style.transform = 'scale(1, 1)'
  }
  if (plateWrapperRef.value) {
    plateWrapperRef.value.style.transform = `translateY(${START_Y}px)`
  }

  // Initiate Sound Sequence at animation start
  playZeldaDeepSynth()
  emit('start')

  animFrameId = requestAnimationFrame(updatePhysics)
}

onMounted(() => {
  if (canvasRef.value) {
    ctx = canvasRef.value.getContext('2d')
  }
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)
  window.addEventListener('orientationchange', resizeCanvas)

  if (props.autoPlay) {
    triggerDrop()
  }
})

onBeforeUnmount(() => {
  if (animFrameId) cancelAnimationFrame(animFrameId)
  timeoutIds.forEach(clearTimeout)
  stopActiveAudio()
  window.removeEventListener('resize', resizeCanvas)
  window.removeEventListener('orientationchange', resizeCanvas)
  if (audioCtx && audioCtx.state !== 'closed') {
    audioCtx.close()
  }
})

defineExpose({
  triggerDrop,
  playZeldaDeepSynth
})
</script>

<style scoped>
.celebration-container {
  width: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  user-select: none;
  background: transparent;
}

.stage {
  position: relative;
  width: 100%;
  max-width: 440px;
  height: 600px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: visible;
}

.floor {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 90px;
  background: repeating-linear-gradient(
    45deg,
    #161b22,
    #161b22 15px,
    #12161c 15px,
    #12161c 30px
  );
  border-top: 4px solid #30363d;
  box-shadow: inset 0 8px 16px rgba(0, 0, 0, 0.6);
  z-index: 1;
}

.chalk-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 4;
}

.goal-banner {
  position: absolute;
  top: 85px;
  left: 50%;
  width: 90%;
  max-width: 360px;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  pointer-events: none;
  z-index: 5;
  opacity: 0;
  visibility: hidden;
}

.goal-glow {
  position: absolute;
  width: 100%;
  max-width: 340px;
  height: 180px;
  background: radial-gradient(ellipse at center, rgba(91, 122, 140, 0.5) 0%, rgba(88, 166, 255, 0.18) 45%, transparent 75%);
  filter: blur(24px);
  opacity: 0;
  transform: scale(0.4);
  pointer-events: none;
  transition: opacity 0.4s ease-out, transform 0.5s cubic-bezier(0.1, 0.9, 0.2, 1);
}

.goal-title {
  width: 100%;
  font-size: clamp(1.55rem, 9vw, 2.1rem);
  font-weight: 900;
  font-style: italic;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  line-height: 1.1;
  color: #ffffff;
  background: linear-gradient(180deg, #ffffff 0%, #d8e5ee 55%, #8ba2b2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 4px 18px rgba(0, 0, 0, 0.85)) drop-shadow(0 0 25px rgba(91, 122, 140, 0.7));
  opacity: 0;
  white-space: nowrap;
}

.goal-subtitle {
  margin-top: 8px;
  font-size: clamp(0.75rem, 3.2vw, 0.9rem);
  font-weight: 700;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: #c9a227;
  opacity: 0;
  transform: translateY(12px);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.9);
  border-top: 1px solid rgba(164, 192, 208, 0.4);
  border-bottom: 1px solid rgba(164, 192, 208, 0.4);
  padding: 3px 14px;
}

.goal-banner.show {
  opacity: 1;
  visibility: visible;
}

.goal-banner.show .goal-glow {
  opacity: 1;
  transform: scale(1.15);
}

.goal-banner.show .goal-title {
  animation: textSlam 0.45s cubic-bezier(0.15, 0.85, 0.35, 1.25) forwards;
}

.goal-banner.show .goal-subtitle {
  animation: subtitleReveal 0.4s ease-out 0.2s forwards;
}

@keyframes textSlam {
  0% {
    opacity: 0;
    transform: scale(1.6) translateY(-15px);
    filter: drop-shadow(0 0 30px rgba(255, 255, 255, 0.9));
  }
  60% {
    opacity: 1;
    transform: scale(0.95) translateY(2px);
  }
  80% {
    transform: scale(1.03) translateY(-1px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
    filter: drop-shadow(0 4px 18px rgba(0, 0, 0, 0.85)) drop-shadow(0 0 25px rgba(91, 122, 140, 0.7));
  }
}

@keyframes subtitleReveal {
  0% {
    opacity: 0;
    transform: translateY(12px) scale(0.9);
    letter-spacing: 0.15em;
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
    letter-spacing: 0.3em;
  }
}

.plate-wrapper {
  position: absolute;
  top: 0;
  left: 50%;
  width: 200px;
  height: 200px;
  margin-left: -100px;
  transform: translateY(-220px);
  will-change: transform;
  z-index: 3;
}

.plate {
  width: 100%;
  height: 100%;
  transform-origin: center bottom;
  transition: transform 0.075s ease-out;
}

.plate svg {
  display: block;
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 10px 22px rgba(0, 0, 0, 0.6));
}

.plate svg circle {
  fill: none;
}

.shadow {
  position: absolute;
  bottom: 80px;
  left: 50%;
  width: 160px;
  height: 14px;
  margin-left: -80px;
  background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0.75) 0%, transparent 70%);
  border-radius: 50%;
  transform: scale(0.2);
  opacity: 0.1;
  will-change: transform, opacity;
  z-index: 2;
}

.shockwave {
  position: absolute;
  bottom: 84px;
  left: 50%;
  width: 20px;
  height: 6px;
  margin-left: -10px;
  border-radius: 50%;
  border: 2px solid rgba(240, 246, 252, 0.7);
  opacity: 0;
  pointer-events: none;
  z-index: 2;
}

.shockwave.active {
  animation: wave 0.38s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
}

@keyframes wave {
  0% {
    width: 20px;
    height: 6px;
    margin-left: -10px;
    opacity: 0.8;
  }
  100% {
    width: 280px;
    height: 16px;
    margin-left: -140px;
    opacity: 0;
  }
}

.stage.shake {
  animation: screenShake 0.18s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

@keyframes screenShake {
  10%, 90% { transform: translate3d(0, -2px, 0); }
  20%, 80% { transform: translate3d(0, 4px, 0); }
  30%, 50%, 70% { transform: translate3d(0, -3px, 0); }
  40%, 60% { transform: translate3d(0, 2px, 0); }
}

.controls {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 0 16px;
}

button {
  background: #238636;
  color: #ffffff;
  border: 1px solid rgba(240, 246, 252, 0.1);
  padding: 12px 28px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  touch-action: manipulation;
}

button:hover {
  background: #2ea043;
}

button:active {
  transform: scale(0.97);
}
</style>