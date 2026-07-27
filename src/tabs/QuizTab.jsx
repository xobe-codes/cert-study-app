import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { getCuratedQuestions } from '../data/ccnaCurated.js'
import {
  isOrderingQuestion, isMcQuestion, isCliQuestion, isMultiQuestion, gradeQuestion,
  shuffleArrayCopy, buildMissedEntry, normalizeSelectedIndexes,
} from '../questionUtils.js'
import { getObjectiveCkuIds } from '../lesson/quizCoverage.js'
import { pickQuizSessionSet } from './pickQuizSessionSet.js'
import { READING_TIER_KEYS } from '../lesson/readingTier.js'
import { masteryBreakdown } from '../lesson/masteryCriteria.js'
import { preloadCleanBankForObjective } from '../data/cleanQuestionAdapter.js'
import McChoices from '../components/McChoices.jsx'
import MultiChoices from '../components/MultiChoices.jsx'
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
import { diagnoseWrongAnswer } from '../answerReview/diagnoseWrongAnswer.js'
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
  recordSeen,
} from '../features/domainPass/domainQuestionExposure.js'
import { loadPracticeExposurePool, recordPracticeExposure } from './practiceExposure.js'
import { recordMissClearAttempt } from '../features/domainPass/missDrillQueue.js'
import { useMasteryProgress } from '../features/progress/MasteryProgressContext.jsx'
import { ENGAGEMENT_KINDS } from '../features/progress/masteryEngagement.js'
import {
  resolveQuizTrapDrillPrefill,
  QUIZ_PROMPT_SYSTEM,
  BankMixDisplay,
  CONFIDENCE_OPTIONS,
  quizFeedbackA11y,
  QuizCompleteCard,
} from './quizTabChrome.jsx'
import PostPracticeSecondaryTools from '../components/PostPracticeSecondaryTools.jsx'
import IdkButton from '../components/IdkButton.jsx'
import { takeLatencyMs, recordAnswerOutcome, unknownMissExtra } from '../features/study/answerOutcome.js'

export function QuizTab({
  objective, progress, missed, onMissed, onScoreSaved, nextObjective, onSelectObjective, onOpenMissed, onOpenTrapDrill, onOpenLab, onOpenSubnet, onSwitchTab,
  examMode = false, premiumUnlocked = false, onPremiumBlocked,
  showPreAssessFirst = false, onUpdateProgress,
}) {
  const showNavHint = useNavHint()
  const { recordEngagement, removeMissedByQuestionIds } = useMasteryProgress() || {}
  const removeMissedByQuestionId = (qid) => removeMissedByQuestionIds?.([qid])
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
  const [selectedIndexes, setSelectedIndexes] = useState([])
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
  const shownAtRef = useRef(null)
  const [unknownMarked, setUnknownMarked] = useState(false)

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
      const forced = Number(objective?.__sessionSize)
      const next = Number.isFinite(forced) && forced > 0 ? Math.min(forced, MAX_QUIZ_SESSION_SIZE) : size
      setSessionSize(next)
      setSessionSizeDraft(sessionSizeDraftFromCommitted(next))
    })
  }, [objective?.id, objective?.__sessionSize])

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
    setSelectedIndexes([])
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
      let exposurePool = null
      let preferUnseenIds = null
      try {
        const loaded = await loadPracticeExposurePool(objective.id, banked, missed)
        exposurePool = loaded.exposurePool
        preferUnseenIds = loaded.preferUnseenIds
      } catch {
        exposurePool = null
        preferUnseenIds = null
      }
      const set = pickQuizSessionSet({
        banked,
        sessionSize,
        accuracy: breakdown.has ? breakdown.acc : null,
        ckuIds,
        preferUnseenIds,
        exposurePool,
      })
      if (set.length === 0) throw new Error('No questions available for this objective yet.')
      sessionQuestionIdsRef.current = set.map(q => q.id).filter(id => id != null)
      exposureRecordedRef.current = false
      setBankSize(banked.length)
      setSourceLabel(usedApi ? 'Freshly generated · added to your bank' : STATIC_COPY.sessionBank(banked.length))
      setQueue(set.slice(1))
      setCurrent(set[0])
      setSelected(null)
      setSelectedIndexes([])
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
    setSelectedIndexes([])
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

  useEffect(() => {
    if (phase === 'active' && current) {
      shownAtRef.current = Date.now()
      setUnknownMarked(false)
    }
  }, [phase, current?.id, current?.question])

  // Optional, backward-compatible diagnosis (pure — reuses existing answer-review resolution).
  function missEntry(question, submittedAnswer, correct, extra) {
    const diagnosis = diagnoseWrongAnswer({ question, submittedAnswer, gradeResult: correct })
    return buildMissedEntry(objective.id, question, { ...extra, diagnosis })
  }

  function selectAnswer(idx) {
    if (revealed || !isMcQuestion(current)) return
    setSelected(idx)
    setRevealed(true)
    setUnknownMarked(false)
    const correct = gradeQuestion(current, idx)
    const latencyMs = takeLatencyMs(shownAtRef.current)
    haptic(correct ? 15 : [10, 40, 10])
    if (correct) bumpSessionStudy('correct')
    else bumpSessionStudy('incorrect')
    setStats(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1, missedCount: s.missedCount + (correct ? 0 : 1) }))
    const newStreak = correct ? streak + 1 : 0
    setStreak(newStreak)
    if (correct && newStreak >= 4) {
      setQueue(q => {
        const tIdx = q.findIndex(x => x.type === 'troubleshooting' || x.type === 'ordering' || x.type === 'multi')
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
    recordAnswerOutcome({
      objectiveId: objective.id,
      questionId: current.id,
      correct,
      latencyMs,
      selectedIndex: idx,
    }).catch(() => {})
    recordPracticeExposure(objective.id, current.id, correct)
    recordEngagement?.(objective.id, {
      kind: ENGAGEMENT_KINDS.QUIZ,
      correct: correct ? 1 : 0,
      total: 1,
      questionId: current.id,
    })
    if (correct && current.id) {
      recordMissClearAttempt(current.id, { correct: true, sessionKey: `quiz-${objective.id}` }).then((result) => {
        if (result?.cleared) removeMissedByQuestionId?.(current.id)
      }).catch(() => {})
    }
    if (!correct) {
      collectDeferredTip(current, idx)
      onMissed(missEntry(current, idx, correct, { selectedIndex: idx }))
      recordMissClearAttempt(current.id, { correct: false }).catch(() => {})
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

  function markUnknown() {
    if (revealed || !isMcQuestion(current)) return
    setSelected(null)
    setRevealed(true)
    setUnknownMarked(true)
    const latencyMs = takeLatencyMs(shownAtRef.current)
    bumpSessionStudy('incorrect')
    haptic([10, 40, 10])
    setStats(s => ({ correct: s.correct, total: s.total + 1, missedCount: s.missedCount + 1 }))
    setStreak(0)
    if (current.id) recordQuizResult(objective.id, current.id, { correct: false, schedule: !!progress?.[objective.id]?.reviewEligible })
    recordAnswerOutcome({
      objectiveId: objective.id,
      questionId: current.id,
      correct: false,
      unknown: true,
      latencyMs,
    }).catch(() => {})
    recordPracticeExposure(objective.id, current.id, false)
    recordEngagement?.(objective.id, {
      kind: ENGAGEMENT_KINDS.QUIZ,
      correct: 0,
      total: 1,
      questionId: current.id,
    })
    onMissed(missEntry(current, null, false, unknownMissExtra(null)))
    recordMissClearAttempt(current.id, { correct: false }).catch(() => {})
    const qKey = current.id || current.question
    if (missedOnce.current.has(qKey)) {
      setQueue(q => [q[0], current, ...q.slice(1)].filter(Boolean))
    } else {
      missedOnce.current.add(qKey)
      setQueue(q => [...q, current])
    }
  }

  function toggleMultiChoice(idx) {
    if (revealed || !isMultiQuestion(current)) return
    setSelectedIndexes(prev => {
      const set = new Set(prev)
      if (set.has(idx)) set.delete(idx)
      else set.add(idx)
      return normalizeSelectedIndexes([...set])
    })
  }

  function submitMulti() {
    if (revealed || !isMultiQuestion(current)) return
    if (selectedIndexes.length < 1) return
    setRevealed(true)
    const correct = gradeQuestion(current, selectedIndexes)
    haptic(correct ? 15 : [10, 40, 10])
    if (correct) bumpSessionStudy('correct')
    else bumpSessionStudy('incorrect')
    setStats(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1, missedCount: s.missedCount + (correct ? 0 : 1) }))
    const newStreak = correct ? streak + 1 : 0
    setStreak(newStreak)
    if (current.id) recordQuizResult(objective.id, current.id, { correct, schedule: !!progress?.[objective.id]?.reviewEligible })
    if (current.id) {
      recordQuestionHealthSignal(current.id, objective.id, {
        correct,
        selectedIndexes,
        lastRating: current.ratings?.length ? current.ratings[current.ratings.length - 1].value : null,
      })
    }
    logEvent('user_answered_question', { objectiveId: objective.id, questionId: current.id, correct })
    recordAnswerOutcome({
      objectiveId: objective.id,
      questionId: current.id,
      correct,
      latencyMs: takeLatencyMs(shownAtRef.current),
      selectedIndexes: [...selectedIndexes],
    }).catch(() => {})
    recordPracticeExposure(objective.id, current.id, correct)
    if (!correct) {
      const firstWrong = selectedIndexes.find(i => !(current.correctIndexes || []).includes(i))
      collectDeferredTip(current, firstWrong ?? selectedIndexes[0])
      onMissed(missEntry(current, selectedIndexes, correct, { selectedIndexes: [...selectedIndexes] }))
      const trapPrefill = resolveQuizTrapDrillPrefill(current, objective, firstWrong ?? selectedIndexes[0])
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
    recordPracticeExposure(objective.id, current.id, correct)
    if (!correct) {
      collectDeferredTip(current, null)
      onMissed(missEntry(current, orderDraft, correct, { orderAnswer: orderDraft }))
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
    recordPracticeExposure(objective.id, current.id, correct)
    if (!correct) {
      collectDeferredTip(current, null)
      onMissed(missEntry(current, cliAnswer, correct, { cliAnswer }))
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
    const multi = isMultiQuestion(current)
    let wasCorrect = null
    if (revealed) {
      if (ordering) wasCorrect = gradeQuestion(current, orderDraft)
      else if (cli) wasCorrect = gradeQuestion(current, cliAnswer)
      else if (multi) wasCorrect = gradeQuestion(current, selectedIndexes)
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
    setUnknownMarked(false)
    setSelectedIndexes([])
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
    const score = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0
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
        {/* Option B: Post-practice secondary tools appear contextually after user practices */}
        <PostPracticeSecondaryTools
          objectiveId={objective.id}
          domainId={objective.domainId}
          score={score}
          onOpenTrapDrill={onOpenTrapDrill}
          onOpenDomainPass={onSelectObjective ? (opts) => onSelectObjective({
            ...objective,
            __mode: 'domainPass',
            __focusObjectiveIds: opts?.focusObjectiveIds,
          }) : undefined}
          onOpenMockExam={onSelectObjective}
        />
        {examMode && <DeferredExamTips tips={deferredTips.current} />}
      </>
    )
  }

  // active
  const ordering = isOrderingQuestion(current)
  const cli = isCliQuestion(current)
  const multi = isMultiQuestion(current)
  const isCorrect = revealed && (
    ordering ? gradeQuestion(current, orderDraft)
      : cli ? gradeQuestion(current, cliAnswer)
        : multi ? gradeQuestion(current, selectedIndexes)
          : gradeQuestion(current, selected)
  )
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
        ) : multi ? (
          <MultiChoices
            q={current}
            selectedIndexes={selectedIndexes}
            revealed={revealed}
            onToggle={toggleMultiChoice}
          />
        ) : (
          <McChoices q={current} selected={selected} revealed={revealed} onSelect={selectAnswer} />
        )}
        {!revealed && isMcQuestion(current) && !multi && !ordering && !cli && (
          <IdkButton onClick={markUnknown} />
        )}
        {multi && !revealed && (
          <button
            type="button"
            style={{ ...styles.primaryBtn, marginTop: 8 }}
            disabled={selectedIndexes.length < 1}
            onClick={submitMulti}
          >
            Check answers
          </button>
        )}
        {revealed && (
          <div className="ccna-quiz-reveal" style={{
            marginTop: 8, padding: 12, borderRadius: 10,
            background: isCorrect ? COLORS.mintDim : (unknownMarked ? COLORS.amberDim : COLORS.roseDim),
            border: `2px solid ${isCorrect ? COLORS.mintBorder : (unknownMarked ? COLORS.amberBorder : COLORS.rose)}`,
          }} {...quizFeedbackA11y}>
            <div style={{
              fontWeight: 700,
              color: isCorrect ? COLORS.mint : (unknownMarked ? COLORS.amber : COLORS.rose),
              marginBottom: 4,
              fontSize: 'var(--ccna-type-sm)',
            }}>
              {isCorrect ? 'Correct' : (unknownMarked ? 'Unknown' : 'Incorrect')}
            </div>
            <AnswerReview
              q={applyAnswerReviewToQuestion(current)}
              selected={selected}
              selectedIndexes={multi ? selectedIndexes : undefined}
              hideExamTip={examMode}
              objectiveId={objective.id}
              domainId={domainIdFromObjectiveId(objective.id)}
              showQuestionFlag
              cliAnswer={cli ? cliAnswer : undefined}
              orderAnswer={ordering ? orderDraft : undefined}
              onOpenLab={onOpenLab}
              onOpenTrapDrill={onOpenTrapDrill}
              onOpenSubnet={onOpenSubnet}
            />
            {!isCorrect && onOpenTrapDrill && (() => {
              const prefill = resolveQuizTrapDrillPrefill(
                current,
                objective,
                multi
                  ? (selectedIndexes.find(i => !(current.correctIndexes || []).includes(i)) ?? selectedIndexes[0])
                  : selected,
              )
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
