import React, { useState, useEffect, useMemo, useRef } from 'react'
import { ALL_OBJECTIVES } from './data/ccnaDomains.js'
import { getCuratedQuestions } from './data/ccnaCurated.js'
import { isMcQuestion } from './questionUtils.js'
import { COLORS, styles } from './ui/appTheme.js'
import McChoices from './components/McChoices.jsx'
import AnswerReview from './components/AnswerReview.jsx'

const INTERVIEW_SIZE = 10
const QUESTION_SECONDS = 90
const AUTO_ADVANCE_SECONDS = 4
const PASS_THRESHOLD = 0.7

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildPool() {
  const all = ALL_OBJECTIVES.flatMap(o =>
    getCuratedQuestions(o.id)
      .filter(isMcQuestion)
      .map(q => ({ ...q, objectiveId: q.objectiveId || o.id }))
  )
  if (!all.length) return []
  const s = shuffle(all)
  const trouble = s.filter(q => q.type === 'troubleshooting')
  const other = s.filter(q => q.type !== 'troubleshooting')
  return shuffle([...trouble.slice(0, 3), ...other]).slice(0, INTERVIEW_SIZE)
}

function TimerRing({ seconds, total }) {
  const pct = seconds / total
  const r = 20
  const circ = 2 * Math.PI * r
  const color = pct > 0.4 ? COLORS.mint : pct > 0.2 ? COLORS.amber : COLORS.rose
  return (
    <svg width={52} height={52} style={{ flexShrink: 0 }}>
      <circle cx={26} cy={26} r={r} fill="none" stroke={COLORS.surface} strokeWidth={4} />
      <circle
        cx={26} cy={26} r={r}
        fill="none" stroke={color} strokeWidth={4}
        strokeDasharray={`${pct * circ} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 26 26)"
        style={{ transition: 'stroke-dasharray 1s linear, stroke 0.3s' }}
      />
      <text x={26} y={30} textAnchor="middle" fill={color} fontSize={13} fontWeight={700} fontFamily="inherit">{seconds}</text>
    </svg>
  )
}

export default function ExamDayInterview({ onExit }) {
  const [phase, setPhase] = useState('intro') // intro | active | done
  const [questions, setQuestions] = useState([])
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [timeLeft, setTimeLeft] = useState(QUESTION_SECONDS)
  const [autoLeft, setAutoLeft] = useState(AUTO_ADVANCE_SECONDS)
  const [responses, setResponses] = useState([])

  // Per-question countdown
  useEffect(() => {
    if (phase !== 'active' || revealed) return
    if (timeLeft <= 0) { doReveal(null); return }
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000)
    return () => clearTimeout(t)
  })

  // Auto-advance after reveal
  useEffect(() => {
    if (!revealed) return
    if (autoLeft <= 0) { doAdvance(); return }
    const t = setTimeout(() => setAutoLeft(s => s - 1), 1000)
    return () => clearTimeout(t)
  })

  function start() {
    const pool = buildPool()
    setQuestions(pool)
    setIdx(0)
    setSelected(null)
    setRevealed(false)
    setTimeLeft(QUESTION_SECONDS)
    setAutoLeft(AUTO_ADVANCE_SECONDS)
    setResponses([])
    setPhase(pool.length ? 'active' : 'done')
  }

  function doReveal(choice) {
    setSelected(choice)
    setRevealed(true)
    setResponses(prev => [...prev, choice])
    setAutoLeft(AUTO_ADVANCE_SECONDS)
  }

  function doAdvance() {
    const next = idx + 1
    if (next >= questions.length) {
      setPhase('done')
    } else {
      setIdx(next)
      setSelected(null)
      setRevealed(false)
      setTimeLeft(QUESTION_SECONDS)
      setAutoLeft(AUTO_ADVANCE_SECONDS)
    }
  }

  const current = questions[idx]

  const score = useMemo(() => {
    if (!responses.length) return null
    const correct = responses.filter((sel, i) => sel != null && questions[i] && sel === questions[i].correctIndex).length
    const total = responses.length
    return { correct, total, pct: correct / total, pass: correct / total >= PASS_THRESHOLD }
  }, [responses, questions])

  /* ---- INTRO ---- */
  if (phase === 'intro') {
    return (
      <div style={{ padding: 20, maxWidth: 480, margin: '0 auto' }}>
        <button onClick={onExit} style={styles.backBtn}>← Back</button>
        <div style={{ fontSize: 'var(--ccna-type-xl)', fontWeight: 800, color: COLORS.silver, marginTop: 8, marginBottom: 4 }}>
          Exam Day Interview
        </div>
        <div style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.silverMid, marginBottom: 20 }}>
          Simulate real exam pressure — one question at a time with a hard countdown.
        </div>
        <div style={{ ...styles.card, padding: 14, marginBottom: 20 }}>
          {[
            ['🎯', '10 questions', 'from the full static question bank'],
            ['⏱', '90 seconds each', 'auto-submits when time runs out'],
            ['⚡', 'Immediate reveal', 'answer shown right after you submit'],
            ['🏆', '7/10 to pass', 'same 70% threshold as the real CCNA'],
          ].map(([icon, bold, rest]) => (
            <div key={bold} style={{ display: 'flex', gap: 10, marginBottom: 10, fontSize: 'var(--ccna-type-sm)', color: COLORS.silver, alignItems: 'flex-start' }}>
              <span style={{ flexShrink: 0, marginTop: 1 }}>{icon}</span>
              <span><strong>{bold}</strong> — {rest}</span>
            </div>
          ))}
        </div>
        <button style={{ ...styles.primaryBtn, width: '100%' }} onClick={start}>
          Start Interview
        </button>
      </div>
    )
  }

  /* ---- DONE ---- */
  if (phase === 'done') {
    const passed = score?.pass
    const pct = Math.round((score?.pct || 0) * 100)
    const resultColor = passed ? COLORS.mint : COLORS.rose
    const resultBg = passed ? COLORS.mintDim : COLORS.roseDim
    const resultBorder = passed ? COLORS.mintBorder : COLORS.rose
    return (
      <div style={{ padding: 20, maxWidth: 480, margin: '0 auto' }}>
        <button onClick={onExit} style={styles.backBtn}>← Back</button>
        <div style={{ textAlign: 'center', padding: '24px 16px', background: resultBg, border: `2px solid ${resultBorder}`, borderRadius: 14, marginBottom: 20, marginTop: 8 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>{passed ? '🎉' : '📚'}</div>
          <div style={{ fontSize: 48, fontWeight: 800, color: resultColor, lineHeight: 1 }}>{pct}%</div>
          <div style={{ fontSize: 'var(--ccna-type-md)', color: resultColor, fontWeight: 700, marginTop: 4, marginBottom: 4 }}>
            {passed ? 'PASS' : 'KEEP STUDYING'}
          </div>
          <div style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.silverMid }}>
            {score?.correct}/{score?.total} correct · 70% needed to pass
          </div>
        </div>
        <div style={{ ...styles.card, padding: 12, marginBottom: 20 }}>
          <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 700, color: COLORS.silverMid, marginBottom: 10, letterSpacing: 0.4 }}>
            QUESTION BREAKDOWN
          </div>
          {questions.map((q, i) => {
            const sel = responses[i]
            const correct = sel != null && sel === q.correctIndex
            const timedOut = sel == null
            const icon = timedOut ? '⏱' : correct ? '✓' : '✗'
            const iconColor = timedOut ? COLORS.amber : correct ? COLORS.mint : COLORS.rose
            return (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8, fontSize: 'var(--ccna-type-sm)' }}>
                <span style={{ flexShrink: 0, color: iconColor, fontWeight: 700, width: 16, marginTop: 1 }}>{icon}</span>
                <span style={{ color: COLORS.silverMid, flexShrink: 0, marginTop: 1 }}>Q{i + 1}</span>
                <span style={{ color: COLORS.silver, lineHeight: 1.4 }}>
                  {q.question?.slice(0, 90)}{(q.question?.length ?? 0) > 90 ? '…' : ''}
                </span>
              </div>
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ ...styles.primaryBtn, flex: 1 }} onClick={start}>Try Again</button>
          <button style={{ ...styles.secondaryBtn, flex: 1 }} onClick={onExit}>Done</button>
        </div>
      </div>
    )
  }

  /* ---- ACTIVE ---- */
  if (!current) return null
  const isCorrect = revealed && selected === current.correctIndex
  const timedOut = revealed && selected == null

  return (
    <div style={{ padding: 20, maxWidth: 480, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <button onClick={onExit} style={{ ...styles.backBtn, margin: 0, fontSize: 'var(--ccna-type-sm)' }}>✕ Exit</button>
        <span style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.silverMid, fontWeight: 600 }}>
          {idx + 1} / {questions.length}
        </span>
        {revealed
          ? <div style={{ width: 52 }} />
          : <TimerRing seconds={timeLeft} total={QUESTION_SECONDS} />
        }
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: COLORS.surface, borderRadius: 99, marginBottom: 16, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${((idx + (revealed ? 1 : 0)) / questions.length) * 100}%`,
          background: COLORS.sky,
          borderRadius: 99,
          transition: 'width 0.3s',
        }} />
      </div>

      {/* Question */}
      <div style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 600, lineHeight: 1.5, color: COLORS.silver, marginBottom: 14, overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
        {current.question}
      </div>

      {/* Choices */}
      <McChoices
        q={current}
        selected={selected}
        revealed={revealed}
        onSelect={sel => { if (!revealed) setSelected(sel) }}
        accordionOnReveal={false}
      />

      {/* Submit or post-reveal */}
      {!revealed ? (
        <button
          style={{ ...styles.primaryBtn, width: '100%', marginTop: 4, opacity: selected == null ? 0.5 : 1 }}
          onClick={() => selected != null && doReveal(selected)}
          disabled={selected == null}
        >
          Submit Answer
        </button>
      ) : (
        <div style={{ marginTop: 4 }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 14px', borderRadius: 10, marginBottom: 10,
            background: timedOut ? COLORS.amberDim : isCorrect ? COLORS.mintDim : COLORS.roseDim,
            border: `2px solid ${timedOut ? COLORS.amberBorder : isCorrect ? COLORS.mintBorder : COLORS.rose}`,
          }}>
            <span style={{ fontWeight: 700, fontSize: 'var(--ccna-type-sm)', color: timedOut ? COLORS.amber : isCorrect ? COLORS.mint : COLORS.rose }}>
              {timedOut ? "⏱ Time's up" : isCorrect ? '✓ Correct' : '✗ Incorrect'}
            </span>
            {idx + 1 < questions.length && (
              <span style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid }}>
                Next in {autoLeft}s
              </span>
            )}
          </div>
          <AnswerReview q={current} selected={selected} hideExamTip />
          <button style={{ ...styles.primaryBtn, width: '100%', marginTop: 8 }} onClick={doAdvance}>
            {idx + 1 < questions.length ? 'Next Question →' : 'See Results'}
          </button>
        </div>
      )}
    </div>
  )
}
