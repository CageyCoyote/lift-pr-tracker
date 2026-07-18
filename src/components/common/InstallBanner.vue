<script setup>
import { ref, onMounted } from 'vue'
import { useInstallPrompt } from '../../composables/useInstallPrompt'

const { canInstall, isIOS, isInstalled, promptInstall } = useInstallPrompt()

const dismissed = ref(false)
const outcome = ref(null)

// Dev overrides — add to URL to force banner visible on any browser:
// ?install=1   → Android/Chrome UI
// ?install=ios → iOS Safari UI
const devParam = import.meta.env.DEV && new URLSearchParams(location.search).get('install')
const forceShow = !!devParam
const forceIOS  = devParam === 'ios'
const showIOSInstructions = forceIOS || (isIOS.value && !forceShow)

const LS_KEY = 'pr-tracker:install-dismissed'
onMounted(() => {
  if (localStorage.getItem(LS_KEY)) dismissed.value = true
})

function dismiss() {
  dismissed.value = true
  localStorage.setItem(LS_KEY, '1')
}

async function install() {
  if (forceShow) { dismiss(); return }
  outcome.value = await promptInstall()
  if (outcome.value === 'accepted') dismissed.value = true
}

const shouldShow = () =>
  !dismissed.value && (forceShow || (!isInstalled.value && (canInstall.value || isIOS.value)))
</script>

<template>
  <transition name="banner-slide">
    <div v-if="shouldShow()" class="install-banner">

      <img src="/icons/image.png" alt="PR Tracker" class="banner-icon" />

      <!-- iOS Safari — manual instructions -->
      <template v-if="showIOSInstructions">
        <div class="banner-text">
          <strong class="banner-title">Add to Home Screen</strong>
          <span class="banner-sub">
            Tap
            <svg class="share-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
              <polyline points="16 6 12 2 8 6"/>
              <line x1="12" y1="2" x2="12" y2="15"/>
            </svg>
            then "Add to Home Screen"
          </span>
        </div>
        <button class="banner-dismiss" @click="dismiss" aria-label="Dismiss">×</button>
      </template>

      <!-- Android/Chrome OR dev force-show fallback -->
      <template v-else>
        <div class="banner-text">
          <strong class="banner-title">Add to Home Screen</strong>
          <span class="banner-sub">Install PR Tracker for the best experience</span>
        </div>
        <button class="banner-install" @click="install">Install</button>
        <button class="banner-dismiss" @click="dismiss" aria-label="Dismiss">×</button>
      </template>

    </div>
  </transition>
</template>

<style scoped>
.install-banner {
  position: fixed;
  bottom: calc(var(--nav-height) + env(safe-area-inset-bottom, 0px) + 8px);
  left: 12px;
  right: 12px;
  max-width: 600px;
  margin: 0 auto;
  background: var(--color-surface);
  border: 1px solid var(--color-accent);
  border-radius: var(--radius);
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 15;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
}

.banner-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  flex-shrink: 0;
}

.banner-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.banner-title {
  font-family: var(--font-display);
  font-size: 14px;
  color: var(--color-text);
}

.banner-sub {
  font-size: 12px;
  color: var(--color-text-dim);
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.share-icon {
  width: 13px;
  height: 13px;
  flex-shrink: 0;
  color: var(--color-steel);
}

.banner-install {
  flex-shrink: 0;
  background: var(--color-accent);
  color: #1a1500;
  border: none;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 700;
  font-family: var(--font-body);
}

.banner-dismiss {
  flex-shrink: 0;
  background: none;
  border: none;
  color: var(--color-text-dim);
  font-size: 20px;
  line-height: 1;
  padding: 0 2px;
}

/* Slide up from below the nav */
.banner-slide-enter-active,
.banner-slide-leave-active {
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.banner-slide-enter-from,
.banner-slide-leave-to {
  transform: translateY(16px);
  opacity: 0;
}
</style>