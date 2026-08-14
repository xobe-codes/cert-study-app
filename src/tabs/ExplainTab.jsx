import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { getCurated, hasCuratedReading, getCuratedQuestions } from '../data/ccnaCurated.js'
import { getLessonReference, hasLessonReference } from '../lesson/knowledgeReference.js'
import { computeCkuCoverage } from '../lesson/quizCoverage.js'
import {
  computeDefaultReadingTier,
  studyMetaToProgress, READING_TIER_KEYS,
} from '../lesson/readingTier.js'
import {
  explanationBodyFromAi, resolveAiTakeaway,
} from '../lesson/explanationFormat.js'
import CuratedVisualBundle from '../components/CuratedVisualBundle.jsx'
import TabSectionLabel from '../components/TabSectionLabel.jsx'
import { ReadingTtsControls, SectionListenButton } from '../components/ReadingTtsControls.jsx'
import { buildAiReadingSpeech, bulletsToSpeech } from '../lib/readingTts.js'
import ErrorBox from '../components/ErrorBox.jsx'
import { COLORS, accentColors, styles } from '../ui/appTheme.js'
import { STATIC_COPY } from '../ui/staticContentCopy.js'
import { BOOK_REF } from '../data/bookRefFull.js'
import {
  PREMIUM_FEATURES,
  PREMIUM_COMING_SOON_LABEL,
} from '../premium/premiumFeatures.js'
import {
  askClaudeJSON, AiBudgetWarning,
  EXPLAIN_CACHE_KEY, EXPLAIN_PROMPT_SYSTEM, EXPLAIN_SCHEMA,
  seedTestedOutReview, logEvent, Skeleton,
} from './tabRuntimeDeps.js'
import { EXAM_SOURCES } from './studyConstants.js'
import { RichText, Bullets, PreAssessment } from './studyQuizShared.jsx'
import CuratedUnifiedReading from './CuratedUnifiedReading.jsx'
import { KeyTermsCarousel } from './explainKeyTermsCarousel.jsx'

/* ---- Structured explanation renderer (progressive disclosure) ---- */
function ExplainBlock({ icon, title, accent, children, collapsible, defaultOpen = true, speechText, onListen }) {
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
          <SectionListenButton speechText={speechText} onListen={onListen} />
        </span>
        {collapsible && <span style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.silverMid }}>{open ? '−' : '+'}</span>}
      </button>
      {open && <div style={{ marginTop: 8, fontSize: 'var(--ccna-type-md)', lineHeight: 1.55, color: COLORS.silver }}>{children}</div>}
    </div>
  )
}

function CoreConceptsBlock({ ckus, onConceptViewed }) {
  if (!ckus?.length) return null
  return (
    <ExplainBlock icon="🧩" title="CORE CONCEPTS" accent="purple">
      {ckus.map(c => (
        <div key={c.id} id={c.lessonAnchor} tabIndex={-1} onFocus={() => onConceptViewed?.(c)} style={{ marginBottom: ckus.length > 1 ? 12 : 0, scrollMarginTop: 96 }}>
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
function CuratedReading(props) {
  return (
    <CuratedUnifiedReading
      {...props}
      ExplainBlock={ExplainBlock}
      CoreConceptsBlock={CoreConceptsBlock}
    />
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
  const hasCuratedVisual = !!(
    curatedData?.diagram
    || curatedData?.visualCompare
    || curatedData?.visualTraps?.length
    || curatedData?.packetFlow?.steps?.length
  )
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
          {isStudy && hasCuratedVisual && (curated || recalled) && (
            <div className="study-visual-section study-visual-section--above" style={{ marginTop: 4, marginBottom: 14, maxWidth: '100%', minWidth: 0 }}>
              <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 700, color: COLORS.silverMid, marginBottom: 8, letterSpacing: 0.4 }}>
                VISUAL FIRST
              </div>
              <CuratedVisualBundle data={curatedData} />
            </div>
          )}
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
