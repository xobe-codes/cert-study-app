import React, { useMemo, useState } from 'react'
import { gradeQuestion, randomizeQuestionOrder } from '../../questionUtils.js'
import { COLORS, styles } from '../../ui/appTheme.js'
import McChoices from '../../components/McChoices.jsx'
import AnswerReview from '../../components/AnswerReview.jsx'
import { applyAnswerReviewToQuestion } from '../../answerReviewLogic.js'
import { getTrapDrillQuestions, resolveTrapDrillCku, TRAP_DRILL_CKUS } from './trapDrillQuestions.js'

export default function TrapDrillSession({ prefill, onBack }) {
  const resolved = useMemo(() => resolveTrapDrillCku(prefill || {}), [prefill])
  const questions = useMemo(() => {
    const pool = getTrapDrillQuestions(prefill || {})
    return randomizeQuestionOrder(pool.length ? pool : getTrapDrillQuestions())
  }, [prefill])

  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [stats, setStats] = useState({ correct: 0, total: 0 })

  const current = questions[idx]
  const done = idx >= questions.length

  function selectChoice(choiceIdx) {
    if (revealed || !current) return
    const enriched = applyAnswerReviewToQuestion(current)
    const correct = gradeQuestion(enriched, choiceIdx)
    setSelected(choiceIdx)
    setRevealed(true)
    setStats(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
  }

  function next() {
    if (idx + 1 >= questions.length) {
      setIdx(questions.length)
      return
    }
    setIdx(i => i + 1)
    setSelected(null)
    setRevealed(false)
  }

  function restart() {
    setIdx(0)
    setSelected(null)
    setRevealed(false)
    setStats({ correct: 0, total: 0 })
  }

  if (!questions.length) {
    return (
      <div>
        <button type="button" style={styles.backBtn} onClick={onBack}>‹ Back</button>
        <h1 style={styles.h1}>Trap Drill</h1>
        <p style={styles.small}>No drill questions match this trap yet. Try another pattern from your missed bank.</p>
      </div>
    )
  }

  if (done) {
    const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0
    return (
      <div>
        <button type="button" style={styles.backBtn} onClick={onBack}>‹ Back</button>
        <h1 style={styles.h1}>Trap Drill Complete</h1>
        <div style={styles.card}>
          <div style={{ fontSize: 'var(--ccna-type-display)', fontWeight: 700, color: pct >= 70 ? COLORS.mint : COLORS.amber }}>{pct}%</div>
          <div style={styles.small}>{stats.correct} / {stats.total} correct</div>
          {resolved && (
            <div style={{ ...styles.small, marginTop: 8, color: COLORS.silverMid }}>
              Pattern: {resolved.trapLabel}
            </div>
          )}
        </div>
        <button type="button" style={styles.primaryBtn} onClick={restart}>Drill again</button>
        <button type="button" style={{ ...styles.secondaryBtn, marginTop: 8 }} onClick={onBack}>Done</button>
      </div>
    )
  }

  const enriched = applyAnswerReviewToQuestion(current)
  const isCorrect = revealed && gradeQuestion(enriched, selected)

  return (
    <div>
      <button type="button" style={styles.backBtn} onClick={onBack}>‹ Back</button>
      <h1 style={styles.h1}>Trap Drill</h1>
      {resolved ? (
        <div style={{ ...styles.pill('amber'), display: 'inline-block', marginBottom: 10, fontSize: 'var(--ccna-type-xs)' }}>
          {resolved.trapLabel}
        </div>
      ) : (
        <p style={{ ...styles.small, marginBottom: 10 }}>
          {TRAP_DRILL_CKUS.length} high-frequency exam traps · {questions.length} questions
        </p>
      )}
      <div style={styles.small}>Question {idx + 1} / {questions.length}</div>
      <div style={styles.card}>
        {current.objectiveId && (
          <div style={{ ...styles.small, marginBottom: 6 }}>Objective {current.objectiveId}</div>
        )}
        <div style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 600, marginBottom: 14, lineHeight: 1.5 }}>
          {current.question}
        </div>
        <McChoices q={enriched} selected={selected} revealed={revealed} onSelect={selectChoice} />
        {revealed && (
          <div
            className="ccna-quiz-reveal"
            style={{
              marginTop: 10, padding: 12, borderRadius: 10,
              background: isCorrect ? COLORS.mintDim : COLORS.roseDim,
              border: `2px solid ${isCorrect ? COLORS.mintBorder : COLORS.rose}`,
            }}
          >
            <div style={{ fontWeight: 700, color: isCorrect ? COLORS.mint : COLORS.rose, marginBottom: 6, fontSize: 'var(--ccna-type-sm)' }}>
              {isCorrect ? '✓ Correct' : '✗ Incorrect'}
            </div>
            <AnswerReview q={enriched} selected={selected} />
          </div>
        )}
      </div>
      {revealed && (
        <button type="button" style={styles.primaryBtn} onClick={next}>
          {idx + 1 >= questions.length ? 'Finish' : 'Next question'}
        </button>
      )}
    </div>
  )
}
