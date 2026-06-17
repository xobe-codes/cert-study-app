import React, { useState, useEffect, useMemo, useCallback, useRef, useId } from 'react'
import { getCurated, hasCuratedReading, hasCuratedQuestions, getCuratedQuestions } from '../data/ccnaCurated.js'
import {
  TYPE_LABEL, SKILL_LABEL, isOrderingQuestion, isMcQuestion, gradeQuestion, correctAnswerLabel,
  shuffleArrayCopy, randomizeQuestionOrder, computeBankMix, normalizeQuestionForBank, inferSkill, buildMissedEntry,
} from '../questionUtils.js'
import { getLessonReference, hasLessonReference } from '../lesson/knowledgeReference.js'
import { buildConceptDetail } from '../lesson/conceptDetail.js'
import { pickReviewSet, computeCkuCoverage, getObjectiveCkuIds } from '../lesson/quizCoverage.js'
import {
  READING_TIERS, computeDefaultReadingTier, getReadingTier, readingTierHint,
  studyMetaToProgress, READING_TIER_KEYS,
} from '../lesson/readingTier.js'
import {
  explanationBodyFromReading, explanationBodyFromAi, resolveBigTakeaway, resolveAiTakeaway,
} from '../lesson/explanationFormat.js'
import { parseRichTextSegments } from '../lesson/richTextParse.js'
import CuratedDiagram from '../components/CuratedDiagram.jsx'
import CuratedStaticBadge from '../components/CuratedStaticBadge.jsx'
import OverflowMarquee from '../components/OverflowMarquee.jsx'
import EngineerViewSection from '../components/EngineerViewSection.jsx'
import { getEngineerView } from '../lesson/engineerView.js'
import McChoices from '../components/McChoices.jsx'
import AnswerReview from '../components/AnswerReview.jsx'
import ErrorBox from '../components/ErrorBox.jsx'
import Spinner from '../components/Spinner.jsx'
import SvgConfetti from '../components/SvgConfetti.jsx'
import DeferredExamTips from '../components/DeferredExamTips.jsx'
import MasteryChecklist from '../components/MasteryChecklist.jsx'
import { COLORS, accentColors, styles } from '../ui/appTheme.js'
import { STATIC_COPY } from '../ui/staticContentCopy.js'
import { useNavHint } from '../components/NavHintProvider.jsx'
import { NAV_HINT_KEYS } from '../ui/navHintConfig.js'
import { DEFAULT_QUIZ_SESSION_SIZE, clampQuizSessionSize } from '../quizSessionConfig.js'
import { BOOK_REF } from '../data/bookRefFull.js'
import {
  PREMIUM_FEATURES,
  PREMIUM_COMING_SOON_LABEL,
} from '../premium/premiumFeatures.js'
import {
  askClaudeJSON, MODEL, MODELS, AiBudgetWarning,
  EXPLAIN_CACHE_KEY, EXPLAIN_PROMPT_SYSTEM, EXPLAIN_SCHEMA,
  PREASSESS_CACHE_KEY, PREASSESS_PROMPT_SYSTEM, PREASSESS_SCHEMA,
  QUIZ_BANK_MIN,
  seedTestedOutReview, logEvent, haptic, celebrate, Skeleton,
  loadQuizBank, saveQuizBank, mergeIntoBank, recordQuizResult,
  enableSectionReview, loadDueQuestions,
} from './tabRuntimeDeps.js'

function VisualBadge({ children, accent }) {
  const c = accent || COLORS.purpleGlow
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      minWidth: 22, height: 22, borderRadius: 6, fontSize: 'var(--ccna-type-xs)', fontWeight: 700,
      background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: c, padding: '0 6px',
    }}>{children}</span>
  )
}

function CuratedPacketFlow({ data }) {
  const pf = data?.packetFlow
  if (!pf?.steps?.length) return null
  return (
    <div style={{ ...styles.card, border: `1px solid ${COLORS.mintBorder}`, background: COLORS.mintDim, marginTop: 8, marginBottom: 12 }}>
      <div style={{ fontSize: 'var(--ccna-type-sm)', fontWeight: 700, color: COLORS.mint, marginBottom: 10 }}>{pf.title}</div>
      {pf.steps.map((s, i) => (
        <div key={s.id} style={{ display: 'flex', gap: 8, marginBottom: i < pf.steps.length - 1 ? 8 : 0, alignItems: 'flex-start' }}>
          <VisualBadge accent={COLORS.mint}>{s.order}</VisualBadge>
          <div>
            <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 600, color: COLORS.silver }}>{s.title}</div>
            <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, lineHeight: 1.45 }}>{s.action}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

const TERMS_CACHE_KEY = 'ccna_terms_cache_v1'
const TERMS_PROMPT_SYSTEM = `You are a CCNA 200-301 study aid generator. Use the provided reference notes as your primary source; where the notes don't fully cover a detail a CCNA candidate needs, fill the gap with accurate CCNA 200-301 knowledge consistent with the notes. Produce 6-8 key-term flashcards for this objective — the most exam-relevant terms, acronyms, commands, or concepts to know cold.

Respond with ONLY valid JSON (no markdown fences, no commentary), in this exact shape:
{"cards":[{"term":"...","detail":"..."}]}

"term": a short label, max ~4 words (a word, acronym, command, or short phrase).
"detail": 1-2 short sentences with the key fact, definition, or syntax.`

const TERMS_SCHEMA = {
  type: 'object', required: ['cards'],
  properties: { cards: { type: 'array', items: {
    type: 'object', required: ['term', 'detail'],
    properties: { term: { type: 'string' }, detail: { type: 'string' } },
  } } },
}

function KeyTermsCarousel({ objective, premiumUnlocked = false, onPremiumBlocked }) {
  const [cards, setCards] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [flipped, setFlipped] = useState(() => new Set())
  const [detailIdx, setDetailIdx] = useState(null)
  const [fromCurated, setFromCurated] = useState(false)
  const curatedFlashcards = useMemo(() => getCurated(objective.id)?.flashcards || null, [objective.id])

  const fetchTerms = useCallback(async (force) => {
    setLoading(true)
    setError(null)
    setFromCurated(false)
    try {
      if (!force && curatedFlashcards?.length) {
        setCards(curatedFlashcards.map(f => ({ term: f.front, detail: f.back, ckuId: f.ckuId || null, id: f.id })))
        setFromCurated(true)
        setLoading(false)
        return
      }
      if (!force) {
        const cache = (await window.storage.getItem(TERMS_CACHE_KEY)) || {}
        if (cache[objective.id]) {
          setCards(cache[objective.id])
          setLoading(false)
          return
        }
      }
      if (!premiumUnlocked) {
        onPremiumBlocked?.(PREMIUM_FEATURES.ai_terms, 'key_terms', { objectiveId: objective.id })
        setCards(null)
        setLoading(false)
        return
      }
      const refNotes = BOOK_REF[objective.id] || ''
      const data = await askClaudeJSON({
        system: TERMS_PROMPT_SYSTEM,
        messages: [{
          role: 'user',
          content: `Objective ${objective.id}: ${objective.title}\n\nReference notes:\n${refNotes}\n\nGenerate key-term flashcards for this objective.`,
        }],
        max_tokens: 700,
        model: MODELS.fast,
        schema: TERMS_SCHEMA,
        toolName: 'emit_terms',
        feature: 'terms',
      })
      const list = data.cards || []
      if (list.length === 0) throw new Error('Claude returned no flashcards.')
      setCards(list)
      const cache = (await window.storage.getItem(TERMS_CACHE_KEY)) || {}
      cache[objective.id] = list
      await window.storage.setItem(TERMS_CACHE_KEY, cache)
    } catch (err) {
      setError(err.message.includes('JSON') ? 'Claude returned an unexpected format. Please try again.' : err.message)
    } finally {
      setLoading(false)
    }
  }, [objective.id, objective.title, curatedFlashcards, premiumUnlocked, onPremiumBlocked])

  useEffect(() => {
    setCards(null)
    setError(null)
    setFlipped(new Set())
    setDetailIdx(null)
    fetchTerms(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objective.id])

  const toggleFlip = (idx) => {
    setFlipped(prev => {
      const next = new Set(prev)
      if (next.has(idx)) {
        next.delete(idx)
        setDetailIdx(current => (current === idx ? null : current))
      } else {
        next.add(idx)
        setDetailIdx(idx)
      }
      return next
    })
  }

  if (loading) return <Spinner label="Pulling key terms..." />
  if (error) return <ErrorBox message={error} onRetry={premiumUnlocked ? () => fetchTerms(true) : undefined} />
  if (!cards) return null

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 700, color: COLORS.silverMid, letterSpacing: 0.9 }}>🃏 KEY TERMS</div>
            <div style={{ ...styles.small, fontSize: 'var(--ccna-type-xs)', marginTop: 1 }}>Tap a card to flip</div>
          </div>
          {fromCurated && <CuratedStaticBadge objectiveId={objective.id} fontSize={9} />}
        </div>
        {premiumUnlocked && (
          <button
            type="button"
            style={{ background: 'none', border: 'none', color: COLORS.silverMid, fontSize: 'var(--ccna-type-xs)', cursor: 'pointer', padding: '4px 0', minHeight: 32 }}
            onClick={() => fetchTerms(true)}
          >
            {fromCurated ? 'Generate with AI' : 'Refresh'}
          </button>
        )}
      </div>
      <div style={{
        display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6, width: '100%', maxWidth: '100%',
        scrollSnapType: 'x mandatory',
        overscrollBehaviorX: 'contain',
      }}
      className="ccna-h-scroll"
      >
        {cards.map((c, idx) => {
          const isFlipped = flipped.has(idx)
          return (
            <button
              key={idx}
              onClick={() => toggleFlip(idx)}
              className={`key-term-card${isFlipped ? ' key-term-card--flipped' : ''}`}
              style={{
                flex: '0 0 auto', width: 168, minHeight: 110, scrollSnapAlign: 'start',
                background: isFlipped ? COLORS.skyDim : COLORS.purpleDim,
                border: `1px solid ${isFlipped ? COLORS.skyBorder : COLORS.borderGlow}`,
                borderRadius: 12, padding: 12, textAlign: 'left', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6,
                fontFamily: 'inherit', color: COLORS.silver,
              }}
            >
              <div style={{ fontSize: 'var(--ccna-type-sm)', fontWeight: 700, color: isFlipped ? COLORS.sky : COLORS.purpleGlow }}>
                {c.term}
              </div>
              {isFlipped ? (
                <div style={{ fontSize: 'var(--ccna-type-xs)', lineHeight: 1.4, color: COLORS.silver }}>{c.detail}</div>
              ) : (
                <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid }}>Tap to reveal</div>
              )}
            </button>
          )
        })}
      </div>
      {detailIdx != null && cards[detailIdx] && flipped.has(detailIdx) && (
        <ConceptDetailPanel objectiveId={objective.id} card={cards[detailIdx]} />
      )}
    </div>
  )
}

function PreAssessment({ objective, onTestedOut, onStudy, premiumUnlocked = false, onPremiumBlocked }) {
  const [phase, setPhase] = useState('intro') // intro | loading | active | result | error
  const [error, setError] = useState(null)
  const [questions, setQuestions] = useState([])
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [orderDraft, setOrderDraft] = useState([])
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
          setLoading(false)
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
  function next() {
    if (idx + 1 >= questions.length) { setPhase('result'); return }
    setIdx(i => i + 1); setSelected(null); setRevealed(false)
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
  const isCorrect = revealed && (ordering ? gradeQuestion(q, orderDraft) : gradeQuestion(q, selected))
  return (
    <div>
      <div style={{ ...styles.small, marginBottom: 8 }}>Pre-assessment · {idx + 1} of {questions.length}</div>
      <div style={styles.card}>
        <QuestionMeta q={q} />
        <div style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 600, marginBottom: 14, lineHeight: 1.5, overflowWrap: 'anywhere', wordBreak: 'break-word' }}><RichText text={q.question} /></div>
        {ordering ? (
          <OrderingQuestion items={orderDraft} onChange={setOrderDraft} revealed={revealed} correctOrder={revealed ? q.orderItems : null} />
        ) : (
          <McChoices q={q} selected={selected} revealed={revealed} onSelect={answer} />
        )}
        {revealed && (
          <div style={{ marginTop: 8, padding: 12, borderRadius: 10, background: isCorrect ? COLORS.mintDim : COLORS.roseDim, border: `2px solid ${isCorrect ? COLORS.mintBorder : COLORS.rose}` }}>
            <div style={{ fontWeight: 700, color: isCorrect ? COLORS.mint : COLORS.rose, marginBottom: 4, fontSize: 'var(--ccna-type-sm)' }}>{isCorrect ? 'Correct' : 'Incorrect'}</div>
            <AnswerReview q={q} selected={selected} />
          </div>
        )}
      </div>
      {ordering && !revealed && <button style={{ ...styles.primaryBtn, marginBottom: 10 }} onClick={submitOrder}>Check order</button>}
      {revealed && <button style={styles.primaryBtn} onClick={next}>{idx + 1 >= questions.length ? 'See result' : 'Next'}</button>}
    </div>
  )
}

/* ---- Text-to-Speech utilities ---- */
function _stripMarkup(text) {
  return String(text || '').replace(/`([^`]*)`/g, '$1').replace(/\*\*/g, '')
}
function _curatedReadingText(r, tier) {
  const body = explanationBodyFromReading(r, tier)
  const takeaway = resolveBigTakeaway(r)
  const parts = []
  if (body) parts.push(_stripMarkup(body))
  if (takeaway) parts.push('Key takeaway: ' + _stripMarkup(takeaway))
  if (r.keyPoints?.length) parts.push('Key points: ' + r.keyPoints.map(_stripMarkup).join('. '))
  if (r.commonMistakes?.length) parts.push('Common mistakes: ' + r.commonMistakes.map(_stripMarkup).join('. '))
  return parts.join('\n\n')
}
function _aiExplanationText(data) {
  const takeaway = resolveAiTakeaway(data)
  const parts = []
  if (data.definition) parts.push(_stripMarkup(data.definition))
  if (takeaway && takeaway !== data.definition) parts.push('Key takeaway: ' + _stripMarkup(takeaway))
  if (data.keyPoints?.length) parts.push('Key points: ' + data.keyPoints.map(_stripMarkup).join('. '))
  if (data.commonMistakes?.length) parts.push('Common mistakes: ' + data.commonMistakes.map(_stripMarkup).join('. '))
  return parts.join('\n\n')
}
function useTTS() {
  const [speaking, setSpeaking] = useState(false)
  const supported = typeof window !== 'undefined' && !!window.speechSynthesis
  const speak = useCallback((text) => {
    if (!supported) return
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(text)
    utt.onstart = () => setSpeaking(true)
    utt.onend = () => setSpeaking(false)
    utt.onerror = () => setSpeaking(false)
    window.speechSynthesis.speak(utt)
  }, [supported])
  const stop = useCallback(() => {
    if (supported) window.speechSynthesis.cancel()
    setSpeaking(false)
  }, [supported])
  useEffect(() => () => { if (supported) window.speechSynthesis.cancel() }, [supported])
  return { speak, stop, speaking, supported }
}
function SpeakButton({ getText }) {
  const { speak, stop, speaking, supported } = useTTS()
  if (!supported) return null
  return (
    <button
      type="button"
      onClick={() => speaking ? stop() : speak(getText())}
      title={speaking ? 'Stop reading' : 'Read aloud'}
      style={{
        background: speaking ? COLORS.roseDim : COLORS.surface,
        border: `1px solid ${speaking ? COLORS.rose : COLORS.border}`,
        borderRadius: 6,
        color: speaking ? COLORS.rose : COLORS.silverMid,
        cursor: 'pointer',
        fontSize: 'var(--ccna-type-xs)',
        fontWeight: 600,
        padding: '4px 8px',
        fontFamily: 'inherit',
        flexShrink: 0,
        minHeight: 28,
        lineHeight: 1,
      }}
    >
      {speaking ? '⏹ Stop' : '🔊'}
    </button>
  )
}

/* ---- Structured explanation renderer (progressive disclosure) ---- */
function ExplainBlock({ icon, title, accent, children, collapsible, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  const c = accentColors(accent)
  return (
    <div style={{ borderLeft: `3px solid ${c.text}`, background: c.dim, border: `1px solid ${c.border}`, borderRadius: 6, padding: '10px 12px', marginBottom: 8, boxShadow: '0 2px 10px #00000022' }}>
      <button
        onClick={() => collapsible && setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', padding: 0, cursor: collapsible ? 'pointer' : 'default', color: c.text }}
      >
        <span style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 700, letterSpacing: 0.3 }}>{icon} {title}</span>
        {collapsible && <span style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.silverMid }}>{open ? '−' : '+'}</span>}
      </button>
      {open && <div style={{ marginTop: 8, fontSize: 'var(--ccna-type-md)', lineHeight: 1.55, color: COLORS.silver }}>{children}</div>}
    </div>
  )
}
// Renders `inline code` and **bold** segments in lesson prose.
function RichText({ text }) {
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
function Bullets({ items }) {
  return <ul style={{ margin: 0, paddingLeft: 18 }}>{(items || []).map((t, i) => <li key={i} style={{ marginBottom: 4 }}><RichText text={t} /></li>)}</ul>
}

function ExplanationSection({ body, takeaway }) {
  if (!body) return null
  return (
    <ExplainBlock icon="🎯" title="EXPLANATION" accent="sky">
      <RichText text={body} />
      {takeaway && (
        <div style={{
          marginTop: 10, padding: '8px 10px', borderRadius: 6,
          background: COLORS.amberDim, border: `1px solid ${COLORS.amberBorder}`,
        }}>
          <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 700, color: COLORS.amber, marginBottom: 4, letterSpacing: 0.3 }}>
            🧠 BIG TAKEAWAY
          </div>
          <div style={{ fontSize: 'var(--ccna-type-sm)', lineHeight: 1.5, color: COLORS.silver }}>
            <RichText text={takeaway} />
          </div>
        </div>
      )}
    </ExplainBlock>
  )
}

function StructuredExplanation({ data }) {
  return (
    <div className="ccna-stagger">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
        <SpeakButton getText={() => _aiExplanationText(data)} />
      </div>
      <ExplanationSection body={explanationBodyFromAi(data)} takeaway={resolveAiTakeaway(data)} />
      <ExplainBlock icon="📌" title="KEY POINTS" accent="amber"><Bullets items={data.keyPoints} /></ExplainBlock>
      <ExplainBlock icon="⚠️" title="COMMON MISTAKES" accent="rose"><Bullets items={data.commonMistakes} /></ExplainBlock>
      {data.realWorld && <ExplainBlock icon="🔧" title="REAL-WORLD APPLICATION" accent="purple" collapsible defaultOpen={false}><RichText text={data.realWorld} /></ExplainBlock>}
      {data.advanced && <ExplainBlock icon="🧬" title="ADVANCED DETAILS" accent="silver" collapsible defaultOpen={false}><RichText text={data.advanced} /></ExplainBlock>}
      {data.related?.length > 0 && <ExplainBlock icon="🔗" title="RELATED CONCEPTS" accent="sky" collapsible defaultOpen={false}><Bullets items={data.related} /></ExplainBlock>}
    </div>
  )
}

/* ---- Curated content renderers (Phase 19 — static, no AI) ---- */

// Renders a curated objective's reading: source-grounded, no AI call. Reuses
// the same ExplainBlock visual language as the AI path so it feels native.
function CuratedReading({ data, progressEntry, onTierChange, onOpenReference, showDiagram = true }) {
  const resolvedTier = useMemo(() => getReadingTier(progressEntry), [progressEntry])
  const [tier, setTier] = useState(resolvedTier)
  const hint = useMemo(() => readingTierHint(progressEntry, tier), [progressEntry, tier])

  useEffect(() => {
    setTier(getReadingTier(progressEntry))
  }, [data.objectiveId, progressEntry?.readingTier, progressEntry?.testedOut, progressEntry?.preAssessPct])

  function selectTier(key) {
    setTier(key)
    onTierChange?.(key)
  }

  const r = data.reading
  return (
    <div className="ccna-stagger objective-reading-prose lesson-prose">
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, flexWrap: 'nowrap' }}>
        <CuratedStaticBadge objectiveId={data.objectiveId} fontSize={10} />
        <span style={{ flex: 1 }} />
        <SpeakButton getText={() => _curatedReadingText(r, tier)} />
      </div>
      {hint && (
        <div style={{
          ...styles.card,
          marginBottom: 10,
          padding: '10px 12px',
          borderColor: hint.type === 'testedOut' ? COLORS.mintBorder : COLORS.skyBorder,
          background: hint.type === 'testedOut' ? COLORS.mintDim : COLORS.skyDim,
        }}>
          <div style={{ fontSize: 'var(--ccna-type-sm)', lineHeight: 1.45, color: COLORS.silver, marginBottom: hint.showFullWalkthrough || hint.showReferenceLink ? 8 : 0 }}>
            {hint.message}
          </div>
          {(hint.showFullWalkthrough || hint.showReferenceLink) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {hint.showFullWalkthrough && (
                <button
                  type="button"
                  style={styles.secondaryBtn}
                  onClick={() => selectTier(READING_TIER_KEYS.intermediate)}
                >
                  Full walkthrough
                </button>
              )}
              {hint.showReferenceLink && onOpenReference && (
                <button type="button" style={styles.secondaryBtn} onClick={onOpenReference}>
                  Traps & commands →
                </button>
              )}
            </div>
          )}
        </div>
      )}
      <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 700, color: COLORS.silverMid, marginBottom: 6, letterSpacing: 0.4 }}>
        READING DEPTH
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        {READING_TIERS.map(t => {
          const active = tier === t.key
          return (
            <button key={t.key} onClick={() => selectTier(t.key)} style={{ flex: 1, minHeight: 36, borderRadius: 8, border: `1px solid ${active ? COLORS.skyBorder : COLORS.border}`, background: active ? COLORS.skyDim : COLORS.surface, color: active ? COLORS.sky : COLORS.silverMid, fontSize: 'var(--ccna-type-xs)', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>{t.label}</button>
          )
        })}
      </div>
      <ExplanationSection
        body={explanationBodyFromReading(r, tier)}
        takeaway={resolveBigTakeaway(r)}
      />
      <ExplainBlock icon="📌" title="KEY POINTS" accent="amber"><Bullets items={r.keyPoints} /></ExplainBlock>
      <ExplainBlock icon="⚠️" title="COMMON MISTAKES" accent="rose"><Bullets items={r.commonMistakes} /></ExplainBlock>
      {r.realWorld && <ExplainBlock icon="🔧" title="REAL-WORLD APPLICATION" accent="purple" collapsible defaultOpen={false}><RichText text={r.realWorld} /></ExplainBlock>}
      {r.advanced && <ExplainBlock icon="🧬" title="ADVANCED DETAILS" accent="silver" collapsible defaultOpen={false}><RichText text={r.advanced} /></ExplainBlock>}
      {r.related?.length > 0 && <ExplainBlock icon="🔗" title="RELATED CONCEPTS" accent="sky" collapsible defaultOpen={false}><Bullets items={r.related} /></ExplainBlock>}
      {showDiagram && data.diagram && <CuratedDiagram diagram={data.diagram} />}
    </div>
  )
}

/* ---- Quick-reference panel: shows BOOK_REF notes instantly for any objective
   (no AI, no wait). Shown on non-curated objectives before Reveal explanation. ---- */
function BookRefPanel({ objective }) {
  const notes = BOOK_REF[objective.id]
  if (!notes) return null
  return (
    <div style={{ ...styles.card, border: `1px solid ${COLORS.border}`, marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <span style={{ ...styles.pill('amber'), fontSize: 'var(--ccna-type-micro)' }}>⚡ QUICK REFERENCE · {STATIC_COPY.quickRefPill}</span>
      </div>
      <div style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.silver, lineHeight: 1.65 }}>
        <RichText text={notes} />
      </div>
    </div>
  )
}

function LessonReferencePanel({ objectiveId, defaultOpen = true }) {
  const ref = useMemo(() => getLessonReference(objectiveId), [objectiveId])
  if (!ref) return null
  const openDefault = defaultOpen
  return (
    <div style={{ ...styles.card, marginBottom: 12, border: `1px solid ${COLORS.skyBorder}` }}>
      <SectionLabel icon="📚" label="REFERENCE" />
      {ref.summary && <div style={{ fontSize: 'var(--ccna-type-sm)', lineHeight: 1.55, marginBottom: 10 }}><RichText text={ref.summary} /></div>}
      {ref.glossary.length > 0 && (
        <ExplainBlock icon="📖" title="GLOSSARY" accent="sky" collapsible defaultOpen={openDefault}>
          {ref.glossary.map(g => (
            <div key={g.id || g.term} style={{ marginBottom: 10 }}>
              <div style={{ fontWeight: 600, fontSize: 'var(--ccna-type-sm)' }}>{g.term}</div>
              <div style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.silverMid, lineHeight: 1.5 }}><RichText text={g.definition} /></div>
            </div>
          ))}
        </ExplainBlock>
      )}
      {ref.commands.length > 0 && (
        <ExplainBlock icon="⌨️" title="COMMAND BANK" accent="mint" collapsible defaultOpen={openDefault}>
          {ref.commands.map(c => (
            <div key={c.id || c.command} style={{ marginBottom: 10, fontSize: 'var(--ccna-type-sm)' }}>
              <code style={{ color: COLORS.mint, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>{c.command}</code>
              {c.mode && <span style={{ color: COLORS.silverDim, marginLeft: 6, fontSize: 'var(--ccna-type-xs)' }}>({c.mode})</span>}
              <div style={{ color: COLORS.silverMid, marginTop: 4, lineHeight: 1.45 }}>{c.purpose}</div>
              {c.example && <div style={{ color: COLORS.silverDim, marginTop: 2, fontSize: 'var(--ccna-type-xs)', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>{c.example}</div>}
            </div>
          ))}
        </ExplainBlock>
      )}
      {ref.examTraps.length > 0 && (
        <ExplainBlock icon="⚠️" title="EXAM TRAPS" accent="amber" collapsible defaultOpen={openDefault}>
          {ref.examTraps.map(t => (
            <div key={t.id || t.trap} style={{ marginBottom: 10, fontSize: 'var(--ccna-type-sm)', lineHeight: 1.45 }}>
              <div style={{ fontWeight: 600 }}>{t.trap || t.title}</div>
              {(t.avoid || t.correction) && <div style={{ color: COLORS.silverMid, marginTop: 4 }}>{t.avoid || t.correction}</div>}
            </div>
          ))}
        </ExplainBlock>
      )}
      {ref.mnemonics?.length > 0 && (
        <ExplainBlock icon="💡" title="MNEMONICS" accent="purple" collapsible defaultOpen={openDefault}>
          {ref.mnemonics.map(m => (
            <div key={m.id || m.title} style={{ marginBottom: 10, fontSize: 'var(--ccna-type-sm)', lineHeight: 1.45 }}>
              <div style={{ fontWeight: 600 }}>{m.title}</div>
              <div style={{ color: COLORS.purpleGlow, marginTop: 2 }}>{m.mnemonic}</div>
              {m.explanation && <div style={{ color: COLORS.silverMid, marginTop: 4 }}>{m.explanation}</div>}
            </div>
          ))}
        </ExplainBlock>
      )}
      {ref.misconceptions?.length > 0 && (
        <ExplainBlock icon="🚫" title="MISCONCEPTIONS" accent="rose" collapsible defaultOpen={false}>
          {ref.misconceptions.map(x => (
            <div key={x.id || x.misconception} style={{ marginBottom: 10, fontSize: 'var(--ccna-type-sm)', lineHeight: 1.45 }}>
              <div style={{ fontWeight: 600 }}>{x.misconception}</div>
              <div style={{ color: COLORS.silverMid, marginTop: 4 }}>{x.reality}</div>
            </div>
          ))}
        </ExplainBlock>
      )}
    </div>
  )
}

function LessonViewTabs({ view, onChange, showReference }) {
  if (!showReference) return null
  const tabs = [
    { key: 'read', label: 'Read' },
    { key: 'reference', label: 'Reference' },
  ]
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
      {tabs.map(t => {
        const active = view === t.key
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            style={{
              flex: 1, minHeight: 40, borderRadius: 10,
              border: `1px solid ${active ? COLORS.skyBorder : COLORS.border}`,
              background: active ? COLORS.skyDim : COLORS.surface,
              color: active ? COLORS.sky : COLORS.silverMid,
              fontSize: 'var(--ccna-type-sm)', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            {t.label}
          </button>
        )
      })}
    </div>
  )
}

function CkuCoverageChip({ objectiveId, banked }) {
  const coverage = useMemo(() => computeCkuCoverage(objectiveId, banked), [objectiveId, banked])
  if (!coverage || coverage.total === 0) return null
  const complete = coverage.covered === coverage.total
  return (
    <span style={{ ...styles.pill(complete ? 'mint' : 'amber'), fontSize: 'var(--ccna-type-xs)', display: 'inline-block', marginBottom: 10 }}>
      {coverage.covered}/{coverage.total} concepts in quiz bank
    </span>
  )
}

function ConceptDetailPanel({ objectiveId, card }) {
  const detail = useMemo(() => buildConceptDetail(objectiveId, card), [objectiveId, card])
  if (!detail.hasDepth && !card?.detail) return null
  return (
    <div style={{ ...styles.card, marginTop: 10, marginBottom: 12, border: `1px solid ${COLORS.purpleGlow}`, background: COLORS.purpleDim }}>
      <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 700, color: COLORS.purpleGlow, marginBottom: 8, letterSpacing: 0.6 }}>
        ABOUT: {card.term}
      </div>
      {detail.cku?.summary && (
        <div style={{ fontSize: 'var(--ccna-type-sm)', lineHeight: 1.55, marginBottom: 10, color: COLORS.silver }}>
          <RichText text={detail.cku.summary} />
        </div>
      )}
      {detail.glossaryEntry && !detail.cku?.summary && (
        <div style={{ fontSize: 'var(--ccna-type-sm)', lineHeight: 1.55, marginBottom: 10, color: COLORS.silver }}>
          <RichText text={detail.glossaryEntry.definition} />
        </div>
      )}
      {detail.commands.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.mint, fontWeight: 700, marginBottom: 4 }}>Commands</div>
          {detail.commands.slice(0, 3).map(c => (
            <div key={c.id || c.command} style={{ fontSize: 'var(--ccna-type-xs)', marginBottom: 4, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', color: COLORS.silverMid }}>
              {c.command}
            </div>
          ))}
        </div>
      )}
      {detail.traps.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.amber, fontWeight: 700, marginBottom: 4 }}>Exam trap</div>
          <div style={{ fontSize: 'var(--ccna-type-xs)', lineHeight: 1.45, color: COLORS.silverMid }}>{detail.traps[0].trap || detail.traps[0].title}</div>
        </div>
      )}
      {detail.mnemonics.length > 0 && (
        <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.purpleGlow, marginBottom: 8 }}>
          💡 {detail.mnemonics[0].mnemonic}
        </div>
      )}
      {detail.quizCount > 0 && (
        <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid }}>
          {detail.quizCount} quiz question{detail.quizCount === 1 ? '' : 's'} test this concept
        </div>
      )}
    </div>
  )
}

function SubnetPracticeHome({ onBack }) {
  return (
    <div>
      <button style={styles.backBtn} onClick={onBack}>‹ Back</button>
      <h1 style={styles.h1}>Subnetting Drill</h1>
      <div style={styles.small}>Practice network/broadcast/range calculations — works offline.</div>
      <SubnettingTab />
    </div>
  )
}


export function ExplainTab({
  objective, progress, onUpdateProgress,
  layout = 'legacy',
  onStartPractice,
  VisualAidTab: VisualAidTabProp,
  premiumUnlocked,
  onPremiumBlocked,
}) {
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [recalled, setRecalled] = useState(false)
  const [lessonView, setLessonView] = useState('read')
  const [stage, setStage] = useState(layout === 'study' ? 'lesson' : 'assess')
  const testedOut = !!progress?.[objective.id]?.testedOut
  const curated = hasCuratedReading(objective.id) ? getCurated(objective.id) : null
  const curatedData = useMemo(() => getCurated(objective.id), [objective.id])
  const hasCuratedVisual = !!curatedData?.diagram || !!curatedData?.packetFlow?.steps?.length
  const showReference = hasLessonReference(objective.id)
  const bankedForCoverage = useMemo(() => getCuratedQuestions(objective.id), [objective.id])
  const isStudy = layout === 'study'

  useEffect(() => {
    setRecalled(false)
    setLessonView('read')
    if (isStudy) {
      setStage('lesson')
    } else {
      setStage(progress?.[objective.id]?.testedOut ? 'lesson' : 'assess')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objective.id, isStudy])

  // Persist reading progress when Study tab shows curated reading.
  useEffect(() => {
    if (!isStudy || stage !== 'lesson' || !curated || !recalled) return
    const entry = progress?.[objective.id] || {}
    const updates = {}
    if (!entry.readingTier) {
      updates.readingTier = computeDefaultReadingTier(entry)
    }
    if (!entry.studySectionsViewed) updates.studySectionsViewed = true
    if (!entry.lastSeen) updates.lastSeen = Date.now()
    if (Object.keys(updates).length) onUpdateProgress?.(objective.id, updates)
  }, [isStudy, stage, curated, recalled, objective.id, progress, onUpdateProgress])

  const fetchExplanation = useCallback(async (force, adjust) => {
    setLoading(true)
    setError(null)
    try {
      const cacheKey = adjust ? `${objective.id}::${adjust}` : objective.id
      if (!force) {
        const cache = (await window.storage.getItem(EXPLAIN_CACHE_KEY)) || {}
        if (cache[cacheKey]) { setContent(cache[cacheKey]); setLoading(false); return }
      }
      if (!premiumUnlocked) {
        onPremiumBlocked?.(PREMIUM_FEATURES.ai_explain, 'explain_tab', { objectiveId: objective.id })
        setLoading(false)
        return
      }
      const refNotes = BOOK_REF[objective.id] || ''
      const adjustNote = adjust ? `\n\nThe learner found a previous explanation "${adjust}". Rewrite accordingly.` : ''
      const data = await askClaudeJSON({
        system: EXPLAIN_PROMPT_SYSTEM,
        messages: [{ role: 'user', content: `Objective ${objective.id}: ${objective.title}\n\nReference notes:\n${refNotes}${adjustNote}\n\nExplain this objective for a CCNA candidate.` }],
        max_tokens: 1100, schema: EXPLAIN_SCHEMA, toolName: 'emit_explanation', feature: 'explain',
      })
      setContent(data)
      const cache = (await window.storage.getItem(EXPLAIN_CACHE_KEY)) || {}
      cache[cacheKey] = data
      await window.storage.setItem(EXPLAIN_CACHE_KEY, cache)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [objective.id, objective.title, premiumUnlocked, onPremiumBlocked])

  // Fetch the lesson once the learner enters the lesson stage — AI path only.
  // Curated objectives render static content (no fetch).
  useEffect(() => {
    if (stage !== 'lesson' || curated) return
    setContent(null); setError(null)
    if (!premiumUnlocked) {
      setLoading(false)
      return
    }
    fetchExplanation(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, objective.id, curated, premiumUnlocked])

  async function handleTestedOut(questions, pct) {
    onUpdateProgress?.(objective.id, {
      testedOut: true,
      preAssessPct: pct,
      readingTier: READING_TIER_KEYS.examReady,
      lastSeen: Date.now(),
    })
    await seedTestedOutReview(objective.id, questions)
    logEvent('user_tested_out', { objectiveId: objective.id, score: pct })
    setStage('lesson')
  }

  function enterLesson(studyMeta = {}) {
    const entry = progress?.[objective.id] || {}
    const metaFields = studyMetaToProgress(studyMeta)
    const tier = computeDefaultReadingTier({ ...entry, ...metaFields })
    onUpdateProgress?.(objective.id, {
      ...metaFields,
      readingTier: tier,
      studySectionsViewed: true,
      lastSeen: Date.now(),
    })
    setStage('lesson')
  }

  // Pre-assessment stage (legacy layout only — Study tab skips assess)
  if (!isStudy && stage === 'assess' && !testedOut) {
    return (
      <div>
        <PreAssessment objective={objective} onTestedOut={handleTestedOut} onStudy={enterLesson} premiumUnlocked={premiumUnlocked} onPremiumBlocked={onPremiumBlocked} />
      </div>
    )
  }

  // Lesson stage
  const showReading = curated || recalled
  return (
    <div>
      {testedOut && (
        <div style={{ marginBottom: 10, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <span style={{ ...styles.pill('mint'), fontSize: 'var(--ccna-type-xs)', display: 'inline-block' }}>✓ Tested out — scheduled for review</span>
          {showReference && (
            <button type="button" style={styles.secondaryBtn} onClick={() => setLessonView('reference')}>
              Traps & commands →
            </button>
          )}
        </div>
      )}
      <CkuCoverageChip objectiveId={objective.id} banked={bankedForCoverage} />
      <LessonViewTabs view={lessonView} onChange={setLessonView} showReference={showReference} />

      {lessonView === 'reference' && showReference ? (
        <LessonReferencePanel objectiveId={objective.id} defaultOpen />
      ) : (
        <>
          {!curated && <BookRefPanel objective={objective} />}

          {!curated && !recalled && !error && !isStudy && (
            <div style={{ ...styles.card, border: `1px solid ${COLORS.purpleGlow}`, background: COLORS.purpleDim }}>
              <div style={{ fontSize: 'var(--ccna-type-sm)', fontWeight: 700, color: COLORS.purpleGlow, marginBottom: 6 }}>🧠 RECALL FIRST</div>
              <div style={{ fontSize: 'var(--ccna-type-md)', lineHeight: 1.5, marginBottom: 12 }}>
                Before you read it: what do you already know about <strong>{objective.title}</strong>? Try to explain it to yourself — a rough attempt strengthens memory far more than re-reading.
              </div>
              <button style={styles.primaryBtn} onClick={() => setRecalled(true)}>Reveal explanation</button>
            </div>
          )}
          {!curated && isStudy && !recalled && !error && (
            <div style={{ ...styles.card, border: `1px solid ${COLORS.purpleGlow}`, background: COLORS.purpleDim, marginBottom: 10 }}>
              <div style={{ fontSize: 'var(--ccna-type-sm)', fontWeight: 700, color: COLORS.purpleGlow, marginBottom: 6 }}>🧠 RECALL FIRST</div>
              <div style={{ fontSize: 'var(--ccna-type-md)', lineHeight: 1.5, marginBottom: 12 }}>
                Before you read: what do you already know about <strong>{objective.title}</strong>?
              </div>
              <button style={styles.primaryBtn} onClick={() => {
                setRecalled(true)
                const entry = progress?.[objective.id] || {}
                onUpdateProgress?.(objective.id, {
                  studySectionsViewed: true,
                  readingTier: entry.readingTier || computeDefaultReadingTier(entry),
                  lastSeen: Date.now(),
                })
              }}>Start reading</button>
            </div>
          )}

          {showReading && loading && (
            <div>
              <Skeleton width="50%" height={16} style={{ marginBottom: 10 }} />
              <Skeleton width="100%" height={48} /><Skeleton width="100%" height={48} /><Skeleton width="100%" height={48} />
            </div>
          )}
          {error && <ErrorBox message={error} onRetry={() => { setRecalled(true); fetchExplanation(true) }} />}
          {showReading && curated && (
            <CuratedReading
              data={curated}
              progressEntry={progress[objective.id]}
              onTierChange={(key) => onUpdateProgress?.(objective.id, { readingTier: key, studySectionsViewed: true, lastSeen: Date.now() })}
              onOpenReference={showReference ? () => setLessonView('reference') : undefined}
              showDiagram={!isStudy}
            />
          )}
          {isStudy && (curated || recalled) && getEngineerView(objective.id) && (
            <EngineerViewSection data={getEngineerView(objective.id)} />
          )}
          {showReading && !curated && premiumUnlocked && <AiBudgetWarning />}
          {showReading && !curated && !premiumUnlocked && recalled && !content && !loading && (
            <div style={{ ...styles.card, border: `1px solid ${COLORS.border}`, marginBottom: 10 }}>
              <div style={{ fontSize: 'var(--ccna-type-sm)', fontWeight: 600, color: COLORS.silver, marginBottom: 6 }}>
                {PREMIUM_COMING_SOON_LABEL}
              </div>
              <p style={{ ...styles.small, margin: 0, lineHeight: 1.45 }}>
                AI-generated explanations unlock with supporter access. Bundled Study lessons stay free and work offline.
              </p>
            </div>
          )}
          {showReading && !curated && content && !loading && (
            <>
              <div className="objective-reading-prose lesson-prose">
                <StructuredExplanation data={content} />
              </div>
            </>
          )}
          {isStudy && hasCuratedVisual && (curated || recalled) && (
            <div className="study-visual-section" style={{ marginTop: 12, marginBottom: 12, maxWidth: '100%', minWidth: 0 }}>
              {curatedData.diagram && <CuratedDiagram diagram={curatedData.diagram} />}
              <CuratedPacketFlow data={curatedData} />
            </div>
          )}
          {isStudy && !hasCuratedVisual && VisualAidTabProp && recalled && (
            <div className="study-visual-section" style={{ marginTop: 12, marginBottom: 12 }}>
              <VisualAidTabProp objective={objective} premiumUnlocked={premiumUnlocked} onPremiumBlocked={onPremiumBlocked} />
            </div>
          )}
          {isStudy && (curated || recalled) && (
            <KeyTermsCarousel objective={objective} premiumUnlocked={premiumUnlocked} onPremiumBlocked={onPremiumBlocked} />
          )}
          {isStudy && onStartPractice && (curated || recalled) && (
            <button type="button" style={{ ...styles.primaryBtn, marginTop: 12 }} onClick={onStartPractice}>
              Start practice →
            </button>
          )}
        </>
      )}
    </div>
  )
}

/* =========================================================================
   QUIZ TAB
   ========================================================================= */
const QUIZ_PROMPT_SYSTEM = `You are a CCNA 200-301 quiz generator. Use the provided reference notes as your primary source; where the notes don't cover a detail needed for a good question, you may draw on accurate broader CCNA 200-301 knowledge consistent with the notes. Write questions at genuine CCNA exam difficulty.

Mix the question types across the set:
- definition/recall (2): test knowing a fact or term
- scenario-based (2-3): a short situation the learner must reason about
- application (1-2): apply a concept to solve something
- true-false on a common misconception (1): give exactly two choices ["True","False"]
- troubleshooting (2-3): a realistic fault scenario where the learner diagnoses the MOST LIKELY cause

Tag each question with skill: design (planning/architecture), implement (configuration/deployment), or troubleshoot (diagnosis). AI-generated questions are multiple-choice only — ordering/drag-drop questions come from the curated skill bank.

For troubleshooting questions, write them the way a network engineer actually troubleshoots: describe a concrete symptom (e.g. "Hosts on VLAN 20 can't reach their gateway"), include a short relevant config or "show" snippet inline using backticks for commands/output, then ask for the most likely cause. Use specific but VARIED surface details (interface names, IPs, VLAN IDs, subnet masks) so regenerated questions test the same underlying principle without being memorizable by pattern. The correct answer must be deducible from the snippet + reference notes; the distractors should be plausible real mistakes.

Spread difficulty from easy to hard. Tag each question with its type, difficulty (easy/medium/hard), skill (design/implement/troubleshoot), and the short sub-concept it tests. Each question's explanation should be 1-2 sentences on why the correct answer is right. Most questions have 4 choices; true-false questions have exactly 2.`

function BankMixDisplay({ questions }) {
  const mix = computeBankMix(questions)
  if (!mix.total) return null
  const typeLine = Object.entries(mix.types).sort((a, b) => b[1] - a[1]).map(([t, n]) => `${TYPE_LABEL[t] || t} ${n}`).join(' · ')
  const skillLine = Object.entries(mix.skills).sort((a, b) => b[1] - a[1]).map(([s, n]) => `${SKILL_LABEL[s] || s} ${n}`).join(' · ')
  return (
    <div style={{ marginTop: 8, marginBottom: 8, padding: '8px 10px', borderRadius: 10, background: COLORS.surface, border: `1px solid ${COLORS.border}` }}>
      <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, lineHeight: 1.45 }}>{typeLine}</div>
      {skillLine && <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverDim, lineHeight: 1.45, marginTop: 2 }}>{skillLine}</div>}
    </div>
  )
}

function moveOrderItem(items, from, to) {
  const next = [...items]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

function OrderingQuestion({ items, onChange, revealed, correctOrder }) {
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
          const ok = item === correctOrder[idx]
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
function QuestionMeta({ q }) {
  if (!q || (!q.type && !q.difficulty && !q.skill)) return null
  const skill = q.skill || inferSkill(q)
  // easy = green (approachable) · medium = blue (learning) · hard = amber
  // (heads-up). Red stays reserved for wrong answers, never for difficulty.
  const dAccent = q.difficulty === 'hard' ? 'amber' : q.difficulty === 'medium' ? 'sky' : 'mint'
  const skillAccent = skill === 'troubleshoot' ? 'amber' : skill === 'implement' ? 'sky' : 'mint'
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
      {q.difficulty && <span style={{ ...styles.pill(dAccent), fontSize: 'var(--ccna-type-micro)' }}>{q.difficulty.toUpperCase()}</span>}
      {q.type && <span style={{ ...styles.pill(q.type === 'troubleshooting' || q.type === 'ordering' ? 'sky' : 'silver'), fontSize: 'var(--ccna-type-micro)' }}>{TYPE_LABEL[q.type] || q.type}</span>}
      {skill && <span style={{ ...styles.pill(skillAccent), fontSize: 'var(--ccna-type-micro)' }}>{SKILL_LABEL[skill] || skill}</span>}
      {q.concept && <span style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, alignSelf: 'center' }}>{q.concept}</span>}
    </div>
  )
}

const CONFIDENCE_OPTIONS = [
  { value: 'easy', label: 'Easy', accent: COLORS.mint, dim: COLORS.mintDim, border: COLORS.mintBorder },
  { value: 'medium', label: 'Medium', accent: COLORS.sky, dim: COLORS.skyDim, border: COLORS.skyBorder },
  { value: 'hard', label: 'Hard', accent: COLORS.purpleGlow, dim: COLORS.purpleDim, border: COLORS.borderGlow },
  { value: 'practice', label: 'Need practice', accent: COLORS.rose, dim: COLORS.roseDim, border: COLORS.roseBorder },
]

const FOCUSABLE_SELECTOR = 'a[href],button:not([disabled]),textarea,input:not([type="hidden"]),select,[tabindex]:not([tabindex="-1"])'

function useFocusTrap(containerRef) {
  useEffect(() => {
    const root = containerRef.current
    if (!root) return
    const previous = document.activeElement

    function focusables() {
      return [...root.querySelectorAll(FOCUSABLE_SELECTOR)].filter(el => !el.hasAttribute('disabled'))
    }

    const nodes = focusables()
    if (nodes.length) nodes[0].focus()
    else {
      root.tabIndex = -1
      root.focus()
    }

    function onKeyDown(e) {
      if (e.key !== 'Tab') return
      const list = focusables()
      if (!list.length) {
        e.preventDefault()
        return
      }
      const first = list[0]
      const last = list[list.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    root.addEventListener('keydown', onKeyDown)
    return () => {
      root.removeEventListener('keydown', onKeyDown)
      if (previous?.focus) previous.focus()
    }
  }, [containerRef])
}

function objectiveTabId(objectiveId, tabName) {
  return `obj-tab-${objectiveId}-${tabName.replace(/\s+/g, '-')}`
}

function objectivePanelId(objectiveId, tabName) {
  return `obj-panel-${objectiveId}-${tabName.replace(/\s+/g, '-')}`
}

const quizFeedbackA11y = { role: 'status', 'aria-live': 'polite', 'aria-atomic': true }

function QuizCompleteCard({
  title = 'Quiz complete',
  stats,
  objectiveId,
  progress,
  nextObjective,
  missedCountGlobal = 0,
  onReviewAgain,
  onGenerateNew,
  onOpenMissed,
  onSelectObjective,
  onSwitchTab,
  footnote,
  premiumUnlocked = false,
}) {
  const pct = stats.total ? Math.round((stats.correct / stats.total) * 100) : 0
  const mastery = computeMastery(progress?.[objectiveId] || {})
  const sessionMissed = stats.missedCount || 0
  const scoreColor = pct >= 80 ? COLORS.mint : pct >= 60 ? COLORS.sky : COLORS.rose

  let primaryLabel
  let primaryAction
  if (sessionMissed > 0) {
    primaryLabel = missedCountGlobal > 0 ? `Review missed questions (${missedCountGlobal})` : 'Review missed questions'
    primaryAction = onOpenMissed
  } else if (nextObjective) {
    primaryLabel = `Next objective: ${nextObjective.id}`
    primaryAction = () => onSelectObjective?.({ ...nextObjective, __initialTab: 'Practice' })
  } else {
    primaryLabel = 'Review again from bank'
    primaryAction = onReviewAgain
  }

  return (
    <div style={styles.card}>
      <h2 style={styles.h2}>{title}</h2>
      <p style={{ fontSize: 'var(--ccna-type-2xl)', fontWeight: 700, color: scoreColor, margin: '4px 0' }}>{stats.correct} / {stats.total}</p>
      <p style={{ ...styles.small, marginBottom: 4 }}>
        {pct}% this session · Topic mastery {Math.round(mastery.score * 100)}%
        {mastery.mastered ? ' · Mastered ✓' : ''}
      </p>
      {sessionMissed > 0 && (
        <p style={{ ...styles.small, marginBottom: 10, color: COLORS.rose }}>
          {sessionMissed} answer{sessionMissed === 1 ? '' : 's'} missed this session — saved to your review bank.
        </p>
      )}
      {footnote && <p style={{ ...styles.small, marginBottom: 10 }}>{footnote}</p>}
      <button style={{ ...styles.primaryBtn, marginTop: 4 }} onClick={primaryAction}>{primaryLabel}</button>
      {sessionMissed > 0 && nextObjective && (
        <button
          style={{ ...styles.secondaryBtn, marginTop: 8 }}
          onClick={() => onSelectObjective?.({ ...nextObjective, __initialTab: 'Practice' })}
        >
          Continue to {nextObjective.id} instead
        </button>
      )}
      <button style={{ ...styles.secondaryBtn, marginTop: 8 }} onClick={() => onSwitchTab?.('Study')}>
        Read explanation
      </button>
      {primaryAction !== onReviewAgain && (
        <button style={{ ...styles.secondaryBtn, marginTop: 8 }} onClick={onReviewAgain}>Review again from bank</button>
      )}
      {premiumUnlocked && (
        <button style={{ ...styles.secondaryBtn, marginTop: 8 }} onClick={onGenerateNew}>Generate new questions</button>
      )}
    </div>
  )
}

export function QuizTab({
  objective, progress, missed, onMissed, onScoreSaved, nextObjective, onSelectObjective, onOpenMissed, onSwitchTab,
  examMode = false, premiumUnlocked = false, onPremiumBlocked,
  showPreAssessFirst = false, onUpdateProgress,
}) {
  const showNavHint = useNavHint()
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
  const [revealed, setRevealed] = useState(false)
  const [rating, setRating] = useState(null) // confidence rating for the current question
  const [stats, setStats] = useState({ correct: 0, total: 0, missedCount: 0 })
  const [sourceLabel, setSourceLabel] = useState(null) // where this session's questions came from
  const sessionRatings = useRef([])
  const missedOnce = useRef(new Set()) // question IDs missed once this session → 2nd miss = near-front re-queue
  const [streak, setStreak] = useState(0) // consecutive correct answers this session

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
  const [sessionSize, setSessionSize] = useState(DEFAULT_QUIZ_SESSION_SIZE)
  const curatedPoolSize = useMemo(() => getCuratedQuestions(objective.id).length, [objective.id])

  useEffect(() => {
    loadQuizSessionSize().then(setSessionSize)
  }, [])

  useEffect(() => {
    if (phase !== 'done') {
      doneHintFired.current = false
      justMasteredRef.current = false
      return
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
  }, [phase, stats, nextObjective?.id, showNavHint])

  useEffect(() => {
    if (bankSize > 0 && sessionSize > bankSize) {
      setSessionSize(bankSize)
      saveQuizSessionSize(bankSize)
    }
  }, [bankSize, sessionSize])

  async function commitSessionSize(raw, max = MAX_QUIZ_SESSION_SIZE) {
    const next = clampQuizSessionSize(raw, { max })
    setSessionSize(next)
    await saveQuizSessionSize(next)
    return next
  }

  function onSessionSizeInput(e) {
    const raw = e.target.value
    if (raw === '') return
    const n = parseInt(raw, 10)
    if (!Number.isFinite(n)) return
    const max = bankSize > 0 ? bankSize : MAX_QUIZ_SESSION_SIZE
    setSessionSize(clampQuizSessionSize(n, { max }))
  }

  async function onSessionSizeBlur() {
    const max = bankSize > 0 ? bankSize : MAX_QUIZ_SESSION_SIZE
    await commitSessionSize(sessionSize, max)
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
      await preloadCleanBank()
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
      const set = pickReviewSet(banked, breakdown.has ? breakdown.acc : null, sessionSize, { ckuIds })
      if (set.length === 0) throw new Error('No questions available for this objective yet.')
      setBankSize(banked.length)
      setSourceLabel(usedApi ? 'Freshly generated · added to your bank' : STATIC_COPY.sessionBank(banked.length))
      setQueue(set.slice(1))
      setCurrent(set[0])
      setSelected(null)
      setRevealed(false)
      setRating(null)
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
    setRevealed(false)
    setRating(null)
    setStreak(0)
    sessionRatings.current = []
    deferredTips.current = []
    setOverconfidentCallout(false)
    missedOnce.current = new Set()
    refreshBankSize()
  }, [objective.id, refreshBankSize])

  function selectAnswer(idx) {
    if (revealed || !isMcQuestion(current)) return
    setSelected(idx)
    setRevealed(true)
    const correct = gradeQuestion(current, idx)
    haptic(correct ? 15 : [10, 40, 10])
    if (correct) bumpSessionStudy('correct')
    else bumpSessionStudy('incorrect')
    setStats(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1, missedCount: s.missedCount + (correct ? 0 : 1) }))
    const newStreak = correct ? streak + 1 : 0
    setStreak(newStreak)
    if (correct && newStreak >= 4) {
      setQueue(q => {
        const tIdx = q.findIndex(x => x.type === 'troubleshooting' || x.type === 'ordering')
        if (tIdx > 0) return [q[tIdx], ...q.slice(0, tIdx), ...q.slice(tIdx + 1)]
        return q
      })
    }
    if (current.id) recordQuizResult(objective.id, current.id, { correct, schedule: !!progress?.[objective.id]?.reviewEligible })
    logEvent('user_answered_question', { objectiveId: objective.id, questionId: current.id, correct })
    if (!correct) {
      collectDeferredTip(current, idx)
      onMissed(buildMissedEntry(objective.id, current, { selectedIndex: idx }))
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
    if (!correct) {
      collectDeferredTip(current, null)
      onMissed(buildMissedEntry(objective.id, current, { orderAnswer: orderDraft }))
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
    if (value === 'easy' && revealed) {
      const ordering = isOrderingQuestion(current)
      const wasWrong = ordering ? !gradeQuestion(current, orderDraft) : (selected != null && !gradeQuestion(current, selected))
      if (wasWrong) setOverconfidentCallout(true)
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
    setRevealed(false)
    setRating(null)
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
    const reviewCount = hasBank ? Math.min(sessionSize, bankSize) : sessionSize
    const emptyPool = !hasBank && curatedPoolSize === 0
    return (
      <div className="ccna-quiz-idle">
        <p style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 600, color: COLORS.silver, margin: '0 0 4px', lineHeight: 1.35 }}>
          {emptyPool ? 'Ready to practice?' : 'How many questions do you want?'}
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
              type="number"
              min={1}
              max={sessionMax}
              inputMode="numeric"
              value={sessionSize}
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
          <button style={{ ...styles.primaryBtn, marginTop: 12 }} onClick={() => startQuiz(false)}>
            {hasBank ? `Practice ${reviewCount} question${reviewCount === 1 ? '' : 's'}` : emptyPool ? 'Generate practice set' : 'Start practice'}
          </button>
        )}
        {hasBank && premiumUnlocked && (
          <button style={{ ...styles.secondaryBtn, marginTop: 8 }} onClick={() => startQuiz(true)}>Generate new questions</button>
        )}
      </div>
    )
  }
  if (phase === 'loading') return <Spinner label="Generating quiz questions..." />
  if (phase === 'error') return <ErrorBox message={error} onRetry={() => startQuiz(false)} />
  if (phase === 'done') {
    const missedCountGlobal = (missed || []).length
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
        {examMode && <DeferredExamTips tips={deferredTips.current} />}
      </>
    )
  }

  // active
  const ordering = isOrderingQuestion(current)
  const isCorrect = revealed && (ordering ? gradeQuestion(current, orderDraft) : gradeQuestion(current, selected))
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div style={styles.small}>Question {stats.total + 1}{queue.length > 0 ? ` · ${queue.length} remaining` : ''}</div>
        {streak >= 3 && <span style={{ ...styles.pill('mint'), fontSize: 'var(--ccna-type-micro)' }}>🔥 {streak} streak</span>}
      </div>
      {sourceLabel && <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 8 }}>{sourceLabel}</div>}
      <div style={styles.card}>
        <QuestionMeta q={current} />
        <div style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 600, marginBottom: 14, lineHeight: 1.5, overflowWrap: 'anywhere', wordBreak: 'break-word' }}><RichText text={current.question} /></div>
        {ordering ? (
          <OrderingQuestion
            items={orderDraft}
            onChange={setOrderDraft}
            revealed={revealed}
            correctOrder={revealed ? current.orderItems : null}
          />
        ) : (
          <McChoices q={current} selected={selected} revealed={revealed} onSelect={selectAnswer} />
        )}
        {revealed && (
          <div className="ccna-quiz-reveal" style={{ marginTop: 8, padding: 12, borderRadius: 10, background: isCorrect ? COLORS.mintDim : COLORS.roseDim, border: `2px solid ${isCorrect ? COLORS.mintBorder : COLORS.rose}` }} {...quizFeedbackA11y}>
            <div style={{ fontWeight: 700, color: isCorrect ? COLORS.mint : COLORS.rose, marginBottom: 4, fontSize: 'var(--ccna-type-sm)' }}>
              {isCorrect ? 'Correct' : 'Incorrect'}
            </div>
            <AnswerReview q={current} selected={selected} hideExamTip={examMode} />
          </div>
        )}
      </div>
      {ordering && !revealed && (
        <button style={{ ...styles.primaryBtn, marginBottom: 10 }} onClick={submitOrder}>Check order</button>
      )}
      {revealed && (
        <div style={{ marginBottom: 10 }}>
          {overconfidentCallout && (
            <div style={{ ...styles.small, marginBottom: 8, padding: '8px 10px', borderRadius: 8, border: `1px solid ${COLORS.amberBorder}`, background: COLORS.amberDim, color: COLORS.amber }}>
              You marked this <strong>Easy</strong> but missed it — a common exam trap. Re-read the explanation before moving on.
            </div>
          )}
          <div style={{ ...styles.small, marginBottom: 6 }}>How confident did you feel?</div>
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
        </div>
      )}
      {revealed && <button style={styles.primaryBtn} onClick={next}>{queue.length === 0 ? 'Finish' : 'Next question'}</button>}
    </div>
  )
}
