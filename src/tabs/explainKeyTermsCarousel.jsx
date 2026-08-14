import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { getCurated } from '../data/ccnaCurated.js'
import { buildConceptDetail } from '../lesson/conceptDetail.js'
import CuratedStaticBadge from '../components/CuratedStaticBadge.jsx'
import ErrorBox from '../components/ErrorBox.jsx'
import Spinner from '../components/Spinner.jsx'
import { COLORS, styles } from '../ui/appTheme.js'
import { BOOK_REF } from '../data/bookRefFull.js'
import { PREMIUM_FEATURES } from '../premium/premiumFeatures.js'
import { askClaudeJSON, MODELS } from './tabRuntimeDeps.js'
import { RichText } from './studyQuizShared.jsx'

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

export function KeyTermsCarousel({ objective, premiumUnlocked = false, onPremiumBlocked }) {
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
