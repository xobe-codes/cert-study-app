import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { getCurated, hasCuratedReading, getCuratedQuestions } from '../data/ccnaCurated.js'
import { labsForObjective } from '../data/ccnaLabs.js'
import { getLessonReference, hasLessonReference } from '../lesson/knowledgeReference.js'
import { buildConceptDetail } from '../lesson/conceptDetail.js'
import { computeCkuCoverage } from '../lesson/quizCoverage.js'
import {
  READING_TIERS, computeDefaultReadingTier, getReadingTier, readingTierHint,
  studyMetaToProgress, READING_TIER_KEYS,
} from '../lesson/readingTier.js'
import {
  explanationBodyFromReading, explanationBodyFromAi, resolveBigTakeaway, resolveAiTakeaway,
} from '../lesson/explanationFormat.js'
import CuratedDiagram from '../components/CuratedDiagram.jsx'
import CuratedStaticBadge from '../components/CuratedStaticBadge.jsx'
import OverflowMarquee from '../components/OverflowMarquee.jsx'
import EngineerViewSection from '../components/EngineerViewSection.jsx'
import TabSectionLabel from '../components/TabSectionLabel.jsx'
import QuestionHealthAdminSection from '../components/QuestionHealthAdminSection.jsx'
import { ReadingTtsControls, SectionListenButton } from '../components/ReadingTtsControls.jsx'
import { shouldDefaultOpenRealWorld } from '../lesson/readingEnrichment.js'
import { buildCuratedReadingSpeech, buildAiReadingSpeech, bulletsToSpeech } from '../lib/readingTts.js'
import { formatCuratedAttribution } from '../curatedDisplay.js'
import ErrorBox from '../components/ErrorBox.jsx'
import Spinner from '../components/Spinner.jsx'
import { COLORS, accentColors, styles } from '../ui/appTheme.js'
import { STATIC_COPY } from '../ui/staticContentCopy.js'
import { BOOK_REF } from '../data/bookRefFull.js'
import {
  PREMIUM_FEATURES,
  PREMIUM_COMING_SOON_LABEL,
} from '../premium/premiumFeatures.js'
import {
  askClaudeJSON, MODELS, AiBudgetWarning,
  EXPLAIN_CACHE_KEY, EXPLAIN_PROMPT_SYSTEM, EXPLAIN_SCHEMA,
  seedTestedOutReview, logEvent, Skeleton,
} from './tabRuntimeDeps.js'
import { EXAM_SOURCES } from './studyConstants.js'
import { RichText, Bullets, PreAssessment } from './studyQuizShared.jsx'

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

/* ---- Structured explanation renderer (progressive disclosure) ---- */
function ExplainBlock({ icon, title, accent, children, collapsible, defaultOpen = true, speechText }) {
  const [open, setOpen] = useState(defaultOpen)
  const c = accentColors(accent)
  return (
    <div style={{ borderLeft: `3px solid ${c.text}`, background: c.dim, border: `1px solid ${c.border}`, borderRadius: 6, padding: '10px 12px', marginBottom: 8, boxShadow: '0 2px 10px #00000022' }}>
      <button
        onClick={() => collapsible && setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', padding: 0, cursor: collapsible ? 'pointer' : 'default', color: c.text }}
      >
        <span style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 700, letterSpacing: 0.3, display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
          {icon} {title}
          <SectionListenButton speechText={speechText} />
        </span>
        {collapsible && <span style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.silverMid }}>{open ? '−' : '+'}</span>}
      </button>
      {open && <div style={{ marginTop: 8, fontSize: 'var(--ccna-type-md)', lineHeight: 1.55, color: COLORS.silver }}>{children}</div>}
    </div>
  )
}

function CoreConceptsBlock({ ckus }) {
  if (!ckus?.length) return null
  return (
    <ExplainBlock icon="🧩" title="CORE CONCEPTS" accent="purple">
      {ckus.map(c => (
        <div key={c.id} style={{ marginBottom: ckus.length > 1 ? 12 : 0 }}>
          <div style={{ fontWeight: 600, fontSize: 'var(--ccna-type-sm)', marginBottom: 4 }}>{c.title}</div>
          <div style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.silverMid, lineHeight: 1.55 }}>
            <RichText text={c.summary} />
          </div>
        </div>
      ))}
    </ExplainBlock>
  )
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
  const speechText = useMemo(() => buildAiReadingSpeech(data), [data])
  return (
    <div className="ccna-stagger">
      <ReadingTtsControls speechText={speechText} />
      <ExplanationSection body={explanationBodyFromAi(data)} takeaway={resolveAiTakeaway(data)} />
      <ExplainBlock icon="📌" title="KEY POINTS" accent="amber" speechText={bulletsToSpeech(data.keyPoints)}><Bullets items={data.keyPoints} /></ExplainBlock>
      <ExplainBlock icon="⚠️" title="COMMON MISTAKES" accent="rose" speechText={bulletsToSpeech(data.commonMistakes)}><Bullets items={data.commonMistakes} /></ExplainBlock>
      {data.realWorld && <ExplainBlock icon="🔧" title="REAL-WORLD APPLICATION" accent="purple" collapsible defaultOpen={false} speechText={data.realWorld}><RichText text={data.realWorld} /></ExplainBlock>}
      {data.advanced && <ExplainBlock icon="🧬" title="ADVANCED DETAILS" accent="silver" collapsible defaultOpen={false} speechText={data.advanced}><RichText text={data.advanced} /></ExplainBlock>}
      {data.related?.length > 0 && <ExplainBlock icon="🔗" title="RELATED CONCEPTS" accent="sky" collapsible defaultOpen={false} speechText={bulletsToSpeech(data.related)}><Bullets items={data.related} /></ExplainBlock>}
    </div>
  )
}

/* ---- Curated content renderers (Phase 19 — static, no AI) ---- */

// Renders a curated objective's reading: source-grounded, no AI call. Reuses
// the same ExplainBlock visual language as the AI path so it feels native.
function CuratedReading({ data, progressEntry, onTierChange, onOpenReference, onOpenLab, showDiagram = true }) {
  const resolvedTier = useMemo(() => getReadingTier(progressEntry), [progressEntry])
  const [tier, setTier] = useState(resolvedTier)
  const hint = useMemo(() => readingTierHint(progressEntry, tier), [progressEntry, tier])
  const objectiveLabs = useMemo(() => labsForObjective(data.objectiveId), [data.objectiveId])
  const firstLabId = objectiveLabs[0]?.id

  useEffect(() => {
    setTier(getReadingTier(progressEntry))
  }, [data.objectiveId, progressEntry?.readingTier, progressEntry?.testedOut, progressEntry?.preAssessPct])

  function selectTier(key) {
    setTier(key)
    onTierChange?.(key)
  }

  const r = data.reading
  const speechText = useMemo(() => buildCuratedReadingSpeech(r, tier), [r, tier])
  const openRealWorld = shouldDefaultOpenRealWorld(data)
  const attribution = formatCuratedAttribution(r.sourceRefs, data.objectiveId)
  return (
    <div className="ccna-stagger objective-reading-prose lesson-prose">
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, flexWrap: 'nowrap' }}>
        <CuratedStaticBadge objectiveId={data.objectiveId} fontSize={10} />
        <OverflowMarquee
          text={attribution}
          style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid }}
        />
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
      <ReadingTtsControls speechText={speechText} />
      <ExplanationSection
        body={explanationBodyFromReading(r, tier)}
        takeaway={resolveBigTakeaway(r)}
      />
      <CoreConceptsBlock ckus={data.ckus} />
      <ExplainBlock icon="📌" title="KEY POINTS" accent="amber" speechText={bulletsToSpeech(r.keyPoints)}><Bullets items={r.keyPoints} /></ExplainBlock>
      <ExplainBlock icon="⚠️" title="COMMON MISTAKES" accent="rose" speechText={bulletsToSpeech(r.commonMistakes)}><Bullets items={r.commonMistakes} /></ExplainBlock>
      {r.realWorld && <ExplainBlock icon="🔧" title="REAL-WORLD APPLICATION" accent="purple" collapsible defaultOpen={openRealWorld} speechText={r.realWorld}><RichText text={r.realWorld} /></ExplainBlock>}
      {r.advanced && <ExplainBlock icon="🧬" title="ADVANCED DETAILS" accent="silver" collapsible defaultOpen={false} speechText={r.advanced}><RichText text={r.advanced} /></ExplainBlock>}
      {r.related?.length > 0 && <ExplainBlock icon="🔗" title="RELATED CONCEPTS" accent="sky" collapsible defaultOpen={false} speechText={bulletsToSpeech(r.related)}><Bullets items={r.related} /></ExplainBlock>}
      {data.engineerView && <EngineerViewSection data={data.engineerView} defaultOpen={openRealWorld} />}
      <QuestionHealthAdminSection objectiveId={data.objectiveId} />
      {firstLabId && (
        <div className="objective-lab-cta" style={{ flexDirection: 'column', alignItems: 'stretch', marginTop: 12 }}>
          <div style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.silver, marginBottom: 10, lineHeight: 1.45 }}>
            Hands-on CLI for this topic — verify commands in the lab before exam day.
          </div>
          <button type="button" style={styles.primaryBtn} onClick={() => onOpenLab?.(firstLabId)}>
            Open lab for this topic
          </button>
        </div>
      )}
      {showDiagram && data.diagram && <CuratedDiagram diagram={data.diagram} />}
      <CuratedSources data={data} />
    </div>
  )
}

// Sources panel for curated content — lists the actual per-reading sourceRefs.
function CuratedSources({ data }) {
  const [open, setOpen] = useState(false)
  const refs = data.reading.sourceRefs
  return (
    <div style={{ ...styles.card, padding: 12, marginTop: 4 }}>
      <button onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: COLORS.silver }}>
        <span style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 700, color: COLORS.silverMid }}>📚 SOURCES (verifiable)</span>
        <span style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.silverMid }}>{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div style={{ marginTop: 10, fontSize: 'var(--ccna-type-xs)', lineHeight: 1.5, color: COLORS.silverMid }}>
          <div style={{ marginBottom: 8 }}>
            <a href={EXAM_SOURCES.blueprintUrl} target="_blank" rel="noreferrer" style={{ color: COLORS.sky, textDecoration: 'none' }}>{EXAM_SOURCES.examName} exam topic {data.objectiveId}</a> — official blueprint (authoritative).
          </div>
          {refs.map((s, i) => (
            <div key={i} style={{ marginBottom: 6 }}>
              <span style={{ color: COLORS.silver }}>{s.sourceName}</span>{s.chapter ? ` — ${s.chapter}` : ''}.
              <span style={{ color: COLORS.silverDim }}> confidence {Math.round(s.confidence * 100)}%</span>
            </div>
          ))}
          <div style={{ marginTop: 6, fontSize: 'var(--ccna-type-xs)', color: COLORS.silverDim }}>{STATIC_COPY.sources}</div>
        </div>
      )}
    </div>
  )
}

/* ---- Sources panel (verifiable only) ---- */
function SourcesPanel({ objective }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ ...styles.card, padding: 12, marginTop: 4 }}>
      <button onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: COLORS.silver }}>
        <span style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 700, color: COLORS.silverMid }}>📚 SOURCES</span>
        <span style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.silverMid }}>{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div style={{ marginTop: 10, fontSize: 'var(--ccna-type-xs)', lineHeight: 1.5, color: COLORS.silverMid }}>
          <div style={{ marginBottom: 8 }}>
            <a href={EXAM_SOURCES.blueprintUrl} target="_blank" rel="noreferrer" style={{ color: COLORS.sky, textDecoration: 'none' }}>
              {EXAM_SOURCES.examName} exam topic {objective.id} — {objective.title}
            </a>
            <div>Official Cisco exam blueprint (authoritative).</div>
          </div>
          {EXAM_SOURCES.references.map((r, i) => (
            <div key={i} style={{ marginBottom: 6 }}>
              <span style={{ color: COLORS.silver }}>{r.title}</span> — {r.author}, {r.publisher}.
              <div>Covers: {objective.domainName}.</div>
            </div>
          ))}
          <div style={{ marginTop: 6, fontSize: 'var(--ccna-type-xs)', color: COLORS.silverDim }}>Explanations and key terms are AI study aids grounded in these sources — verify command syntax against official docs.</div>
        </div>
      )}
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
      <TabSectionLabel icon="📚" label="REFERENCE" />
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

export function ExplainTab({
  objective, progress, onUpdateProgress,
  layout = 'legacy',
  onStartPractice,
  onOpenLab,
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
              onOpenLab={onOpenLab}
              showDiagram={!isStudy}
            />
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
              <SourcesPanel objective={objective} />
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
            <button type="button" className="ccna-study-practice-cta" style={{ ...styles.secondaryBtn, marginTop: 12, width: '100%' }} onClick={onStartPractice}>
              Start practice →
            </button>
          )}
        </>
      )}
    </div>
  )
}
