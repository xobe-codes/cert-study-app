import React, { useState, useEffect, useRef } from 'react'
import {
  isOrderingQuestion, isMcQuestion, isCliQuestion, gradeQuestion,
  shuffleArrayCopy,
} from '../../questionUtils.js'
import { ALL_OBJECTIVES } from '../../data/ccnaDomains.js'
import { COLORS, styles } from '../../ui/appTheme.js'
import { buildDiagnosticSet } from '../../onboarding/diagnosticSet.js'
import { fmtPct } from '../export/exportReports.js'
import { useNavHint } from '../../components/NavHintProvider.jsx'
import { NAV_HINT_KEYS } from '../../ui/navHintConfig.js'
import McChoices from '../../components/McChoices.jsx'
import AnswerReview from '../../components/AnswerReview.jsx'
import { McChoiceShuffleProvider } from '../../context/McChoiceShuffleContext.jsx'
import { applyAnswerReviewToQuestion } from '../../answerReviewLogic.js'
import { QuizQuestionStem, QuestionMeta, OrderingQuestion, CliAnswerInput } from '../../components/QuizQuestionChrome.jsx'
import Spinner from '../../components/Spinner.jsx'
import { recordAnswerOutcome } from '../study/answerOutcome.js'

const quizFeedbackA11y = { role: 'status', 'aria-live': 'polite', 'aria-atomic': true }

export default function Onboarding({ onComplete, onSkip }) {
  const showNavHint = useNavHint()
  const doneHintFired = useRef(false)
  const [phase, setPhase] = useState('intro')
  const [queue, setQueue] = useState([])
  const [current, setCurrent] = useState(null)
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [loadError, setLoadError] = useState(null)
  const [orderDraft, setOrderDraft] = useState([])
  const [cliAnswer, setCliAnswer] = useState('')
  const [results, setResults] = useState({})
  const [total, setTotal] = useState(0)
  const [answered, setAnswered] = useState(0)

  useEffect(() => {
    if (current && isOrderingQuestion(current)) {
      setOrderDraft(shuffleArrayCopy(current.orderItems))
    } else {
      setOrderDraft([])
    }
    setCliAnswer('')
  }, [current])

  useEffect(() => {
    if (phase !== 'done') {
      doneHintFired.current = false
      return
    }
    if (doneHintFired.current) return
    doneHintFired.current = true
    const rows = Object.entries(results)
      .map(([objectiveId, r]) => ({ objectiveId, acc: r.correct / Math.max(r.total, 1) }))
      .sort((a, b) => a.acc - b.acc)
    showNavHint(NAV_HINT_KEYS.PLACEMENT_DONE, { weakestId: rows[0]?.objectiveId })
  }, [phase, results, showNavHint])

  function recordResult(correct) {
    if (!current?.objectiveId) return
    setResults(r => {
      const e = r[current.objectiveId] || { correct: 0, total: 0 }
      return { ...r, [current.objectiveId]: { correct: e.correct + (correct ? 1 : 0), total: e.total + 1 } }
    })
    setAnswered(a => a + 1)
  }

  function start() {
    setLoadError(null)
    setPhase('loading')
    ;(async () => {
      try {
        const set = await buildDiagnosticSet()
        if (set.length === 0) {
          onComplete({})
          return
        }
        setTotal(set.length)
        setResults({})
        setAnswered(0)
        setCurrent(set[0])
        setQueue(set.slice(1))
        setSelected(null)
        setRevealed(false)
        setPhase('active')
      } catch (err) {
        console.error('[Onboarding] buildDiagnosticSet failed', err)
        setLoadError(err?.message || 'Could not load placement questions.')
        setPhase('error')
      }
    })()
  }

  function answer(idx) {
    if (revealed || !isMcQuestion(current)) return
    const correct = gradeQuestion(current, idx)
    setSelected(idx); setRevealed(true)
    recordResult(correct)
    recordAnswerOutcome({ objectiveId: current.objectiveId, questionId: current.id, correct, selectedIndex: idx, surface: 'onboarding_placement' }).catch(() => {})
  }

  function submitOrder() {
    if (revealed || !isOrderingQuestion(current)) return
    const correct = gradeQuestion(current, orderDraft)
    setRevealed(true)
    recordResult(correct)
    recordAnswerOutcome({ objectiveId: current.objectiveId, questionId: current.id, correct, responseType: 'ordering', surface: 'onboarding_placement' }).catch(() => {})
  }

  function submitCli() {
    if (revealed || !isCliQuestion(current)) return
    const correct = gradeQuestion(current, cliAnswer)
    setRevealed(true)
    recordResult(correct)
    recordAnswerOutcome({ objectiveId: current.objectiveId, questionId: current.id, correct, responseType: 'cli', surface: 'onboarding_placement' }).catch(() => {})
  }

  function next() {
    if (queue.length === 0) { setPhase('done'); return }
    setCurrent(queue[0]); setQueue(q => q.slice(1)); setSelected(null); setRevealed(false); setCliAnswer('')
  }

  if (phase === 'intro') {
    return (
      <div className="onboarding-shell">
        <div style={styles.card}>
          <h1 style={styles.h1}>Welcome 👋🏾</h1>
          <p style={{ fontSize: 'var(--ccna-type-md)', lineHeight: 1.6, color: COLORS.silver, marginBottom: 10 }}>
            Quick placement check, ~5 minutes. A short mixed-domain quiz — including drag-and-drop ordering
            and troubleshooting — to see where you're starting from and seed your progress.
          </p>
          <p style={styles.small}>No AI calls, no scoring pressure — you can retake real quizzes later regardless of how you do here.</p>
          <button style={{ ...styles.primaryBtn, marginTop: 12 }} onClick={start}>Start placement check</button>
          <button style={{ ...styles.secondaryBtn, marginTop: 8 }} onClick={onSkip}>Skip — start studying</button>
        </div>
      </div>
    )
  }

  if (phase === 'loading') {
    return (
      <div className="onboarding-shell">
        <Spinner label="Building your placement check…" />
      </div>
    )
  }

  if (phase === 'error') {
    return (
      <div className="onboarding-shell">
        <div style={styles.card}>
          <h2 style={styles.h2}>Couldn't start placement check</h2>
          <p style={{ ...styles.small, marginBottom: 12 }}>{loadError}</p>
          <button style={styles.primaryBtn} onClick={start}>Try again</button>
          <button style={{ ...styles.secondaryBtn, marginTop: 8 }} onClick={onSkip}>Skip — start studying</button>
        </div>
      </div>
    )
  }

  if (phase === 'active') {
    if (!current) {
      return (
        <div className="onboarding-shell">
          <Spinner label="Loading question…" />
        </div>
      )
    }
    const ordering = isOrderingQuestion(current)
    const cli = isCliQuestion(current)
    const isCorrect = revealed && (ordering ? gradeQuestion(current, orderDraft) : cli ? gradeQuestion(current, cliAnswer) : gradeQuestion(current, selected))
    const obj = ALL_OBJECTIVES.find(o => o.id === current.objectiveId)
    return (
      <div className="onboarding-shell onboarding-shell--quiz">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
          <h1 style={{ ...styles.h1, margin: 0 }}>Placement Check</h1>
          <span style={styles.small}>{answered} of {total}</span>
        </div>
        {obj && <div style={{ ...styles.small, marginBottom: 8 }}>{obj.id} {obj.title}</div>}
        <div style={styles.card}>
          <QuestionMeta q={current} />
          <QuizQuestionStem text={current.question} />
          <McChoiceShuffleProvider q={current} enabled={!ordering && !cli}>
          {ordering ? (
            <OrderingQuestion items={orderDraft} onChange={setOrderDraft} revealed={revealed} correctOrder={revealed ? current.orderItems : null} />
          ) : cli ? (
            <CliAnswerInput value={cliAnswer} onChange={setCliAnswer} onSubmit={submitCli} revealed={revealed} question={current} />
          ) : (
            <McChoices q={current} selected={selected} revealed={revealed} onSelect={answer} />
          )}
          {revealed && (
            <div className="ccna-quiz-reveal" style={{ marginTop: 8, padding: 12, borderRadius: 10, background: isCorrect ? COLORS.mintDim : COLORS.roseDim, border: `2px solid ${isCorrect ? COLORS.mintBorder : COLORS.rose}` }} {...quizFeedbackA11y}>
              <div style={{ fontWeight: 700, color: isCorrect ? COLORS.mint : COLORS.rose, marginBottom: 4, fontSize: 'var(--ccna-type-sm)' }}>{isCorrect ? 'Correct' : 'Incorrect'}</div>
              <AnswerReview
                q={applyAnswerReviewToQuestion(current)}
                selected={selected}
                cliAnswer={cliAnswer}
                orderAnswer={orderDraft}
              />
            </div>
          )}
          </McChoiceShuffleProvider>
        </div>
        {ordering && !revealed && <button style={{ ...styles.primaryBtn, marginBottom: 10 }} onClick={submitOrder}>Check order</button>}
        {cli && !revealed && <button style={{ ...styles.primaryBtn, marginBottom: 10 }} onClick={submitCli} disabled={!cliAnswer.trim()}>Check command</button>}
        {revealed && <button style={styles.primaryBtn} onClick={next}>{queue.length === 0 ? 'See results' : 'Next'}</button>}
      </div>
    )
  }

  const rows = Object.entries(results)
    .map(([objectiveId, r]) => ({ objectiveId, obj: ALL_OBJECTIVES.find(o => o.id === objectiveId), acc: r.correct / Math.max(r.total, 1), ...r }))
    .sort((a, b) => a.acc - b.acc)
  const weakest = rows[0]
  const overall = rows.length ? rows.reduce((s, r) => s + r.acc, 0) / rows.length : 0

  return (
    <div className="onboarding-shell">
      <div style={styles.card}>
        <h2 style={styles.h2}>Placement check complete</h2>
        <p style={{ fontSize: 'var(--ccna-type-2xl)', fontWeight: 700, color: COLORS.mint, margin: '4px 0' }}>{fmtPct(overall)}</p>
        <p style={styles.small}>Your progress for these {rows.length} objectives has been seeded. Everything else starts fresh — no penalty either way.</p>
        {weakest && weakest.obj && (
          <div style={{ marginTop: 10, padding: 12, borderRadius: 10, background: COLORS.purpleDim, border: `1px solid ${COLORS.purpleGlow}` }}>
            <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.purpleGlow, fontWeight: 700, marginBottom: 4 }}>RECOMMENDED STARTING POINT</div>
            <div style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 600 }}>{weakest.obj.id} {weakest.obj.title}</div>
            <div style={styles.small}>{fmtPct(weakest.acc)} on the placement check</div>
          </div>
        )}
        <button style={{ ...styles.primaryBtn, marginTop: 12 }} onClick={() => onComplete(results)}>Go to my dashboard</button>
      </div>
    </div>
  )
}
