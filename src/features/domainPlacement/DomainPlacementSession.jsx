import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { DOMAINS } from '../../data/ccnaDomains.js'
import { preloadCleanBank } from '../../data/cleanQuestionAdapter.js'
import { gradeQuestion, buildMissedEntry } from '../../questionUtils.js'
import { COLORS, styles } from '../../ui/appTheme.js'
import McChoices from '../../components/McChoices.jsx'
import AnswerReview from '../../components/AnswerReview.jsx'
import { QuestionMeta } from '../../components/QuizQuestionChrome.jsx'
import Spinner from '../../components/Spinner.jsx'
import ErrorBox from '../../components/ErrorBox.jsx'
import { buildPlacementPool } from './buildPlacementPool.js'
import { computePlacementReport } from './computePlacementReport.js'
import { loadPlacementRecord, savePlacementAttempt } from './domainPlacementStorage.js'
import DomainPlacementDebrief from './DomainPlacementDebrief.jsx'
import { appendMissedEntry } from '../domainPass/domainPassStorage.js'

/**
 * Fixed-blueprint domain placement — instant feedback, delta debrief, one CTA.
 */
export default function DomainPlacementSession({
  domainId,
  onExit,
  onStudyObjective,
  onOpenTrapDrill,
  onOpenLab,
}) {
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
      await preloadCleanBank()
      const record = await loadPlacementRecord(domainId)
      setPreviousAttempt(record?.lastAttempt || null)
      const pool = buildPlacementPool(domainId)
      setQuestions(pool.questions)
      setTrapByQuestionId(pool.trapByQuestionId)
      setBlueprintVersion(pool.blueprintVersion)
      setResponses({})
      setRevealed({})
      setCurrent(0)
      setPhase('active')
    } catch (err) {
      setError(err.message)
      setPhase('error')
    }
  }, [domain, domainId])

  useEffect(() => {
    startSession()
  }, [startSession])

  function selectChoice(idx) {
    if (revealed[current]) return
    setResponses(r => ({ ...r, [current]: idx }))
    setRevealed(r => ({ ...r, [current]: true }))
    const q = questions[current]
    if (q && !gradeQuestion(q, idx)) {
      appendMissedEntry(buildMissedEntry(q.objectiveId, q, { selectedIndex: idx }))
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
    if (phase !== 'done') return null
    return computePlacementReport({ questions, responses, trapByQuestionId })
  }, [phase, questions, responses, trapByQuestionId])

  useEffect(() => {
    if (phase !== 'done' || !report || finishSaved.current) return
    finishSaved.current = true
    savePlacementAttempt(domainId, {
      at: Date.now(),
      pct: report.pct,
      trapPct: report.trapPct,
      byObjective: report.byObjective,
      blueprintVersion,
      correct: report.correct,
      total: report.total,
    })
  }, [phase, report, domainId, blueprintVersion])

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
        <button type="button" style={styles.backBtn} onClick={onExit}>‹ Back</button>
        <DomainPlacementDebrief
          domainName={domain.name}
          report={report}
          previousAttempt={previousAttempt}
          onStudyObjective={onStudyObjective}
          onOpenTrapDrill={onOpenTrapDrill}
          onOpenLab={onOpenLab}
          onRetake={startSession}
          onExit={onExit}
        />
      </div>
    )
  }

  const q = questions[current]
  const selected = responses[current]
  const isRevealed = !!revealed[current]
  const isCorrect = isRevealed && selected != null && gradeQuestion(q, selected)
  const answered = Object.keys(revealed).length

  return (
    <div className="ccna-placement-flow ccna-review-flow">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
        <button type="button" style={{ ...styles.backBtn, marginBottom: 0, padding: '8px 0' }} onClick={onExit}>‹ Exit</button>
        <span style={styles.small}>{answered} / {questions.length} · Placement</span>
      </div>
      <div style={{ ...styles.small, marginBottom: 8, color: COLORS.silverMid }}>
        {domain.name} — fixed diagnostic set (compare scores over time)
      </div>
      <div style={styles.card}>
        <QuestionMeta q={q} />
        <div style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 600, marginBottom: 14, lineHeight: 1.5, overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
          {q.question}
        </div>
        <McChoices q={q} selected={selected} revealed={isRevealed} onSelect={selectChoice} />
        {isRevealed && (
          <div className="ccna-quiz-reveal" style={{ marginTop: 8, padding: 12, borderRadius: 10, background: isCorrect ? COLORS.mintDim : COLORS.roseDim, border: `2px solid ${isCorrect ? COLORS.mintBorder : COLORS.rose}` }}>
            <div style={{ fontWeight: 700, color: isCorrect ? COLORS.mint : COLORS.rose, marginBottom: 4, fontSize: 'var(--ccna-type-sm)' }}>
              {isCorrect ? 'Correct' : 'Incorrect'}
            </div>
            <AnswerReview q={q} selected={selected} objectiveId={q.objectiveId} />
          </div>
        )}
      </div>
      {isRevealed && (
        <button type="button" style={styles.primaryBtn} onClick={next}>
          {current + 1 >= questions.length ? 'See results' : 'Next'}
        </button>
      )}
    </div>
  )
}
