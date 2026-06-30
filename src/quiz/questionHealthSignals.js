import { STORAGE_KEYS } from '../storageKeys.js'
import { AUTO_FLAG_REASONS } from '../data/questionHealthConstants.js'
import { submitQuestionFlag } from './questionHealthClient.js'

const SIGNALS_KEY = STORAGE_KEYS.questionHealthSignals
const WRONG_KEY_CLUSTER_RATE = 0.8
const EASY_LAPSE_MIN = 2

async function loadSignals() {
  return (await window.storage.getItem(SIGNALS_KEY)) || {}
}

async function saveSignals(signals) {
  await window.storage.setItem(SIGNALS_KEY, signals)
}

/**
 * Record attempt analytics; auto-flag heuristic defects (local signal only until export merge).
 */
export async function recordQuestionHealthSignal(questionId, objectiveId, {
  correct,
  selectedIndex,
  lastRating,
} = {}) {
  if (!questionId || !objectiveId) return

  const signals = await loadSignals()
  const s = signals[questionId] || { attempts: 0, wrongChoices: {}, easyLapses: 0, autoFlagged: false }
  s.attempts += 1
  if (correct === false && typeof selectedIndex === 'number') {
    const k = String(selectedIndex)
    s.wrongChoices[k] = (s.wrongChoices[k] || 0) + 1
  }
  if (lastRating === 'easy' && correct === false) {
    s.easyLapses += 1
  }
  signals[questionId] = s
  await saveSignals(signals)

  if (s.autoFlagged || s.attempts < 5) return

  const wrongTotal = Object.values(s.wrongChoices).reduce((a, b) => a + b, 0)
  const topWrong = Math.max(...Object.values(s.wrongChoices), 0)
  const clusterRate = wrongTotal ? topWrong / wrongTotal : 0

  if (clusterRate >= WRONG_KEY_CLUSTER_RATE) {
    s.autoFlagged = true
    await saveSignals(signals)
    await submitQuestionFlag({
      questionId,
      objectiveId,
      reason: 'wrong_key',
      choiceIndex: Number(Object.entries(s.wrongChoices).sort((a, b) => b[1] - a[1])[0]?.[0]),
      source: AUTO_FLAG_REASONS.wrongKeyCluster,
    })
    return
  }

  if (s.easyLapses >= EASY_LAPSE_MIN) {
    s.autoFlagged = true
    await saveSignals(signals)
    await submitQuestionFlag({
      questionId,
      objectiveId,
      reason: 'ambiguous',
      source: AUTO_FLAG_REASONS.easyLapse,
    })
  }
}
