import { ref, readonly } from 'vue'

// Module-level so the event is captured as early as possible,
// before any component mounts and potentially misses it.
let _deferredPrompt = null
const _canInstall = ref(false)
const _isIOS = ref(false)
const _isInstalled = ref(false)

// Detect iOS Safari (no beforeinstallprompt support)
const ua = navigator.userAgent
_isIOS.value = /iphone|ipad|ipod/i.test(ua) && !/crios|fxios/i.test(ua)

// Detect already running as installed PWA
_isInstalled.value =
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone === true

// Intercept the native prompt as early as possible
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  _deferredPrompt = e
  _canInstall.value = true
})

// Clean up if user installs from browser UI directly
window.addEventListener('appinstalled', () => {
  _deferredPrompt = null
  _canInstall.value = false
  _isInstalled.value = true
})

export function useInstallPrompt() {
  async function promptInstall() {
    if (!_deferredPrompt) return 'unavailable'
    _deferredPrompt.prompt()
    const { outcome } = await _deferredPrompt.userChoice
    _deferredPrompt = null
    _canInstall.value = false
    return outcome // 'accepted' | 'dismissed'
  }

  return {
    canInstall: readonly(_canInstall),
    isIOS: readonly(_isIOS),
    isInstalled: readonly(_isInstalled),
    promptInstall,
  }
}
