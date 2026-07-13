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
import MockExamDebriefActions from '../mockExam/MockExamDebriefActions.jsx'
import StudyModeHeader from '../../components/StudyModeHeader.jsx'
import Spinner from '../../components/Spinner.jsx'
import ErrorBox from '../../components/ErrorBox.jsx'
import { QuizQuestionStem, QuestionMeta } from '../../components/QuizQuestionChrome.jsx'
import { getDomainStudyMeta } from '../../home/domainStudyRoutes.js'
import { buildDomainPassWeakStudyHandoff } from './domainPassWeakStudy.js'
import WeakAreasCompact from './WeakAreasCompact.jsx'
import ResultsNextAction from './ResultsNextAction.jsx'
import {
  stashDomainPassDebriefResume,
  consumeDomainPassDebriefResume,
  clearDomainPassDebriefResume,
} from './domainPassDebriefResume.js'
import {
  DOMAIN_PASS_PASS_PCT,
  domainPassDurationSec,
  domainPassTimerMinutes,
  isDomainPassPassed,
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
} from './domainQuestionExposure.js'
import { useMasteryProgress } from '../progress/MasteryProgressContext.jsx'
import { ENGAGEMENT_KINDS } from '../progress/masteryEngagement.js'
import { shouldShowWildcardBridge } from '../practice/trapStreak.js'
import { isPlacementDomain } from '../domainPlacement/placementBlueprints.js'
import IdkButton from '../../components/IdkButton.jsx'
import { takeLatencyMs, recordAnswerOutcome, unknownMissExtra } from '../study/answerOutcome.js'

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
  const [showMoreTools, setShowMoreTools] = useState(false)
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
      if (!correct) appendMissedEntry(buildMissedEntry(q.objectiveId, q, { selectedIndex: idx }))
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
      appendMissedEntry(buildMissedEntry(q.objectiveId, q, unknownMissExtra(null)))
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
      if (!correct) appendMissedEntry(buildMissedEntry(q.objectiveId, q, { selectedIndexes: answer }))
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
    const pct = report.total > 0 ? Math.round((report.correct / report.total) * 100) : 0
    const passed = isDomainPassPassed(pct)
    const skippedCount = report.total - Object.keys(responses).length
    const wrongCount = report.total - report.correct - skippedCount

    const weakObjectiveIds = computeWeakObjectivesFromResponses(questions, responses)
    const domainMeta = getDomainStudyMeta(domainId)
    const showTrapCta = Boolean(onOpenTrapDrill)
    const showLabsCta = domainMeta.labCount > 0 && Boolean(onOpenLabs)
    const showCommandHubCta = Boolean(onOpenCommandHub)
    const showWildcardCta = shouldShowWildcardBridge(domainId, onOpenSubnet)
    const showDomainActions = showTrapCta || showLabsCta || showCommandHubCta || showWildcardCta
    const topWeakId = weakObjectiveIds[0] || null

    function stashDebriefResume() {
      if (!report || !questions.length) return
      stashDomainPassDebriefResume(domainId, { report, questions, responses })
    }

    function openWeakStudy(objectiveId) {
      if (!onSelectObjective) return
      stashDebriefResume()
      const handoff = buildDomainPassWeakStudyHandoff(domain, objectiveId)
      if (handoff) onSelectObjective(handoff)
    }

    function handleExit() {
      clearDomainPassDebriefResume()
      onExit?.()
    }

    function handleRetake() {
      setResumedReport(null)
      clearDomainPassDebriefResume()
      startSession()
    }

    const domainActionBtn = {
      ...styles.secondaryBtn,
      width: '100%',
      textAlign: 'left',
      fontSize: 'var(--ccna-type-sm)',
      padding: '8px 10px',
      marginBottom: 4,
    }

    return (
      <div>
        <StudyModeHeader
          title={isFocusSession ? `${domain.name} — Focus results` : `${domain.name} — Results`}
          onBack={handleExit}
          backLabel="Domain Pass"
        />
        {isFocusSession && (
          <div style={{ ...styles.card, marginBottom: 8, border: `1px solid ${COLORS.skyBorder}`, background: COLORS.skyDim }}>
            <div style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.sky, fontWeight: 600, lineHeight: 1.45 }}>
              Focus practice — does not replace full domain pass
            </div>
            {focusObjectiveIds?.length > 0 && (
              <div style={{ ...styles.small, marginTop: 6, marginBottom: 0 }}>
                Topics: {focusObjectiveIds.join(', ')}
              </div>
            )}
          </div>
        )}
        <div style={styles.card}>
          <div style={{ fontSize: 'var(--ccna-type-display)', fontWeight: 700, color: passed ? COLORS.mint : COLORS.rose }}>
            {pct}%
          </div>
          <div style={{ ...styles.pill(passed ? 'mint' : 'rose'), display: 'inline-block', marginTop: 8, marginBottom: 8 }}>
            {passed ? 'PASS' : 'FAIL'}
          </div>
          <div style={styles.small}>{report.correct} / {report.total} correct</div>
          <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.mint }}>✓ {report.correct} correct</span>
            {wrongCount > 0 && <span style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.rose }}>✗ {wrongCount} incorrect</span>}
            {skippedCount > 0 && <span style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.amber }}>— {skippedCount} skipped</span>}
          </div>
          {skippedCount > 0 && (
            <div style={{ ...styles.small, marginTop: 8, marginBottom: 0, color: COLORS.amber }}>
              Skipped questions are queued for your next pass.
            </div>
          )}
        </div>
        {/* Clean weak areas display (top 3 only) */}
        <WeakAreasCompact
          domainId={domainId}
          weakObjectiveIds={weakObjectiveIds}
          responses={responses}
          questions={questions}
          onSelectObjective={onSelectObjective}
        />

        {/* Smart next action based on pass/fail */}
        <ResultsNextAction
          passed={passed}
          pct={pct}
          weakObjectiveIds={weakObjectiveIds}
          topWeakId={topWeakId}
          onNextDomain={null}
          onStudyWeak={weakObjectiveIds.length > 0 && onSelectObjective ? () => {
            const handoff = buildDomainPassWeakStudyHandoff(domain, weakObjectiveIds[0])
            if (handoff) {
              stashDebriefResume()
              onSelectObjective(handoff)
            }
          } : undefined}
          onRetake={() => handleRetake()}
          isFocusSession={isFocusSession}
        />
        <MockExamDebriefActions
          report={report}
          questions={questions}
          responses={responses}
          domains={DOMAINS}
          missed={missed}
          onOpenTrapDrill={onOpenTrapDrill ? (prefill) => {
            stashDebriefResume()
            onOpenTrapDrill(prefill)
          } : undefined}
          onOpenLab={onOpenLab ? (labId) => {
            stashDebriefResume()
            onOpenLab(labId)
          } : undefined}
          onStudyDomain={() => openWeakStudy(topWeakId)}
          onSelectObjective={onSelectObjective ? (handoffOrId) => {
            const oid = typeof handoffOrId === 'object' ? handoffOrId?.id : handoffOrId
            openWeakStudy(oid)
          } : undefined}
          onOpenDomainPass={onStartFocus ? (opts) => {
            stashDebriefResume()
            onStartFocus({
              domainId: opts?.domainId || domainId,
              objectiveIds: opts?.focusObjectiveIds || opts?.objectiveIds,
            })
          } : undefined}
        />
        {/* Collapsible secondary tools */}
        {showDomainActions && (
          <div style={{ ...styles.card, marginBottom: 8 }}>
            <button
              type="button"
              onClick={() => setShowMoreTools(!showMoreTools)}
              style={{
                width: '100%',
                textAlign: 'left',
                background: 'transparent',
                border: 'none',
                color: COLORS.text,
                cursor: 'pointer',
                fontSize: 'var(--ccna-type-sm)',
                fontWeight: 600,
                padding: 0,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              More options
              <span style={{ fontSize: 'var(--ccna-type-xs)' }}>
                {showMoreTools ? '▼' : '▶'}
              </span>
            </button>

            {showMoreTools && (
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {showTrapCta && (
                  <button
                    type="button"
                    style={domainActionBtn}
                    onClick={() => {
                      stashDebriefResume()
                      onOpenTrapDrill({ domainId })
                    }}
                  >
                    Trap drill (this domain) →
                  </button>
                )}
                {showLabsCta && (
                  <button
                    type="button"
                    style={domainActionBtn}
                    onClick={() => {
                      stashDebriefResume()
                      onOpenLabs({ domainId })
                    }}
                  >
                    Domain labs ({domainMeta.labCount}) →
                  </button>
                )}
                {showCommandHubCta && (
                  <button
                    type="button"
                    style={domainActionBtn}
                    onClick={() => {
                      stashDebriefResume()
                      onOpenCommandHub({ domainId, tab: 'sprint' })
                    }}
                  >
                    Command Hub →
                  </button>
                )}
                {showWildcardCta && (
                  <button
                    type="button"
                    style={{ ...domainActionBtn, marginBottom: 0 }}
                    onClick={() => {
                      stashDebriefResume()
                      onOpenSubnet()
                    }}
                  >
                    Subnetting Wildcard (ACL/OSPF) →
                  </button>
                )}
              </div>
            )}
          </div>
        )}
        {isFocusSession && weakObjectiveIds.length > 0 && onStartFocus && (
          <button
            type="button"
            style={{ ...styles.secondaryBtn, marginBottom: 8 }}
            onClick={() => onStartFocus({ domainId, objectiveIds: weakObjectiveIds })}
          >
            Focus these topics ({weakObjectiveIds.join(', ')}) →
          </button>
        )}
        {!isFocusSession && onOpenMock && (
          <button
            type="button"
            style={{ ...styles.secondaryBtn, marginBottom: 8 }}
            onClick={() => {
              stashDebriefResume()
              onOpenMock({ domainId })
            }}
          >
            Take domain mock
          </button>
        )}
        <button type="button" style={styles.primaryBtn} onClick={handleRetake}>
          {isFocusSession ? 'Retake focus pass' : 'Retake domain pass'}
        </button>
        <button type="button" style={{ ...styles.secondaryBtn, marginTop: 8 }} onClick={handleExit}>Back to domains</button>
      </div>
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
