import React, { useState, useEffect, useRef } from 'react'
import { isOrderingQuestion, isMcQuestion, isCliQuestion, gradeQuestion, buildMissedEntry,
  shuffleArrayCopy, randomizeQuestionOrder,
} from '../../questionUtils.js'
import { ALL_OBJECTIVES } from '../../data/ccnaDomains.js'
import { COLORS, styles } from '../../ui/appTheme.js'
import { computeMastery } from '../../netUtils.js'
import { loadQuizBank, recordQuizResult } from '../../quiz/quizBankStorage.js'
import { REVIEW_SESSION_CAP } from '../../quiz/srsReview.js'
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
import { diagnoseWrongAnswer } from '../../answerReview/diagnoseWrongAnswer.js'
import { recordAnswerOutcome } from '../study/answerOutcome.js'

const quizFeedbackA11y = { role: 'status', 'aria-live': 'polite', 'aria-atomic': true }

export default function FocusModeSession({ progress, onBack, onMissed, onDone, onOpenTrapDrill, onOpenLab }) {
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
  const [weakIds, setWeakIds] = useState([])

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
    showNavHint(NAV_HINT_KEYS.FOCUS_DONE)
  }, [phase, showNavHint])

  useEffect(() => {
    (async () => {
      const bank = await loadQuizBank()
      const weak = ALL_OBJECTIVES.filter(o => {
        const p = progress[o.id]
        if (!p) return false
        const { score } = computeMastery(p)
        return score < 0.5
      }).map(o => o.id)
      setWeakIds(weak)
      if (weak.length === 0) { setPhase('empty'); return }
      const questions = []
      for (const id of weak) {
        const qs = bank[id] || []
        const sorted = [...qs].sort((a, b) => {
          const typeA = (a.type === 'troubleshooting' || a.type === 'ordering') ? 1 : 0
          const typeB = (b.type === 'troubleshooting' || b.type === 'ordering') ? 1 : 0
          if (typeB !== typeA) return typeB - typeA
          const lapA = a.srs?.lapses || 0, lapB = b.srs?.lapses || 0
          return lapB - lapA
        })
        sorted.slice(0, 3).forEach(q => questions.push({ ...q, objectiveId: id }))
      }
      const shuffled = randomizeQuestionOrder(questions).slice(0, REVIEW_SESSION_CAP)
      if (shuffled.length === 0) { setPhase('empty'); return }
      setTotal(shuffled.length)
      setCurrent(shuffled[0])
      setQueue(shuffled.slice(1))
      setPhase('active')
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function answer(idx) {
    if (revealed || !isMcQuestion(current)) return
    const correct = gradeQuestion(current, idx)
    setSelected(idx); setRevealed(true)
    haptic(correct ? 15 : [10, 40, 10])
    setStats(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
    recordQuizResult(current.objectiveId, current.id, { correct })
    recordEngagement?.(current.objectiveId, { kind: ENGAGEMENT_KINDS.FOCUS, correct: correct ? 1 : 0, total: 1 })
    recordAnswerOutcome({ objectiveId: current.objectiveId, questionId: current.id, correct, selectedIndex: idx, surface: 'focus' }).catch(() => {})
    if (!correct) {
      const diagnosis = diagnoseWrongAnswer({ question: current, submittedAnswer: idx, gradeResult: correct })
      onMissed(buildMissedEntry(current.objectiveId, current, { selectedIndex: idx, diagnosis }))
    }
  }
  function submitOrder() {
    if (revealed || !isOrderingQuestion(current)) return
    const correct = gradeQuestion(current, orderDraft)
    setRevealed(true)
    haptic(correct ? 15 : [10, 40, 10])
    setStats(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
    recordQuizResult(current.objectiveId, current.id, { correct })
    recordEngagement?.(current.objectiveId, { kind: ENGAGEMENT_KINDS.FOCUS, correct: correct ? 1 : 0, total: 1 })
    recordAnswerOutcome({ objectiveId: current.objectiveId, questionId: current.id, correct, responseType: 'ordering', surface: 'focus' }).catch(() => {})
    if (!correct) {
      const diagnosis = diagnoseWrongAnswer({ question: current, submittedAnswer: orderDraft, gradeResult: correct })
      onMissed(buildMissedEntry(current.objectiveId, current, { orderAnswer: orderDraft, diagnosis }))
    }
  }
  function submitCli() {
    if (revealed || !isCliQuestion(current)) return
    const correct = gradeQuestion(current, cliAnswer)
    setRevealed(true)
    haptic(correct ? 15 : [10, 40, 10])
    setStats(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
    recordQuizResult(current.objectiveId, current.id, { correct })
    recordEngagement?.(current.objectiveId, { kind: ENGAGEMENT_KINDS.FOCUS, correct: correct ? 1 : 0, total: 1 })
    recordAnswerOutcome({ objectiveId: current.objectiveId, questionId: current.id, correct, responseType: 'cli', surface: 'focus' }).catch(() => {})
    if (!correct) {
      const diagnosis = diagnoseWrongAnswer({ question: current, submittedAnswer: cliAnswer, gradeResult: correct })
      onMissed(buildMissedEntry(current.objectiveId, current, { cliAnswer, diagnosis }))
    }
  }
  function next() {
    if (queue.length === 0) { setPhase('done'); onDone?.(); return }
    setCurrent(queue[0]); setQueue(q => q.slice(1)); setSelected(null); setRevealed(false); setCliAnswer('')
  }

  const ordering = current && isOrderingQuestion(current)
  const cli = current && isCliQuestion(current)
  const isCorrect = revealed && (ordering ? gradeQuestion(current, orderDraft) : cli ? gradeQuestion(current, cliAnswer) : gradeQuestion(current, selected))
  const obj = current ? ALL_OBJECTIVES.find(o => o.id === current.objectiveId) : null

  if (phase === 'loading') return <div><StudyModeHeader title="Weak Areas" onBack={onBack} /><Spinner label="Finding your weak areas..." /></div>
  if (phase === 'empty') return (
    <div>
      <StudyModeHeader title="Weak Areas" onBack={onBack} />
      <p style={styles.small}>No weak areas found! All studied objectives are above 50% mastery. Keep quizzing to identify gaps, or take a mock exam to find where to focus.</p>
    </div>
  )
  if (phase === 'done') return (
    <div>
      <StudyModeHeader title="Weak Areas" onBack={onBack} />
      <div style={styles.card}>
        <h2 style={styles.h2}>Weak Areas complete</h2>
        <p style={{ fontSize: 'var(--ccna-type-2xl)', fontWeight: 700, color: COLORS.mint, margin: '4px 0' }}>{stats.correct} / {stats.total}</p>
        <p style={styles.small}>{weakIds.length} weak objective{weakIds.length !== 1 ? 's' : ''} targeted. Keep drilling these until they reach 50%+.</p>
        <button style={{ ...styles.primaryBtn, marginTop: 10 }} onClick={onBack}>Done</button>
      </div>
    </div>
  )

  return (
    <div>
      <StudyModeHeader title="Weak Areas" onBack={onBack} />
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'baseline', marginBottom: 4 }}>
        <span style={styles.small}>{total - queue.length} of {total}</span>
      </div>
      <div style={{ ...styles.small, marginBottom: 8 }}>{weakIds.length} weak objective{weakIds.length !== 1 ? 's' : ''} · {total} question{total === 1 ? '' : 's'} in this drill</div>
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
