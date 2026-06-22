import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'inline',
      includeAssets: ['icons/icon.svg', 'icons/apple-touch-icon.png', 'icons/maskable-icon-512x512.png'],
      base: process.env.VUE_APP_BASE_URL || '/',
      manifest: {
        name: 'PR Tracker',
        short_name: 'PR Tracker',
        description: 'Track personal records and plan workouts',
        theme_color: '#15161A',
        background_color: '#15161A',
        display: 'standalone',
        start_url:  process.env.VUE_APP_BASE_URL || '/',
        scope:  process.env.VUE_APP_BASE_URL || '/',
        icons: [
          {
            src: 'icons/icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: 'icons/maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'icons/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          }
        ]
      },
      devOptions: {
        enabled: true
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,json,svg,png,ico,map}'],
        sourcemap: true
      }
    })
  ]
})
