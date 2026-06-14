import { inferTrapForChoice, applyAnswerReviewToQuestion } from '../answerReviewLogic.js'

function trapForMissed(m) {
  if (m.misconceptionTested) return m.misconceptionTested
  const ar = m.answerReview
  if (ar?.incorrect?.[0]?.misconceptionTested) return ar.incorrect[0].misconceptionTested
  if (m.selectedIndex != null && Array.isArray(m.choices)) {
    return inferTrapForChoice({ ...m, answerReview: ar }, m.selectedIndex)
  }
  return m.concept ? `${m.concept} confusion` : 'General concept gap'
}

/** Group missed bank entries by exam trap label for study planning. */
export function groupMissedByTrap(missed = []) {
  const groups = new Map()
  for (const raw of missed) {
    const m = raw.answerReview ? raw : applyAnswerReviewToQuestion(raw)
    const trap = trapForMissed(m)
    const list = groups.get(trap) || []
    list.push(m)
    groups.set(trap, list)
  }
  return [...groups.entries()]
    .map(([trap, items]) => ({ trap, items, count: items.length }))
    .sort((a, b) => b.count - a.count)
}

/** Summarize traps from wrong mock/quiz responses. */
export function summarizeWrongTraps(questions, responses, { limit = 8 } = {}) {
  const tallies = new Map()
  questions.forEach((q, idx) => {
    const selected = responses[idx]
    if (selected == null || selected === q.correctIndex) return
    const enriched = applyAnswerReviewToQuestion(q)
    const trap = inferTrapForChoice(enriched, selected)
      || enriched.answerReview?.examTip
      || enriched.concept
      || 'Review this topic'
    const domainId = (q.objectiveId || '1.1').split('.')[0]
    const key = `${domainId}::${trap}`
    const prev = tallies.get(key) || { trap, domainId, count: 0, objectiveIds: new Set() }
    prev.count += 1
    if (q.objectiveId) prev.objectiveIds.add(q.objectiveId)
    tallies.set(key, prev)
  })
  return [...tallies.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map(t => ({ ...t, objectiveIds: [...t.objectiveIds] }))
}
