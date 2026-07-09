import React, { useMemo, useState } from 'react'
import { gradeQuestion, randomizeQuestionOrder } from '../../questionUtils.js'
import { COLORS, styles } from '../../ui/appTheme.js'
import McChoices from '../../components/McChoices.jsx'
import AnswerReview from '../../components/AnswerReview.jsx'
import { McChoiceShuffleProvider } from '../../context/McChoiceShuffleContext.jsx'
import { applyAnswerReviewToQuestion } from '../../answerReviewLogic.js'
import {
  getTrapDrillQuestions,
  resolveTrapDrillCku,
} from './trapDrillQuestions.js'
import { trapDomainMeta } from '../../study/trapDomainConstants.js'
import TrapDrillHub from './TrapDrillHub.jsx'
import StudyModeHeader from '../../components/StudyModeHeader.jsx'
import { useMasteryProgress } from '../progress/MasteryProgressContext.jsx'
import { ENGAGEMENT_KINDS } from '../progress/masteryEngagement.js'

export default function TrapDrillSession({ prefill, onBack }) {
  const { recordEngagement } = useMasteryProgress()
  const resolved = useMemo(() => resolveTrapDrillCku(prefill || {}), [prefill])
  const [scope, setScope] = useState(() => {
    if (resolved || prefill?.ckuId || prefill?.trapLabel) return { kind: 'cku', ...prefill }
    if (prefill?.domainId) return { kind: 'domain', domainId: String(prefill.domainId) }
    return null
  })

  const questions = useMemo(() => {
    if (!scope) return []
    const pool = getTrapDrillQuestions(
      scope.kind === 'domain'
        ? { domainId: scope.domainId }
        : { ckuId: scope.ckuId, trapLabel: scope.trapLabel },
    )
    return randomizeQuestionOrder(pool)
  }, [scope])

  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [stats, setStats] = useState({ correct: 0, total: 0 })

  const current = questions[idx]
  const done = scope && idx >= questions.length

  function startDomain(domainId) {
    setScope({ kind: 'domain', domainId: String(domainId) })
    setIdx(0)
    setSelected(null)
    setRevealed(false)
    setStats({ correct: 0, total: 0 })
  }

  function startCku(ckuId) {
    setScope({ kind: 'cku', ckuId })
    setIdx(0)
    setSelected(null)
    setRevealed(false)
    setStats({ correct: 0, total: 0 })
  }

  function backToHub() {
    setScope(null)
    setIdx(0)
    setSelected(null)
    setRevealed(false)
    setStats({ correct: 0, total: 0 })
  }

  function selectChoice(choiceIdx) {
    if (revealed || !current) return
    const enriched = applyAnswerReviewToQuestion(current)
    const correct = gradeQuestion(enriched, choiceIdx)
    setSelected(choiceIdx)
    setRevealed(true)
    setStats(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
    if (current.objectiveId) {
      recordEngagement?.(current.objectiveId, {
        kind: ENGAGEMENT_KINDS.TRAP_DRILL,
        correct: correct ? 1 : 0,
        total: 1,
      })
    }
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

  if (!scope) {
    return (
      <TrapDrillHub
        prefill={prefill}
        onBack={onBack}
        onStartDomain={startDomain}
        onStartCku={startCku}
      />
    )
  }

  if (!questions.length) {
    return (
      <div>
        <StudyModeHeader title="Trap Drill" onBack={backToHub} backLabel="Choose domain" />
        <p style={styles.small}>No drill questions match this scope. Pick another domain or pattern.</p>
        <button type="button" style={styles.secondaryBtn} onClick={backToHub}>Back to domain picker</button>
      </div>
    )
  }

  if (done) {
    const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0
    const domainMeta = scope.kind === 'domain' ? trapDomainMeta(scope.domainId) : null
    return (
      <div>
        <StudyModeHeader title="Trap Drill Complete" onBack={backToHub} backLabel="Choose domain" />
        <div style={styles.card}>
          <div style={{ fontSize: 'var(--ccna-type-display)', fontWeight: 700, color: pct >= 70 ? COLORS.mint : COLORS.amber }}>{pct}%</div>
          <div style={styles.small}>{stats.correct} / {stats.total} correct</div>
          {resolved && (
            <div style={{ ...styles.small, marginTop: 8, color: COLORS.silverMid }}>
              Pattern: {resolved.trapLabel}
            </div>
          )}
          {domainMeta && (
            <div style={{ ...styles.small, marginTop: 8, color: COLORS.silverMid }}>
              Domain: {domainMeta.label}
            </div>
          )}
        </div>
        <button type="button" style={styles.primaryBtn} onClick={restart}>Drill again</button>
        <button type="button" style={{ ...styles.secondaryBtn, marginTop: 8 }} onClick={backToHub}>Pick another domain</button>
        <button type="button" style={{ ...styles.secondaryBtn, marginTop: 8 }} onClick={onBack}>Done</button>
      </div>
    )
  }

  const enriched = applyAnswerReviewToQuestion(current)
  const isCorrect = revealed && gradeQuestion(enriched, selected)
  const domainMeta = scope.kind === 'domain' ? trapDomainMeta(scope.domainId) : null

  return (
    <div className="trap-drill-session">
      <StudyModeHeader title="Trap Drill" onBack={backToHub} backLabel="Domains" />
      {resolved ? (
        <div style={{ ...styles.pill('amber'), display: 'inline-block', marginBottom: 10, fontSize: 'var(--ccna-type-xs)' }}>
          {resolved.trapLabel}
        </div>
      ) : domainMeta ? (
        <div style={{ ...styles.pill(domainMeta.accent), display: 'inline-block', marginBottom: 10, fontSize: 'var(--ccna-type-xs)' }}>
          {domainMeta.chip} · {questions.length} questions
        </div>
      ) : null}
      <div style={styles.small}>Question {idx + 1} / {questions.length}</div>
      <div style={styles.card}>
        {current.objectiveId && (
          <div style={{ ...styles.small, marginBottom: 6 }}>Objective {current.objectiveId}</div>
        )}
        <div style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 600, marginBottom: 14, lineHeight: 1.5 }}>
          {current.question}
        </div>
        <McChoiceShuffleProvider q={enriched}>
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
        </McChoiceShuffleProvider>
      </div>
      {revealed && (
        <button type="button" style={styles.primaryBtn} onClick={next}>
          {idx + 1 >= questions.length ? 'Finish' : 'Next question'}
        </button>
      )}
    </div>
  )
}
