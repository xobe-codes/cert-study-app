import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { DOMAINS } from '../../data/ccnaDomains.js'
import { getCuratedQuestions } from '../../data/ccnaCurated.js'
import { preloadCleanBank } from '../../data/cleanQuestionAdapter.js'
import { isChoiceQuestion, isMcQuestion, isMultiQuestion, gradeQuestion, buildMissedEntry, normalizeSelectedIndexes } from '../../questionUtils.js'
import { COLORS, styles } from '../../ui/appTheme.js'
import McChoices from '../../components/McChoices.jsx'
import MultiChoices from '../../components/MultiChoices.jsx'
import AnswerReview from '../../components/AnswerReview.jsx'
import { answerReviewSessionProps } from '../../components/answerReviewSessionProps.js'
import { McChoiceShuffleProvider } from '../../context/McChoiceShuffleContext.jsx'
import { summarizeWrongTraps } from '../../missed/missedTrapGroups.js'
import StudyModeHeader from '../../components/StudyModeHeader.jsx'
import Spinner from '../../components/Spinner.jsx'
import ErrorBox from '../../components/ErrorBox.jsx'
import { QuizQuestionStem, QuestionMeta } from '../../components/QuizQuestionChrome.jsx'
import DomainPassResultsScreen from './DomainPassResultsScreen.jsx'
import {
  consumeDomainPassDebriefResume,
  clearDomainPassDebriefResume,
} from './domainPassDebriefResume.js'
import {
  DOMAIN_PASS_PASS_PCT,
  domainPassDurationSec,
  domainPassTimerMinutes,
} from './domainPassConfig.js'
import { buildDomainPassPool, collectDomainQuestionIds, computeWeakObjectivesFromResponses, mergeCarryoverSkipped } from './buildDomainPassPool.js'
import {
  loadDomainRecords,
  loadTimerEnabled,
  saveDomainPassAttempt,
  saveDomainPassFocusAttempt,
  appendMissedEntry,
  getDomainRecord,
} from './domainPassStorage.js'
import {
  getDomainSeenMap,
  getExposureStats,
  loadDomainQuestionExposure,
  recordSeen,
  recordExposureOutcome,
} from './domainQuestionExposure.js'
import { useMasteryProgress } from '../progress/MasteryProgressContext.jsx'
import { ENGAGEMENT_KINDS } from '../progress/masteryEngagement.js'
import IdkButton from '../../components/IdkButton.jsx'
import { takeLatencyMs, recordAnswerOutcome, unknownMissExtra } from '../study/answerOutcome.js'
import { diagnoseWrongAnswer } from '../../answerReview/diagnoseWrongAnswer.js'

function recordPassExposure(domainId, questionId, correct) {
  if (!domainId || !questionId) return
  recordExposureOutcome(domainId, questionId, { seen: true, correct: !!correct }).catch(() => {})
}

function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function formatSeconds(total) {
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

/**
 * Single-domain pass session — instant feedback, optional timer, adaptive pool.
 */
export default function DomainPassSession({
  domainId,
  objectiveFilter = null,
  focusMode = false,
  onExit,
  onOpenMock,
  onOpenTrapDrill,
  onOpenLab,
  onOpenLabs,
  onOpenCommandHub,
  onOpenSubnet,
  onSelectObjective,
  onStartFocus,
  onOpenPlacementPulse,
  examMode = false,
  missed = [],
}) {
  const { recordEngagement } = useMasteryProgress()
  const domain = useMemo(() => DOMAINS.find(d => d.id === domainId), [domainId])
  const [phase, setPhase] = useState('loading')
  const [error, setError] = useState(null)
  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [responses, setResponses] = useState({})
  const [studyRevealed, setStudyRevealed] = useState({})
  const [multiDraft, setMultiDraft] = useState([])
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [timerEnabled, setTimerEnabledState] = useState(true)
  const [resumedReport, setResumedReport] = useState(null)
  const [unknownFlags, setUnknownFlags] = useState({})
  const shownAtRef = useRef(null)
  const finishSaved = useRef(false)
  const prevSkippedRef = useRef([])
  const bootstrappedRef = useRef(false)

  useEffect(() => {
    setMultiDraft([])
  }, [current])

  const focusObjectiveIds = useMemo(
    () => (Array.isArray(objectiveFilter) && objectiveFilter.length ? objectiveFilter : null),
    [objectiveFilter],
  )
  const isFocusSession = focusMode || Boolean(focusObjectiveIds?.length)

  const getMcForObjective = useCallback((objectiveId) => (
    getCuratedQuestions(objectiveId).filter(isChoiceQuestion)
  ), [])

  const startSession = useCallback(async () => {
    if (!domain) {
      setError('Unknown domain.')
      setPhase('error')
      return
    }
    setPhase('loading')
    setError(null)
    setResumedReport(null)
    clearDomainPassDebriefResume()
    finishSaved.current = false
    try {
      await preloadCleanBank()
      const [records, timerOn, exposureStore] = await Promise.all([
        loadDomainRecords(),
        loadTimerEnabled(),
        loadDomainQuestionExposure(),
      ])
      setTimerEnabledState(timerOn)
      const passRecord = getDomainRecord(records, domainId)
      prevSkippedRef.current = passRecord?.skippedQuestionIds || []
      const allDomainIds = collectDomainQuestionIds(domain, getMcForObjective)
      const seenById = getDomainSeenMap(exposureStore, domainId)
      const exposureStats = getExposureStats(domainId, allDomainIds, seenById)
      const final = buildDomainPassPool({
        domain,
        getMcQuestions: getMcForObjective,
        shuffle: shuffleArray,
        weakObjectiveIds: passRecord?.weakObjectives || [],
        missedQuestions: missed,
        skippedQuestionIds: prevSkippedRef.current,
        objectiveFilter: focusObjectiveIds,
        exposureStats,
      })
      if (final.length === 0) {
        throw new Error(
          isFocusSession
            ? `No questions available for the selected objectives in ${domain.name}.`
            : `No questions available for ${domain.name}.`,
        )
      }
      setQuestions(final)
      setResponses({})
      setStudyRevealed({})
      setCurrent(0)
      const qCount = final.length
      const durationSec = timerOn
        ? (isFocusSession
          ? domainPassTimerMinutes(qCount) * 60
          : domainPassDurationSec(domain, true))
        : 0
      setSecondsLeft(durationSec)
      setPhase('active')
    } catch (err) {
      setError(err.message)
      setPhase('error')
    }
  }, [domain, domainId, getMcForObjective, missed, focusObjectiveIds, isFocusSession])

  useEffect(() => {
    bootstrappedRef.current = false
  }, [domainId])

  useEffect(() => {
    if (bootstrappedRef.current) return
    bootstrappedRef.current = true
    const resume = consumeDomainPassDebriefResume(domainId)
    if (resume?.report && Array.isArray(resume.questions) && resume.questions.length) {
      finishSaved.current = true
      setQuestions(resume.questions)
      setResponses(resume.responses || {})
      setResumedReport(resume.report)
      setPhase('done')
      return
    }
    startSession()
  }, [domainId, startSession])

  useEffect(() => {
    if (phase !== 'active' || !timerEnabled) return
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
  }, [phase, timerEnabled])

  useEffect(() => {
    if (phase === 'active' && questions[current]) {
      shownAtRef.current = Date.now()
    }
  }, [phase, current, questions])

  function selectChoice(idx) {
    if (studyRevealed[current]) return
    const q = questions[current]
    if (!isMcQuestion(q)) return
    setResponses(r => ({ ...r, [current]: idx }))
    setStudyRevealed(r => ({ ...r, [current]: true }))
    setUnknownFlags(f => ({ ...f, [current]: false }))
    if (q?.objectiveId) {
      const correct = gradeQuestion(q, idx)
      const latencyMs = takeLatencyMs(shownAtRef.current)
      recordEngagement?.(q.objectiveId, {
        kind: ENGAGEMENT_KINDS.DOMAIN_PASS,
        correct: correct ? 1 : 0,
        total: 1,
      })
      recordAnswerOutcome({
        objectiveId: q.objectiveId,
        questionId: q.id,
        correct,
        latencyMs,
        selectedIndex: idx,
      }).catch(() => {})
      recordPassExposure(domainId, q.id, correct)
      if (!correct) {
        const diagnosis = diagnoseWrongAnswer({ question: q, submittedAnswer: idx, gradeResult: correct })
        appendMissedEntry(buildMissedEntry(q.objectiveId, q, { selectedIndex: idx, diagnosis }))
      }
    }
  }

  function markUnknown() {
    if (studyRevealed[current]) return
    const q = questions[current]
    if (!isMcQuestion(q)) return
    setResponses(r => ({ ...r, [current]: null }))
    setStudyRevealed(r => ({ ...r, [current]: true }))
    setUnknownFlags(f => ({ ...f, [current]: true }))
    if (q?.objectiveId) {
      const latencyMs = takeLatencyMs(shownAtRef.current)
      recordEngagement?.(q.objectiveId, {
        kind: ENGAGEMENT_KINDS.DOMAIN_PASS,
        correct: 0,
        total: 1,
      })
      recordAnswerOutcome({
        objectiveId: q.objectiveId,
        questionId: q.id,
        correct: false,
        unknown: true,
        latencyMs,
      }).catch(() => {})
      recordPassExposure(domainId, q.id, false)
      const diagnosis = diagnoseWrongAnswer({ question: q, submittedAnswer: null, gradeResult: false })
      appendMissedEntry(buildMissedEntry(q.objectiveId, q, { ...unknownMissExtra(null), diagnosis }))
    }
  }

  function toggleMultiChoice(idx) {
    if (studyRevealed[current]) return
    const q = questions[current]
    if (!isMultiQuestion(q)) return
    setMultiDraft(prev => {
      const set = new Set(prev)
      if (set.has(idx)) set.delete(idx)
      else set.add(idx)
      return normalizeSelectedIndexes([...set])
    })
  }

  function submitMultiChoice() {
    if (studyRevealed[current] || multiDraft.length < 1) return
    const q = questions[current]
    if (!isMultiQuestion(q)) return
    const answer = normalizeSelectedIndexes(multiDraft)
    setResponses(r => ({ ...r, [current]: answer }))
    setStudyRevealed(r => ({ ...r, [current]: true }))
    if (q?.objectiveId) {
      const correct = gradeQuestion(q, answer)
      recordEngagement?.(q.objectiveId, {
        kind: ENGAGEMENT_KINDS.DOMAIN_PASS,
        correct: correct ? 1 : 0,
        total: 1,
      })
      recordAnswerOutcome({
        objectiveId: q.objectiveId,
        questionId: q.id,
        correct,
        latencyMs: takeLatencyMs(shownAtRef.current),
        selectedIndexes: answer,
      }).catch(() => {})
      recordPassExposure(domainId, q.id, correct)
      if (!correct) {
        const diagnosis = diagnoseWrongAnswer({ question: q, submittedAnswer: answer, gradeResult: correct })
        appendMissedEntry(buildMissedEntry(q.objectiveId, q, { selectedIndexes: answer, diagnosis }))
      }
    }
  }

  const report = useMemo(() => {
    if (resumedReport) return resumedReport
    if (phase !== 'done') return null
    const byDomain = {}
    DOMAINS.forEach(d => { byDomain[d.id] = { name: d.name, correct: 0, total: 0 } })
    let correct = 0
    questions.forEach((q, idx) => {
      const domainIdx = parseInt((q.objectiveId || '1.1').split('.')[0], 10) - 1
      const d = DOMAINS[domainIdx] || DOMAINS[0]
      byDomain[d.id].total++
      if (gradeQuestion(q, responses[idx])) {
        byDomain[d.id].correct++
        correct++
      }
    })
    const trapDebrief = summarizeWrongTraps(
      questions,
      questions.map((_, idx) => responses[idx]),
    )
    return { correct, total: questions.length, byDomain, trapDebrief }
  }, [resumedReport, phase, questions, responses])

  useEffect(() => {
    if (phase !== 'done' || !report || finishSaved.current || !domainId) return
    finishSaved.current = true
    const weakObjectiveIds = computeWeakObjectivesFromResponses(questions, responses)
    const skippedQuestionIds = mergeCarryoverSkipped(prevSkippedRef.current, questions, responses)
    const sessionQuestionIds = questions.map(q => q.id ?? q.questionId).filter(id => id != null)
    recordSeen(domainId, sessionQuestionIds)
    if (isFocusSession) {
      saveDomainPassFocusAttempt(domainId, {
        correct: report.correct,
        total: report.total,
        objectiveIds: focusObjectiveIds || [],
        weakObjectiveIds,
        skippedQuestionIds,
      })
      return
    }
    saveDomainPassAttempt(domainId, {
      correct: report.correct,
      total: report.total,
      weakObjectiveIds,
      skippedQuestionIds,
    })
  }, [phase, report, domainId, questions, responses, isFocusSession, focusObjectiveIds])

  if (!domain && phase !== 'loading') {
    return (
      <div>
        <StudyModeHeader title="Domain Pass" onBack={onExit} />
        <ErrorBox message="Unknown domain." onRetry={onExit} />
      </div>
    )
  }

  if (phase === 'loading') {
    return <Spinner label={isFocusSession ? `Building focus pass…` : `Building ${domain?.name || 'domain'} pass...`} />
  }
  if (phase === 'error') {
    return <ErrorBox message={error} onRetry={startSession} />
  }

  if (phase === 'done' && report) {
    return (
      <DomainPassResultsScreen
        report={report}
        questions={questions}
        responses={responses}
        domainId={domainId}
        domain={domain}
        isFocusSession={isFocusSession}
        focusObjectiveIds={focusObjectiveIds}
        missed={missed}
        onExit={onExit}
        onOpenMock={onOpenMock}
        onOpenTrapDrill={onOpenTrapDrill}
        onOpenLab={onOpenLab}
        onOpenLabs={onOpenLabs}
        onOpenCommandHub={onOpenCommandHub}
        onOpenSubnet={onOpenSubnet}
        onSelectObjective={onSelectObjective}
        onStartFocus={onStartFocus}
        onOpenPlacementPulse={onOpenPlacementPulse}
        onRetake={() => { setResumedReport(null); startSession() }}
      />
    )
  }

  const q = questions[current]
  const selected = responses[current]
  const isCurrentRevealed = !!studyRevealed[current]
  const multi = isMultiQuestion(q)
  const isCurrentCorrect = selected != null && gradeQuestion(q, selected)
  const studyAnsweredCount = Object.keys(studyRevealed).length
  const studyCorrectCount = Object.keys(studyRevealed).filter(
    idx => {
      const i = parseInt(idx, 10)
      const qq = questions[i]
      return qq && gradeQuestion(qq, responses[i])
    },
  ).length
  const questionTotal = questions.length

  return (
    <div>
      <StudyModeHeader
        title={isFocusSession ? `${domain.name} — Focus` : domain.name}
        onBack={onExit}
        backLabel="Exit"
      />
      {isFocusSession && (
        <div style={{ ...styles.small, marginBottom: 8, color: COLORS.sky, lineHeight: 1.4 }}>
          Focus pass · {focusObjectiveIds?.join(', ')}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={styles.small}>Question {current + 1} / {questionTotal}</div>
        {timerEnabled && (
          <div style={{ ...styles.pill(secondsLeft < 300 ? 'rose' : 'sky') }}>{formatSeconds(secondsLeft)}</div>
        )}
        {!timerEnabled && studyAnsweredCount > 0 && (
          <div style={{ ...styles.pill(studyCorrectCount / studyAnsweredCount >= DOMAIN_PASS_PASS_PCT / 100 ? 'mint' : 'rose') }}>
            {studyCorrectCount}/{studyAnsweredCount} correct
          </div>
        )}
      </div>
      <div style={styles.card}>
        <QuestionMeta q={q} />
        <QuizQuestionStem text={q.question} />
        <McChoiceShuffleProvider q={q}>
        {multi ? (
          <MultiChoices
            q={q}
            selectedIndexes={isCurrentRevealed ? (Array.isArray(selected) ? selected : []) : multiDraft}
            revealed={isCurrentRevealed}
            onToggle={toggleMultiChoice}
          />
        ) : (
          <McChoices q={q} selected={typeof selected === 'number' ? selected : null} revealed={isCurrentRevealed} onSelect={selectChoice} />
        )}
        {multi && !isCurrentRevealed && (
          <button
            type="button"
            style={{ ...styles.primaryBtn, marginTop: 10 }}
            disabled={multiDraft.length < 1}
            onClick={submitMultiChoice}
          >
            Check answers
          </button>
        )}
        {!isCurrentRevealed && !multi && (
          <>
            <IdkButton onClick={markUnknown} />
            <div style={{ ...styles.small, marginTop: 10, textAlign: 'center', color: COLORS.silverMid }}>
              Select an answer to see instant feedback
            </div>
          </>
        )}
        {isCurrentRevealed && (
          <div
            className="ccna-quiz-reveal"
            style={{
              marginTop: 10, padding: 12, borderRadius: 10,
              background: isCurrentCorrect ? COLORS.mintDim : (unknownFlags[current] ? COLORS.amberDim : COLORS.roseDim),
              border: `2px solid ${isCurrentCorrect ? COLORS.mintBorder : (unknownFlags[current] ? COLORS.amberBorder : COLORS.rose)}`,
            }}
          >
            <div style={{
              fontWeight: 700,
              color: isCurrentCorrect ? COLORS.mint : (unknownFlags[current] ? COLORS.amber : COLORS.rose),
              marginBottom: 6,
              fontSize: 'var(--ccna-type-sm)',
            }}>
              {isCurrentCorrect ? '✓ Correct!' : (unknownFlags[current] ? '○ Unknown' : '✗ Incorrect')}
            </div>
            <AnswerReview {...answerReviewSessionProps({
              q,
              selected: typeof selected === 'number' ? selected : undefined,
              selectedIndexes: Array.isArray(selected) ? selected : undefined,
              hideExamTip: examMode,
              domainId,
              onOpenLab,
              onOpenTrapDrill,
              onOpenSubnet,
            })} />
          </div>
        )}
        </McChoiceShuffleProvider>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <button type="button" style={styles.secondaryBtn} disabled={current === 0} onClick={() => setCurrent(c => Math.max(0, c - 1))}>Previous</button>
        {current < questionTotal - 1 ? (
          <button type="button" style={styles.primaryBtn} onClick={() => setCurrent(c => Math.min(questionTotal - 1, c + 1))}>
            Next →
          </button>
        ) : (
          <button type="button" style={styles.primaryBtn} onClick={() => setPhase('done')}>
            {isFocusSession ? 'Finish focus' : 'Finish pass'}
          </button>
        )}
      </div>
      {current !== questionTotal - 1 && (
        <button
          type="button"
          style={{ ...styles.secondaryBtn, marginTop: 8, background: 'none', border: 'none', color: COLORS.silverMid }}
          onClick={() => setPhase('done')}
        >
          {isFocusSession ? 'Finish focus now' : 'Finish pass now'}
        </button>
      )}
    </div>
  )
}
