import React, { useState, useEffect, useMemo, useRef } from 'react'
import { hasCuratedReading, hasCuratedQuestions } from '../../data/ccnaCurated.js'
import { DOMAINS, ALL_OBJECTIVES } from '../../data/ccnaDomains.js'
import { searchLibrary, kindLabel } from '../../library/libraryIndex.js'
import { COLORS, styles } from '../../ui/appTheme.js'
import { MODAL_Z } from '../../ui/modalConstants.js'
import { useFocusTrap } from '../../ui/useFocusTrap.js'
import CuratedStaticBadge from '../../components/CuratedStaticBadge.jsx'
import OverflowMarquee from '../../components/OverflowMarquee.jsx'
import StatusDot from '../../components/StatusDot.jsx'

export default function GlobalSearchModal({ progress, onSelectObjective, onClose }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)
  const dialogRef = useRef(null)
  useFocusTrap(dialogRef)

  useEffect(() => { inputRef.current?.focus() }, [])

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const results = useMemo(() => {
    const q = query.trim()
    if (!q) {
      const recent = ALL_OBJECTIVES
        .map(o => ({ o, last: progress[o.id]?.lastSeen || 0 }))
        .filter(x => x.last > 0)
        .sort((a, b) => b.last - a.last)
        .slice(0, 5)
        .map(x => x.o)
      const seen = new Set(recent.map(o => o.id))
      const fill = ALL_OBJECTIVES.filter(o => !seen.has(o.id)).slice(0, Math.max(0, 12 - recent.length))
      // Wrap bare objectives into the same hit shape searchLibrary hits use, so the
      // result rows below have one rendering/click path regardless of query state.
      return [...recent, ...fill].map(o => ({
        id: `objective:${o.id}`,
        kind: 'objective',
        title: `${o.id} — ${o.title}`,
        objectiveIds: [o.id],
        nav: { view: 'objective', objectiveId: o.id, tab: 'Study' },
      }))
    }
    return searchLibrary(q, { limit: 15 }).hits
  }, [query, progress])

  function pick(hit) {
    const oid = hit.nav?.objectiveId || hit.objectiveIds?.[0]
    const obj = ALL_OBJECTIVES.find(o => o.id === oid)
    if (!obj) { onClose(); return }
    const domain = DOMAINS.find(d => d.objectives.some(o => o.id === obj.id))
    onSelectObjective({
      ...obj,
      domainId: domain?.id,
      domainName: domain?.name,
      accent: domain?.accent,
      __initialTab: hit.nav?.tab || 'Study',
    })
    onClose()
  }

  return (
    <div
      ref={dialogRef}
      className="ccna-overlay global-search-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Search objectives"
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: MODAL_Z,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="global-search-panel" style={{ background: COLORS.card, borderRadius: 16, border: `1px solid ${COLORS.borderGlow}`, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: `1px solid ${COLORS.border}` }}>
          <span style={{ fontSize: 'var(--ccna-type-lg)', color: COLORS.silverMid }} aria-hidden>🔍</span>
          <input
            ref={inputRef}
            type="search"
            inputMode="search"
            enterKeyHint="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search terms, commands, objectives — e.g. 'OSPF' or 'show ip route'"
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 'var(--ccna-type-md)', color: COLORS.silver, fontFamily: 'inherit' }}
          />
          <button type="button" onClick={onClose} aria-label="Close search" style={{ background: 'none', border: 'none', color: COLORS.silverMid, fontSize: 'var(--ccna-type-sm)', cursor: 'pointer', minWidth: 44, minHeight: 44, padding: '4px 8px' }}>✕</button>
        </div>
        <div className="global-search-results">
          {results.map(hit => {
            const oid = hit.objectiveIds?.[0]
            const isObjective = hit.kind === 'objective'
            const status = isObjective ? (progress[oid]?.status || 'unseen') : null
            const domain = oid ? DOMAINS.find(d => d.objectives.some(x => x.id === oid)) : null
            const title = isObjective && oid && hit.title.startsWith(`${oid} — `)
              ? hit.title.slice(oid.length + 3)
              : hit.title
            return (
              <button
                key={hit.id}
                onClick={() => pick(hit)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', minWidth: 0, padding: '12px 16px', background: 'none', border: 'none', borderBottom: `1px solid ${COLORS.border}`, color: COLORS.silver, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
              >
                {isObjective && <StatusDot status={status} />}
                {oid && <span style={{ ...styles.pill(domain?.accent || 'purple'), fontSize: 'var(--ccna-type-micro)', flexShrink: 0 }}>{oid}</span>}
                <span style={{ ...styles.pill('silver'), fontSize: 'var(--ccna-type-micro)', flexShrink: 0 }}>{kindLabel(hit.kind)}</span>
                <OverflowMarquee text={title} style={{ fontSize: 'var(--ccna-type-sm)', lineHeight: 1.4 }} />
                {oid && (hasCuratedReading(oid) || hasCuratedQuestions(oid)) && (
                  <CuratedStaticBadge objectiveId={oid} fontSize={8} />
                )}
              </button>
            )
          })}
          {results.length === 0 && (
            <div style={{ padding: 20, textAlign: 'center', color: COLORS.silverMid, fontSize: 'var(--ccna-type-sm)' }}>No results match "{query}"</div>
          )}
        </div>
        {!query && <div style={{ padding: '8px 16px', fontSize: 'var(--ccna-type-xs)', color: COLORS.silverDim, borderTop: `1px solid ${COLORS.border}` }}>Recent objectives first · type to search terms, commands & objectives</div>}
      </div>
    </div>
  )
}
