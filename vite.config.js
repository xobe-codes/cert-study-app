import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

/** Reject SPA HTML fallbacks cached as JS/CSS (breaks module load → blank screen). */
const rejectHtmlAsScript = {
  cacheWillUpdate: async ({ response }) => {
    const type = response.headers.get('content-type') || ''
    if (/text\/html/i.test(type)) return null
    return response
  },
}

const chunkCacheGuard = {
  cacheWillUpdate: async ({ response }) => {
    const type = response.headers.get('content-type') || ''
    if (/text\/html/i.test(type)) return null
    const len = Number(response.headers.get('content-length') || 0)
    if (len > 5 * 1024 * 1024) return null
    return response
  },
}

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.svg', 'manifest.webmanifest'],
      manifest: false,
      workbox: {
        // Do not precache index.html — stale shell + new hashed chunks = blank screen on mobile.
        globPatterns: ['**/*.{css,ico,svg,webmanifest}', 'registerSW.js'],
        globIgnores: ['**/clean-questions*.js', '**/mock-exam*.js'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/assets\//, /^\/api\//],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'ccna-html',
              networkTimeoutSeconds: 5,
              plugins: [rejectHtmlAsScript],
            },
          },
          {
            urlPattern: /^https:\/\/master\.ccna-study-tool\.pages\.dev\/.*/i,
            handler: 'NetworkFirst',
            options: { cacheName: 'ccna-pages', networkTimeoutSeconds: 5 },
          },
          {
            urlPattern: /\/assets\/clean-questions[^/?]*\.js$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'ccna-clean-questions',
              expiration: { maxEntries: 4, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
              plugins: [chunkCacheGuard],
            },
          },
          {
            urlPattern: /\/assets\/mock-exam[^/?]*\.js$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'ccna-mock-exam',
              expiration: { maxEntries: 4, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
              plugins: [rejectHtmlAsScript],
            },
          },
          {
            urlPattern: /\/assets\/labs[^/?]*\.js$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'ccna-labs-chunk',
              expiration: { maxEntries: 4, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
              plugins: [rejectHtmlAsScript],
            },
          },
          {
            urlPattern: /\/assets\/study-modes[^/?]*\.js$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'ccna-study-modes',
              expiration: { maxEntries: 4, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
              plugins: [rejectHtmlAsScript],
            },
          },
          {
            urlPattern: /\/assets\/studios[^/?]*\.js$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'ccna-studios',
              expiration: { maxEntries: 4, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
              plugins: [rejectHtmlAsScript],
            },
          },
          {
            urlPattern: /\/assets\/[^/?]+\.(?:js|css)$/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'ccna-chunks',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 },
              plugins: [rejectHtmlAsScript],
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  // Cloudflare Pages: `/`. GitHub Pages project site: set VITE_BASE=/cert-study-app/ in deploy workflow.
  base: process.env.VITE_BASE || '/',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('ccnaCleanQuestions')) return 'clean-questions'
          if (id.includes('ccnaShelvedQuestions')) return 'shelved-questions'
          if (id.includes('ccnaSkillQuestions')) return 'skill-questions'
          if (id.includes('MockExam')) return 'mock-exam'
          if (id.includes('/lab/') || id.includes('ccnaLabs')) return 'labs'
          if (id.includes('ExtraStudyMode') || id.includes('ExamTrapStudyMode') || id.includes('RoutingDecoderMode')) return 'study-modes'
          if (id.includes('TopicFocus') || id.includes('CommandHub') || id.includes('StudyLens')) return 'studios'
        },
      },
    },
  },
})
