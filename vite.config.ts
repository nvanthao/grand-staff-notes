import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // Serving from a sub-path (e.g. a project page) only needs `base: '/sub-path/'`;
  // the manifest and service worker scope follow it automatically.
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // The manifest's icons are plain files in `public/`, so the workbox
      // `globPatterns` below already precache them; leaving this on would add a
      // second, identical entry for each one.
      includeManifestIcons: false,
      manifest: {
        name: "Where's the note?",
        short_name: 'Note lookup',
        description: "A beginner's lookup for where a note sits on the treble or bass staff.",
        // Relative, so a deploy under a sub-path resolves against the manifest's own URL.
        start_url: '.',
        scope: '.',
        lang: 'en',
        categories: ['education', 'music'],
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#FBFAF7',
        theme_color: '#FBFAF7',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icon-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ],
        // Chrome shows its richer install dialog only with both form factors present,
        // and drops any entry whose `sizes` disagree with the actual file.
        // Regenerate with `npm run screenshots` after a UI change.
        screenshots: [
          {
            src: 'screenshots/wide.png',
            sizes: '1280x800',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Middle C shown on the treble staff, with note and octave pickers'
          },
          {
            src: 'screenshots/narrow.png',
            sizes: '540x720',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Middle C shown on the treble staff, with note and octave pickers'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        navigateFallback: 'index.html',
        // The music glyphs come from Google Fonts, so they need their own runtime cache
        // to survive going offline.
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com',
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-stylesheets' }
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              cacheableResponse: { statuses: [0, 200] },
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 }
            }
          }
        ]
      }
    })
  ]
})
