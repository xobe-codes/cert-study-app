import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { DOMAINS } from '../../data/ccnaDomains.js'
import { preloadCleanBankForObjective } from '../../data/cleanQuestionAdapter.js'
import { gradeQuestion, buildMissedEntry } from '../../questionUtils.js'
import { COLORS, styles } from '../../ui/appTheme.js'
import McChoices from '../../components/McChoices.jsx'
import AnswerReview from '../../components/AnswerReview.jsx'
import { McChoiceShuffleProvider } from '../../context/McChoiceShuffleContext.jsx'
import { QuestionMeta, QuizQuestionStem } from '../../components/QuizQuestionChrome.jsx'
import Spinner from '../../components/Spinner.jsx'
import ErrorBox from '../../components/ErrorBox.jsx'
import { buildPlacementPool, computeWeakObjectivesFromPlacement } from './buildPlacementPool.js'
import { computePlacementReport } from './computePlacementReport.js'
import { loadPlacementRecord, savePlacementAttempt } from './domainPlacementStorage.js'
import { buildDomainBaselineSummary } from './domainBaselineProfile.js'
import { getSprintObjectiveIdsForDomain } from './domainBaselineStudyPlan.js'
import { stashPlacementDebriefResume, consumePlacementDebriefResume, clearPlacementDebriefResume } from './placementDebriefResume.js'
import { buildStudyObjectiveHandoff } from '../../study/studyObjectiveHandoff.js'
import DomainPlacementDebrief from './DomainPlacementDebrief.jsx'
import StudyModeHeader from '../../components/StudyModeHeader.jsx'
import { appendMissedEntry } from '../domainPass/domainPassStorage.js'
import { useMasteryProgress } from '../progress/MasteryProgressContext.jsx'
import { ENGAGEMENT_KINDS } from '../progress/masteryEngagement.js'

/**
 * Fixed-blueprint domain placement — instant feedback, delta debrief, one CTA.
 */
export default function DomainPlacementSession({
  domainId,
  sessionModeHint = null,
  onExit,
  onStudyObjective,
  onStudyWeakObjectives,
  onOpenTrapDrill,
  onOpenExamTraps,
  onOpenLab,
}) {
  const { recordEngagement } = useMasteryProgress()
  const domain = useMemo(() => DOMAINS.find(d => d.id === domainId), [domainId])
  const [phase, setPhase] = useState('loading')
  const [error, setError] = useState(null)
  const [questions, setQuestions] = useState([])
  const [trapByQuestionId, setTrapByQuestionId] = useState({})
  const [blueprintVersion, setBlueprintVersion] = useState(1)
  const [current, setCurrent] = useState(0)
  const [responses, setResponses] = useState({})
  const [revealed, setRevealed] = useState({})
  const [previousAttempt, setPreviousAttempt] = useState(null)
  const [sessionMode, setSessionMode] = useState('baseline')
  const [adaptiveWeakObjectives, setAdaptiveWeakObjectives] = useState([])
  const [resumedReport, setResumedReport] = useState(null)
  const finishSaved = useRef(false)

  const startSession = useCallback(async () => {
    if (!domain) {
      setError('Unknown domain.')
      setPhase('error')
      return
    }
    setPhase('loading')
    setError(null)
    finishSaved.current = false
    try {
      const seedObjectiveId = domain.objectives[0]?.id
      if (seedObjectiveId) await preloadCleanBankForObjective(seedObjectiveId)
      const record = await loadPlacementRecord(domainId)
      setPreviousAttempt(record?.lastAttempt || null)
      const weakIds = record?.lastAttempt
        ? (record.lastAttempt.weakObjectives
          || computeWeakObjectivesFromPlacement(record.lastAttempt.byObjective))
        : []

      let pool
      if (sessionModeHint === 'maintenance' && record?.lastAttempt?.testedOut) {
        pool = buildPlacementPool(domainId, { mode: 'maintenance' })
      } else if (record?.lastAttempt) {
        const summary = buildDomainBaselineSummary({ domain, lastAttempt: record.lastAttempt })
        const sprintIds = getSprintObjectiveIdsForDomain(domain, record)
        if (sprintIds.length && sprintIds.length < domain.objectives.length) {
          pool = buildPlacementPool(domainId, {
            mode: 'sprint',
            sprintObjectiveIds: sprintIds,
            weakObjectiveIds: summary.weakObjectives,
          })
        } else {
          pool = buildPlacementPool(domainId, { weakObjectiveIds: weakIds })
        }
      } else {
        pool = buildPlacementPool(domainId)
      }
      setQuestions(pool.questions)
      setTrapByQuestionId(pool.trapByQuestionId)
      setBlueprintVersion(pool.blueprintVersion)
      setSessionMode(pool.mode)
      setAdaptiveWeakObjectives(pool.weakObjectiveIds || [])
      setResponses({})
      setRevealed({})
      setCurrent(0)
      setPhase('active')
    } catch (err) {
      setError(err.message)
      setPhase('error')
    }
  }, [domain, domainId, sessionModeHint])

  useEffect(() => {
    const resume = consumePlacementDebriefResume(domainId)
    if (resume?.report) {
      setPreviousAttempt(resume.previousAttempt || null)
      setSessionMode(resume.sessionMode || 'baseline')
      setAdaptiveWeakObjectives(resume.adaptiveWeakObjectives || [])
      setResumedReport(resume.report)
      setPhase('done')
      return
    }
    startSession()
  }, [domainId, startSession])

  function selectChoice(idx) {
    if (revealed[current]) return
    setResponses(r => ({ ...r, [current]: idx }))
    setRevealed(r => ({ ...r, [current]: true }))
    const q = questions[current]
    if (q?.objectiveId) {
      const correct = gradeQuestion(q, idx)
      recordEngagement?.(q.objectiveId, {
        kind: ENGAGEMENT_KINDS.DOMAIN_PLACEMENT,
        correct: correct ? 1 : 0,
        total: 1,
      })
      if (!correct) appendMissedEntry(buildMissedEntry(q.objectiveId, q, { selectedIndex: idx }))
    }
  }

  function next() {
    if (current + 1 >= questions.length) {
      setPhase('done')
      return
    }
    setCurrent(c => c + 1)
  }

  const report = useMemo(() => {
    if (resumedReport) return resumedReport
    if (phase !== 'done') return null
    return computePlacementReport({ questions, responses, trapByQuestionId })
  }, [resumedReport, phase, questions, responses, trapByQuestionId])

  function stashDebriefResume() {
    if (!report) return
    stashPlacementDebriefResume(domainId, {
      report,
      previousAttempt,
      sessionMode,
      adaptiveWeakObjectives,
    })
  }

  function handleStudyObjective(objectiveOrId) {
    stashDebriefResume()
    if (objectiveOrId?.id && objectiveOrId?.domainId) {
      onStudyObjective?.(objectiveOrId)
      return
    }
    const handoff = buildStudyObjectiveHandoff(objectiveOrId, { tab: 'Practice' })
    if (handoff) onStudyObjective?.(handoff)
    else onStudyObjective?.(objectiveOrId)
  }

  function handleStudyWeakObjectives(objectiveIds) {
    stashDebriefResume()
    onStudyWeakObjectives?.(objectiveIds)
  }

  function handleRetake() {
    setResumedReport(null)
    clearPlacementDebriefResume()
    startSession()
  }

  function handleExit() {
    clearPlacementDebriefResume()
    onExit?.()
  }

  useEffect(() => {
    if (phase !== 'done' || !report || finishSaved.current) return
    finishSaved.current = true
    if (sessionMode === 'maintenance') return
    savePlacementAttempt(domainId, {
      at: Date.now(),
      pct: report.pct,
      trapPct: report.trapPct,
      byObjective: report.byObjective,
      trapMisses: report.trapMisses,
      blueprintVersion,
      correct: report.correct,
      total: report.total,
    })
  }, [phase, report, domainId, blueprintVersion, sessionMode])

  if (!domain && phase !== 'loading') {
    return <ErrorBox message="Unknown domain." onRetry={onExit} />
  }
  if (phase === 'loading') {
    return <Spinner label={`Loading ${domain?.name || 'domain'} placement…`} />
  }
  if (phase === 'error') {
    return <ErrorBox message={error} onRetry={startSession} />
  }

  if (phase === 'done' && report) {
    return (
      <div className="ccna-placement-flow ccna-review-flow">
        <StudyModeHeader title={domain.name} onBack={onExit} subtitle="Placement results" />
        <DomainPlacementDebrief
          domainId={domainId}
          domainName={domain.name}
          domain={domain}
          report={report}
          previousAttempt={previousAttempt}
          sessionMode={sessionMode}
          adaptiveWeakObjectives={adaptiveWeakObjectives}
          onStudyObjective={handleStudyObjective}
          onStudyWeakObjectives={handleStudyWeakObjectives}
          onOpenTrapDrill={onOpenTrapDrill}
          onOpenExamTraps={onOpenExamTraps}
          onOpenLab={onOpenLab}
          onRetake={handleRetake}
          onExit={handleExit}
        />
      </div>
    )
  }

  const q = questions[current]
  const selected = responses[current]
  const isRevealed = !!revealed[current]
  const isCorrect = isRevealed && selected != null && gradeQuestion(q, selected)
  const answered = Object.keys(revealed).length
  const progressPct = questions.length ? Math.round((answered / questions.length) * 100) : 0

  return (
    <div className="ccna-placement-flow ccna-review-flow">
      <StudyModeHeader title={domain.name} onBack={onExit} backLabel="Exit" />
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 8 }}>
        <span style={styles.small}>{answered} / {questions.length} · Placement</span>
      </div>
      <div
        style={{ height: 4, borderRadius: 999, background: COLORS.surface, marginBottom: 10, overflow: 'hidden' }}
        aria-hidden
      >
        <div
          style={{
            height: '100%',
            width: `${progressPct}%`,
            borderRadius: 999,
            background: COLORS.sky,
            transition: 'width .25s ease',
          }}
        />
      </div>
      <div style={{ ...styles.small, marginBottom: 8, color: COLORS.silverMid }}>
        {domain.name}
        {sessionMode === 'maintenance'
          ? ' — maintenance pulse (3 trap stems, baseline unchanged)'
          : sessionMode === 'sprint'
            ? ' — sprint (weak + unsampled objectives only)'
            : sessionMode === 'adaptive'
              ? ` — adaptive retake (${adaptiveWeakObjectives.length} weak objective${adaptiveWeakObjectives.length === 1 ? '' : 's'} first)`
              : ' — full domain map (every subsection sampled once)'}
      </div>
      <div style={styles.card}>
        <QuestionMeta q={q} />
        <QuizQuestionStem text={q.question} />
        <McChoiceShuffleProvider q={q}>
        <McChoices q={q} selected={selected} revealed={isRevealed} onSelect={selectChoice} />
        {isRevealed && (
          <div className="ccna-quiz-reveal" style={{ marginTop: 8, padding: 12, borderRadius: 10, background: isCorrect ? COLORS.mintDim : COLORS.roseDim, border: `2px solid ${isCorrect ? COLORS.mintBorder : COLORS.rose}` }}>
            <div style={{ fontWeight: 700, color: isCorrect ? COLORS.mint : COLORS.rose, marginBottom: 4, fontSize: 'var(--ccna-type-sm)' }}>
              {isCorrect ? 'Correct' : 'Incorrect'}
            </div>
            <AnswerReview q={q} selected={selected} objectiveId={q.objectiveId} />
          </div>
        )}
        </McChoiceShuffleProvider>
      </div>
      {isRevealed && (
        <button type="button" style={styles.primaryBtn} onClick={next}>
          {current + 1 >= questions.length ? 'See results' : 'Next'}
        </button>
      )}
    </div>
  )
}
