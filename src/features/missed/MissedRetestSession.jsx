import React, { useState, useEffect } from 'react'
import {
  isOrderingQuestion, isCliQuestion, isMultiQuestion, gradeQuestion,
  shuffleArrayCopy, normalizeSelectedIndexes,
} from '../../questionUtils.js'
import { ALL_OBJECTIVES } from '../../data/ccnaDomains.js'
import { COLORS, styles } from '../../ui/appTheme.js'
import { haptic } from '../../ui/feedbackHelpers.jsx'
import McChoices from '../../components/McChoices.jsx'
import MultiChoices from '../../components/MultiChoices.jsx'
import AnswerReview from '../../components/AnswerReview.jsx'
import { answerReviewSessionProps } from '../../components/answerReviewSessionProps.js'
import { McChoiceShuffleProvider } from '../../context/McChoiceShuffleContext.jsx'
import { QuizQuestionStem, QuestionMeta, OrderingQuestion, CliAnswerInput } from '../../components/QuizQuestionChrome.jsx'
import StudyModeHeader from '../../components/StudyModeHeader.jsx'
import { useMasteryProgress } from '../progress/MasteryProgressContext.jsx'
import { ENGAGEMENT_KINDS } from '../progress/masteryEngagement.js'
import { MISSED_RETEST_CLEAR_CAP } from './missedRetestPool.js'
import { DOMAIN_PASS_PASS_PCT, DOMAIN_PASS_SEC_PER_QUESTION, isDomainPassPassed } from '../domainPass/domainPassConfig.js'

const quizFeedbackA11y = { role: 'status', 'aria-live': 'polite', 'aria-atomic': true }

function formatSeconds(total) {
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

/** Stable id used to remove a missed-bank entry once it's answered correctly. */
function missedEntryId(entry) {
  return entry?.questionId ?? entry?.id ?? null
}

/**
 * Missed Retest session runner — plays through a queue of previously-missed
 * questions with instant feedback, reusing the same interactive stack as
 * ReviewSession.jsx (McChoices/MultiChoices/OrderingQuestion/CliAnswerInput).
 *
 * Two framings over one mechanism: correct answer -> removed from the missed
 * bank immediately (`removeMissedByQuestionIds`), wrong -> left in place.
 *
 * Props:
 * - mode: 'clear' | 'prove'
 * - pool: array of missed-bank entries (already deduped/ordered/capped by the
 *   caller via missedRetestPool.js) — this component does not build the pool
 * - onExit: called from the header back-button (mid-session exit) AND from
 *   the end-screen's finishing button — there is no separate onDone callback
 * - onOpenTrapDrill, onOpenLab: forwarded into AnswerReview, same as ReviewSession
 * - onSelectObjective: called with the ALL_OBJECTIVES entry when the user taps
 *   "Review <objective> ->" on the feedback card (matches ReviewSession's
 *   onOpenSection(obj) pattern, just under the name used elsewhere in the app)
 * - timerEnabled: only relevant when mode === 'prove'. When true, runs a
 *   countdown (~90s/question via DOMAIN_PASS_SEC_PER_QUESTION) and auto-finishes
 *   at zero. Ignored in 'clear' mode (never timed).
 * - missedBankTotal: OPTIONAL. Total size of the deduped missed bank at the
 *   moment this session was launched (before this session's own cap/removals).
 *   Needed to render "Cleared X of Y - N left" where N reflects the WHOLE
 *   bank, not just this session's pool. Defaults to pool.length if omitted,
 *   which degrades gracefully but will under-report "left" if the pool was
 *   capped from a larger bank (e.g. clear mode's 15-question cap out of 100+
 *   missed). The wiring pass should pass the pre-cap deduped bank length here.
 */
export default function MissedRetestSession({
  mode = 'clear',
  pool,
  onExit,
  onOpenTrapDrill,
  onOpenLab,
  onSelectObjective,
  timerEnabled = false,
  missedBankTotal,
}) {
  const { recordEngagement, removeMissedByQuestionIds } = useMasteryProgress()
  const safePool = Array.isArray(pool) ? pool : []
  const isProve = mode === 'prove'
  // Captured once on mount: missedBankTotal is derived from the live `missed`
  // bank upstream, which shrinks as correct answers remove entries mid-session.
  // A plain derived value (not frozen via useState) would recompute smaller on
  // every re-render, making "N left" go negative and clamp to 0 by session end.
  const [bankTotalAtStart] = useState(() => (
    Number.isFinite(missedBankTotal) ? missedBankTotal : safePool.length
  ))

  const [phase, setPhase] = useState(safePool.length === 0 ? 'empty' : 'active')
  const [queue, setQueue] = useState(safePool.slice(1))
  const [current, setCurrent] = useState(safePool[0] || null)
  const [selected, setSelected] = useState(null)
  const [selectedIndexes, setSelectedIndexes] = useState([])
  const [revealed, setRevealed] = useState(false)
  const [orderDraft, setOrderDraft] = useState([])
  const [cliAnswer, setCliAnswer] = useState('')
  const [stats, setStats] = useState({ correct: 0, total: 0 })
  const [clearedCount, setClearedCount] = useState(0)
  const [total] = useState(safePool.length)
  const [secondsLeft, setSecondsLeft] = useState(() => safePool.length * DOMAIN_PASS_SEC_PER_QUESTION)

  useEffect(() => {
    if (current && isOrderingQuestion(current)) {
      setOrderDraft(shuffleArrayCopy(current.orderItems))
    } else {
      setOrderDraft([])
    }
    setCliAnswer('')
    setSelectedIndexes([])
  }, [current])

  useEffect(() => {
    if (phase !== 'active' || !isProve || !timerEnabled) return
    const id = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(id)
          setPhase('done')
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [phase, isProve, timerEnabled])

  function recordOutcome(correct) {
    haptic(correct ? 15 : [10, 40, 10])
    setStats(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
    recordEngagement?.(current.objectiveId, { kind: ENGAGEMENT_KINDS.MISSED_RETEST, correct: correct ? 1 : 0, total: 1 })
    if (correct) {
      const qid = missedEntryId(current)
      if (qid) removeMissedByQuestionIds?.([qid])
      setClearedCount(c => c + 1)
    }
    // Wrong answers are left in the missed bank as-is (no removal). Refreshing
    // the entry's stored selectedIndex to the latest attempt is a stretch goal
    // called out in the spec — skipped here: useMasteryProgress() only exposes
    // removeMissedByQuestionIds, no "update in place" primitive exists yet.
  }

  function answer(idx) {
    if (revealed || !current) return
    const correct = gradeQuestion(current, idx)
    setSelected(idx); setRevealed(true)
    recordOutcome(correct)
  }

  function toggleMulti(idx) {
    if (revealed || !current || !isMultiQuestion(current)) return
    setSelectedIndexes(prev => {
      const set = new Set(prev)
      if (set.has(idx)) set.delete(idx)
      else set.add(idx)
      return normalizeSelectedIndexes([...set])
    })
  }

  function submitMulti() {
    if (revealed || !current || !isMultiQuestion(current) || selectedIndexes.length < 1) return
    const correct = gradeQuestion(current, selectedIndexes)
    setRevealed(true)
    recordOutcome(correct)
  }

  function submitOrder() {
    if (revealed || !current || !isOrderingQuestion(current)) return
    const correct = gradeQuestion(current, orderDraft)
    setRevealed(true)
    recordOutcome(correct)
  }

  function submitCli() {
    if (revealed || !current || !isCliQuestion(current)) return
    const correct = gradeQuestion(current, cliAnswer)
    setRevealed(true)
    recordOutcome(correct)
  }

  function next() {
    if (queue.length === 0) { setPhase('done'); return }
    setCurrent(queue[0]); setQueue(q => q.slice(1)); setSelected(null); setSelectedIndexes([]); setRevealed(false); setCliAnswer('')
  }

  const headerTitle = isProve ? 'Prove It' : 'Clear Queue'

  if (phase === 'empty') {
    return (
      <div>
        <StudyModeHeader title={headerTitle} onBack={onExit} />
        <p style={styles.small}>Nothing to retest right now — your missed bank is empty.</p>
      </div>
    )
  }

  if (phase === 'done') {
    const left = Math.max(0, bankTotalAtStart - clearedCount)
    if (!isProve) {
      return (
        <div>
          <StudyModeHeader title={headerTitle} onBack={onExit} />
          <div style={styles.card}>
            <h2 style={styles.h2}>Queue cleared</h2>
            <p style={{ fontSize: 'var(--ccna-type-lg)', fontWeight: 700, color: COLORS.mint, margin: '4px 0' }}>
              Cleared {clearedCount} of {total} — {left} left, come back anytime.
            </p>
            <button style={{ ...styles.primaryBtn, marginTop: 10 }} onClick={onExit}>Done</button>
          </div>
        </div>
      )
    }
    const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0
    const passed = isDomainPassPassed(pct)
    return (
      <div>
        <StudyModeHeader title={headerTitle} onBack={onExit} />
        <div style={styles.card}>
          <h2 style={styles.h2}>Retest complete</h2>
          <p style={{ fontSize: 'var(--ccna-type-2xl)', fontWeight: 700, color: passed ? COLORS.mint : COLORS.rose, margin: '4px 0' }}>{pct}%</p>
          <div style={{ ...styles.pill(passed ? 'mint' : 'rose'), display: 'inline-block', marginBottom: 8 }}>
            {passed ? `Pass (${DOMAIN_PASS_PASS_PCT}%+)` : `Below ${DOMAIN_PASS_PASS_PCT}% — keep going`}
          </div>
          <p style={styles.small}>{stats.correct} / {stats.total} answered correctly. {left} still left in your missed bank.</p>
          <button style={{ ...styles.primaryBtn, marginTop: 10 }} onClick={onExit}>Done</button>
        </div>
      </div>
    )
  }

  const ordering = isOrderingQuestion(current)
  const cli = isCliQuestion(current)
  const multi = isMultiQuestion(current)
  const isCorrect = revealed && (
    ordering ? gradeQuestion(current, orderDraft)
      : cli ? gradeQuestion(current, cliAnswer)
        : multi ? gradeQuestion(current, selectedIndexes)
          : gradeQuestion(current, selected)
  )
  const obj = ALL_OBJECTIVES.find(o => o.id === current.objectiveId)
  return (
    <div className="ccna-review-flow">
      <StudyModeHeader title={headerTitle} onBack={onExit} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
        <span style={styles.small}>{total - queue.length} of {total}</span>
        {isProve && timerEnabled && (
          <span style={{ ...styles.pill(secondsLeft < 60 ? 'rose' : 'sky') }}>{formatSeconds(secondsLeft)}</span>
        )}
      </div>
      <div style={{ ...styles.small, marginBottom: 8 }}>
        {isProve
          ? `${total} questions from things you've missed. Pass at ${DOMAIN_PASS_PASS_PCT}%+.`
          : `Clearing your missed bank (up to ${MISSED_RETEST_CLEAR_CAP} at a time) — no score kept.`}
        {revealed ? '' : ' Answer before revealing.'}
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
        ) : multi ? (
          <MultiChoices q={current} selectedIndexes={selectedIndexes} revealed={revealed} onToggle={toggleMulti} />
        ) : (
          <McChoices q={current} selected={selected} revealed={revealed} onSelect={answer} />
        )}
        {revealed && (
          <div className="ccna-quiz-reveal" style={{ marginTop: 8, padding: 12, borderRadius: 10, background: isCorrect ? COLORS.mintDim : COLORS.roseDim, border: `2px solid ${isCorrect ? COLORS.mintBorder : COLORS.rose}` }} {...quizFeedbackA11y}>
            <div style={{ fontWeight: 700, color: isCorrect ? COLORS.mint : COLORS.rose, marginBottom: 4, fontSize: 'var(--ccna-type-sm)' }}>{isCorrect ? 'Correct' : 'Incorrect'}</div>
            <AnswerReview {...answerReviewSessionProps({
              q: current,
              selected,
              selectedIndexes: multi ? selectedIndexes : undefined,
              cliAnswer,
              orderAnswer: orderDraft,
              objectiveId: current?.objectiveId,
              onOpenTrapDrill,
              onOpenLab,
            })} />
            {obj && (
              <button
                onClick={() => onSelectObjective?.(obj)}
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
      {multi && !revealed && <button style={{ ...styles.primaryBtn, marginBottom: 10 }} onClick={submitMulti} disabled={selectedIndexes.length < 1}>Check answers</button>}
      {revealed && <button style={styles.primaryBtn} onClick={next}>{queue.length === 0 ? 'Finish' : 'Next'}</button>}
    </div>
  )
}
