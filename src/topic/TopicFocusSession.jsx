import React, { useState, useEffect, useRef } from 'react'
import { ALL_OBJECTIVES } from '../data/ccnaDomains.js'
import { COLORS, styles } from '../ui/appTheme.js'
import { useNavHint } from '../components/NavHintProvider.jsx'
import { NAV_HINT_KEYS } from '../ui/navHintConfig.js'
import {
  gradeQuestion, isMcQuestion, isOrderingQuestion, buildMissedEntry,
  shuffleArrayCopy, randomizeQuestionOrder,
} from '../questionUtils.js'
import { loadQuizBank, recordQuizResult } from '../quiz/quizBankStorage.js'
import { buildTopicFocusQueue } from './topicFocusQuiz.js'
import Spinner from '../components/Spinner.jsx'
import McChoices from '../components/McChoices.jsx'
import AnswerReview from '../components/AnswerReview.jsx'
import { QuestionMeta, QuizRichText, OrderingQuestion } from '../components/QuizQuestionChrome.jsx'

const SESSION_CAP = 30

export default function TopicFocusSession({ config, onBack, onMissed, onDone }) {
  const { objectiveIds = [], conceptIds = [], label } = config || {}
  const showNavHint = useNavHint()
  const doneHintFired = useRef(false)

  const [phase, setPhase] = useState('loading')
  const [queue, setQueue] = useState([])
  const [current, setCurrent] = useState(null)
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [orderDraft, setOrderDraft] = useState([])
  const [stats, setStats] = useState({ correct: 0, total: 0 })
  const [total, setTotal] = useState(0)

  useEffect(() => {
    if (current && isOrderingQuestion(current)) {
      setOrderDraft(shuffleArrayCopy(current.orderItems))
    } else {
      setOrderDraft([])
    }
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
    let cancelled = false
    ;(async () => {
      if (!objectiveIds.length && !conceptIds.length) {
        setPhase('empty')
        return
      }
      const bank = await loadQuizBank()
      const questions = await buildTopicFocusQueue(
        { objectiveIds, conceptIds },
        { cap: SESSION_CAP, bank },
      )
      if (cancelled) return
      if (questions.length === 0) {
        setPhase('empty')
        return
      }
      setTotal(questions.length)
      setCurrent(questions[0])
      setQueue(questions.slice(1))
      setPhase('active')
    })()
    return () => { cancelled = true }
  }, [objectiveIds, conceptIds])

  function answer(idx) {
    if (revealed || !isMcQuestion(current)) return
    const correct = gradeQuestion(current, idx)
    setSelected(idx)
    setRevealed(true)
    setStats(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
    recordQuizResult(current.objectiveId, current.id, { correct })
    if (!correct) onMissed?.(buildMissedEntry(current.objectiveId, current, { selectedIndex: idx }))
  }

  function submitOrder() {
    if (revealed || !isOrderingQuestion(current)) return
    const correct = gradeQuestion(current, orderDraft)
    setRevealed(true)
    setStats(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
    recordQuizResult(current.objectiveId, current.id, { correct })
    if (!correct) onMissed?.(buildMissedEntry(current.objectiveId, current, { orderAnswer: orderDraft }))
  }

  function next() {
    if (queue.length === 0) {
      setPhase('done')
      onDone?.()
      return
    }
    setCurrent(queue[0])
    setQueue(q => q.slice(1))
    setSelected(null)
    setRevealed(false)
  }

  const ordering = current && isOrderingQuestion(current)
  const isCorrect = revealed && (ordering ? gradeQuestion(current, orderDraft) : gradeQuestion(current, selected))
  const obj = current ? ALL_OBJECTIVES.find(o => o.id === current.objectiveId) : null
  const summaryParts = []
  if (objectiveIds.length) summaryParts.push(`${objectiveIds.length} objective${objectiveIds.length === 1 ? '' : 's'}`)
  if (conceptIds.length) summaryParts.push(`${conceptIds.length} concept${conceptIds.length === 1 ? '' : 's'}`)

  if (phase === 'loading') {
    return (
      <div>
        <button type="button" style={styles.backBtn} onClick={onBack}>‹ Back</button>
        <Spinner label="Building your custom quiz…" />
      </div>
    )
  }

  if (phase === 'empty') {
    return (
      <div>
        <button type="button" style={styles.backBtn} onClick={onBack}>‹ Back</button>
        <h1 style={styles.h1}>Topic Focus</h1>
        <p style={styles.small}>No practice questions matched this selection. Try adding whole objectives or broader concepts.</p>
        <button type="button" style={{ ...styles.primaryBtn, marginTop: 12 }} onClick={onBack}>Adjust selection</button>
      </div>
    )
  }

  if (phase === 'done') {
    return (
      <div>
        <button type="button" style={styles.backBtn} onClick={onBack}>‹ Back</button>
        <div style={styles.card}>
          <h2 style={styles.h2}>{label || 'Topic Focus'} complete</h2>
          <p style={{ fontSize: 'var(--ccna-type-2xl)', fontWeight: 700, color: COLORS.mint, margin: '4px 0' }}>
            {stats.correct} / {stats.total}
          </p>
          <p style={styles.small}>{summaryParts.join(' · ')}</p>
          <button type="button" style={{ ...styles.primaryBtn, marginTop: 10 }} onClick={onBack}>Done</button>
        </div>
      </div>
    )
  }

  return (
    <div className="topic-focus-session">
      <button type="button" style={styles.backBtn} onClick={onBack}>‹ Back</button>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4, gap: 8 }}>
        <h1 style={{ ...styles.h1, margin: 0, flex: 1, minWidth: 0 }}>{label || 'Topic Focus'}</h1>
        <span style={styles.small}>{total - queue.length} / {total}</span>
      </div>
      <div style={{ ...styles.small, marginBottom: 8 }}>{summaryParts.join(' · ')}</div>
      {obj && <div style={{ ...styles.small, marginBottom: 8 }}>{obj.id} {obj.title}</div>}
      <div style={styles.card}>
        <QuestionMeta q={current} />
        <div style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 600, marginBottom: 14, lineHeight: 1.5, overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
          <QuizRichText text={current.question} />
        </div>
        {ordering ? (
          <OrderingQuestion items={orderDraft} onChange={setOrderDraft} revealed={revealed} correctOrder={revealed ? current.orderItems : null} />
        ) : (
          <McChoices q={current} selected={selected} revealed={revealed} onSelect={answer} />
        )}
        {revealed && (
          <div className="ccna-quiz-reveal" style={{ marginTop: 8, padding: 12, borderRadius: 10, background: isCorrect ? COLORS.mintDim : COLORS.roseDim, border: `2px solid ${isCorrect ? COLORS.mintBorder : COLORS.rose}` }}>
            <div style={{ fontWeight: 700, color: isCorrect ? COLORS.mint : COLORS.rose, marginBottom: 4, fontSize: 'var(--ccna-type-sm)' }}>
              {isCorrect ? 'Correct' : 'Incorrect'}
            </div>
            <AnswerReview q={current} selected={selected} />
          </div>
        )}
      </div>
      {ordering && !revealed && (
        <button type="button" style={{ ...styles.primaryBtn, marginBottom: 10 }} onClick={submitOrder}>Check order</button>
      )}
      {revealed && (
        <button type="button" style={styles.primaryBtn} onClick={next}>{queue.length === 0 ? 'Finish' : 'Next'}</button>
      )}
    </div>
  )
}
