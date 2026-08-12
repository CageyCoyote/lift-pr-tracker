import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  // Load env so VITE_BASE_URL is available at config time
  const env = loadEnv(mode, process.cwd(), '')
  const base = env.VITE_BASE_URL || '/'

  return {
    base,
    plugins: [
      vue(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'inline',

        // All icon files that should be copied to dist and precached
        includeAssets: [
          'icons/image.png',
          'icons/apple-touch-icon.png',
          'icons/maskable-icon-512x512.png',
          'icons/pwa-192x192.png',
        ],

        manifest: {
          name: 'PR Tracker',
          short_name: 'PR Tracker',
          description: 'Track personal records and plan workouts',
          theme_color: '#15161A',
          background_color: '#15161A',
          display: 'standalone',
          orientation: 'portrait',
          // Use the same base as the Vite build so deep-links work correctly
          start_url: base,
          scope: base,
          icons: [
            {
              // 144px — minimum required for Chrome installability check
              src: 'icons/logo-144x144.png',
              sizes: '144x144',
              type: 'image/png',
              purpose: 'any',
            },
            {
              // 192px — minimum required for Chrome installability check
              src: 'icons/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              // 512px general icon
              src: 'icons/image.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              // Maskable — required for Android adaptive icons (no white border)
              src: 'icons/maskable-icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
            {
              // Apple touch icon for iOS add-to-home-screen
              src: 'icons/apple-touch-icon.png',
              sizes: '180x180',
              type: 'image/png',
              purpose: 'any',
            },
          ],
        },

        devOptions: {
          // Service worker active in dev so you can test install/offline locally
          enabled: true,
        },

        workbox: {
          globPatterns: ['**/*.{js,css,html,json,png,ico}'],
          // Source maps are large — don't precache them
          // @zxing/library pushes the main chunk past the 2MB default
          maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
          runtimeCaching: [
            {
              // Cache Google Fonts at runtime (not precached since URLs are external)
              urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts',
                expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              },
            },
          ],
        },
      }),
    ],
  }
})