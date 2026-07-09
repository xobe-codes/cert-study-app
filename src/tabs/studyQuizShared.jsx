import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { getCuratedQuestions } from '../data/ccnaCurated.js'
import {
  TYPE_LABEL, SKILL_LABEL, isOrderingQuestion, isMcQuestion, isCliQuestion, gradeQuestion,
  shuffleArrayCopy, randomizeQuestionOrder, inferSkill,
} from '../questionUtils.js'
import { parseRichTextSegments } from '../lesson/richTextParse.js'
import McChoices from '../components/McChoices.jsx'
import AnswerReview from '../components/AnswerReview.jsx'
import { McChoiceShuffleProvider } from '../context/McChoiceShuffleContext.jsx'
import { applyAnswerReviewToQuestion } from '../answerReviewLogic.js'
import ErrorBox from '../components/ErrorBox.jsx'
import { CliAnswerInput } from '../components/QuizQuestionChrome.jsx'
import { cliStringsEquivalent } from '../lab/cliGrading.js'
import SvgConfetti from '../components/SvgConfetti.jsx'
import { COLORS, styles } from '../ui/appTheme.js'
import { STATIC_COPY } from '../ui/staticContentCopy.js'
import { useNavHint } from '../components/NavHintProvider.jsx'
import { NAV_HINT_KEYS } from '../ui/navHintConfig.js'
import { BOOK_REF } from '../data/bookRefFull.js'
import { PREMIUM_FEATURES } from '../premium/premiumFeatures.js'
import {
  askClaudeJSON, MODELS, Skeleton,
  PREASSESS_CACHE_KEY, PREASSESS_PROMPT_SYSTEM, PREASSESS_SCHEMA,
  logEvent, haptic,
} from './tabRuntimeDeps.js'

// Renders `inline code` and **bold** segments in lesson prose.
export function RichText({ text }) {
  if (text == null) return null
  const segments = parseRichTextSegments(text)
  return segments.map((seg, i) => {
    if (seg.type === 'code') {
      return (
        <code key={i} style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 5, padding: '1px 5px', fontSize: 'var(--ccna-type-sm)', color: COLORS.sky, overflowWrap: 'anywhere', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{seg.value}</code>
      )
    }
    if (seg.type === 'bold') {
      return <strong key={i} style={{ color: COLORS.silver, fontWeight: 700 }}>{seg.value}</strong>
    }
    return <span key={i}>{seg.value}</span>
  })
}
export function Bullets({ items }) {
  return <ul style={{ margin: 0, paddingLeft: 18 }}>{(items || []).map((t, i) => <li key={i} style={{ marginBottom: 4 }}><RichText text={t} /></li>)}</ul>
}

export function moveOrderItem(items, from, to) {
  const next = [...items]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

export function OrderingQuestion({ items, onChange, revealed, correctOrder }) {
  const [dragIdx, setDragIdx] = useState(null)
  const [coarsePointer, setCoarsePointer] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(pointer: coarse)')
    setCoarsePointer(mq.matches)
    const onChangeMq = () => setCoarsePointer(mq.matches)
    mq.addEventListener?.('change', onChangeMq)
    return () => mq.removeEventListener?.('change', onChangeMq)
  }, [])

  function reorder(from, to) {
    if (revealed || from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) return
    onChange(moveOrderItem(items, from, to))
  }

  return (
    <div className="ordering-touch-first">
      {!coarsePointer && (
        <div style={{ ...styles.small, marginBottom: 8 }}>Drag items into order, or use ↑ ↓ on mobile.</div>
      )}
      {coarsePointer && (
        <div className="ordering-touch-hint" style={{ ...styles.small, marginBottom: 8, fontWeight: 600, color: COLORS.sky }}>Use ↑ ↓ to reorder</div>
      )}
      {items.map((item, idx) => {
        let bg = COLORS.surface
        let border = COLORS.border
        let color = COLORS.silver
        let borderWidth = 1
        if (revealed && correctOrder) {
          const ok = cliStringsEquivalent(item, correctOrder[idx])
          if (ok) { bg = COLORS.mintDim; border = COLORS.mintBorder; color = COLORS.mint }
          else { bg = COLORS.roseDim; border = COLORS.rose; color = COLORS.rose; borderWidth = 2 }
        }
        return (
          <div
            key={`${idx}-${item.slice(0, 24)}`}
            draggable={!revealed && !coarsePointer}
            onDragStart={() => setDragIdx(idx)}
            onDragOver={e => { e.preventDefault() }}
            onDrop={() => { reorder(dragIdx, idx); setDragIdx(null) }}
            onDragEnd={() => setDragIdx(null)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, padding: '10px 12px',
              background: bg, border: `${borderWidth}px solid ${border}`, borderRadius: 10, color,
              cursor: revealed ? 'default' : 'grab', lineHeight: 1.4, fontSize: 'var(--ccna-type-md)',
              opacity: dragIdx === idx ? 0.55 : 1,
            }}
          >
            <span style={{ ...styles.pill('purple'), fontSize: 'var(--ccna-type-micro)', flexShrink: 0, minWidth: 22, textAlign: 'center' }}>{idx + 1}</span>
            <span style={{ flex: 1, minWidth: 0, overflowWrap: 'anywhere', wordBreak: 'break-word' }}>{item}</span>
            {!revealed && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
                <button type="button" onClick={() => reorder(idx, idx - 1)} disabled={idx === 0}
                  style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, color: COLORS.silverMid, borderRadius: 8, width: 44, height: 44, cursor: idx === 0 ? 'default' : 'pointer', fontSize: 'var(--ccna-type-md)', padding: 0 }}>↑</button>
                <button type="button" onClick={() => reorder(idx, idx + 1)} disabled={idx === items.length - 1}
                  style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, color: COLORS.silverMid, borderRadius: 8, width: 44, height: 44, cursor: idx === items.length - 1 ? 'default' : 'pointer', fontSize: 'var(--ccna-type-md)', padding: 0 }}>↓</button>
              </div>
            )}
          </div>
        )
      })}
      {revealed && correctOrder && (
        <div style={{ ...styles.small, marginTop: 4 }}>Correct order: {correctOrder.map((s, i) => `${i + 1}. ${s}`).join(' → ')}</div>
      )}
    </div>
  )
}

// AnswerReview lives in components/AnswerReview.jsx (accordion on other distractors).

// Small type + difficulty badges shown above a question (mixed-type quizzes).
export function QuestionMeta({ q }) {
  if (!q || (!q.type && !q.difficulty && !q.skill)) return null
  const skill = q.skill || inferSkill(q)
  // easy = green (approachable) · medium = blue (learning) · hard = amber
  // (heads-up). Red stays reserved for wrong answers, never for difficulty.
  const dAccent = q.difficulty === 'hard' ? 'amber' : q.difficulty === 'medium' ? 'sky' : 'mint'
  const skillAccent = skill === 'troubleshoot' ? 'amber' : skill === 'implement' ? 'sky' : 'mint'
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
      {q.difficulty && <span style={{ ...styles.pill(dAccent), fontSize: 'var(--ccna-type-micro)' }}>{q.difficulty.toUpperCase()}</span>}
      {q.type && <span style={{ ...styles.pill(q.type === 'troubleshooting' || q.type === 'ordering' || q.type === 'cli' ? 'sky' : 'silver'), fontSize: 'var(--ccna-type-micro)' }}>{TYPE_LABEL[q.type] || q.type}</span>}
      {skill && <span style={{ ...styles.pill(skillAccent), fontSize: 'var(--ccna-type-micro)' }}>{SKILL_LABEL[skill] || skill}</span>}
      {q.concept && <span style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, alignSelf: 'center' }}>{q.concept}</span>}
    </div>
  )
}

export function PreAssessment({ objective, onTestedOut, onStudy, premiumUnlocked = false, onPremiumBlocked }) {
  const [phase, setPhase] = useState('intro') // intro | loading | active | result | error
  const [error, setError] = useState(null)
  const [questions, setQuestions] = useState([])
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [orderDraft, setOrderDraft] = useState([])
  const [cliAnswer, setCliAnswer] = useState('')
  const [results, setResults] = useState([]) // { concept, correct }
  const showNavHint = useNavHint()
  const resultHintFired = useRef(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const quizPoolSize = useMemo(() => getCuratedQuestions(objective.id).length, [objective.id])
  const preassessCount = 6

  const q = questions[idx]
  useEffect(() => {
    if (q && isOrderingQuestion(q)) setOrderDraft(shuffleArrayCopy(q.orderItems))
    else setOrderDraft([])
    setCliAnswer('')
  }, [q])

  useEffect(() => {
    if (phase !== 'result') {
      resultHintFired.current = false
      setShowConfetti(false)
      return
    }
    if (resultHintFired.current || results.length === 0) return
    resultHintFired.current = true
    const correct = results.filter(r => r.correct).length
    const pct = correct / results.length
    if (pct >= 0.85) {
      setShowConfetti(true)
      haptic([12, 40, 12, 40, 18])
      showNavHint(NAV_HINT_KEYS.PREASSESS_PASS)
    } else if (pct >= 0.6) {
      showNavHint(NAV_HINT_KEYS.PREASSESS_PARTIAL)
    } else {
      showNavHint(NAV_HINT_KEYS.PREASSESS_FAIL)
    }
  }, [phase, results, showNavHint])

  const start = useCallback(async () => {
    setPhase('loading'); setError(null)
    try {
      const cache = (await window.storage.getItem(PREASSESS_CACHE_KEY)) || {}
      let qs = cache[objective.id]
      if (!qs) {
        // Use curated/imported questions if we have enough — zero API cost
        const staticQs = getCuratedQuestions(objective.id)
        if (staticQs.length >= 6) {
          qs = randomizeQuestionOrder(staticQs).slice(0, 6)
        } else if (!premiumUnlocked) {
          onPremiumBlocked?.(PREMIUM_FEATURES.quiz_generate, 'preassess', { objectiveId: objective.id })
          setPhase('intro')
          return
        } else {
          const refNotes = BOOK_REF[objective.id] || ''
          const data = await askClaudeJSON({
            system: PREASSESS_PROMPT_SYSTEM,
            messages: [{ role: 'user', content: `Objective ${objective.id}: ${objective.title}\n\nReference notes:\n${refNotes}\n\nWrite the pre-assessment.` }],
            max_tokens: 1800, model: MODELS.fast, schema: PREASSESS_SCHEMA, toolName: 'emit_preassessment', feature: 'preassess',
          })
          qs = data.questions || []
          if (qs.length === 0) throw new Error('Could not build a pre-assessment.')
        }
        cache[objective.id] = qs
        await window.storage.setItem(PREASSESS_CACHE_KEY, cache)
      }
      setQuestions(randomizeQuestionOrder(qs)); setIdx(0); setSelected(null); setRevealed(false); setResults([])
      setPhase('active')
      logEvent('user_started_preassessment', { objectiveId: objective.id })
    } catch (err) {
      setError(err.message); setPhase('error')
    }
  }, [objective.id, objective.title, premiumUnlocked, onPremiumBlocked])

  function answer(i) {
    if (revealed || !isMcQuestion(questions[idx])) return
    const q = questions[idx]
    const correct = gradeQuestion(q, i)
    haptic(correct ? 15 : [10, 40, 10])
    setSelected(i); setRevealed(true)
    setResults(r => [...r, { concept: q.concept, correct }])
  }
  function submitOrder() {
    if (revealed || !isOrderingQuestion(questions[idx])) return
    const q = questions[idx]
    const correct = gradeQuestion(q, orderDraft)
    haptic(correct ? 15 : [10, 40, 10])
    setRevealed(true)
    setResults(r => [...r, { concept: q.concept, correct }])
  }
  function submitCli() {
    if (revealed || !isCliQuestion(questions[idx])) return
    const q = questions[idx]
    const correct = gradeQuestion(q, cliAnswer)
    haptic(correct ? 15 : [10, 40, 10])
    setRevealed(true)
    setResults(r => [...r, { concept: q.concept, correct }])
  }
  function next() {
    if (idx + 1 >= questions.length) { setPhase('result'); return }
    setIdx(i => i + 1); setSelected(null); setRevealed(false); setCliAnswer('')
  }

  if (phase === 'intro') {
    return (
      <div style={{ ...styles.card, border: `1px solid ${COLORS.skyBorder}`, background: COLORS.skyDim }}>
        <div style={{ fontSize: 'var(--ccna-type-sm)', fontWeight: 700, color: COLORS.sky, marginBottom: 6 }}>📋 PRE-ASSESSMENT</div>
        <div style={{ fontSize: 'var(--ccna-type-md)', lineHeight: 1.5, marginBottom: 6 }}>Already know this section? Take a quick {preassessCount}-question check — score 85%+ and you can skip straight ahead.</div>
        <div style={{ ...styles.small, marginBottom: 12 }}>
          {preassessCount} questions in this check
          {quizPoolSize > 0 && <> · <strong style={{ color: COLORS.silver }}>{quizPoolSize}</strong> in full quiz bank</>}
          {quizPoolSize >= preassessCount && ` · ${STATIC_COPY.preassessPool}`}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={styles.primaryBtn} onClick={start}>Test out</button>
          <button style={styles.secondaryBtn} onClick={() => onStudy({ direct: true })}>Study it</button>
        </div>
      </div>
    )
  }
  if (phase === 'loading') return <div style={{ ...styles.card, border: `1px solid ${COLORS.skyBorder}`, background: COLORS.skyDim }}><Skeleton width="50%" height={16} /><Skeleton width="100%" /><Skeleton width="90%" /></div>
  if (phase === 'error') return <ErrorBox message={error} onRetry={start} />

  if (phase === 'result') {
    const correct = results.filter(r => r.correct).length
    const pct = correct / results.length
    const missed = [...new Set(results.filter(r => !r.correct).map(r => r.concept).filter(Boolean))]
    const tier = pct >= 0.85 ? 'ready' : pct >= 0.6 ? 'partial' : 'study'
    // Score → color: green (ready/skip) · amber (partial knowledge) · neutral
    // blue (needs study). Never red for a low score — that demotivates rather
    // than guides; red is reserved for actual errors/warnings.
    const accent = tier === 'ready' ? { c: COLORS.mint, dim: COLORS.mintDim, b: COLORS.mintBorder } : tier === 'partial' ? { c: COLORS.amber, dim: COLORS.amberDim, b: COLORS.amberBorder } : { c: COLORS.sky, dim: COLORS.skyDim, b: COLORS.skyBorder }
    return (
      <>
        {showConfetti && <SvgConfetti active onComplete={() => setShowConfetti(false)} />}
        <div style={{ ...styles.card, border: `1px solid ${accent.b}`, background: accent.dim }}>
        <div style={{ fontSize: 'var(--ccna-type-2xl)', fontWeight: 700, color: accent.c }}>{correct}/{results.length} · {Math.round(pct * 100)}%</div>
        <div style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 600, margin: '4px 0 8px' }}>
          {tier === 'ready' ? "You're ready — you can skip this section." : tier === 'partial' ? 'You know some of this.' : 'Recommend studying this section first.'}
        </div>
        {missed.length > 0 && (
          <div style={{ ...styles.small, marginBottom: 12 }}>Review these: {missed.map(m => <span key={m} style={{ ...styles.pill('amber'), fontSize: 'var(--ccna-type-xs)', marginRight: 4, display: 'inline-block', marginBottom: 4 }}>{m}</span>)}</div>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          {tier === 'ready'
            ? <><button style={styles.primaryBtn} onClick={() => onTestedOut(questions, pct)}>Skip section</button><button style={styles.secondaryBtn} onClick={() => onStudy({ preAssessPct: pct, reviewAnyway: true })}>Review anyway</button></>
            : <button style={styles.primaryBtn} onClick={() => onStudy({ preAssessPct: pct })}>{tier === 'partial' ? 'Review weak areas' : 'Start lesson'}</button>}
        </div>
        </div>
      </>
    )
  }

  // active
  const ordering = isOrderingQuestion(q)
  const cli = isCliQuestion(q)
  const isCorrect = revealed && (ordering ? gradeQuestion(q, orderDraft) : cli ? gradeQuestion(q, cliAnswer) : gradeQuestion(q, selected))
  return (
    <div>
      <div style={{ ...styles.small, marginBottom: 8 }}>Pre-assessment · {idx + 1} of {questions.length}</div>
      <div style={styles.card}>
        <QuestionMeta q={q} />
        <div style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 600, marginBottom: 14, lineHeight: 1.5, overflowWrap: 'anywhere', wordBreak: 'break-word' }}><RichText text={q.question} /></div>
        <McChoiceShuffleProvider q={q} enabled={!ordering && !cli}>
        {ordering ? (
          <OrderingQuestion items={orderDraft} onChange={setOrderDraft} revealed={revealed} correctOrder={revealed ? q.orderItems : null} />
        ) : cli ? (
          <CliAnswerInput value={cliAnswer} onChange={setCliAnswer} onSubmit={submitCli} revealed={revealed} question={q} />
        ) : (
          <McChoices q={q} selected={selected} revealed={revealed} onSelect={answer} />
        )}
        {revealed && (
          <div style={{ marginTop: 8, padding: 12, borderRadius: 10, background: isCorrect ? COLORS.mintDim : COLORS.roseDim, border: `2px solid ${isCorrect ? COLORS.mintBorder : COLORS.rose}` }}>
            <div style={{ fontWeight: 700, color: isCorrect ? COLORS.mint : COLORS.rose, marginBottom: 4, fontSize: 'var(--ccna-type-sm)' }}>{isCorrect ? 'Correct' : 'Incorrect'}</div>
            <AnswerReview
              q={applyAnswerReviewToQuestion(q)}
              selected={selected}
              cliAnswer={cliAnswer}
              orderAnswer={orderDraft}
            />
          </div>
        )}
        </McChoiceShuffleProvider>
      </div>
      {ordering && !revealed && <button style={{ ...styles.primaryBtn, marginBottom: 10 }} onClick={submitOrder}>Check order</button>}
      {cli && !revealed && <button style={{ ...styles.primaryBtn, marginBottom: 10 }} onClick={submitCli} disabled={!cliAnswer.trim()}>Check command</button>}
      {revealed && <button style={styles.primaryBtn} onClick={next}>{idx + 1 >= questions.length ? 'See result' : 'Next'}</button>}
    </div>
  )
}
