import { preloadCleanBank } from '../data/cleanQuestionAdapter.js'

let warmed = false

const LAZY_CHUNK_IMPORTS = [
  () => import('../data/ccnaSkillQuestions.js'),
  () => import('../data/ccnaShelvedQuestions.js'),
  () => import('../features/mockExam/MockExamRoute.jsx'),
  () => import('../lab/LabsHub.jsx'),
  () => import('../lab/LabView.jsx'),
  () => import('../ExtraStudyMode.jsx'),
  () => import('../ExamTrapStudyMode.jsx'),
  () => import('../RoutingDecoderMode.jsx'),
  () => import('../topic/TopicFocusStudio.jsx'),
  () => import('../commands/CommandHubStudio.jsx'),
  () => import('../lens/StudyLensStudio.jsx'),
]

const SCRIPT_CHUNK_MATCHERS = [
  'vendor-react',
  'index-',
  'clean-questions',
  'mock-exam',
  'labs',
  'study-modes',
  'studios',
  'skill-questions',
]

/** True when service workers can cache curated chunks for offline Study/Practice. */
export function isOfflineCapable() {
  return typeof navigator !== 'undefined' && 'serviceWorker' in navigator
}

function warmScriptChunk(matcher) {
  const script = document.querySelector(`script[src*="${matcher}"]`)
  if (!script?.src) return Promise.resolve()
  return fetch(script.src, { cache: 'default' }).catch(() => {})
}

/**
 * Eagerly load large curated chunks so the PWA runtime cache stores them.
 * Idempotent per page session; failures are silent (offline-first must not block UI).
 *
 * First-paint: defer full clean-bank preload so home does not compete with
 * domain-chunk downloads. Quiz/topic paths still use preloadCleanBankForObjective.
 */
export async function warmCuratedChunksForOffline() {
  if (warmed || typeof window === 'undefined') return
  warmed = true
  if (!isOfflineCapable()) return

  const tasks = [
    ...LAZY_CHUNK_IMPORTS.map(loader => loader().catch(() => {})),
    ...SCRIPT_CHUNK_MATCHERS.map(warmScriptChunk),
  ]

  await Promise.all(tasks)

  const scheduleBank = (cb) => {
    if (typeof requestIdleCallback === 'function') {
      requestIdleCallback(() => cb(), { timeout: 4000 })
    } else {
      setTimeout(cb, 1500)
    }
  }
  scheduleBank(() => {
    preloadCleanBank().catch(() => {})
  })
}

/** Test-only reset for warm guard. */
export function resetWarmCuratedChunksForTests() {
  warmed = false
}
