import { ref, readonly } from 'vue'

let _deferredPrompt = null
const _canInstall  = ref(false)
const _isIOS       = ref(false)
const _isInstalled = ref(false)

// Called from main.js before createApp() so the listener
// is registered as early as possible — never misses the event.
export function initInstallPrompt() {
  const ua = navigator.userAgent

  _isIOS.value = /iphone|ipad|ipod/i.test(ua) && !/crios|fxios/i.test(ua)

  _isInstalled.value =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    _deferredPrompt = e
    _canInstall.value = true
  })

  window.addEventListener('appinstalled', () => {
    _deferredPrompt = null
    _canInstall.value = false
    _isInstalled.value = true
  })

  // Keep isInstalled in sync if the display mode changes
  // (e.g. user installs mid-session)
  window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
    _isInstalled.value = e.matches
  })
}

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
    canInstall:  readonly(_canInstall),
    isIOS:       readonly(_isIOS),
    isInstalled: readonly(_isInstalled),
    promptInstall,
  }
}