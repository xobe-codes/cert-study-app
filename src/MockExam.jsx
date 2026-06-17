import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { DOMAINS } from './data/ccnaDomains.js'
import { getCuratedQuestions } from './data/ccnaCurated.js'
import { preloadCleanBank } from './data/cleanQuestionAdapter.js'
import { isMcQuestion, gradeQuestion } from './questionUtils.js'
import {
  MOCK_EXAM_QUESTION_COUNT,
  MOCK_EXAM_DURATION_MIN,
  staticMockExamReady,
  buildStaticMockExamPool,
} from './mockExamConfig.js'
import {
  buildDomainStudyPool,
  countDomainStudyPool,
  DOMAIN_STUDY_DEFAULT_SIZE,
  DOMAIN_STUDY_SIZE_OPTIONS,
  resolveSelectedDomains,
  validateDomainStudyStart,
} from './domainStudyConfig.js'
import { COLORS, styles, accentColors } from './ui/appTheme.js'
import { STATIC_COPY } from './ui/staticContentCopy.js'
import { STORAGE_KEYS } from './storageKeys.js'
import McChoices from './components/McChoices.jsx'
import AnswerReview from './components/AnswerReview.jsx'
import { summarizeWrongTraps } from './missed/missedTrapGroups.js'
import { applyAnswerReviewToQuestion, inferTrapForChoice } from './answerReviewLogic.js'
import DeferredExamTips from './components/DeferredExamTips.jsx'
import Spinner from './components/Spinner.jsx'
import ErrorBox from './components/ErrorBox.jsx'
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

export default function MockExam({ onExit, examMode = false }) {
  const showNavHint = useNavHint()
  const doneHintFired = useRef(false)
  const [phase, setPhase] = useState('intro') // intro | loading | active | done | review | error
  const [introTab, setIntroTab] = useState('full') // full | domain
  const [selectedDomainIds, setSelectedDomainIds] = useState([])
  const [studySessionSize, setStudySessionSize] = useState(DOMAIN_STUDY_DEFAULT_SIZE)
  const [isStudyMode, setIsStudyMode] = useState(false)
  const [introError, setIntroError] = useState(null)
  const [error, setError] = useState(null)
  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [responses, setResponses] = useState({}) // qIndex -> selectedIndex
  const [studyRevealed, setStudyRevealed] = useState({}) // qIndex -> true once answer shown (study mode only)
  const [secondsLeft, setSecondsLeft] = useState(MOCK_EXAM_DURATION_MIN * 60)
  const [bankReady, setBankReady] = useState(false)

  useEffect(() => {
    preloadCleanBank().then(() => setBankReady(true))
  }, [])

  const getMcForObjective = useCallback((objectiveId) => (
    getCuratedQuestions(objectiveId).filter(isMcQuestion)
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
    setIsStudyMode(true)
    try {
      await preloadCleanBank()
      const selected = resolveSelectedDomains(DOMAINS, selectedDomainIds)
      const final = buildDomainStudyPool(selected, getMcForObjective, studySessionSize, shuffleArray)
      if (final.length === 0) throw new Error('No questions were available for the selected domain(s).')
      setQuestions(final)
      setResponses({})
      setStudyRevealed({})
      setCurrent(0)
      setPhase('active')
    } catch (err) {
      setError(err.message)
      setPhase('error')
    }
  }, [selectedDomainIds, studySessionSize, getMcForObjective])

  const start = useCallback(async () => {
    setPhase('loading')
    setError(null)
    setIsStudyMode(false)
    try {
      await preloadCleanBank()
      const getMc = (id) => getCuratedQuestions(id).filter(isMcQuestion)

      if (!staticMockExamReady(DOMAINS, getMc)) {
        throw new Error('Not enough static questions for a full exam. Add more questions to the bank.')
      }
      const final = buildStaticMockExamPool(DOMAINS, getMc, shuffleArray)
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
  }, [])

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

  function selectChoice(idx) {
    // In study mode, lock the answer once revealed — no changing after first pick
    if (isStudyMode && studyRevealed[current]) return
    setResponses(r => ({ ...r, [current]: idx }))
    if (isStudyMode) {
      setStudyRevealed(r => ({ ...r, [current]: true }))
    }
  }

  useEffect(() => {
    if (phase !== 'done') {
      doneHintFired.current = false
      return
    }
    if (doneHintFired.current || questions.length === 0) return
    doneHintFired.current = true
    let correct = 0
    questions.forEach((q, idx) => {
      if (responses[idx] === q.correctIndex) correct++
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
      if (responses[idx] === q.correctIndex) {
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
        if (selected == null || selected === q.correctIndex) return []
        const enriched = applyAnswerReviewToQuestion(q)
        const tip = enriched.answerReview?.examTip
        if (!tip) return []
        return [{ tip, trap: inferTrapForChoice(enriched, selected) }]
      })
      : []
    const result = { correct, total: questions.length, byDomain, trapDebrief, deferredTips }
    if (!isStudyMode) {
      ;(async () => {
        const hist = (await window.storage.getItem(STORAGE_KEYS.mockHistory)) || []
        hist.push({ date: Date.now(), pct: Math.round((correct / Math.max(questions.length, 1)) * 100), correct, total: questions.length })
        await window.storage.setItem(STORAGE_KEYS.mockHistory, hist.slice(-30))
      })()
    }
    return result
  }, [phase, questions, responses, examMode, isStudyMode])

  if (phase === 'intro') {
    const staticCount = bankReady
      ? DOMAINS.flatMap(d => d.objectives).reduce((n, o) => n + getMcForObjective(o.id).length, 0)
      : 0
    const selectedDomains = resolveSelectedDomains(DOMAINS, selectedDomainIds)
    const domainPoolSize = bankReady ? countDomainStudyPool(selectedDomains, getMcForObjective) : 0
    return (
      <div>
        <button style={styles.backBtn} onClick={onExit}>‹ Back</button>
        <h1 style={styles.h1}>Mock Exam</h1>
        <div style={styles.tabBar}>
          <button
            type="button"
            style={styles.tabBtn(introTab === 'full')}
            onClick={() => { setIntroTab('full'); setIntroError(null) }}
          >
            Full mock exam
          </button>
          <button
            type="button"
            style={styles.tabBtn(introTab === 'domain')}
            onClick={() => { setIntroTab('domain'); setIntroError(null) }}
          >
            Study by domain
          </button>
        </div>
        {introTab === 'full' ? (
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
          </>
        ) : (
          <>
            <div style={styles.card}>
              <div style={{ fontSize: 'var(--ccna-type-md)', lineHeight: 1.7, marginBottom: 12 }}>
                <div>• Pick one or more CCNA domains</div>
                <div>• No countdown — study at your own pace</div>
                <div>• Score + trap debrief scoped to your selection</div>
                {examMode && <div>• Exam mode on — tips deferred until results</div>}
              </div>
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
              {bankReady ? 'Start study session' : 'Loading question bank…'}
            </button>
          </>
        )}
      </div>
    )
  }
  if (phase === 'loading') return <Spinner label={isStudyMode ? 'Building your study session...' : 'Building your exam...'} />
  if (phase === 'error') return <ErrorBox message={error} onRetry={isStudyMode ? startDomainStudy : start} />

  if (phase === 'done') {
    const pct = report.total > 0 ? Math.round((report.correct / report.total) * 100) : 0
    const skippedCount = report.total - Object.keys(responses).length
    const wrongCount = report.total - report.correct - skippedCount
    return (
      <div>
        <button style={styles.backBtn} onClick={onExit}>‹ Back to Home</button>
        <h1 style={styles.h1}>{isStudyMode ? 'Study Results' : 'Exam Results'}</h1>
        <div style={styles.card}>
          <div style={{ fontSize: 'var(--ccna-type-display)', fontWeight: 700, color: pct >= 70 ? COLORS.mint : COLORS.rose }}>{pct}%</div>
          <div style={styles.small}>{report.correct} / {report.total} correct</div>
          <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.mint }}>✓ {report.correct} correct</span>
            {wrongCount > 0 && <span style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.rose }}>✗ {wrongCount} incorrect</span>}
            {skippedCount > 0 && <span style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.amber }}>— {skippedCount} skipped</span>}
          </div>
        </div>
        <div style={styles.card}>
          <h2 style={styles.h2}>Question summary</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
            {questions.map((qItem, idx) => {
              const sel = responses[idx]
              const isCorrect = sel != null && sel === qItem.correctIndex
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
        <div style={styles.card}>
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
        {report.trapDebrief?.length > 0 && (
          <div style={styles.card}>
            <h2 style={styles.h2}>Trap debrief</h2>
            <p style={{ ...styles.small, marginBottom: 10 }}>
              {isStudyMode ? 'Patterns behind your missed answers in this session.' : 'Patterns behind your missed answers — study these before retaking.'}
            </p>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 'var(--ccna-type-sm)', color: COLORS.silver, lineHeight: 1.5 }}>
              {report.trapDebrief.map((t, i) => (
                <li key={i} style={{ marginBottom: 6 }}>
                  <strong>{t.trap}</strong> — {t.count} miss{t.count === 1 ? '' : 'es'}
                  {t.objectiveIds?.length ? ` (${t.objectiveIds.join(', ')})` : ''}
                </li>
              ))}
            </ul>
          </div>
        )}
        {report.deferredTips?.length > 0 && <DeferredExamTips tips={report.deferredTips} />}
        <button style={styles.primaryBtn} onClick={() => { setCurrent(0); setPhase('review') }}>Review answers</button>
        <button
          style={{ ...styles.secondaryBtn, marginTop: 8 }}
          onClick={isStudyMode ? startDomainStudy : start}
        >
          {isStudyMode ? 'Study again' : 'Retake mock exam'}
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
      <div>
        <button style={styles.backBtn} onClick={() => setPhase('done')}>‹ Results</button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
          <h1 style={{ ...styles.h1, margin: 0 }}>Answer review</h1>
          <span style={styles.small}>{current + 1} / {questions.length}</span>
        </div>
        {q.objectiveId && <div style={{ ...styles.small, marginBottom: 8 }}>Objective {q.objectiveId}</div>}
        <div style={styles.card}>
          <div style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 600, marginBottom: 14, lineHeight: 1.5, overflowWrap: 'anywhere', wordBreak: 'break-word' }}>{q.question}</div>
          <McChoices q={q} selected={selected} revealed onSelect={() => {}} />
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
            <AnswerReview q={q} selected={selected} hideExamTip={examMode && isStudyMode} />
          </div>
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
  const answeredCount = Object.keys(responses).length
  const isCurrentRevealed = isStudyMode && !!studyRevealed[current]
  const isCurrentCorrect = selected != null && selected === q.correctIndex

  // Running score pill for study mode: counts only questions already answered
  const studyAnsweredCount = Object.keys(studyRevealed).length
  const studyCorrectCount = isStudyMode
    ? Object.keys(studyRevealed).filter(
        idx => responses[parseInt(idx, 10)] === questions[parseInt(idx, 10)]?.correctIndex,
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
        <div style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 600, marginBottom: 14, lineHeight: 1.5, overflowWrap: 'anywhere', wordBreak: 'break-word' }}>{q.question}</div>
        <McChoices q={q} selected={selected ?? null} revealed={isCurrentRevealed} onSelect={selectChoice} />
        {isStudyMode && !isCurrentRevealed && (
          <div style={{ ...styles.small, marginTop: 10, textAlign: 'center', color: COLORS.silverMid }}>
            Select an answer to see instant feedback
          </div>
        )}
        {isCurrentRevealed && (
          <div
            className="ccna-quiz-reveal"
            style={{
              marginTop: 10, padding: 12, borderRadius: 10,
              background: isCurrentCorrect ? COLORS.mintDim : COLORS.roseDim,
              border: `2px solid ${isCurrentCorrect ? COLORS.mintBorder : COLORS.rose}`,
            }}
          >
            <div style={{
              fontWeight: 700,
              color: isCurrentCorrect ? COLORS.mint : COLORS.rose,
              marginBottom: 6,
              fontSize: 'var(--ccna-type-sm)',
            }}>
              {isCurrentCorrect ? '✓ Correct!' : '✗ Incorrect'}
            </div>
            <AnswerReview q={q} selected={selected} hideExamTip={examMode && isStudyMode} />
          </div>
        )}
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
