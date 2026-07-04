import { gradeQuestion } from '../../questionUtils.js'
import { inferTrapForChoice } from '../../answerReviewLogic.js'

/** Score a completed placement attempt. */
export function computePlacementReport({ questions, responses, trapByQuestionId = {} }) {
  const byObjective = {}
  let correct = 0
  let trapTotal = 0
  let trapCorrect = 0

  questions.forEach((q, idx) => {
    const oid = q.objectiveId || 'unknown'
    if (!byObjective[oid]) byObjective[oid] = { correct: 0, total: 0 }
    byObjective[oid].total++

    const selected = responses[idx]
    const isCorrect = selected != null && gradeQuestion(q, selected)
    if (isCorrect) {
      correct++
      byObjective[oid].correct++
    }

    const isTrap = trapByQuestionId[q.id]
    if (isTrap) {
      trapTotal++
      if (isCorrect) trapCorrect++
    }
  })

  const total = questions.length
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0
  const trapPct = trapTotal > 0 ? Math.round((trapCorrect / trapTotal) * 100) : null

  const trapMisses = questions
    .map((q, idx) => {
      if (!trapByQuestionId[q.id]) return null
      const selected = responses[idx]
      if (selected == null || gradeQuestion(q, selected)) return null
      const trap = inferTrapForChoice(q, selected)
      return { questionId: q.id, objectiveId: q.objectiveId, trap: trap?.trap || 'Exam trap' }
    })
    .filter(Boolean)

  const wrongQuestions = questions
    .map((q, idx) => {
      const selected = responses[idx]
      if (selected == null || gradeQuestion(q, selected)) return null
      return { questionId: q.id, objectiveId: q.objectiveId }
    })
    .filter(Boolean)

  const weakestObjective = Object.entries(byObjective)
    .map(([id, stats]) => ({ id, pct: stats.total ? stats.correct / stats.total : 0, ...stats }))
    .sort((a, b) => a.pct - b.pct)[0]?.id || null

  return {
    correct,
    total,
    pct,
    trapPct,
    trapTotal,
    trapCorrect,
    byObjective,
    trapMisses,
    wrongQuestions,
    weakestObjective,
  }
}
