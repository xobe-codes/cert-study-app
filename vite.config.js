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
      // Skip SW terser minify — workbox+terser can early-exit and fail the whole build.
      minify: false,
      workbox: {
        mode: 'development',
        // Curated study chunks precached at install (hashed filenames from build).
        // index.html and index-*.js stay network-first to avoid stale-shell blank screens.
        globPatterns: [
          '**/*.{css,ico,svg,webmanifest}',
          'registerSW.js',
          'assets/clean-questions*.js',
          'assets/mock-exam*.js',
          'assets/study-modes*.js',
          'assets/labs*.js',
          'assets/studios*.js',
          'assets/skill-questions*.js',
          'assets/shelved-questions*.js',
          'assets/core*.js',
          'assets/vendor-react*.js',
        ],
        globIgnores: ['**/index*.js', '**/index.html'],
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
            urlPattern: /\/assets\/skill-questions[^/?]*\.js$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'ccna-skill-questions',
              expiration: { maxEntries: 4, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
              plugins: [rejectHtmlAsScript],
            },
          },
          {
            urlPattern: /\/assets\/shelved-questions[^/?]*\.js$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'ccna-shelved-questions',
              expiration: { maxEntries: 4, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
              plugins: [rejectHtmlAsScript],
            },
          },
          {
            urlPattern: /\/assets\/vendor-react[^/?]*\.js$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'ccna-vendor-react',
              expiration: { maxEntries: 2, maxAgeSeconds: 60 * 60 * 24 * 30 },
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
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React must be a single shared chunk — broad /lab/ and MockExam splits caused
          // index.js to import lazy chunks at startup with undefined React (blank screen).
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
            return 'vendor-react'
          }
          const cleanDomainMatch = id.match(/cleanQuestions\/domain-(\d+)\.js/)
          if (cleanDomainMatch) return `clean-questions-d${cleanDomainMatch[1]}`
          if (id.includes('ccnaCleanQuestions')) return 'clean-questions-legacy'
          if (id.includes('ccnaShelvedQuestions')) return 'shelved-questions'
          // Leaf data file only. Assigning the ccnaSkillQuestions.js wrapper here
          // made Rollup host its shared deps inside this chunk, turning it into a
          // static dep of the entry despite every import() in source being lazy.
          if (id.includes('ccnaSkillQuestionsExtended')) return 'skill-questions'
          // The wrapper stays auto-chunked: it is only ever import()ed (bootstrap,
          // offline warmer), so Rollup gives it its own async chunk.
          if (id.includes('ccnaSkillQuestions')) return undefined
          // Gold answer reviews stay in 'core' (not their own chunk): goldAnswerReviews.js
          // is a 40-file aggregator (import-only, no shared deps outward), and giving
          // an aggregator-of-many-leaves its own manual chunk name reproducibly hit a
          // same-chunk `Cannot access 'X' before initialization` — Rollup's ordering
          // inside a large manually-named chunk isn't guaranteed safe for that shape,
          // even with zero real circular imports in the source graph. Verified live in
          // browser (blank screen + reproducible TDZ via direct import()), not just by
          // build success. Leave this data in the general 'core' bucket below.
          // Lazy route entry points only — not entire /lab/ tree (CLIDrillTab is eager in App).
          if (id.endsWith('/MockExam.jsx')) return 'mock-exam'
          if (id.endsWith('/lab/LabsHub.jsx') || id.endsWith('/lab/LabView.jsx')) return 'labs'
          if (id.endsWith('/ExtraStudyMode.jsx') || id.endsWith('/ExamTrapStudyMode.jsx') || id.endsWith('/RoutingDecoderMode.jsx')) {
            return 'study-modes'
          }
          if (id.endsWith('/TopicFocusStudio.jsx') || id.endsWith('/TopicFocusSession.jsx')
            || id.endsWith('/CommandHubStudio.jsx') || id.endsWith('/StudyLensStudio.jsx')) {
            return 'studios'
          }
          // Everything else in src is shared foundation (curated content tree,
          // component kit, feature storage, theme). Pin it to ONE eager chunk —
          // without an assignment Rollup hosts shared modules inside the route
          // chunks above, which turns every "lazy" route chunk into a static dep
          // of the entry (the modulepreload-at-startup bug). Do NOT split this
          // further by folder (e.g. data vs code): src/data/ccnaLabsExtended.js
          // and src/lab/cliEngine.js form a real (multi-hop) dependency cycle, and
          // splitting a cycle across two physical chunks breaks ESM init order —
          // `Cannot access 'X' before initialization` at runtime with no build
          // error and no console output until you probe it. Keeping the whole
          // shared graph in one chunk lets JS resolve the cycle the same way it
          // always has, since it's one file again.
          if (id.includes('/src/')) return 'core'
        },
      },
    },
  },
})
