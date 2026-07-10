import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { getCurated, getCuratedQuestions } from '../data/ccnaCurated.js'
import {
  TYPE_LABEL, SKILL_LABEL, isOrderingQuestion, isMcQuestion, isCliQuestion, gradeQuestion,
  shuffleArrayCopy, computeBankMix, buildMissedEntry,
} from '../questionUtils.js'
import { pickReviewSet, getObjectiveCkuIds } from '../lesson/quizCoverage.js'
import { READING_TIER_KEYS } from '../lesson/readingTier.js'
import { masteryBreakdown } from '../lesson/masteryCriteria.js'
import { computeMastery } from '../netUtils.js'
import { preloadCleanBankForObjective } from '../data/cleanQuestionAdapter.js'
import McChoices from '../components/McChoices.jsx'
import AnswerReview from '../components/AnswerReview.jsx'
import { McChoiceShuffleProvider } from '../context/McChoiceShuffleContext.jsx'
import ErrorBox from '../components/ErrorBox.jsx'
import Spinner from '../components/Spinner.jsx'
import { CliAnswerInput, QuizQuestionStem } from '../components/QuizQuestionChrome.jsx'
import DeferredExamTips from '../components/DeferredExamTips.jsx'
import { COLORS, styles } from '../ui/appTheme.js'
import { useMobileGestureBlock } from '../ui/useMobileGestureBlock.js'
import { STATIC_COPY } from '../ui/staticContentCopy.js'
import { useNavHint } from '../components/NavHintProvider.jsx'
import { NAV_HINT_KEYS } from '../ui/navHintConfig.js'
import { DEFAULT_QUIZ_SESSION_SIZE, MAX_QUIZ_SESSION_SIZE, loadQuizSessionSize, saveQuizSessionSize, commitSessionSizeDraft, effectiveSessionSize, isSessionSizeDraftSubmittable, sanitizeSessionSizeDraftInput, sessionSizeDraftFromCommitted } from '../quizSessionConfig.js'
import { BOOK_REF } from '../data/bookRefFull.js'
import {
  PREMIUM_FEATURES,
  PREMIUM_COMING_SOON_LABEL,
} from '../premium/premiumFeatures.js'
import {
  askClaudeJSON, MODELS, AiBudgetWarning,
  QUIZ_BANK_MIN,
  seedTestedOutReview, logEvent, haptic,
  loadQuizBank, saveQuizBank, mergeIntoBank, recordQuizResult,
} from './tabRuntimeDeps.js'
import { QUIZ_SCHEMA } from '../ai/claudeClient.js'
import { recordQuestionHealthSignal } from '../quiz/questionHealthSignals.js'
import { confidenceFeedbackCopy } from '../quiz/confidenceScheduler.js'
import { applyAnswerReviewToQuestion, inferTrapForChoice } from '../answerReviewLogic.js'
import { isActionableMissedTrap } from '../missed/missedTrapGroups.js'
import { bumpSessionStudy } from '../home/sessionRecap.js'
import {
  createTrapStreakState,
  recordTrapMiss,
  shouldShowTrapStreakCta,
} from '../features/practice/trapStreak.js'
import {
  OrderingQuestion, QuestionMeta, PreAssessment,
} from './studyQuizShared.jsx'
import {
  domainIdFromObjectiveId,
  getDomainSeenMap,
  getExposureStats,
  loadDomainQuestionExposure,
  recordSeen,
} from '../features/domainPass/domainQuestionExposure.js'

/** Resolve trap-drill prefill from a missed MC question (prefer family label from answerReview). */
function resolveQuizTrapDrillPrefill(question, objective, selected) {
  const enriched = applyAnswerReviewToQuestion(question)
  const wrongItem = (enriched.answerReview?.incorrect || []).find(i => i.choiceIndex === selected)
  let trap = wrongItem?.misconceptionTested
    || inferTrapForChoice(enriched, selected)
  let ckuId = question.ckuIds?.[0] || enriched.ckuIds?.[0]

  if (!trap || !isActionableMissedTrap(trap)) {
    const examTraps = getCurated(objective.id)?.examTraps || []
    const match = examTraps.find(t => t.ckuIds?.some(id => id === ckuId)) || examTraps[0]
    if (match?.trap) {
      trap = match.trap
      ckuId = ckuId || match.ckuIds?.[0]
    }
  }

  if (!trap) return null
  return { trapLabel: trap, objectiveId: objective.id, ckuId }
}

/* =========================================================================
   QUIZ TAB
   ========================================================================= */
const QUIZ_PROMPT_SYSTEM = `You are a CCNA 200-301 quiz generator. Use the provided reference notes as your primary source; where the notes don't cover a detail needed for a good question, you may draw on accurate broader CCNA 200-301 knowledge consistent with the notes. Write questions at genuine CCNA exam difficulty.

Mix the question types across the set:
- definition/recall (2): test knowing a fact or term
- scenario-based (2-3): a short situation the learner must reason about
- application (1-2): apply a concept to solve something
- true-false on a common misconception (1): give exactly two choices ["True","False"]
- troubleshooting (2-3): a realistic fault scenario where the learner diagnoses the MOST LIKELY cause

Tag each question with skill: design (planning/architecture), implement (configuration/deployment), or troubleshoot (diagnosis). AI-generated questions are multiple-choice only — ordering/drag-drop questions come from the curated skill bank.

For troubleshooting questions, write them the way a network engineer actually troubleshoots: describe a concrete symptom (e.g. "Hosts on VLAN 20 can't reach their gateway"), include a short relevant config or "show" snippet inline using backticks for commands/output, then ask for the most likely cause. Use specific but VARIED surface details (interface names, IPs, VLAN IDs, subnet masks) so regenerated questions test the same underlying principle without being memorizable by pattern. The correct answer must be deducible from the snippet + reference notes; the distractors should be plausible real mistakes.

Spread difficulty from easy to hard. Tag each question with its type, difficulty (easy/medium/hard), skill (design/implement/troubleshoot), and the short sub-concept it tests. Each question's explanation should be 1-2 sentences on why the correct answer is right. Most questions have 4 choices; true-false questions have exactly 2.`

function BankMixDisplay({ questions }) {
  const mix = computeBankMix(questions)
  if (!mix.total) return null
  const typeLine = Object.entries(mix.types).sort((a, b) => b[1] - a[1]).map(([t, n]) => `${TYPE_LABEL[t] || t} ${n}`).join(' · ')
  const skillLine = Object.entries(mix.skills).sort((a, b) => b[1] - a[1]).map(([s, n]) => `${SKILL_LABEL[s] || s} ${n}`).join(' · ')
  return (
    <div style={{ marginTop: 8, marginBottom: 8, padding: '8px 10px', borderRadius: 10, background: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
      <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, lineHeight: 1.45 }}>{typeLine}</div>
      {skillLine && <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverDim, lineHeight: 1.45, marginTop: 2 }}>{skillLine}</div>}
    </div>
  )
}

const CONFIDENCE_OPTIONS = [
  { value: 'easy', label: 'Easy', accent: COLORS.mint, dim: COLORS.mintDim, border: COLORS.mintBorder },
  { value: 'medium', label: 'Medium', accent: COLORS.sky, dim: COLORS.skyDim, border: COLORS.skyBorder },
  { value: 'hard', label: 'Hard', accent: COLORS.purpleGlow, dim: COLORS.purpleDim, border: COLORS.borderGlow },
  { value: 'practice', label: 'Need practice', accent: COLORS.rose, dim: COLORS.roseDim, border: COLORS.roseBorder },
]

const FOCUSABLE_SELECTOR = 'a[href],button:not([disabled]),textarea,input:not([type="hidden"]),select,[tabindex]:not([tabindex="-1"])'

function useFocusTrap(containerRef) {
  useEffect(() => {
    const root = containerRef.current
    if (!root) return
    const previous = document.activeElement

    function focusables() {
      return [...root.querySelectorAll(FOCUSABLE_SELECTOR)].filter(el => !el.hasAttribute('disabled'))
    }

    const nodes = focusables()
    if (nodes.length) nodes[0].focus()
    else {
      root.tabIndex = -1
      root.focus()
    }

    function onKeyDown(e) {
      if (e.key !== 'Tab') return
      const list = focusables()
      if (!list.length) {
        e.preventDefault()
        return
      }
      const first = list[0]
      const last = list[list.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    root.addEventListener('keydown', onKeyDown)
    return () => {
      root.removeEventListener('keydown', onKeyDown)
      if (previous?.focus) previous.focus()
    }
  }, [containerRef])
}

const quizFeedbackA11y = { role: 'status', 'aria-live': 'polite', 'aria-atomic': true }

function QuizCompleteCard({
  title = 'Quiz complete',
  stats,
  objectiveId,
  progress,
  nextObjective,
  missedCountGlobal = 0,
  onReviewAgain,
  onGenerateNew,
  onOpenMissed,
  onSelectObjective,
  onSwitchTab,
  footnote,
  premiumUnlocked = false,
}) {
  const pct = stats.total ? Math.round((stats.correct / stats.total) * 100) : 0
  const mastery = computeMastery(progress?.[objectiveId] || {})
  const sessionMissed = stats.missedCount || 0
  const scoreColor = pct >= 80 ? COLORS.mint : pct >= 60 ? COLORS.sky : COLORS.rose

  let primaryLabel
  let primaryAction
  if (sessionMissed > 0) {
    primaryLabel = missedCountGlobal > 0 ? `Review missed questions (${missedCountGlobal})` : 'Review missed questions'
    primaryAction = onOpenMissed
  } else if (nextObjective) {
    primaryLabel = `Next objective: ${nextObjective.id}`
    primaryAction = () => onSelectObjective?.({ ...nextObjective, __initialTab: 'Practice' })
  } else {
    primaryLabel = 'Review again from bank'
    primaryAction = onReviewAgain
  }

  return (
    <div style={styles.card}>
      <h2 style={styles.h2}>{title}</h2>
      <p style={{ fontSize: 'var(--ccna-type-2xl)', fontWeight: 700, color: scoreColor, margin: '4px 0' }}>{stats.correct} / {stats.total}</p>
      <p style={{ ...styles.small, marginBottom: 4 }}>
        {pct}% this session · Topic mastery {Math.round(mastery.score * 100)}%
        {mastery.mastered ? ' · Mastered ✓' : ''}
      </p>
      {sessionMissed > 0 && (
        <p style={{ ...styles.small, marginBottom: 10, color: COLORS.rose }}>
          {sessionMissed} answer{sessionMissed === 1 ? '' : 's'} missed this session — saved to your review bank.
        </p>
      )}
      {footnote && <p style={{ ...styles.small, marginBottom: 10 }}>{footnote}</p>}
      <button style={{ ...styles.primaryBtn, marginTop: 4 }} onClick={primaryAction}>{primaryLabel}</button>
      {sessionMissed > 0 && nextObjective && (
        <button
          style={{ ...styles.secondaryBtn, marginTop: 8 }}
          onClick={() => onSelectObjective?.({ ...nextObjective, __initialTab: 'Practice' })}
        >
          Continue to {nextObjective.id} instead
        </button>
      )}
      <button style={{ ...styles.secondaryBtn, marginTop: 8 }} onClick={() => onSwitchTab?.('Study')}>
        Read explanation
      </button>
      {primaryAction !== onReviewAgain && (
        <button style={{ ...styles.secondaryBtn, marginTop: 8 }} onClick={onReviewAgain}>Review again from bank</button>
      )}
      {premiumUnlocked && (
        <button style={{ ...styles.secondaryBtn, marginTop: 8 }} onClick={onGenerateNew}>Generate new questions</button>
      )}
    </div>
  )
}

export function QuizTab({
  objective, progress, missed, onMissed, onScoreSaved, nextObjective, onSelectObjective, onOpenMissed, onOpenTrapDrill, onOpenLab, onOpenSubnet, onSwitchTab,
  examMode = false, premiumUnlocked = false, onPremiumBlocked,
  showPreAssessFirst = false, onUpdateProgress,
}) {
  const showNavHint = useNavHint()
  const doneHintFired = useRef(false)
  const justMasteredRef = useRef(false)
  const deferredTips = useRef([])
  const [overconfidentCallout, setOverconfidentCallout] = useState(false)
  const [preAssessDone, setPreAssessDone] = useState(false)
  const [phase, setPhase] = useState('idle') // idle | loading | active | done | error
  const [error, setError] = useState(null)
  const [queue, setQueue] = useState([]) // remaining questions
  const [current, setCurrent] = useState(null)
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [rating, setRating] = useState(null) // confidence rating for the current question
  const [confidenceHint, setConfidenceHint] = useState(null)
  const [stats, setStats] = useState({ correct: 0, total: 0, missedCount: 0 })
  const [sourceLabel, setSourceLabel] = useState(null) // where this session's questions came from
  const sessionRatings = useRef([])
  const missedOnce = useRef(new Set()) // question IDs missed once this session → 2nd miss = near-front re-queue
  const trapStreakRef = useRef(createTrapStreakState())
  const [trapStreakTick, setTrapStreakTick] = useState(0) // bump to re-render after trap-family miss
  const [streak, setStreak] = useState(0) // consecutive correct answers this session
  const sessionQuestionIdsRef = useRef([])
  const exposureRecordedRef = useRef(false)

  function collectDeferredTip(q, selectedIndex) {
    if (!examMode || !q) return
    const enriched = applyAnswerReviewToQuestion(q)
    const tip = enriched.answerReview?.examTip
    if (!tip) return
    const trap = selectedIndex != null ? inferTrapForChoice(enriched, selectedIndex) : null
    deferredTips.current.push({ tip, trap })
  }
  const [bankSize, setBankSize] = useState(0)
  const [bankQuestions, setBankQuestions] = useState([])
  const [orderDraft, setOrderDraft] = useState([])
  const [cliAnswer, setCliAnswer] = useState('')
  const [sessionSize, setSessionSize] = useState(DEFAULT_QUIZ_SESSION_SIZE)
  const [sessionSizeDraft, setSessionSizeDraft] = useState(sessionSizeDraftFromCommitted(DEFAULT_QUIZ_SESSION_SIZE))
  const curatedPoolSize = useMemo(() => getCuratedQuestions(objective.id).length, [objective.id])

  useMobileGestureBlock({ pull: revealed, edge: false })

  useEffect(() => {
    loadQuizSessionSize().then((size) => {
      setSessionSize(size)
      setSessionSizeDraft(sessionSizeDraftFromCommitted(size))
    })
  }, [])

  useEffect(() => {
    if (phase !== 'done') {
      doneHintFired.current = false
      justMasteredRef.current = false
      return
    }
    if (!exposureRecordedRef.current) {
      exposureRecordedRef.current = true
      const domainId = domainIdFromObjectiveId(objective.id)
      const ids = sessionQuestionIdsRef.current
      if (domainId && ids.length) recordSeen(domainId, ids)
    }
    if (doneHintFired.current) return
    doneHintFired.current = true
    if (justMasteredRef.current) return
    const pct = stats.total ? stats.correct / stats.total : 0
    if ((stats.missedCount || 0) > 0 || pct < 0.6) {
      showNavHint(NAV_HINT_KEYS.QUIZ_FAIL)
    } else {
      showNavHint(NAV_HINT_KEYS.QUIZ_PASS, { nextId: nextObjective?.id })
    }
  }, [phase, stats, nextObjective?.id, showNavHint, objective.id])

  useEffect(() => {
    if (bankSize > 0 && sessionSize > bankSize) {
      const next = bankSize
      setSessionSize(next)
      setSessionSizeDraft(sessionSizeDraftFromCommitted(next))
      saveQuizSessionSize(next)
    }
  }, [bankSize, sessionSize])

  async function commitSessionSize(raw, max = MAX_QUIZ_SESSION_SIZE) {
    const next = commitSessionSizeDraft(raw, { max, fallback: sessionSize })
    setSessionSize(next)
    setSessionSizeDraft(sessionSizeDraftFromCommitted(next))
    await saveQuizSessionSize(next)
    return next
  }

  function onSessionSizeInput(e) {
    setSessionSizeDraft(sanitizeSessionSizeDraftInput(e.target.value))
  }

  async function onSessionSizeBlur() {
    const max = bankSize > 0 ? bankSize : MAX_QUIZ_SESSION_SIZE
    await commitSessionSize(sessionSizeDraft, max)
  }

  async function startPracticeSession(forceNew = false) {
    const max = bankSize > 0 ? bankSize : MAX_QUIZ_SESSION_SIZE
    await commitSessionSize(sessionSizeDraft, max)
    startQuiz(forceNew)
  }

  // Keep the idle screen honest about how many questions are stored locally.
  const refreshBankSize = useCallback(async () => {
    const bank = await loadQuizBank()
    const qs = bank[objective.id] || []
    setBankSize(qs.length)
    setBankQuestions(qs)
  }, [objective.id])

  useEffect(() => {
    if (current && isOrderingQuestion(current)) {
      setOrderDraft(shuffleArrayCopy(current.orderItems))
    } else {
      setOrderDraft([])
    }
    setCliAnswer('')
  }, [current])

  // forceNew=true always generates a fresh set via the API and adds it to the
  // bank. Otherwise we reuse stored questions whenever the bank is big enough,
  // which means review sessions cost zero API calls.
  const startQuiz = useCallback(async (forceNew) => {
    setError(null)
    sessionRatings.current = []
    deferredTips.current = []
    setOverconfidentCallout(false)
    try {
      await preloadCleanBankForObjective(objective.id)
      let bank = await loadQuizBank()
      let banked = bank[objective.id] || []
      let usedApi = false

      // Curated objectives: seed their hand-written questions into the bank so
      // quizzes run with zero API cost. Done once (skipped if already present).
      const curatedQs = getCuratedQuestions(objective.id)
      if (curatedQs.length && banked.length < curatedQs.length) {
        bank = mergeIntoBank(bank, objective.id, curatedQs)
        await saveQuizBank(bank)
        banked = bank[objective.id]
      }

      if (forceNew) {
        if (!premiumUnlocked) {
          onPremiumBlocked?.(PREMIUM_FEATURES.quiz_generate, 'quiz_tab', { objectiveId: objective.id })
          setPhase('idle')
          return
        }
      }

      const needsAiGeneration = forceNew || (!curatedQs.length && banked.length < QUIZ_BANK_MIN)
      if (needsAiGeneration && !premiumUnlocked) {
        setPhase('idle')
        setError('No practice questions available yet. Premium unlocks AI-generated sets for this topic.')
        return
      }

      if (needsAiGeneration) {
        setPhase('loading')
        const refNotes = BOOK_REF[objective.id] || ''
        // Personalize: tell the generator which sub-concepts this learner has
        // actually gotten wrong on this objective, so the new batch leans
        // toward their real weak spots instead of a generic spread.
        const weakConcepts = [...new Set(
          (missed || []).filter(m => m.objectiveId === objective.id && m.concept).map(m => m.concept)
        )].slice(-5)
        const weakNote = weakConcepts.length
          ? `\n\nThis learner has previously gotten questions wrong on these sub-concepts: ${weakConcepts.join(', ')}. Include extra questions targeting these specifically (still cover the full objective).`
          : ''
        const data = await askClaudeJSON({
          system: QUIZ_PROMPT_SYSTEM,
          messages: [{
            role: 'user',
            content: `Objective ${objective.id}: ${objective.title}\n\nReference notes:\n${refNotes}${weakNote}\n\nGenerate 8 multiple-choice questions for this objective.`,
          }],
          max_tokens: 2200,
          model: MODELS.fast,
          schema: QUIZ_SCHEMA,
          toolName: 'emit_quiz',
          feature: 'quiz',
        })
        const fresh = data.questions || []
        if (fresh.length === 0 && banked.length === 0) throw new Error('Claude returned no questions.')
        bank = mergeIntoBank(bank, objective.id, fresh)
        await saveQuizBank(bank)
        banked = bank[objective.id]
        usedApi = true
      }

      const breakdown = masteryBreakdown(progress?.[objective.id])
      const ckuIds = getObjectiveCkuIds(objective.id)
      let preferUnseenIds = null
      try {
        const domainId = domainIdFromObjectiveId(objective.id)
        if (domainId) {
          const exposureStore = await loadDomainQuestionExposure()
          const seenMap = getDomainSeenMap(exposureStore, domainId)
          const stats = getExposureStats(domainId, banked.map(q => q.id).filter(Boolean), seenMap)
          if (stats.unseen.length) preferUnseenIds = new Set(stats.unseen)
        }
      } catch {
        preferUnseenIds = null
      }
      const set = pickReviewSet(banked, breakdown.has ? breakdown.acc : null, sessionSize, {
        ckuIds,
        preferUnseenIds,
      })
      if (set.length === 0) throw new Error('No questions available for this objective yet.')
      sessionQuestionIdsRef.current = set.map(q => q.id).filter(id => id != null)
      exposureRecordedRef.current = false
      setBankSize(banked.length)
      setSourceLabel(usedApi ? 'Freshly generated · added to your bank' : STATIC_COPY.sessionBank(banked.length))
      setQueue(set.slice(1))
      setCurrent(set[0])
      setSelected(null)
      setRevealed(false)
      setRating(null)
      setConfidenceHint(null)
      setStats({ correct: 0, total: 0, missedCount: 0 })
      setPhase('active')
      logEvent('user_started_quiz', { objectiveId: objective.id, source: usedApi ? 'fresh' : 'bank', size: set.length })
    } catch (err) {
      setError(err.message.includes('JSON') ? 'Claude returned an unexpected format. Please try again.' : err.message)
      setPhase('error')
    }
  }, [objective.id, objective.title, progress, missed, sessionSize, premiumUnlocked, onPremiumBlocked])

  useEffect(() => {
    setPhase('idle')
    setPreAssessDone(false)
    setQueue([])
    setCurrent(null)
    setSelected(null)
    setRevealed(false)
    setRating(null)
    setConfidenceHint(null)
    setStreak(0)
    sessionRatings.current = []
    deferredTips.current = []
    trapStreakRef.current = createTrapStreakState()
    setTrapStreakTick(0)
    setOverconfidentCallout(false)
    missedOnce.current = new Set()
    refreshBankSize()
  }, [objective.id, refreshBankSize])

  function selectAnswer(idx) {
    if (revealed || !isMcQuestion(current)) return
    setSelected(idx)
    setRevealed(true)
    const correct = gradeQuestion(current, idx)
    haptic(correct ? 15 : [10, 40, 10])
    if (correct) bumpSessionStudy('correct')
    else bumpSessionStudy('incorrect')
    setStats(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1, missedCount: s.missedCount + (correct ? 0 : 1) }))
    const newStreak = correct ? streak + 1 : 0
    setStreak(newStreak)
    if (correct && newStreak >= 4) {
      setQueue(q => {
        const tIdx = q.findIndex(x => x.type === 'troubleshooting' || x.type === 'ordering')
        if (tIdx > 0) return [q[tIdx], ...q.slice(0, tIdx), ...q.slice(tIdx + 1)]
        return q
      })
    }
    if (current.id) recordQuizResult(objective.id, current.id, { correct, schedule: !!progress?.[objective.id]?.reviewEligible })
    if (current.id) {
      recordQuestionHealthSignal(current.id, objective.id, {
        correct,
        selectedIndex: idx,
        lastRating: current.ratings?.length ? current.ratings[current.ratings.length - 1].value : null,
      })
    }
    logEvent('user_answered_question', { objectiveId: objective.id, questionId: current.id, correct })
    if (!correct) {
      collectDeferredTip(current, idx)
      onMissed(buildMissedEntry(objective.id, current, { selectedIndex: idx }))
      const trapPrefill = resolveQuizTrapDrillPrefill(current, objective, idx)
      if (trapPrefill) {
        const recorded = recordTrapMiss(trapStreakRef.current, trapPrefill)
        trapStreakRef.current = recorded.state
        setTrapStreakTick(t => t + 1)
      }
      const qKey = current.id || current.question
      if (missedOnce.current.has(qKey)) {
        setQueue(q => [q[0], current, ...q.slice(1)].filter(Boolean))
      } else {
        missedOnce.current.add(qKey)
        setQueue(q => [...q, current])
      }
    }
  }

  function submitOrder() {
    if (revealed || !isOrderingQuestion(current)) return
    setRevealed(true)
    const correct = gradeQuestion(current, orderDraft)
    haptic(correct ? 15 : [10, 40, 10])
    if (correct) bumpSessionStudy('correct')
    else bumpSessionStudy('incorrect')
    setStats(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1, missedCount: s.missedCount + (correct ? 0 : 1) }))
    const newStreak = correct ? streak + 1 : 0
    setStreak(newStreak)
    if (current.id) recordQuizResult(objective.id, current.id, { correct, schedule: !!progress?.[objective.id]?.reviewEligible })
    logEvent('user_answered_question', { objectiveId: objective.id, questionId: current.id, correct })
    if (!correct) {
      collectDeferredTip(current, null)
      onMissed(buildMissedEntry(objective.id, current, { orderAnswer: orderDraft }))
      const qKey = current.id || current.question
      if (missedOnce.current.has(qKey)) {
        setQueue(q => [q[0], current, ...q.slice(1)].filter(Boolean))
      } else {
        missedOnce.current.add(qKey)
        setQueue(q => [...q, current])
      }
    }
  }

  function submitCli() {
    if (revealed || !isCliQuestion(current)) return
    setRevealed(true)
    const correct = gradeQuestion(current, cliAnswer)
    haptic(correct ? 15 : [10, 40, 10])
    if (correct) bumpSessionStudy('correct')
    else bumpSessionStudy('incorrect')
    setStats(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1, missedCount: s.missedCount + (correct ? 0 : 1) }))
    const newStreak = correct ? streak + 1 : 0
    setStreak(newStreak)
    if (current.id) recordQuizResult(objective.id, current.id, { correct, schedule: !!progress?.[objective.id]?.reviewEligible })
    logEvent('user_answered_question', { objectiveId: objective.id, questionId: current.id, correct })
    if (!correct) {
      collectDeferredTip(current, null)
      onMissed(buildMissedEntry(objective.id, current, { cliAnswer }))
      const qKey = current.id || current.question
      if (missedOnce.current.has(qKey)) {
        setQueue(q => [q[0], current, ...q.slice(1)].filter(Boolean))
      } else {
        missedOnce.current.add(qKey)
        setQueue(q => [...q, current])
      }
    }
  }

  function rate(value) {
    setRating(value)
    sessionRatings.current.push(value)
    if (current.id) recordQuizResult(objective.id, current.id, { rating: value })
    logEvent('user_rated_question_difficulty', { objectiveId: objective.id, questionId: current.id, rating: value })
    const ordering = isOrderingQuestion(current)
    const cli = isCliQuestion(current)
    let wasCorrect = null
    if (revealed) {
      if (ordering) wasCorrect = gradeQuestion(current, orderDraft)
      else if (cli) wasCorrect = gradeQuestion(current, cliAnswer)
      else if (selected != null) wasCorrect = gradeQuestion(current, selected)
    }
    setConfidenceHint(confidenceFeedbackCopy(value, wasCorrect))
    if (value === 'easy' && revealed && wasCorrect === false) {
      setOverconfidentCallout(true)
    }
  }

  function next() {
    if (queue.length === 0) {
      justMasteredRef.current = onScoreSaved({ ...stats, ratings: [...sessionRatings.current] }) === true
      setPhase('done')
      return
    }
    setCurrent(queue[0])
    setQueue(q => q.slice(1))
    setSelected(null)
    setRevealed(false)
    setRating(null)
    setConfidenceHint(null)
    setCliAnswer('')
    setOverconfidentCallout(false)
  }

  async function handlePreAssessTestedOut(questions, pct) {
    onUpdateProgress?.(objective.id, {
      testedOut: true,
      preAssessPct: pct,
      readingTier: READING_TIER_KEYS.examReady,
      lastSeen: Date.now(),
    })
    await seedTestedOutReview(objective.id, questions)
    logEvent('user_tested_out', { objectiveId: objective.id, score: pct })
    setPreAssessDone(true)
  }

  if (showPreAssessFirst && !preAssessDone && !progress?.[objective.id]?.testedOut) {
    return (
      <div>
        <p style={{ ...styles.small, marginBottom: 10, color: COLORS.silverMid }}>
          Quick check before practice — test out if you already know this topic.
        </p>
        <PreAssessment
          objective={objective}
          onTestedOut={handlePreAssessTestedOut}
          onStudy={() => setPreAssessDone(true)}
          premiumUnlocked={premiumUnlocked}
          onPremiumBlocked={onPremiumBlocked}
        />
      </div>
    )
  }

  if (phase === 'idle') {
    const hasBank = bankSize >= QUIZ_BANK_MIN
    const poolMax = hasBank ? bankSize : (curatedPoolSize > 0 ? curatedPoolSize : MAX_QUIZ_SESSION_SIZE)
    const sessionMax = hasBank ? bankSize : MAX_QUIZ_SESSION_SIZE
    const pendingSize = effectiveSessionSize(sessionSizeDraft, sessionSize, { max: sessionMax })
    const reviewCount = hasBank ? Math.min(pendingSize, bankSize) : pendingSize
    const canStartSession = isSessionSizeDraftSubmittable(sessionSizeDraft, { max: sessionMax })
    const emptyPool = !hasBank && curatedPoolSize === 0
    return (
      <div className={`ccna-quiz-idle${hasBank ? ' ccna-quiz-idle--slim' : ''}`}>
        <p className="ccna-quiz-idle__lead" style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 600, color: COLORS.silver, margin: '0 0 4px', lineHeight: 1.35 }}>
          {emptyPool ? 'Ready to practice?' : hasBank ? 'Practice from your bank' : 'How many questions do you want?'}
        </p>
        <p style={{ ...styles.small, marginBottom: 10, color: COLORS.silverMid }}>
          {hasBank ? (
            <>
              <strong style={{ color: COLORS.silver }}>{bankSize}</strong> question{bankSize === 1 ? '' : 's'} available in your bank — {STATIC_COPY.bankReview}.
            </>
          ) : curatedPoolSize > 0 ? (
            <>
              <strong style={{ color: COLORS.silver }}>{curatedPoolSize}</strong> curated question{curatedPoolSize === 1 ? '' : 's'} for this topic — {STATIC_COPY.curatedQuizPool}.
            </>
          ) : (
            <>No questions yet — read the Study tab first{premiumUnlocked ? ', or generate a custom set' : ''}.</>
          )}
        </p>
        {emptyPool && onSwitchTab && (
          <button type="button" style={{ ...styles.secondaryBtn, marginBottom: 8 }} onClick={() => onSwitchTab('Study')}>
            ← Back to Study
          </button>
        )}
        {hasBank && <BankMixDisplay questions={bankQuestions} />}
        {!hasBank && curatedPoolSize === 0 && premiumUnlocked && <AiBudgetWarning />}
        {!hasBank && curatedPoolSize === 0 && !premiumUnlocked && (
          <div style={{ ...styles.card, border: `1px solid ${COLORS.border}`, marginBottom: 8, padding: '10px 12px' }}>
            <p style={{ ...styles.small, margin: 0, lineHeight: 1.45 }}>
              {PREMIUM_COMING_SOON_LABEL} — AI practice sets unlock with supporter access. Curated topics include free questions automatically.
            </p>
          </div>
        )}
        <div style={{ marginBottom: 4 }}>
          <label htmlFor={`quiz-session-size-${objective.id}`} style={{ display: 'block', fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 6 }}>This session</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <input
              id={`quiz-session-size-${objective.id}`}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={sessionSizeDraft}
              onChange={onSessionSizeInput}
              onBlur={onSessionSizeBlur}
              aria-label={`How many questions this session, up to ${poolMax} available`}
              style={{
                ...styles.input,
                width: 56,
                padding: '4px 8px',
                fontSize: 'var(--ccna-type-sm)',
                textAlign: 'center',
              }}
            />
            <span style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid }}>
              of {poolMax} available
            </span>
          </div>
        </div>
        {emptyPool && !premiumUnlocked ? (
          <button type="button" style={{ ...styles.secondaryBtn, marginTop: 12 }} onClick={() => onSwitchTab?.('Study')}>
            ← Study this topic first
          </button>
        ) : (
          <button style={{ ...styles.primaryBtn, marginTop: 12 }} disabled={!canStartSession} onClick={() => startPracticeSession(false)}>
            {hasBank ? `Practice ${reviewCount} question${reviewCount === 1 ? '' : 's'}` : emptyPool ? 'Generate practice set' : 'Start practice'}
          </button>
        )}
        {hasBank && premiumUnlocked && (
          <button style={{ ...styles.secondaryBtn, marginTop: 8 }} disabled={!canStartSession} onClick={() => startPracticeSession(true)}>Generate new questions</button>
        )}
      </div>
    )
  }
  if (phase === 'loading') return <Spinner label="Generating quiz questions..." />
  if (phase === 'error') return <ErrorBox message={error} onRetry={() => startQuiz(false)} />
  if (phase === 'done') {
    const missedCountGlobal = (missed || []).length
    return (
      <>
        <QuizCompleteCard
          stats={stats}
          objectiveId={objective.id}
          progress={progress}
          nextObjective={nextObjective}
          missedCountGlobal={missedCountGlobal}
          onReviewAgain={() => startQuiz(false)}
          onGenerateNew={() => startQuiz(true)}
          onOpenMissed={onOpenMissed}
          onSelectObjective={onSelectObjective}
          onSwitchTab={onSwitchTab}
          footnote={examMode ? 'Exam mode — tips saved for debrief below.' : null}
          premiumUnlocked={premiumUnlocked}
        />
        {examMode && <DeferredExamTips tips={deferredTips.current} />}
      </>
    )
  }

  // active
  const ordering = isOrderingQuestion(current)
  const cli = isCliQuestion(current)
  const isCorrect = revealed && (ordering ? gradeQuestion(current, orderDraft) : cli ? gradeQuestion(current, cliAnswer) : gradeQuestion(current, selected))
  return (
    <div className="ccna-practice-active ccna-review-flow">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div style={styles.small}>Question {stats.total + 1}{queue.length > 0 ? ` · ${queue.length} remaining` : ''}</div>
        {streak >= 3 && <span style={{ ...styles.pill('mint'), fontSize: 'var(--ccna-type-micro)' }}>🔥 {streak} streak</span>}
      </div>
      {sourceLabel && <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 8 }}>{sourceLabel}</div>}
      <div style={styles.card}>
        <QuestionMeta q={current} />
        <QuizQuestionStem text={current.question} />
        <McChoiceShuffleProvider q={current} enabled={!ordering && !cli}>
        {ordering ? (
          <OrderingQuestion
            items={orderDraft}
            onChange={setOrderDraft}
            revealed={revealed}
            correctOrder={revealed ? current.orderItems : null}
          />
        ) : cli ? (
          <CliAnswerInput value={cliAnswer} onChange={setCliAnswer} onSubmit={submitCli} revealed={revealed} question={current} />
        ) : (
          <McChoices q={current} selected={selected} revealed={revealed} onSelect={selectAnswer} />
        )}
        {revealed && (
          <div className="ccna-quiz-reveal" style={{ marginTop: 8, padding: 12, borderRadius: 10, background: isCorrect ? COLORS.mintDim : COLORS.roseDim, border: `2px solid ${isCorrect ? COLORS.mintBorder : COLORS.rose}` }} {...quizFeedbackA11y}>
            <div style={{ fontWeight: 700, color: isCorrect ? COLORS.mint : COLORS.rose, marginBottom: 4, fontSize: 'var(--ccna-type-sm)' }}>
              {isCorrect ? 'Correct' : 'Incorrect'}
            </div>
            <AnswerReview
              q={applyAnswerReviewToQuestion(current)}
              selected={selected}
              hideExamTip={examMode}
              objectiveId={objective.id}
              domainId={domainIdFromObjectiveId(objective.id)}
              showQuestionFlag
              onOpenLab={onOpenLab}
              onOpenTrapDrill={onOpenTrapDrill}
              onOpenSubnet={onOpenSubnet}
            />
            {!isCorrect && onOpenTrapDrill && (() => {
              const prefill = resolveQuizTrapDrillPrefill(current, objective, selected)
              if (!prefill) return null
              const streakCta = trapStreakTick >= 0 && shouldShowTrapStreakCta(trapStreakRef.current, prefill)
              if (!streakCta) return null
              return (
                <button
                  type="button"
                  style={{ ...styles.secondaryBtn, marginTop: 10, width: '100%' }}
                  onClick={() => onOpenTrapDrill(prefill)}
                >
                  Trap drill this misconception →
                </button>
              )
            })()}
          </div>
        )}
        </McChoiceShuffleProvider>
      </div>
      {ordering && !revealed && (
        <button style={{ ...styles.primaryBtn, marginBottom: 10 }} onClick={submitOrder}>Check order</button>
      )}
      {cli && !revealed && (
        <button style={{ ...styles.primaryBtn, marginBottom: 10 }} onClick={submitCli} disabled={!cliAnswer.trim()}>Check command</button>
      )}
      {revealed && (
        <div className="ccna-confidence-strip" style={{ marginBottom: 10 }}>
          {overconfidentCallout && (
            <div style={{ ...styles.small, marginBottom: 8, padding: '8px 10px', borderRadius: 8, border: `1px solid ${COLORS.amberBorder}`, background: COLORS.amberDim, color: COLORS.amber }}>
              You marked this <strong>Easy</strong> but missed it — a common exam trap. Re-read the explanation before moving on.
            </div>
          )}
          <div className="ccna-confidence-strip__label" style={{ ...styles.small, marginBottom: 6 }}>How confident did you feel?</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {CONFIDENCE_OPTIONS.map(opt => {
              const active = rating === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => rate(opt.value)}
                  style={{
                    flex: '1 1 auto', minHeight: 40, borderRadius: 10, cursor: 'pointer',
                    background: active ? opt.dim : COLORS.surface,
                    border: `1px solid ${active ? opt.border : COLORS.border}`,
                    color: active ? opt.accent : COLORS.silverMid,
                    fontSize: 'var(--ccna-type-xs)', fontWeight: 600, padding: '8px 6px', fontFamily: 'inherit',
                  }}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
          {confidenceHint && (
            <div style={{ ...styles.small, marginTop: 8, color: COLORS.sky, lineHeight: 1.4 }}>
              {confidenceHint}
            </div>
          )}
        </div>
      )}
      {revealed && <button style={styles.primaryBtn} onClick={next}>{queue.length === 0 ? 'Finish' : 'Next question'}</button>}
    </div>
  )
}
