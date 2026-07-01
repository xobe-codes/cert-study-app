import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.svg', 'manifest.webmanifest'],
      manifest: false,
      workbox: {
        globPatterns: ['**/*.{html,css,ico,svg,webmanifest}', 'registerSW.js'],
        globIgnores: ['**/clean-questions*.js', '**/mock-exam*.js'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/master\.ccna-study-tool\.pages\.dev\/.*/i,
            handler: 'NetworkFirst',
            options: { cacheName: 'ccna-pages', networkTimeoutSeconds: 5 },
          },
          {
            urlPattern: /\/assets\/[^/?]+\.(?:js|css)$/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'ccna-chunks',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 },
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
