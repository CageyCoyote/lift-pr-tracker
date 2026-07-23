import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { load, save } from '../utils/storage'

export const ICON_COLORS = [
  { label: 'Energy',   hex: '#c9a227' },
  { label: 'Steel',    hex: '#5b7a8c' },
  { label: 'Stealth',  hex: '#383838' },
  { label: 'Pump',     hex: '#c1443c' },
  { label: 'Recovery', hex: '#4a9e6b' },
  { label: 'Chalk',    hex: '#ece9e2' },
]

const DEFAULT_COLOR = '#c9a227'

// Per-theme fallbacks for colours that become illegible against that theme's background.
const THEME_OVERRIDES = {
  'steel:#383838': '#909090',
  'light:#ece9e2': '#8a8c91',
}

export const useSettingsStore = defineStore('settings', () => {
  // Map of personId → hex. Persisted as a single IDB key.
  const personIconColors = ref(load('settings.personIconColors', {}))
  const theme = ref(load('settings.theme', 'steel'))

  watch(personIconColors, (v) => save('settings.personIconColors', v), { deep: true })
  watch(theme, (v) => {
    save('settings.theme', v)
    document.documentElement.setAttribute('data-theme', v)
  })

  function getIconColor(personId) {
    if (!personId) return DEFAULT_COLOR
    return personIconColors.value[personId] ?? DEFAULT_COLOR
  }

  function setIconColor(personId, hex) {
    if (!personId) return
    personIconColors.value[personId] = hex
  }

  // Used when a person is deleted — drops their entry from the map entirely
  // rather than leaving an orphaned personId -> hex pairing behind.
  function clearIconColor(personId) {
    if (!personId) return
    delete personIconColors.value[personId]
  }

  // Returns the colour to actually render — applies theme overrides for illegible combos
  function effectiveIconColor(personId) {
    const color = getIconColor(personId)
    const key = `${theme.value}:${color}`
    return THEME_OVERRIDES[key] ?? color
  }

  function setTheme(t) {
    theme.value = t
  }

  function applyTheme() {
    document.documentElement.setAttribute('data-theme', theme.value)
  }

  return {
    personIconColors,
    theme,
    getIconColor,
    setIconColor,
    clearIconColor,
    effectiveIconColor,
    setTheme,
    applyTheme,
  }
})