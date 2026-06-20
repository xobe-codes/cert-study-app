import React, { useCallback, useMemo, useState } from 'react'
import { DOMAINS } from '../data/ccnaDomains.js'
import { COLORS, styles } from '../ui/appTheme.js'
import { parseRichTextSegments } from '../lesson/richTextParse.js'
import { AiBudgetWarning } from '../ai/claudeClient.jsx'
import { PREMIUM_FEATURES } from '../premium/premiumFeatures.js'
import { searchLibrary, kindLabel } from '../library/libraryIndex.js'
import { buildInstantAnswer } from '../library/instantAnswer.js'
import { detectIntent, INTENT_LABEL } from '../library/intentDetect.js'
import { synthesizeLibraryAnswer, synthesisCacheKey } from '../library/synthesizeAnswer.js'
import { loadSynthesisCache, saveSynthesisCache } from '../lens/lensStorage.js'
import StudyModeHeader from '../components/StudyModeHeader.jsx'

const SUGGESTED = [
  'What is longest prefix match?',
  'AAA protocols',
  'Routing protocols on CCNA',
  'How do I configure SSH on a router?',
  'Wireless security protocols',
]

function RichText({ text }) {
  const segments = parseRichTextSegments(text)
  return (
    <>
      {segments.map((seg, i) => {
        if (seg.type === 'code') {
          return <code key={i} style={{ fontFamily: 'var(--ccna-font-mono, monospace)', fontSize: '0.92em', background: COLORS.surface, padding: '1px 4px', borderRadius: 4 }}>{seg.value}</code>
        }
        if (seg.type === 'bold') return <strong key={i}>{seg.value}</strong>
        return <span key={i}>{seg.value}</span>
      })}
    </>
  )
}

function confidenceBadge(confidence) {
  if (confidence === 'high') return { label: 'Library-backed', color: COLORS.mint, bg: COLORS.mintDim }
  if (confidence === 'partial') return { label: 'Partial match', color: COLORS.amber, bg: COLORS.amberDim }
  return { label: 'Weak match', color: COLORS.silverMid, bg: COLORS.surface }
}

export default function StudyLensStudio({
  onBack,
  onSelectObjective,
  premiumUnlocked = false,
  onPremiumBlocked,
  scopeObjectiveId = null,
  initialQuery = '',
}) {
  const [query, setQuery] = useState(initialQuery)
  const [domainFilter, setDomainFilter] = useState('all')
  const [submitted, setSubmitted] = useState(initialQuery.trim())
  const [synthesized, setSynthesized] = useState(null)
  const [streaming, setStreaming] = useState(null)
  const [synthLoading, setSynthLoading] = useState(false)
  const [synthError, setSynthError] = useState(null)

  const searchResult = useMemo(() => {
    if (!submitted.trim()) return null
    return searchLibrary(submitted, { domainFilter, scopeObjectiveId })
  }, [submitted, domainFilter, scopeObjectiveId])

  const instant = useMemo(() => {
    if (!searchResult?.hits?.length) return null
    return buildInstantAnswer(submitted, searchResult.hits, searchResult.intent, searchResult.cluster)
  }, [submitted, searchResult])

  const runSearch = useCallback(() => {
    const q = query.trim()
    setSubmitted(q)
    setSynthesized(null)
    setStreaming(null)
    setSynthError(null)
  }, [query])

  const openSource = useCallback((hit) => {
    const oid = hit.objectiveIds?.[0]
    if (oid) onSelectObjective?.(oid)
  }, [onSelectObjective])

  const runSynthesize = useCallback(async () => {
    if (!searchResult?.hits?.length || synthLoading) return
    if (!premiumUnlocked) {
      onPremiumBlocked?.(PREMIUM_FEATURES.tutor, 'studylens')
      return
    }

    const cacheKey = synthesisCacheKey(submitted, searchResult.hits)
    const cached = await loadSynthesisCache(cacheKey)
    if (cached?.answer) {
      setSynthesized(cached.answer)
      return
    }

    setSynthLoading(true)
    setSynthError(null)
    setStreaming('')
    setSynthesized(null)
    try {
      const answer = await synthesizeLibraryAnswer({
        query: submitted,
        hits: searchResult.hits,
        intent: searchResult.intent,
        cluster: searchResult.cluster,
        onDelta: chunk => setStreaming(prev => (prev || '') + chunk),
      })
      setSynthesized(answer)
      await saveSynthesisCache(cacheKey, answer)
    } catch (err) {
      setSynthError(err.message || 'Synthesis failed.')
    } finally {
      setSynthLoading(false)
      setStreaming(null)
    }
  }, [searchResult, submitted, synthLoading, premiumUnlocked, onPremiumBlocked])

  const displayAnswer = synthesized || streaming
  const intent = searchResult?.intent || detectIntent(submitted)

  return (
    <div className="study-lens-studio">
      <StudyModeHeader
        title="Study Lens"
        onBack={onBack}
        subtitle="Ask anything CCNA — instant answers from your study library. Synthesize cited prose with AI Tutor access."
      />

      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') runSearch() }}
          placeholder="What is OSPF? HSRP vs VRRP? show ip route…"
          className="study-lens-search"
          style={{
            flex: 1, boxSizing: 'border-box', padding: '10px 12px',
            borderRadius: 10, border: `1px solid ${COLORS.border}`, background: COLORS.surface,
            color: COLORS.silver, fontSize: 'var(--ccna-type-md)', fontFamily: 'inherit',
          }}
        />
        <button type="button" onClick={runSearch} style={{ ...styles.primaryBtn, width: 'auto', minWidth: 72, padding: '0 16px' }}>Ask</button>
      </div>

      {scopeObjectiveId && (
        <div style={{ ...styles.small, marginBottom: 8, color: COLORS.sky }}>
          Scoped to objective {scopeObjectiveId}
        </div>
      )}

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
        <button type="button" onClick={() => setDomainFilter('all')}
          style={{ ...styles.pill(domainFilter === 'all' ? 'sky' : 'silver'), border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>All</button>
        {DOMAINS.map(d => (
          <button key={d.id} type="button" onClick={() => setDomainFilter(d.id)}
            style={{ ...styles.pill(domainFilter === d.id ? d.accent : 'silver'), border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            {d.weight}%
          </button>
        ))}
      </div>

      {!submitted && (
        <div style={{ ...styles.card, marginBottom: 12 }}>
          <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 8, letterSpacing: '0.04em' }}>TRY ASKING</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {SUGGESTED.map(s => (
              <button key={s} type="button" onClick={() => { setQuery(s); setSubmitted(s); setSynthesized(null); setSynthError(null) }}
                style={{ textAlign: 'left', background: 'none', border: 'none', color: COLORS.sky, cursor: 'pointer', fontFamily: 'inherit', fontSize: 'var(--ccna-type-sm)', padding: 0 }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {submitted && searchResult && (
        <>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
            <span style={styles.pill('sky')}>{INTENT_LABEL[intent] || intent}</span>
            {searchResult.cluster && (
              <span style={styles.pill('mint')}>{searchResult.cluster.label}</span>
            )}
            <span style={{ ...styles.small, color: COLORS.silverMid }}>{searchResult.totalMatches} library matches</span>
          </div>

          {instant && (
            <div style={{ ...styles.card, marginBottom: 12, background: COLORS.mintDim, border: `1px solid ${COLORS.mintBorder}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 600, letterSpacing: '0.04em', color: COLORS.mint }}>INSTANT ANSWER · FREE</div>
                {instant.confidence && (() => {
                  const b = confidenceBadge(instant.confidence)
                  return <span style={{ ...styles.pill('mint'), background: b.bg, color: b.color, border: 'none' }}>{b.label}</span>
                })()}
              </div>

              {instant.compareRows ? (
                <div style={{ display: 'grid', gap: 8 }}>
                  {instant.compareRows.map(row => (
                    <div key={row.label} style={{ padding: '8px 10px', borderRadius: 8, background: COLORS.surface }}>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>{row.label}</div>
                      <div style={{ fontSize: 'var(--ccna-type-sm)', lineHeight: 1.5 }}><RichText text={row.detail} /></div>
                    </div>
                  ))}
                </div>
              ) : instant.familyRows ? (
                <div style={{ display: 'grid', gap: 8 }}>
                  {instant.familyRows.map(row => (
                    <div key={row.label} style={{
                      padding: '8px 10px', borderRadius: 8,
                      background: row.isPrimary ? COLORS.surface : 'transparent',
                      border: row.isPrimary ? `1px solid ${COLORS.mintBorder}` : 'none',
                    }}>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>{row.label}</div>
                      <div style={{ fontSize: 'var(--ccna-type-sm)', lineHeight: 1.5 }}><RichText text={row.detail} /></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 'var(--ccna-type-md)', lineHeight: 1.55 }}><RichText text={instant.text} /></div>
              )}
            </div>
          )}

          {(displayAnswer || synthLoading) && (
            <div style={{ ...styles.card, marginBottom: 12, background: COLORS.purpleDim, border: `1px solid ${COLORS.borderGlow}` }}>
              <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 600, letterSpacing: '0.04em', color: COLORS.purple, marginBottom: 8 }}>SYNTHESIZED · AI TUTOR</div>
              <div style={{ fontSize: 'var(--ccna-type-md)', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
                <RichText text={displayAnswer || ''} />
                {synthLoading && !displayAnswer && <span className="ccna-pulse"> …</span>}
              </div>
            </div>
          )}

          {synthError && (
            <div style={{ ...styles.card, marginBottom: 12, border: `1px solid ${COLORS.roseBorder}`, background: COLORS.roseDim, color: COLORS.rose, fontSize: 'var(--ccna-type-sm)' }}>
              {synthError}
            </div>
          )}

          {!synthesized && !synthLoading && searchResult.hits.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <AiBudgetWarning />
              <button
                type="button"
                onClick={runSynthesize}
                style={{ ...styles.secondaryBtn, width: '100%' }}
              >
                {premiumUnlocked ? 'Synthesize cited answer' : 'Synthesize answer (AI Tutor access)'}
              </button>
              <div style={{ ...styles.small, color: COLORS.silverMid, marginTop: 6, lineHeight: 1.4 }}>
                Builds prose from library sources with [chunk-id] citations. Included with AI Tutor supporter access.
              </div>
            </div>
          )}

          <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 8, letterSpacing: '0.04em' }}>LIBRARY SOURCES</div>
          <div className="study-lens-list" style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
            {searchResult.hits.length === 0 ? (
              <div style={{ ...styles.card, color: COLORS.silverMid, fontSize: 'var(--ccna-type-sm)' }}>No library matches. Try a command, term, or objective ID.</div>
            ) : searchResult.hits.map(hit => (
              <button
                key={hit.id}
                type="button"
                onClick={() => openSource(hit)}
                style={{
                  ...styles.card, textAlign: 'left', cursor: 'pointer', width: '100%',
                  border: `1px solid ${COLORS.border}`, background: COLORS.surface,
                  fontFamily: 'inherit', color: COLORS.silver,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, fontSize: 'var(--ccna-type-sm)' }}>{hit.title}</span>
                  <span style={styles.pill('silver')}>{kindLabel(hit.kind)}</span>
                </div>
                <div style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.silverMid, lineHeight: 1.45 }}>{hit.snippet}</div>
                {hit.objectiveIds?.[0] && (
                  <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.sky, marginTop: 6 }}>Open {hit.objectiveIds[0]} →</div>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
