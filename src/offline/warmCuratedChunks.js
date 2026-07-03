import { preloadCleanBank } from '../data/cleanQuestionAdapter.js'

let warmed = false

/** True when service workers can cache curated chunks for offline Study/Practice. */
export function isOfflineCapable() {
  return typeof navigator !== 'undefined' && 'serviceWorker' in navigator
}

/**
 * Eagerly load large curated chunks so the PWA runtime cache stores them.
 * Idempotent per page session; failures are silent (offline-first must not block UI).
 */
export async function warmCuratedChunksForOffline() {
  if (warmed || typeof window === 'undefined') return
  warmed = true
  if (!isOfflineCapable()) return

  const tasks = [
    preloadCleanBank().catch(() => {}),
    import('../data/ccnaSkillQuestions.js').catch(() => {}),
    import('../data/ccnaShelvedQuestions.js').catch(() => {}),
  ]

  // Warm vendor-react via existing script tag (SW CacheFirst picks it up on fetch).
  const vendorScript = document.querySelector('script[src*="vendor-react"]')
  if (vendorScript?.src) {
    tasks.push(fetch(vendorScript.src, { cache: 'default' }).catch(() => {}))
  }

  await Promise.all(tasks)
}

/** Test-only reset for warm guard. */
export function resetWarmCuratedChunksForTests() {
  warmed = false
}
