import React, { useState, useEffect, useRef } from 'react'
import {
  isOrderingQuestion, isMcQuestion, isCliQuestion, gradeQuestion, buildMissedEntry,
  shuffleArrayCopy, randomizeQuestionOrder,
} from '../../questionUtils.js'
import { ALL_OBJECTIVES } from '../../data/ccnaDomains.js'
import { COLORS, styles } from '../../ui/appTheme.js'
import { loadDueQuestions, REVIEW_SESSION_CAP } from '../../quiz/srsReview.js'
import { recordQuizResult } from '../../quiz/quizBankStorage.js'
import { logEvent } from '../../eventLog.js'
import { useNavHint } from '../../components/NavHintProvider.jsx'
import { NAV_HINT_KEYS } from '../../ui/navHintConfig.js'
import { haptic } from '../../ui/feedbackHelpers.jsx'
import McChoices from '../../components/McChoices.jsx'
import AnswerReview from '../../components/AnswerReview.jsx'
import { answerReviewSessionProps } from '../../components/answerReviewSessionProps.js'
import { McChoiceShuffleProvider } from '../../context/McChoiceShuffleContext.jsx'
import { QuizQuestionStem, QuestionMeta, OrderingQuestion, CliAnswerInput } from '../../components/QuizQuestionChrome.jsx'
import Spinner from '../../components/Spinner.jsx'
import StudyModeHeader from '../../components/StudyModeHeader.jsx'
import { useMasteryProgress } from '../progress/MasteryProgressContext.jsx'
import { ENGAGEMENT_KINDS } from '../progress/masteryEngagement.js'

const quizFeedbackA11y = { role: 'status', 'aria-live': 'polite', 'aria-atomic': true }

export default function ReviewSession({ onBack, onMissed, onDone, onOpenSection, onOpenTrapDrill, onOpenLab }) {
  const { recordEngagement } = useMasteryProgress()
  const showNavHint = useNavHint()
  const doneHintFired = useRef(false)
  const [phase, setPhase] = useState('loading')
  const [queue, setQueue] = useState([])
  const [current, setCurrent] = useState(null)
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [orderDraft, setOrderDraft] = useState([])
  const [cliAnswer, setCliAnswer] = useState('')
  const [stats, setStats] = useState({ correct: 0, total: 0 })
  const [total, setTotal] = useState(0)

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
    showNavHint(NAV_HINT_KEYS.REVIEW_DONE)
  }, [phase, showNavHint])

  useEffect(() => {
    (async () => {
      const due = randomizeQuestionOrder(await loadDueQuestions(REVIEW_SESSION_CAP))
      if (due.length === 0) { setPhase('empty'); return }
      setTotal(due.length)
      setCurrent(due[0]); setQueue(due.slice(1)); setPhase('active')
    })()
  }, [])

  function answer(idx) {
    if (revealed || !isMcQuestion(current)) return
    const correct = gradeQuestion(current, idx)
    setSelected(idx); setRevealed(true)
    haptic(correct ? 15 : [10, 40, 10])
    setStats(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
    recordQuizResult(current.objectiveId, current.id, { correct })
    recordEngagement?.(current.objectiveId, { kind: ENGAGEMENT_KINDS.REVIEW, correct: correct ? 1 : 0, total: 1 })
    logEvent('user_reviewed_concept', { objectiveId: current.objectiveId, questionId: current.id, correct })
    if (!correct) {
      onMissed({ objectiveId: current.objectiveId, questionId: current.id, question: current.question, choices: current.choices, correctIndex: current.correctIndex, selectedIndex: idx, explanation: current.explanation, concept: current.concept, type: current.type, skill: current.skill, addedAt: Date.now() })
    }
  }
  function submitOrder() {
    if (revealed || !isOrderingQuestion(current)) return
    const correct = gradeQuestion(current, orderDraft)
    setRevealed(true)
    haptic(correct ? 15 : [10, 40, 10])
    setStats(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
    recordQuizResult(current.objectiveId, current.id, { correct })
    recordEngagement?.(current.objectiveId, { kind: ENGAGEMENT_KINDS.REVIEW, correct: correct ? 1 : 0, total: 1 })
    logEvent('user_reviewed_concept', { objectiveId: current.objectiveId, questionId: current.id, correct })
    if (!correct) {
      onMissed(buildMissedEntry(current.objectiveId, current, { orderAnswer: orderDraft }))
    }
  }
  function submitCli() {
    if (revealed || !isCliQuestion(current)) return
    const correct = gradeQuestion(current, cliAnswer)
    setRevealed(true)
    haptic(correct ? 15 : [10, 40, 10])
    setStats(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
    recordQuizResult(current.objectiveId, current.id, { correct })
    recordEngagement?.(current.objectiveId, { kind: ENGAGEMENT_KINDS.REVIEW, correct: correct ? 1 : 0, total: 1 })
    logEvent('user_reviewed_concept', { objectiveId: current.objectiveId, questionId: current.id, correct })
    if (!correct) {
      onMissed(buildMissedEntry(current.objectiveId, current, { cliAnswer }))
    }
  }
  function next() {
    if (queue.length === 0) { setPhase('done'); onDone?.(); return }
    setCurrent(queue[0]); setQueue(q => q.slice(1)); setSelected(null); setRevealed(false); setCliAnswer('')
  }

  if (phase === 'loading') return <div><StudyModeHeader title="Daily Review" onBack={onBack} /><Spinner label="Gathering your reviews..." /></div>
  if (phase === 'empty') {
    return (
      <div>
        <StudyModeHeader title="Daily Review" onBack={onBack} />
        <p style={styles.small}>Nothing due right now. Spaced repetition brings questions back on their schedule — take some quizzes and they'll reappear here over the coming days.</p>
      </div>
    )
  }
  if (phase === 'done') {
    return (
      <div>
        <StudyModeHeader title="Daily Review" onBack={onBack} />
        <div style={styles.card}>
          <h2 style={styles.h2}>Review complete</h2>
          <p style={{ fontSize: 'var(--ccna-type-2xl)', fontWeight: 700, color: COLORS.mint, margin: '4px 0' }}>{stats.correct} / {stats.total}</p>
          <p style={styles.small}>Each question's next review has been rescheduled. Come back tomorrow for the next batch.</p>
          <button style={{ ...styles.primaryBtn, marginTop: 10 }} onClick={onBack}>Done</button>
        </div>
      </div>
    )
  }

  const ordering = isOrderingQuestion(current)
  const cli = isCliQuestion(current)
  const isCorrect = revealed && (ordering ? gradeQuestion(current, orderDraft) : cli ? gradeQuestion(current, cliAnswer) : gradeQuestion(current, selected))
  const obj = ALL_OBJECTIVES.find(o => o.id === current.objectiveId)
  return (
    <div className="ccna-review-flow">
      <StudyModeHeader title="Daily Review" onBack={onBack} />
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'baseline', marginBottom: 4 }}>
        <span style={styles.small}>{total - queue.length} of {total}</span>
      </div>
      <div style={{ ...styles.small, marginBottom: 8 }}>Mixed sections · retrieval practice{revealed ? '' : ' — answer before revealing'}</div>
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
            <AnswerReview {...answerReviewSessionProps({
              q: current,
              selected,
              cliAnswer,
              orderAnswer: orderDraft,
              objectiveId: current?.objectiveId,
              onOpenTrapDrill,
              onOpenLab,
            })} />
            {obj && (
              <button
                onClick={() => onOpenSection?.(obj)}
                style={{ marginTop: 10, background: 'none', border: 'none', color: COLORS.sky, fontSize: 'var(--ccna-type-xs)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
              >
                Review {obj.id} {obj.title} →
              </button>
            )}
          </div>
        )}
        </McChoiceShuffleProvider>
      </div>
      {ordering && !revealed && <button style={{ ...styles.primaryBtn, marginBottom: 10 }} onClick={submitOrder}>Check order</button>}
      {cli && !revealed && <button style={{ ...styles.primaryBtn, marginBottom: 10 }} onClick={submitCli} disabled={!cliAnswer.trim()}>Check command</button>}
      {revealed && <button style={styles.primaryBtn} onClick={next}>{queue.length === 0 ? 'Finish' : 'Next'}</button>}
    </div>
  )
}
