import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { load, save } from '../utils/storage'

export const ICON_COLORS = [
  { label: 'Energy',   hex: '#c9a227' },
  { label: 'Steel',    hex: '#5b7a8c' },
  { label: 'Stealth',  hex: '#383838' },
  { label: 'Pump',     hex: '#c1443c' },
  { label: 'Recovery', hex: '#4a9e6b' },
  { label: 'Chalk',    hex: '#ece9e2' },
]

// Per-theme fallbacks for colours that become illegible against that theme's background.
// Keys are "<theme>:<hex>" — values are the replacement colour to render instead.
const THEME_OVERRIDES = {
  'steel:#383838': '#909090',  // Stealth on steel bg (#2a2d31) — too close; use mid-grey
  'light:#ece9e2': '#8a8c91',  // Chalk on light bg (#F8F9FA)   — invisible; use cool grey
}

export const useSettingsStore = defineStore('settings', () => {
  const iconColor = ref(load('settings.iconColor', '#c9a227'))
  const theme = ref(load('settings.theme', 'steel'))

  // Resolves the actual rendered colour, swapping out illegible combos
  const effectiveIconColor = computed(() => {
    const key = `${theme.value}:${iconColor.value}`
    return THEME_OVERRIDES[key] ?? iconColor.value
  })

  watch(iconColor, (v) => save('settings.iconColor', v))
  watch(theme, (v) => {
    save('settings.theme', v)
    document.documentElement.setAttribute('data-theme', v)
  })

  function setIconColor(hex) {
    iconColor.value = hex
  }

  function setTheme(t) {
    theme.value = t
  }

  function applyTheme() {
    document.documentElement.setAttribute('data-theme', theme.value)
  }

  return { iconColor, effectiveIconColor, theme, setIconColor, setTheme, applyTheme }
})