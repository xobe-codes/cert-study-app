import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { DOMAINS } from './data/ccnaDomains.js'
import { getCuratedQuestions } from './data/ccnaCurated.js'
import { preloadCleanBank } from './data/cleanQuestionAdapter.js'
import { isChoiceQuestion, isMcQuestion, isMultiQuestion, gradeQuestion, normalizeSelectedIndexes, buildMissedEntry } from './questionUtils.js'
import {
  MOCK_EXAM_QUESTION_COUNT,
  MOCK_EXAM_DURATION_MIN,
  staticMockExamReady,
  buildStaticMockExamPool,
  buildBlueprintWeightedPool,
  computeDomainWeakness,
} from './mockExamConfig.js'
import {
  buildDomainStudyPool,
  countDomainStudyPool,
  DOMAIN_STUDY_DEFAULT_SIZE,
  DOMAIN_STUDY_SIZE_OPTIONS,
  resolveSelectedDomains,
  validateDomainStudyStart,
} from './domainStudyConfig.js'
import {
  buildBankBurnPool,
  collectMissRetryIds,
  computeBankCoverage,
  domainSimDurationSec,
} from './features/mockExam/bankBurnPool.js'
import {
  domainIdFromObjectiveId,
  loadDomainQuestionExposure,
  recordSeen,
} from './features/domainPass/domainQuestionExposure.js'
import { COLORS, styles, accentColors } from './ui/appTheme.js'
import { STATIC_COPY } from './ui/staticContentCopy.js'
import { STORAGE_KEYS } from './storageKeys.js'
import { buildMockHistoryEntry } from './features/mockExam/mockHistoryEntry.js'
import { useMasteryProgress } from './features/progress/MasteryProgressContext.jsx'
import { aggregateSessionByObjective, ENGAGEMENT_KINDS } from './features/progress/masteryEngagement.js'
import McChoices from './components/McChoices.jsx'
import MultiChoices from './components/MultiChoices.jsx'
import IdkButton from './components/IdkButton.jsx'
import { takeLatencyMs, recordAnswerOutcome, unknownMissExtra } from './features/study/answerOutcome.js'
import { diagnoseWrongAnswer } from './answerReview/diagnoseWrongAnswer.js'
import { appendMissedEntry } from './features/domainPass/domainPassStorage.js'
import AnswerReview from './components/AnswerReview.jsx'
import { answerReviewSessionProps } from './components/answerReviewSessionProps.js'
import { McChoiceShuffleProvider } from './context/McChoiceShuffleContext.jsx'
import { summarizeWrongTraps } from './missed/missedTrapGroups.js'
import { computeCkuWeakness } from './weaknessUtils.js'
import { applyAnswerReviewToQuestion, inferTrapForChoice } from './answerReviewLogic.js'
import DeferredExamTips from './components/DeferredExamTips.jsx'
import MockExamDebriefActions from './features/mockExam/MockExamDebriefActions.jsx'
import StudyModeHeader from './components/StudyModeHeader.jsx'
import { useMobileGestureBlock } from './ui/useMobileGestureBlock.js'
import Spinner from './components/Spinner.jsx'
import ErrorBox from './components/ErrorBox.jsx'
import { QuizQuestionStem, QuestionMeta } from './components/QuizQuestionChrome.jsx'
import { useNavHint } from './components/NavHintProvider.jsx'
import { NAV_HINT_KEYS } from './ui/navHintConfig.js'

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

export default function MockExam({ onExit, examMode = false, missed = [], initialDomainId = null, initialMode = null, initialMissOnly = false, onOpenLab, onOpenTrapDrill, onSelectObjective, onOpenMockInterview, onOpenDomainPass }) {
  const showNavHint = useNavHint()
  const { recordEngagement } = useMasteryProgress()
  const doneHintFired = useRef(false)
  const examEngagementSaved = useRef(false)
  const exposureSaved = useRef(false)
  const [phase, setPhase] = useState('intro') // intro | loading | active | done | review | error
  const [introTab, setIntroTab] = useState('full') // full (Exam sim) | bank (Bank burn) | domain (Domain sim / study)
  const [selectedDomainIds, setSelectedDomainIds] = useState([])
  const [studySessionSize, setStudySessionSize] = useState(DOMAIN_STUDY_DEFAULT_SIZE)
  const [isStudyMode, setIsStudyMode] = useState(false)
  // exam | bank | domainStudy | domainSim — drives history writes, timing, and coverage delta
  const [sessionKind, setSessionKind] = useState('exam')
  const [bankMissOnly, setBankMissOnly] = useState(false)
  const [domainSimTimed, setDomainSimTimed] = useState(false)
  const [coverageDelta, setCoverageDelta] = useState(null)
  const [introError, setIntroError] = useState(null)
  const [error, setError] = useState(null)
  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [responses, setResponses] = useState({}) // qIndex -> selectedIndex | selectedIndexes[]
  const [studyRevealed, setStudyRevealed] = useState({}) // qIndex -> true once answer shown (study mode only)
  const [unknownFlags, setUnknownFlags] = useState({})
  const shownAtRef = useRef(null)
  const [multiDraft, setMultiDraft] = useState([])
  const [secondsLeft, setSecondsLeft] = useState(MOCK_EXAM_DURATION_MIN * 60)
  const [bankReady, setBankReady] = useState(false)

  useEffect(() => {
    preloadCleanBank().then(() => setBankReady(true))
  }, [])

  useMobileGestureBlock({
    pull: ['loading', 'active', 'review'].includes(phase),
    edge: ['loading', 'active', 'review'].includes(phase),
  })

  useEffect(() => {
    if (!initialDomainId && !initialMode) return
    setIntroTab(initialMode === 'bankburn' ? 'bank' : 'domain')
    if (initialDomainId) setSelectedDomainIds([initialDomainId])
    if (initialMode === 'bankburn') setBankMissOnly(Boolean(initialMissOnly))
    setIntroError(null)
  }, [initialDomainId, initialMode, initialMissOnly])

  const getMcForObjective = useCallback((objectiveId) => (
    getCuratedQuestions(objectiveId).filter(isChoiceQuestion)
  ), [])

  const canUseStaticOnly = useMemo(() => (
    bankReady && staticMockExamReady(DOMAINS, getMcForObjective)
  ), [bankReady, getMcForObjective])

  const toggleDomain = useCallback((domainId) => {
    setIntroError(null)
    setSelectedDomainIds(prev => (
      prev.includes(domainId) ? prev.filter(id => id !== domainId) : [...prev, domainId]
    ))
  }, [])

  const startDomainStudy = useCallback(async () => {
    setIntroError(null)
    const validation = validateDomainStudyStart(selectedDomainIds, DOMAINS, getMcForObjective, studySessionSize)
    if (!validation.ok) {
      setIntroError(validation.error)
      return
    }
    setPhase('loading')
    setError(null)
    setIsStudyMode(!domainSimTimed)
    setSessionKind(domainSimTimed ? 'domainSim' : 'domainStudy')
    setCoverageDelta(null)
    try {
      await preloadCleanBank()
      const selected = resolveSelectedDomains(DOMAINS, selectedDomainIds)
      // Domain sim uses the exposure-aware picker (unseen → stale → miss-retry);
      // untimed study keeps the plain shuffled union pool.
      const final = domainSimTimed
        ? buildBankBurnPool({
          domains: selected,
          getMcQuestions: getMcForObjective,
          exposureStore: await loadDomainQuestionExposure(),
          missed,
          count: studySessionSize,
          shuffle: shuffleArray,
        })
        : buildDomainStudyPool(selected, getMcForObjective, studySessionSize, shuffleArray)
      if (final.length === 0) throw new Error('No questions were available for the selected domain(s).')
      setQuestions(final)
      setResponses({})
      setStudyRevealed({})
      setCurrent(0)
      if (domainSimTimed) setSecondsLeft(domainSimDurationSec(final.length))
      setPhase('active')
    } catch (err) {
      setError(err.message)
      setPhase('error')
    }
  }, [selectedDomainIds, studySessionSize, getMcForObjective, domainSimTimed, missed])

  const startBankBurn = useCallback(async () => {
    setIntroError(null)
    setPhase('loading')
    setError(null)
    setIsStudyMode(true)
    setSessionKind('bank')
    setCoverageDelta(null)
    try {
      await preloadCleanBank()
      const selected = selectedDomainIds.length
        ? resolveSelectedDomains(DOMAINS, selectedDomainIds)
        : DOMAINS
      const exposureStore = await loadDomainQuestionExposure()
      const final = buildBankBurnPool({
        domains: selected,
        getMcQuestions: getMcForObjective,
        exposureStore,
        missed,
        count: studySessionSize,
        shuffle: shuffleArray,
        missOnly: bankMissOnly,
      })
      if (final.length === 0) {
        throw new Error(bankMissOnly
          ? 'No missed questions to retry in the selected domain(s). Clear the misses-only filter or pick another domain.'
          : 'No questions were available for the selected domain(s).')
      }
      setQuestions(final)
      setResponses({})
      setStudyRevealed({})
      setCurrent(0)
      setPhase('active')
    } catch (err) {
      setError(err.message)
      setPhase('error')
    }
  }, [selectedDomainIds, studySessionSize, getMcForObjective, missed, bankMissOnly])

  const start = useCallback(async () => {
    setPhase('loading')
    setError(null)
    setIsStudyMode(false)
    setSessionKind('exam')
    setCoverageDelta(null)
    try {
      await preloadCleanBank()
      const getMc = (id) => getCuratedQuestions(id).filter(isChoiceQuestion)

      if (!staticMockExamReady(DOMAINS, getMc)) {
        throw new Error('Not enough static questions for a full exam. Add more questions to the bank.')
      }
      const weakCkuIds = computeCkuWeakness(missed).slice(0, 12).map(w => w.id)
      const weakDomainIds = computeDomainWeakness(missed, DOMAINS).slice(0, 3).map(w => w.id)
      const final = (weakCkuIds.length || weakDomainIds.length)
        ? buildBlueprintWeightedPool(DOMAINS, getMc, weakCkuIds, shuffleArray, MOCK_EXAM_QUESTION_COUNT, weakDomainIds)
        : buildStaticMockExamPool(DOMAINS, getMc, shuffleArray)
      setQuestions(final)
      setResponses({})
      setStudyRevealed({})
      setCurrent(0)
      setSecondsLeft(MOCK_EXAM_DURATION_MIN * 60)
      setPhase('active')
    } catch (err) {
      setError(err.message)
      setPhase('error')
    }
  }, [missed])

  // Countdown timer (full mock exam only — study mode has no countdown)
  useEffect(() => {
    if (phase !== 'active' || isStudyMode) return
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
  }, [phase, isStudyMode])

  useEffect(() => {
    setMultiDraft(Array.isArray(responses[current]) ? responses[current] : [])
  }, [current, responses])

  useEffect(() => {
    if (phase === 'active') shownAtRef.current = Date.now()
  }, [phase, current])

  function selectChoice(idx) {
    // In study mode, lock the answer once revealed — no changing after first pick
    if (isStudyMode && studyRevealed[current]) return
    const q = questions[current]
    if (isMultiQuestion(q)) return
    setResponses(r => ({ ...r, [current]: idx }))
    if (isStudyMode) {
      setStudyRevealed(r => ({ ...r, [current]: true }))
      setUnknownFlags(f => ({ ...f, [current]: false }))
      if (q?.objectiveId) {
        const correct = gradeQuestion(q, idx)
        const latencyMs = takeLatencyMs(shownAtRef.current)
        recordEngagement?.(q.objectiveId, {
          kind: ENGAGEMENT_KINDS.MOCK,
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
        if (!correct) {
          const diagnosis = diagnoseWrongAnswer({ question: q, submittedAnswer: idx, gradeResult: correct })
          appendMissedEntry(buildMissedEntry(q.objectiveId, q, { selectedIndex: idx, diagnosis }))
        }
      }
    }
  }

  function markUnknown() {
    if (!isStudyMode || studyRevealed[current]) return
    const q = questions[current]
    if (!isMcQuestion(q)) return
    setResponses(r => ({ ...r, [current]: null }))
    setStudyRevealed(r => ({ ...r, [current]: true }))
    setUnknownFlags(f => ({ ...f, [current]: true }))
    if (q?.objectiveId) {
      recordEngagement?.(q.objectiveId, { kind: ENGAGEMENT_KINDS.MOCK, correct: 0, total: 1 })
      recordAnswerOutcome({
        objectiveId: q.objectiveId,
        questionId: q.id,
        correct: false,
        unknown: true,
        latencyMs: takeLatencyMs(shownAtRef.current),
      }).catch(() => {})
      const diagnosis = diagnoseWrongAnswer({ question: q, submittedAnswer: null, gradeResult: false })
      appendMissedEntry(buildMissedEntry(q.objectiveId, q, { ...unknownMissExtra(null), diagnosis }))
    }
  }

  function toggleMultiChoice(idx) {
    if (isStudyMode && studyRevealed[current]) return
    const q = questions[current]
    if (!isMultiQuestion(q)) return
    setMultiDraft(prev => {
      const set = new Set(prev)
      if (set.has(idx)) set.delete(idx)
      else set.add(idx)
      const next = normalizeSelectedIndexes([...set])
      if (!isStudyMode) setResponses(r => ({ ...r, [current]: next }))
      return next
    })
  }

  function submitMultiChoice() {
    const q = questions[current]
    if (!isMultiQuestion(q) || multiDraft.length < 1) return
    if (isStudyMode && studyRevealed[current]) return
    const answer = normalizeSelectedIndexes(multiDraft)
    setResponses(r => ({ ...r, [current]: answer }))
    if (isStudyMode) {
      setStudyRevealed(r => ({ ...r, [current]: true }))
      if (q?.objectiveId) {
        const correct = gradeQuestion(q, answer)
        recordEngagement?.(q.objectiveId, {
          kind: ENGAGEMENT_KINDS.MOCK,
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
        if (!correct) {
          const diagnosis = diagnoseWrongAnswer({ question: q, submittedAnswer: answer, gradeResult: correct })
          appendMissedEntry(buildMissedEntry(q.objectiveId, q, { selectedIndexes: answer, diagnosis }))
        }
      }
    }
  }

  useEffect(() => {
    if (phase !== 'done' || isStudyMode || questions.length === 0) return
    if (examEngagementSaved.current) return
    examEngagementSaved.current = true
    aggregateSessionByObjective(
      questions,
      questions.map((_, idx) => responses[idx]),
      ENGAGEMENT_KINDS.MOCK,
      (q, resp) => gradeQuestion(q, resp),
    ).forEach(({ objectiveId, activity }) => recordEngagement?.(objectiveId, activity))
  }, [phase, isStudyMode, questions, responses, recordEngagement])

  useEffect(() => {
    if (phase !== 'intro' && phase !== 'loading') return
    examEngagementSaved.current = false
    exposureSaved.current = false
  }, [phase])

  // Shared exposure ledger: every mock-surface session marks its questions seen,
  // so Domain Pass and Bank burn never re-serve them while unseen remain.
  useEffect(() => {
    if (phase !== 'done' || questions.length === 0) return
    if (exposureSaved.current) return
    exposureSaved.current = true
    const byDomain = {}
    for (const q of questions) {
      const domainId = q.domainId || domainIdFromObjectiveId(q.objectiveId)
      const id = q.id ?? q.questionId
      if (!domainId || id == null) continue
      ;(byDomain[domainId] ||= []).push(id)
    }
    ;(async () => {
      const involved = new Set(Object.keys(byDomain))
      const domains = DOMAINS.filter(d => involved.has(d.id))
      const before = sessionKind === 'bank'
        ? computeBankCoverage(domains, getMcForObjective, await loadDomainQuestionExposure())
        : null
      for (const [domainId, ids] of Object.entries(byDomain)) {
        await recordSeen(domainId, ids)
      }
      if (before) {
        const after = computeBankCoverage(domains, getMcForObjective, await loadDomainQuestionExposure())
        setCoverageDelta(domains.map(d => ({
          domainId: d.id,
          name: d.name,
          bankCount: after[d.id].bankCount,
          seenBefore: before[d.id].seenCount,
          seenAfter: after[d.id].seenCount,
        })))
      }
    })()
  }, [phase, questions, sessionKind, getMcForObjective])

  useEffect(() => {
    if (phase !== 'done') {
      doneHintFired.current = false
      return
    }
    if (doneHintFired.current || questions.length === 0) return
    doneHintFired.current = true
    let correct = 0
    questions.forEach((q, idx) => {
      if (gradeQuestion(q, responses[idx])) correct++
    })
    const pct = correct / questions.length
    if (pct >= 0.7) showNavHint(NAV_HINT_KEYS.MOCK_PASS)
    else showNavHint(NAV_HINT_KEYS.MOCK_FAIL)
  }, [phase, questions, responses, showNavHint])

  const report = useMemo(() => {
    if (phase !== 'done') return null
    const byDomain = {}
    DOMAINS.forEach(d => { byDomain[d.id] = { name: d.name, correct: 0, total: 0 } })
    let correct = 0
    questions.forEach((q, idx) => {
      const domainIdx = parseInt((q.objectiveId || '1.1').split('.')[0], 10) - 1
      const domain = DOMAINS[domainIdx] || DOMAINS[0]
      byDomain[domain.id].total++
      if (gradeQuestion(q, responses[idx])) {
        byDomain[domain.id].correct++
        correct++
      }
    })
    const trapDebrief = summarizeWrongTraps(
      questions,
      questions.map((_, idx) => responses[idx]),
    )
    const deferredTips = examMode && isStudyMode
      ? questions.flatMap((q, idx) => {
        const selected = responses[idx]
        if (selected == null || gradeQuestion(q, selected)) return []
        const enriched = applyAnswerReviewToQuestion(q)
        const tip = enriched.answerReview?.examTip
        if (!tip) return []
        const trapIdx = Array.isArray(selected)
          ? (selected.find(i => !(q.correctIndexes || []).includes(i)) ?? selected[0])
          : selected
        return [{ tip, trap: inferTrapForChoice(enriched, trapIdx) }]
      })
      : []
    const result = { correct, total: questions.length, byDomain, trapDebrief, deferredTips }
    // Only true Exam sim attempts count toward mock history (bank burn / domain sim are practice surfaces).
    if (sessionKind === 'exam') {
      ;(async () => {
        const hist = (await window.storage.getItem(STORAGE_KEYS.mockHistory)) || []
        hist.push(buildMockHistoryEntry({
          correct,
          total: questions.length,
          questions,
          responses,
          byDomain,
        }))
        await window.storage.setItem(STORAGE_KEYS.mockHistory, hist.slice(-30))
      })()
    }
    return result
  }, [phase, questions, responses, examMode, isStudyMode, sessionKind])

  if (phase === 'intro') {
    const staticCount = bankReady
      ? DOMAINS.flatMap(d => d.objectives).reduce((n, o) => n + getMcForObjective(o.id).length, 0)
      : 0
    const selectedDomains = resolveSelectedDomains(DOMAINS, selectedDomainIds)
    const domainPoolSize = bankReady ? countDomainStudyPool(selectedDomains, getMcForObjective) : 0
    return (
      <div>
        <StudyModeHeader title="Mock Exam" onBack={onExit} />
        <div style={styles.tabBar}>
          <button
            type="button"
            style={styles.tabBtn(introTab === 'full')}
            onClick={() => { setIntroTab('full'); setIntroError(null) }}
          >
            Exam sim
          </button>
          <button
            type="button"
            style={styles.tabBtn(introTab === 'bank')}
            onClick={() => { setIntroTab('bank'); setIntroError(null) }}
          >
            Bank burn
          </button>
          <button
            type="button"
            style={styles.tabBtn(introTab === 'domain')}
            onClick={() => { setIntroTab('domain'); setIntroError(null) }}
          >
            Study by domain
          </button>
        </div>
        {introTab === 'bank' && (
          <>
            <div style={styles.card}>
              <div style={{ fontSize: 'var(--ccna-type-md)', lineHeight: 1.7, marginBottom: 12 }}>
                <div>• Burns through your bank: <span style={{ color: COLORS.mint }}>unseen first</span>, then stale, then miss retries</div>
                <div>• Never recycles recent questions while unseen remain</div>
                <div>• Instant feedback, no countdown — coverage delta at the end</div>
              </div>
              <div style={{ ...styles.small, marginBottom: 8 }}>Domains (none selected = whole bank)</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {DOMAINS.map(d => {
                  const active = selectedDomainIds.includes(d.id)
                  const c = accentColors(d.accent)
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => toggleDomain(d.id)}
                      style={{
                        ...styles.pill(d.accent),
                        cursor: 'pointer',
                        border: `2px solid ${active ? c.text : c.border}`,
                        opacity: active ? 1 : 0.72,
                        padding: '8px 12px',
                        fontSize: 'var(--ccna-type-sm)',
                      }}
                    >
                      {active ? '✓ ' : ''}{d.name}
                    </button>
                  )
                })}
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={bankMissOnly}
                onClick={() => setBankMissOnly(v => !v)}
                style={{
                  ...styles.tabBtn(bankMissOnly),
                  marginTop: 12,
                  width: '100%',
                  fontSize: 'var(--ccna-type-sm)',
                }}
              >
                {bankMissOnly ? '✓ Misses only — retry what you got wrong' : 'Misses only (off) — full bank order'}
              </button>
              <div style={{ ...styles.small, marginTop: 14, marginBottom: 8 }}>Session size</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {DOMAIN_STUDY_SIZE_OPTIONS.map(size => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => { setStudySessionSize(size); setIntroError(null) }}
                    style={{
                      ...styles.tabBtn(studySessionSize === size),
                      flex: 1,
                      fontSize: 'var(--ccna-type-sm)',
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {bankReady && bankMissOnly && (
                <div style={{ ...styles.small, marginTop: 10, color: COLORS.silverMid }}>
                  {collectMissRetryIds(missed, selectedDomainIds.length ? resolveSelectedDomains(DOMAINS, selectedDomainIds) : DOMAINS).length} missed question(s) available to retry
                </div>
              )}
            </div>
            {introError && (
              <div style={{ ...styles.small, color: COLORS.rose, marginBottom: 8 }}>{introError}</div>
            )}
            <button style={styles.primaryBtn} onClick={startBankBurn} disabled={!bankReady}>
              {bankReady ? 'Start bank burn' : 'Loading question bank…'}
            </button>
          </>
        )}
        {introTab === 'full' && (
          <>
            <div style={styles.card}>
              <div style={{ fontSize: 'var(--ccna-type-md)', lineHeight: 1.7 }}>
                <div>• {MOCK_EXAM_QUESTION_COUNT} questions, {MOCK_EXAM_DURATION_MIN} minute countdown</div>
                <div>• Weighted by official exam domain percentages</div>
                <div>• <span style={{ color: COLORS.mint }}>100% from your static bank</span> — {STATIC_COPY.mockStaticLine}</div>
                <div>• Score report broken down by domain at the end</div>
                <div>• Once started, the timer runs continuously — find a quiet 2 hours, or submit early</div>
              </div>
              {bankReady && staticCount > 0 && (
                <div style={{ ...styles.small, marginTop: 8, color: COLORS.silverMid }}>
                  {staticCount} multiple-choice questions in static bank for this exam
                  {computeCkuWeakness(missed).length > 0 && (
                    <> · adaptive weighting from your missed bank</>
                  )}
                </div>
              )}
              {bankReady && !canUseStaticOnly && (
                <div style={{ ...styles.small, marginTop: 8, color: COLORS.rose }}>
                  Not enough static questions for a full exam yet.
                </div>
              )}
            </div>
            <button style={styles.primaryBtn} onClick={start} disabled={!bankReady || !canUseStaticOnly}>
              {bankReady ? 'Start Mock Exam' : 'Loading question bank…'}
            </button>
            {onOpenMockInterview && (
              <button
                type="button"
                style={{ ...styles.secondaryBtn, marginTop: 10 }}
                onClick={onOpenMockInterview}
              >
                Exam day interview
              </button>
            )}
          </>
        )}
        {introTab === 'domain' && (
          <>
            <div style={styles.card}>
              <div style={{ fontSize: 'var(--ccna-type-md)', lineHeight: 1.7, marginBottom: 12 }}>
                <div>• Pick one or more CCNA domains</div>
                <div>• {domainSimTimed ? 'Domain sim — exam-style countdown, answers revealed at the end' : 'No countdown — study at your own pace'}</div>
                <div>• Score + trap debrief scoped to your selection</div>
                {examMode && <div>• Exam mode on — tips deferred until results</div>}
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={domainSimTimed}
                onClick={() => { setDomainSimTimed(v => !v); setIntroError(null) }}
                style={{
                  ...styles.tabBtn(domainSimTimed),
                  width: '100%',
                  marginBottom: 12,
                  fontSize: 'var(--ccna-type-sm)',
                }}
              >
                {domainSimTimed ? '✓ Domain sim — timed, exam chrome, exposure-aware pool' : 'Domain sim (off) — untimed study with instant feedback'}
              </button>
              <div style={{ ...styles.small, marginBottom: 8 }}>Domains</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {DOMAINS.map(d => {
                  const active = selectedDomainIds.includes(d.id)
                  const c = accentColors(d.accent)
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => toggleDomain(d.id)}
                      style={{
                        ...styles.pill(d.accent),
                        cursor: 'pointer',
                        border: `2px solid ${active ? c.text : c.border}`,
                        opacity: active ? 1 : 0.72,
                        padding: '8px 12px',
                        fontSize: 'var(--ccna-type-sm)',
                      }}
                    >
                      {active ? '✓ ' : ''}{d.name}
                    </button>
                  )
                })}
              </div>
              {bankReady && selectedDomainIds.length > 0 && (
                <div style={{ ...styles.small, marginTop: 10, color: COLORS.silverMid }}>
                  {domainPoolSize} question{domainPoolSize === 1 ? '' : 's'} available in selected domain{selectedDomainIds.length === 1 ? '' : 's'}
                </div>
              )}
              <div style={{ ...styles.small, marginTop: 14, marginBottom: 8 }}>Session size</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {DOMAIN_STUDY_SIZE_OPTIONS.map(size => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => { setStudySessionSize(size); setIntroError(null) }}
                    style={{
                      ...styles.tabBtn(studySessionSize === size),
                      flex: 1,
                      fontSize: 'var(--ccna-type-sm)',
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
            {introError && (
              <div style={{ ...styles.small, color: COLORS.rose, marginBottom: 8 }}>{introError}</div>
            )}
            <button style={styles.primaryBtn} onClick={startDomainStudy} disabled={!bankReady}>
              {bankReady ? (domainSimTimed ? 'Start domain sim' : 'Start study session') : 'Loading question bank…'}
            </button>
          </>
        )}
      </div>
    )
  }
  const restartSession = sessionKind === 'bank' ? startBankBurn
    : (sessionKind === 'domainStudy' || sessionKind === 'domainSim') ? startDomainStudy
      : start
  if (phase === 'loading') return <Spinner label={isStudyMode ? 'Building your study session...' : 'Building your exam...'} />
  if (phase === 'error') return <ErrorBox message={error} onRetry={restartSession} />

  if (phase === 'done') {
    const pct = report.total > 0 ? Math.round((report.correct / report.total) * 100) : 0
    const skippedCount = report.total - Object.keys(responses).length
    const wrongCount = report.total - report.correct - skippedCount
    return (
      <div className="ccna-mock-results">
        <StudyModeHeader title={isStudyMode ? 'Study Results' : 'Exam Results'} onBack={onExit} backLabel="Back to Home" />
        <div className="ccna-mock-results__score" style={styles.card}>
          <div style={{ fontSize: 'var(--ccna-type-display)', fontWeight: 700, color: pct >= 70 ? COLORS.mint : COLORS.rose }}>{pct}%</div>
          <div style={styles.small}>{report.correct} / {report.total} correct</div>
          <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.mint }}>✓ {report.correct} correct</span>
            {wrongCount > 0 && <span style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.rose }}>✗ {wrongCount} incorrect</span>}
            {skippedCount > 0 && <span style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.amber }}>— {skippedCount} skipped</span>}
          </div>
        </div>
        {sessionKind === 'bank' && coverageDelta?.length > 0 && (
          <div style={{ ...styles.card, border: `1px solid ${COLORS.mintBorder}`, background: COLORS.mintDim }}>
            <h2 style={{ ...styles.h2, color: COLORS.mint }}>Bank coverage</h2>
            {coverageDelta.map(d => {
              const gained = d.seenAfter - d.seenBefore
              return (
                <div key={d.domainId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--ccna-type-sm)', marginBottom: 4, gap: 8 }}>
                  <span>{d.name}</span>
                  <span style={{ fontWeight: 600 }}>
                    {d.seenAfter}/{d.bankCount} seen{gained > 0 ? ` (+${gained})` : ''}
                  </span>
                </div>
              )
            })}
          </div>
        )}
        <div className="ccna-mock-results__grid" style={styles.card}>
          <h2 style={styles.h2}>Question summary</h2>
          <div className="ccna-mock-results__qgrid" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
            {questions.map((qItem, idx) => {
              const sel = responses[idx]
              const isCorrect = sel != null && gradeQuestion(qItem, sel)
              const isSkipped = sel == null
              return (
                <button
                  key={idx}
                  type="button"
                  title={`Q${idx + 1}: ${isSkipped ? 'Skipped' : isCorrect ? 'Correct' : 'Incorrect'}`}
                  onClick={() => { setCurrent(idx); setPhase('review') }}
                  style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: isSkipped ? COLORS.surface : isCorrect ? COLORS.mintDim : COLORS.roseDim,
                    border: `2px solid ${isSkipped ? COLORS.border : isCorrect ? COLORS.mintBorder : COLORS.rose}`,
                    color: isSkipped ? COLORS.silverMid : isCorrect ? COLORS.mint : COLORS.rose,
                    fontWeight: 700, fontSize: 'var(--ccna-type-xs)', cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'inherit',
                  }}
                >
                  {idx + 1}
                </button>
              )
            })}
          </div>
          <div style={{ ...styles.small, color: COLORS.silverMid }}>Tap any number to jump straight to that question's review</div>
        </div>
        <div className="ccna-mock-results__domains" style={styles.card}>
          <h2 style={styles.h2}>By Domain</h2>
          {DOMAINS.map(d => {
            const r = report.byDomain[d.id]
            if (!r || r.total === 0) return null
            const dpct = Math.round((r.correct / r.total) * 100)
            return (
              <div key={d.id} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--ccna-type-sm)', marginBottom: 4 }}>
                  <span>{d.name}</span>
                  <span style={{ color: dpct >= 70 ? COLORS.mint : COLORS.rose, fontWeight: 600 }}>{r.correct}/{r.total} ({dpct}%)</span>
                </div>
                <div style={{ height: 6, borderRadius: 999, background: COLORS.surface, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${dpct}%`, background: dpct >= 70 ? COLORS.mint : COLORS.rose }} />
                </div>
              </div>
            )
          })}
        </div>
        <MockExamDebriefActions
          report={report}
          questions={questions}
          responses={responses}
          domains={DOMAINS}
          missed={missed}
          onOpenTrapDrill={onOpenTrapDrill}
          onOpenLab={onOpenLab}
          onOpenDomainPass={onOpenDomainPass}
          onStudyDomain={(domainId) => {
            setSelectedDomainIds([domainId])
            setIntroTab('domain')
            setPhase('intro')
          }}
          onSelectObjective={onSelectObjective}
        />
        {onOpenMockInterview && pct < 80 && (
          <button
            type="button"
            style={{ ...styles.secondaryBtn, marginTop: 8 }}
            onClick={onOpenMockInterview}
          >
            Exam day interview — verbal warm-up on weak spots
          </button>
        )}
        {report.deferredTips?.length > 0 && <DeferredExamTips tips={report.deferredTips} />}
        {(() => {
          const firstWrongIdx = questions.findIndex((qItem, idx) => {
            const sel = responses[idx]
            return sel != null && !gradeQuestion(qItem, sel)
          })
          return firstWrongIdx >= 0 ? (
            <button
              style={{ ...styles.primaryBtn, background: COLORS.roseDim, borderColor: COLORS.rose, color: COLORS.rose }}
              onClick={() => { setCurrent(firstWrongIdx); setPhase('review') }}
            >
              Review first wrong answer (Q{firstWrongIdx + 1}) →
            </button>
          ) : null
        })()}
        <button style={{ ...styles.primaryBtn, marginTop: 8 }} onClick={() => { setCurrent(0); setPhase('review') }}>Review all answers</button>
        <button
          style={{ ...styles.secondaryBtn, marginTop: 8 }}
          onClick={restartSession}
        >
          {sessionKind === 'bank' ? 'Burn more bank' : isStudyMode ? 'Study again' : sessionKind === 'domainSim' ? 'Retake domain sim' : 'Retake mock exam'}
        </button>
        {isStudyMode && (
          <button
            style={{ ...styles.secondaryBtn, marginTop: 8, background: 'none', border: 'none', color: COLORS.silverMid }}
            onClick={() => setPhase('intro')}
          >
            Change domains
          </button>
        )}
      </div>
    )
  }

  if (phase === 'review') {
    const q = questions[current]
    const selected = responses[current] ?? null
    const isCorrect = selected != null && gradeQuestion(q, selected)
    const unanswered = selected == null
    return (
      <div className="ccna-review-flow ccna-mock-review">
        <StudyModeHeader title="Answer review" onBack={() => setPhase('done')} backLabel="Results" />
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'baseline', marginBottom: 8 }}>
          <span style={styles.small}>{current + 1} / {questions.length}</span>
        </div>
        <div style={styles.card}>
          <QuestionMeta q={q} />
          <QuizQuestionStem text={q.question} />
          <McChoiceShuffleProvider q={q}>
          {isMultiQuestion(q) ? (
            <MultiChoices
              q={q}
              selectedIndexes={Array.isArray(selected) ? selected : []}
              revealed
              onToggle={() => {}}
            />
          ) : (
            <McChoices q={q} selected={typeof selected === 'number' ? selected : null} revealed onSelect={() => {}} />
          )}
          <div
            className="ccna-quiz-reveal"
            style={{
              marginTop: 8, padding: 12, borderRadius: 10,
              background: unanswered ? COLORS.amberDim : isCorrect ? COLORS.mintDim : COLORS.roseDim,
              border: `2px solid ${unanswered ? COLORS.amberBorder : isCorrect ? COLORS.mintBorder : COLORS.rose}`,
            }}
          >
            <div style={{ fontWeight: 700, color: unanswered ? COLORS.amber : isCorrect ? COLORS.mint : COLORS.rose, marginBottom: 4, fontSize: 'var(--ccna-type-sm)' }}>
              {unanswered ? 'Unanswered' : isCorrect ? 'Correct' : 'Incorrect'}
            </div>
            <AnswerReview {...answerReviewSessionProps({
              q,
              selected: typeof selected === 'number' ? selected : undefined,
              selectedIndexes: Array.isArray(selected) ? selected : undefined,
              hideExamTip: examMode && isStudyMode,
              onOpenLab,
              onOpenTrapDrill,
            })} />
          </div>
          </McChoiceShuffleProvider>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button style={styles.secondaryBtn} disabled={current === 0} onClick={() => setCurrent(c => Math.max(0, c - 1))}>Previous</button>
          <button style={styles.primaryBtn} disabled={current >= questions.length - 1} onClick={() => setCurrent(c => Math.min(questions.length - 1, c + 1))}>Next</button>
        </div>
      </div>
    )
  }

  // active — study mode reveals answer immediately on selection; full mock keeps choices hidden until submit.
  const q = questions[current]
  const selected = responses[current]
  const multi = isMultiQuestion(q)
  const answeredCount = Object.keys(responses).length
  const isCurrentRevealed = isStudyMode && !!studyRevealed[current]
  const isCurrentCorrect = selected != null && gradeQuestion(q, selected)

  // Running score pill for study mode: counts only questions already answered
  const studyAnsweredCount = Object.keys(studyRevealed).length
  const studyCorrectCount = isStudyMode
    ? Object.keys(studyRevealed).filter(
        idx => {
          const i = parseInt(idx, 10)
          const qq = questions[i]
          return qq && gradeQuestion(qq, responses[i])
        },
      ).length
    : 0

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={styles.small}>Question {current + 1} / {questions.length}</div>
        {!isStudyMode && (
          <div style={{ ...styles.pill(secondsLeft < 600 ? 'rose' : 'sky') }}>{formatSeconds(secondsLeft)}</div>
        )}
        {isStudyMode && studyAnsweredCount === 0 && (
          <div style={{ ...styles.pill('mint') }}>Study mode</div>
        )}
        {isStudyMode && studyAnsweredCount > 0 && (
          <div style={{ ...styles.pill(studyCorrectCount / studyAnsweredCount >= 0.7 ? 'mint' : 'rose') }}>
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
            selectedIndexes={isCurrentRevealed && Array.isArray(selected) ? selected : multiDraft}
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
            {isStudyMode ? 'Check answers' : 'Save selection'}
          </button>
        )}
        {isStudyMode && !isCurrentRevealed && !multi && (
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
              hideExamTip: examMode && isStudyMode,
              onOpenLab,
              onOpenTrapDrill,
            })} />
          </div>
        )}
        </McChoiceShuffleProvider>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <button style={styles.secondaryBtn} disabled={current === 0} onClick={() => setCurrent(c => Math.max(0, c - 1))}>Previous</button>
        {current < questions.length - 1 ? (
          <button style={styles.primaryBtn} onClick={() => setCurrent(c => Math.min(questions.length - 1, c + 1))}>
            {isCurrentRevealed ? 'Next →' : 'Next'}
          </button>
        ) : (
          <button style={styles.primaryBtn} onClick={() => setPhase('done')}>
            {isStudyMode ? 'Finish session' : 'Submit Exam'}
          </button>
        )}
      </div>
      {!isStudyMode && (
        <div style={{ ...styles.small, textAlign: 'center' }}>{answeredCount} / {questions.length} answered</div>
      )}
      {!isStudyMode && current !== questions.length - 1 && (
        <button style={{ ...styles.secondaryBtn, marginTop: 8, background: 'none', border: 'none', color: COLORS.silverMid }} onClick={() => setPhase('done')}>
          Submit exam now
        </button>
      )}
      {isStudyMode && current !== questions.length - 1 && (
        <button style={{ ...styles.secondaryBtn, marginTop: 8, background: 'none', border: 'none', color: COLORS.silverMid }} onClick={() => setPhase('done')}>
          Finish session now
        </button>
      )}
    </div>
  )
}
