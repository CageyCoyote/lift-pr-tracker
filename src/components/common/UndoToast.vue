<script setup>
import { useUndoToast } from '../../composables/useUndoToast'

const { toast, undo, dismissUndoToast } = useUndoToast()

function handleUndo() {
  if (navigator.vibrate) navigator.vibrate(12)
  undo()
}
</script>

<template>
  <Transition name="undo-slide">
    <div v-if="toast" :key="toast" class="undo-toast" :class="toast.variant">
      <svg v-if="toast.variant === 'success'" class="toast-icon" width="18" height="18" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 6 9 17l-5-5" />
      </svg>
      <span class="undo-message">{{ toast.message }}</span>
      <button v-if="toast.onUndo" class="undo-btn" @click="handleUndo">Undo</button>
      <button class="undo-dismiss" aria-label="Dismiss" @click="dismissUndoToast">×</button>
      <div class="undo-progress" :style="{ animationDuration: toast.durationMs + 'ms' }" />
    </div>
  </Transition>
</template>

<style scoped>
.undo-toast {
  position: fixed;
  left: 12px;
  right: 12px;
  bottom: calc(var(--nav-height, 0px) + env(safe-area-inset-bottom, 0px) + 8px);
  max-width: 420px;
  margin: 0 auto;
  z-index: 55;
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 12px 10px 12px 14px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35);
  overflow: hidden;
}

.undo-toast.success {
  border-color: var(--color-green);
}

.toast-icon {
  flex-shrink: 0;
  color: var(--color-green);
}

.undo-message {
  flex: 1;
  font-size: 13px;
  color: var(--color-text);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.undo-btn {
  flex-shrink: 0;
  background: none;
  border: none;
  color: var(--color-accent);
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  padding: 4px 6px;
}

.undo-btn:hover {
  color: var(--color-accent-light);
}

.undo-dismiss {
  flex-shrink: 0;
  background: none;
  border: none;
  color: var(--color-text-dim);
  font-size: 18px;
  line-height: 1;
  padding: 0 2px;
}

.undo-progress {
  position: absolute;
  left: 0;
  bottom: 0;
  height: 2px;
  background: var(--color-accent);
  width: 100%;
  transform-origin: left;
  animation-name: undo-shrink;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}

.undo-toast.success .undo-progress {
  background: var(--color-green);
}

@keyframes undo-shrink {
  from { transform: scaleX(1); }
  to { transform: scaleX(0); }
}

.undo-slide-enter-active,
.undo-slide-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.undo-slide-enter-from,
.undo-slide-leave-to {
  transform: translateY(12px);
  opacity: 0;
}
</style>