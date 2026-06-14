import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { DOMAINS } from './data/ccnaDomains.js'
import { getCuratedQuestions } from './data/ccnaCurated.js'
import { preloadCleanBank } from './data/cleanQuestionAdapter.js'
import { isMcQuestion, gradeQuestion } from './questionUtils.js'
import {
  buildMockExamDomainCounts,
  MOCK_EXAM_QUESTION_COUNT,
  MOCK_EXAM_DURATION_MIN,
  MOCK_EXAM_AI_CAP,
  staticMockExamReady,
  buildStaticMockExamPool,
} from './mockExamConfig.js'
import { COLORS, styles } from './ui/appTheme.js'
import { STATIC_COPY } from './ui/staticContentCopy.js'
import { STORAGE_KEYS } from './storageKeys.js'
import McChoices from './components/McChoices.jsx'
import AnswerReview from './components/AnswerReview.jsx'
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
const MOCK_EXAM_SYSTEM = `You are a CCNA 200-301 exam question generator. Ground every question strictly in the provided reference notes for each objective — do not introduce facts that contradict them. Generate multiple-choice questions (4 choices each, exactly one correct) at official CCNA exam difficulty, distributed across the listed objectives.

Respond with ONLY valid JSON (no markdown fences, no commentary), in this exact shape:
{"questions":[{"objectiveId":"x.x","question":"...","choices":["...","...","...","..."],"correctIndex":0,"explanation":"..."}]}`

function formatSeconds(total) {
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function MockExam({ onExit, askClaudeJSON, cachedSystem, mockSchema, bookRef = {} }) {
  const showNavHint = useNavHint()
  const doneHintFired = useRef(false)
  const [phase, setPhase] = useState('intro') // intro | loading | active | done | review | error
  const [error, setError] = useState(null)
  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [responses, setResponses] = useState({}) // qIndex -> selectedIndex
  const [secondsLeft, setSecondsLeft] = useState(MOCK_EXAM_DURATION_MIN * 60)
  const [staticOnly, setStaticOnly] = useState(true)
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

  useEffect(() => {
    if (canUseStaticOnly) setStaticOnly(true)
    else setStaticOnly(false)
  }, [canUseStaticOnly])

  const start = useCallback(async () => {
    setPhase('loading')
    setError(null)
    try {
      await preloadCleanBank()
      const getMc = (id) => getCuratedQuestions(id).filter(isMcQuestion)

      if (staticOnly) {
        if (!staticMockExamReady(DOMAINS, getMc)) {
          throw new Error('Not enough static questions for a full exam. Turn off static-only or add more questions to the bank.')
        }
        const final = buildStaticMockExamPool(DOMAINS, getMc, shuffleArray)
        setQuestions(final)
        setResponses({})
        setCurrent(0)
        setSecondsLeft(MOCK_EXAM_DURATION_MIN * 60)
        setPhase('active')
        return
      }

      const domainCounts = buildMockExamDomainCounts(DOMAINS).filter(dc => dc.count > 0)

      const all = []
      let aiUsed = 0
      await Promise.all(domainCounts.map(async ({ domain, count }) => {
        const staticPool = shuffleArray(
          domain.objectives.flatMap(o => getCuratedQuestions(o.id).filter(isMcQuestion).map(q => ({ ...q, objectiveId: o.id }))),
        )
        const fromStatic = staticPool.slice(0, count)
        all.push(...fromStatic)

        const aiCount = Math.min(count - fromStatic.length, Math.max(0, MOCK_EXAM_AI_CAP - aiUsed))
        if (aiCount <= 0) return
        aiUsed += aiCount

        const objectivesText = domain.objectives.map(o => `Objective ${o.id} — ${o.title}\n${bookRef[o.id] || ''}`).join('\n\n')
        const data = await askClaudeJSON({
          system: cachedSystem(MOCK_EXAM_SYSTEM),
          messages: [{
            role: 'user',
            content: `Domain: ${domain.name}\n\n${objectivesText}\n\nGenerate ${aiCount} multiple-choice questions total for this domain, spread across the objectives above. Tag each question with its objectiveId.`,
          }],
          max_tokens: 250 * aiCount + 300,
          schema: mockSchema,
          toolName: 'emit_exam',
          feature: 'mock',
        })
        all.push(...(data.questions || []).slice(0, aiCount))
      }))

      const final = shuffleArray(all)
      if (final.length === 0) throw new Error('No questions were generated.')
      setQuestions(final)
      setResponses({})
      setCurrent(0)
      setSecondsLeft(MOCK_EXAM_DURATION_MIN * 60)
      setPhase('active')
    } catch (err) {
      setError(err.message.includes('JSON') ? 'Claude returned an unexpected format while building the exam. Please try again.' : err.message)
      setPhase('error')
    }
  }, [staticOnly])

  // Countdown timer
  useEffect(() => {
    if (phase !== 'active') return
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
  }, [phase])

  function selectChoice(idx) {
    setResponses(r => ({ ...r, [current]: idx }))
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
    const result = { correct, total: questions.length, byDomain }
    // Persist to history
    ;(async () => {
      const hist = (await window.storage.getItem(STORAGE_KEYS.mockHistory)) || []
      hist.push({ date: Date.now(), pct: Math.round((correct / Math.max(questions.length, 1)) * 100), correct, total: questions.length })
      await window.storage.setItem(STORAGE_KEYS.mockHistory, hist.slice(-30)) // keep last 30 attempts
    })()
    return result
  }, [phase, questions, responses])

  if (phase === 'intro') {
    const staticCount = bankReady
      ? DOMAINS.flatMap(d => d.objectives).reduce((n, o) => n + getMcForObjective(o.id).length, 0)
      : 0
    const staticPct = Math.min(100, Math.round((Math.min(staticCount, MOCK_EXAM_QUESTION_COUNT) / MOCK_EXAM_QUESTION_COUNT) * 100))
    return (
      <div>
        <button style={styles.backBtn} onClick={onExit}>‹ Back</button>
        <h1 style={styles.h1}>Mock Exam</h1>
        <div style={styles.card}>
          <div style={{ fontSize: 'var(--ccna-type-md)', lineHeight: 1.7 }}>
            <div>• {MOCK_EXAM_QUESTION_COUNT} questions, {MOCK_EXAM_DURATION_MIN} minute countdown</div>
            <div>• Weighted by official exam domain percentages</div>
            <div>• <span style={{ color: COLORS.mint }}>{canUseStaticOnly ? '100% from your static bank' : `~${staticPct}% from your static question bank`}</span>{canUseStaticOnly ? ` — ${STATIC_COPY.mockStaticLine}` : ' — hybrid fills gaps on demand'}</div>
            <div>• Score report broken down by domain at the end</div>
            <div>• Once started, the timer runs continuously — find a quiet 2 hours, or submit early</div>
          </div>
          {bankReady && staticCount > 0 && (
            <div style={{ ...styles.small, marginTop: 8, color: COLORS.silverMid }}>
              {staticCount} multiple-choice questions in static bank for this exam
            </div>
          )}
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, fontSize: 'var(--ccna-type-md)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={staticOnly}
              onChange={e => setStaticOnly(e.target.checked)}
              disabled={!canUseStaticOnly && staticOnly}
              style={{ width: 18, height: 18, accentColor: COLORS.brand }}
            />
            <span>
              {STATIC_COPY.mockStaticOnly}
              {!canUseStaticOnly && !bankReady && <span style={{ color: COLORS.silverMid }}> — loading bank…</span>}
            </span>
          </label>
        </div>
        <button style={styles.primaryBtn} onClick={start}>Start Mock Exam</button>
      </div>
    )
  }
  if (phase === 'loading') return <Spinner label="Building your exam..." />
  if (phase === 'error') return <ErrorBox message={error} onRetry={start} />

  if (phase === 'done') {
    const pct = report.total > 0 ? Math.round((report.correct / report.total) * 100) : 0
    return (
      <div>
        <button style={styles.backBtn} onClick={onExit}>‹ Back to Home</button>
        <h1 style={styles.h1}>Exam Results</h1>
        <div style={styles.card}>
          <div style={{ fontSize: 'var(--ccna-type-display)', fontWeight: 700, color: pct >= 70 ? COLORS.mint : COLORS.rose }}>{pct}%</div>
          <div style={styles.small}>{report.correct} / {report.total} correct</div>
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
        <button style={styles.primaryBtn} onClick={() => { setCurrent(0); setPhase('review') }}>Review answers</button>
        <button style={{ ...styles.secondaryBtn, marginTop: 8 }} onClick={start}>Retake mock exam</button>
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
            <AnswerReview q={q} selected={selected} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button style={styles.secondaryBtn} disabled={current === 0} onClick={() => setCurrent(c => Math.max(0, c - 1))}>Previous</button>
          <button style={styles.primaryBtn} disabled={current >= questions.length - 1} onClick={() => setCurrent(c => Math.min(questions.length - 1, c + 1))}>Next</button>
        </div>
      </div>
    )
  }

  // active — exam mode keeps choices fully visible until submit; accordion applies in review.
  const q = questions[current]
  const selected = responses[current]
  const answeredCount = Object.keys(responses).length
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={styles.small}>Question {current + 1} / {questions.length}</div>
        <div style={{ ...styles.pill(secondsLeft < 600 ? 'rose' : 'sky') }}>{formatSeconds(secondsLeft)}</div>
      </div>
      <div style={styles.card}>
        <div style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 600, marginBottom: 14, lineHeight: 1.5, overflowWrap: 'anywhere', wordBreak: 'break-word' }}>{q.question}</div>
        <McChoices q={q} selected={selected ?? null} revealed={false} onSelect={selectChoice} />
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <button style={styles.secondaryBtn} disabled={current === 0} onClick={() => setCurrent(c => Math.max(0, c - 1))}>Previous</button>
        {current < questions.length - 1 ? (
          <button style={styles.primaryBtn} onClick={() => setCurrent(c => Math.min(questions.length - 1, c + 1))}>Next</button>
        ) : (
          <button style={styles.primaryBtn} onClick={() => setPhase('done')}>Submit Exam</button>
        )}
      </div>
      <div style={{ ...styles.small, textAlign: 'center' }}>{answeredCount} / {questions.length} answered</div>
      {current === questions.length - 1 ? null : (
        <button style={{ ...styles.secondaryBtn, marginTop: 8, background: 'none', border: 'none', color: COLORS.silverMid }} onClick={() => setPhase('done')}>
          Submit exam now
        </button>
      )}
    </div>
  )
}
