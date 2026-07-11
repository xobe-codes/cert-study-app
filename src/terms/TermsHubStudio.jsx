import React, { useMemo, useState } from 'react'
import { COLORS, styles } from '../ui/appTheme.js'
import { DOMAINS } from '../data/ccnaDomains.js'
import StudyModeHeader from '../components/StudyModeHeader.jsx'
import { buildTermsCatalog, filterTermsCatalog } from './termsCatalog.js'
import {
  buildFlashItems,
  buildTypeTermItems,
  buildPickDefinitionItems,
  gradeTypeTerm,
} from './termsDrillQuiz.js'
import { useMasteryProgress } from '../features/progress/MasteryProgressContext.jsx'
import { ENGAGEMENT_KINDS } from '../features/progress/masteryEngagement.js'
import { speak, stopSpeaking, isTtsSupported } from '../lib/browserTts.js'

const MODES = [
  { id: 'browse', label: 'Browse' },
  { id: 'flash', label: 'Flash' },
  { id: 'type', label: 'Type the term' },
  { id: 'pick', label: 'Pick definition' },
]

/**
 * Spec 11 — Terms & Definitions Hub (Command Hub twin).
 */
export default function TermsHubStudio({ onBack, domainPrefill = null }) {
  const { recordEngagement } = useMasteryProgress() || {}
  const catalog = useMemo(() => buildTermsCatalog(), [])
  const [domainId, setDomainId] = useState(domainPrefill || 'all')
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState('browse')
  const [items, setItems] = useState([])
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [typed, setTyped] = useState('')
  const [picked, setPicked] = useState(null)
  const [stats, setStats] = useState({ correct: 0, total: 0 })

  const filtered = useMemo(
    () => filterTermsCatalog(catalog, { domainId, query }),
    [catalog, domainId, query],
  )

  function startMode(nextMode) {
    stopSpeaking()
    const pool = filtered.length ? filtered : catalog
    let next = []
    if (nextMode === 'flash') next = buildFlashItems(pool, 12)
    else if (nextMode === 'type') next = buildTypeTermItems(pool, 10)
    else if (nextMode === 'pick') next = buildPickDefinitionItems(pool, 10)
    setMode(nextMode)
    setItems(next)
    setIdx(0)
    setFlipped(false)
    setTyped('')
    setPicked(null)
    setStats({ correct: 0, total: 0 })
  }

  function record(card, correct) {
    if (card?.objectiveId) {
      recordEngagement?.(card.objectiveId, {
        kind: ENGAGEMENT_KINDS.TERMS || ENGAGEMENT_KINDS.TOPIC_FOCUS,
        correct: correct ? 1 : 0,
        total: 1,
      })
    }
  }

  const current = items[idx]
  const done = mode !== 'browse' && items.length > 0 && idx >= items.length

  return (
    <div>
      <StudyModeHeader title="Terms Hub" onBack={onBack} subtitle="Flash · type · pick definitions" />

      <div className="ccna-h-scroll" style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 10, paddingBottom: 4 }}>
        <button type="button" onClick={() => setDomainId('all')} style={{ ...styles.pill(domainId === 'all' ? 'sky' : 'silver'), border: 'none', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>
          All
        </button>
        {DOMAINS.map(d => (
          <button key={d.id} type="button" onClick={() => setDomainId(d.id)} style={{ ...styles.pill(domainId === d.id ? d.accent : 'silver'), border: 'none', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>
            {d.name}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        {MODES.map(m => (
          <button
            key={m.id}
            type="button"
            onClick={() => (m.id === 'browse' ? setMode('browse') : startMode(m.id))}
            style={{ ...styles.pill(mode === m.id ? 'purple' : 'silver'), border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {mode === 'browse' && (
        <>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search terms…"
            aria-label="Search terms"
            style={{ ...styles.input, width: '100%', marginBottom: 10 }}
          />
          <div style={{ ...styles.small, marginBottom: 8, color: COLORS.silverMid }}>
            {filtered.length} terms
          </div>
          {filtered.slice(0, 80).map(card => (
            <div key={card.id} style={{ ...styles.card, marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ fontWeight: 700, color: COLORS.sky }}>{card.term}</div>
                {isTtsSupported() && (
                  <button type="button" style={{ ...styles.secondaryBtn, width: 'auto', minHeight: 28, padding: '2px 8px', fontSize: 'var(--ccna-type-micro)' }} onClick={() => { stopSpeaking(); speak(`${card.term}. ${card.definition}`, { rate: 0.95 }) }}>
                    ▶ Hear
                  </button>
                )}
              </div>
              <div style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.silver, lineHeight: 1.45, marginTop: 6 }}>{card.definition}</div>
              {card.dontConfuse && (
                <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.amber, marginTop: 6 }}>{card.dontConfuse}</div>
              )}
              {card.objectiveId && (
                <div style={{ fontSize: 'var(--ccna-type-micro)', color: COLORS.silverMid, marginTop: 6 }}>{card.objectiveId}</div>
              )}
            </div>
          ))}
        </>
      )}

      {mode !== 'browse' && done && (
        <div style={styles.card}>
          <div style={{ fontSize: 'var(--ccna-type-display)', fontWeight: 700, color: COLORS.mint }}>{stats.correct}/{stats.total}</div>
          <button type="button" style={{ ...styles.primaryBtn, marginTop: 10 }} onClick={() => startMode(mode)}>Again</button>
          <button type="button" style={{ ...styles.secondaryBtn, marginTop: 8 }} onClick={() => setMode('browse')}>Back to browse</button>
        </div>
      )}

      {mode === 'flash' && current && !done && (
        <div style={styles.card}>
          <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 8 }}>{idx + 1}/{items.length}</div>
          <div style={{ fontWeight: 700, fontSize: 'var(--ccna-type-lg)', color: COLORS.sky, marginBottom: 10 }}>{current.prompt}</div>
          {flipped && <div style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.silver, lineHeight: 1.45 }}>{current.answer}</div>}
          <button type="button" style={{ ...styles.primaryBtn, marginTop: 12 }} onClick={() => {
            if (!flipped) { setFlipped(true); return }
            record(current.card, true)
            setStats(s => ({ correct: s.correct + 1, total: s.total + 1 }))
            setFlipped(false)
            setIdx(i => i + 1)
          }}>
            {flipped ? 'Next' : 'Reveal'}
          </button>
        </div>
      )}

      {mode === 'type' && current && !done && (
        <div style={styles.card}>
          <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 8 }}>{idx + 1}/{items.length}</div>
          <div style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.silver, lineHeight: 1.45, marginBottom: 10 }}>{current.prompt}</div>
          <input value={typed} onChange={e => setTyped(e.target.value)} aria-label="Type the term" style={{ ...styles.input, width: '100%' }} />
          <button type="button" style={{ ...styles.primaryBtn, marginTop: 10 }} onClick={() => {
            const ok = gradeTypeTerm(typed, current.answer)
            record(current.card, ok)
            setStats(s => ({ correct: s.correct + (ok ? 1 : 0), total: s.total + 1 }))
            setTyped('')
            setIdx(i => i + 1)
          }}>
            Check
          </button>
        </div>
      )}

      {mode === 'pick' && current && !done && (
        <div style={styles.card}>
          <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 8 }}>{idx + 1}/{items.length}</div>
          <div style={{ fontWeight: 700, color: COLORS.sky, marginBottom: 10 }}>{current.prompt}</div>
          {current.choices.map((c, i) => (
            <button
              key={i}
              type="button"
              disabled={picked != null}
              onClick={() => {
                setPicked(i)
                const ok = i === current.correctIndex
                record(current.card, ok)
                setStats(s => ({ correct: s.correct + (ok ? 1 : 0), total: s.total + 1 }))
                setTimeout(() => { setPicked(null); setIdx(x => x + 1) }, 500)
              }}
              style={{
                ...styles.secondaryBtn,
                textAlign: 'left',
                marginBottom: 6,
                borderColor: picked == null ? COLORS.border : (i === current.correctIndex ? COLORS.mintBorder : (picked === i ? COLORS.roseBorder : COLORS.border)),
              }}
            >
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
