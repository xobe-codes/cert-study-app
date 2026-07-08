import React, { useState, useEffect, useMemo } from 'react'
import { DOMAINS } from '../data/ccnaDomains.js'
import { STORAGE_KEYS } from '../storageKeys.js'
import { buildLabModules, filterLabModules, labDomainDoneCount } from '../data/labModules.js'
import { getInterpretAlternate } from '../data/labTierStrategy.js'
import { COLORS, styles } from '../ui/appTheme.js'
import { STATIC_COPY } from '../ui/staticContentCopy.js'
import { loadLabDone } from './labStorage.js'
import { LabTierBadge } from './LabTierBadge.jsx'

const LAB_DIFF_ACCENT = { beginner: 'mint', intermediate: 'sky', advanced: 'amber' }

function domainChipLabel(domain, domainNumber) {
  const short = {
    fundamentals: 'Fundamentals',
    access: 'Access',
    connectivity: 'Connectivity',
    services: 'Services',
    security: 'Security',
    automation: 'Automation',
  }
  return `D${domainNumber} ${short[domain.id] || domain.name}`
}

export default function LabsHub({ onBack, onOpenLab, initialDomainFilter = null }) {
  const [done, setDone] = useState([])
  const [domainFilter, setDomainFilter] = useState('all')
  const [filterReady, setFilterReady] = useState(false)
  useEffect(() => { loadLabDone().then(setDone) }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      let next = initialDomainFilter
      if (!next) next = await window.storage?.getItem(STORAGE_KEYS.labsDomainFilter)
      if (!cancelled && next) setDomainFilter(next)
      if (!cancelled) setFilterReady(true)
    })()
    return () => { cancelled = true }
  }, [initialDomainFilter])

  useEffect(() => {
    if (!filterReady) return
    window.storage?.setItem(STORAGE_KEYS.labsDomainFilter, domainFilter === 'all' ? null : domainFilter)
  }, [domainFilter, filterReady])

  const modules = useMemo(() => buildLabModules(), [])
  const visibleModules = useMemo(
    () => filterLabModules(modules, domainFilter),
    [modules, domainFilter],
  )
  const allProgress = useMemo(() => labDomainDoneCount(modules, done, 'all'), [modules, done])

  const labCard = (lab) => {
    const interpretAlt = getInterpretAlternate(lab.id)
    return (
    <button
      key={lab.id}
      type="button"
      className="ccna-hover"
      onClick={() => onOpenLab(lab.id)}
      style={{ ...styles.card, display: 'block', width: '100%', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 600, color: COLORS.silver, flex: 1, lineHeight: 1.35 }}>{lab.title}</span>
        {done.includes(lab.id) && <span style={{ ...styles.pill('mint'), fontSize: 'var(--ccna-type-micro)' }}>✓ DONE</span>}
      </div>
      {lab.learningGoals?.[0] && (
        <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, lineHeight: 1.45, marginBottom: 8 }}>
          📖 {lab.learningGoals[0]}
        </div>
      )}
      {interpretAlt && (
        <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.amber, marginBottom: 8, lineHeight: 1.4 }}>
          Exam prep: interpret-only alternate available
        </div>
      )}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <span style={{ ...styles.pill(LAB_DIFF_ACCENT[lab.difficulty] || 'sky'), fontSize: 'var(--ccna-type-micro)' }}>{lab.difficulty.toUpperCase()}</span>
        <LabTierBadge lab={lab} />
        {lab.labType === 'troubleshooting' && <span style={{ ...styles.pill('amber'), fontSize: 'var(--ccna-type-micro)' }}>TROUBLESHOOT</span>}
        <span style={{ ...styles.pill(lab.interpretOnly ? 'mint' : 'sky'), fontSize: 'var(--ccna-type-micro)' }}>{lab.interpretOnly ? 'SHOW ONLY' : 'LEARN → DO'}</span>
        <span style={{ ...styles.pill('silver'), fontSize: 'var(--ccna-type-micro)' }}>{lab.tasks?.length || 0} tasks</span>
        <span style={{ ...styles.pill('silver'), fontSize: 'var(--ccna-type-micro)' }}>~{lab.estimatedTimeMinutes} MIN</span>
        <span style={{ ...styles.pill('silver'), fontSize: 'var(--ccna-type-micro)' }}>{lab.objectiveId}</span>
      </div>
    </button>
  )}

  return (
    <div>
      <button type="button" style={styles.backBtn} onClick={onBack}>‹ Back</button>
      <h1 style={styles.h1}>🧪 Hands-on Labs</h1>
      <div style={{ ...styles.card, background: COLORS.skyDim, border: `1px solid ${COLORS.skyBorder}`, marginBottom: 14 }}>
        <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 700, color: COLORS.sky, marginBottom: 6 }}>HOW LABS WORK</div>
        <ol style={{ margin: 0, paddingLeft: 18, fontSize: 'var(--ccna-type-sm)', color: COLORS.silver, lineHeight: 1.5 }}>
          <li><strong>Learn</strong> — read scenario, goals, topology, and traps</li>
          <li><strong>Practice</strong> — <strong>Interpret</strong> labs use <code>show</code> only; <strong>Config</strong> labs type IOS commands (<code>enable</code>, <code>conf t</code>, …)</li>
          <li><strong>Verify</strong> — confirm with <code>show</code> commands in the terminal</li>
        </ol>
        <p style={{ ...styles.small, margin: '8px 0 0' }}>{STATIC_COPY.lab}</p>
        <p style={{ ...styles.small, margin: '8px 0 0', color: COLORS.silverMid }}>
          Labs are grouped by CCNA exam domain — filter below or browse all {allProgress.total} labs in curriculum order.
          {allProgress.done > 0 && ` You have completed ${allProgress.done}.`}
        </p>
      </div>

      <div
        className="ccna-h-scroll"
        role="tablist"
        aria-label="Filter labs by exam domain"
        style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 14, paddingBottom: 4, flexWrap: 'wrap' }}
      >
        {(() => {
          const { done: d, total } = labDomainDoneCount(modules, done, 'all')
          return (
            <button
              type="button"
              role="tab"
              aria-selected={domainFilter === 'all'}
              onClick={() => setDomainFilter('all')}
              style={{ ...styles.pill(domainFilter === 'all' ? 'sky' : 'silver'), border: 'none', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              All · {d}/{total}
            </button>
          )
        })()}
        {modules.filter(m => m.domainId && m.domainId !== 'capstone').map((mod) => {
          const domain = DOMAINS.find(d => d.id === mod.domainId)
          if (!domain) return null
          const { done: d, total } = labDomainDoneCount(modules, done, mod.domainId)
          const active = domainFilter === mod.domainId
          return (
            <button
              key={mod.domainId}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setDomainFilter(mod.domainId)}
              style={{ ...styles.pill(active ? domain.accent : 'silver'), border: 'none', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0, fontSize: 'var(--ccna-type-xs)' }}
            >
              {domainChipLabel(domain, mod.domainNumber)} · {d}/{total}
            </button>
          )
        })}
        {modules.some(m => m.domainId === 'capstone') && (() => {
          const { done: d, total } = labDomainDoneCount(modules, done, 'capstone')
          const active = domainFilter === 'capstone'
          return (
            <button
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setDomainFilter('capstone')}
              style={{ ...styles.pill(active ? 'amber' : 'silver'), border: 'none', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0, fontSize: 'var(--ccna-type-xs)' }}
            >
              Capstone · {d}/{total}
            </button>
          )
        })()}
      </div>

      {visibleModules.length === 0 && <p style={styles.small}>No labs in this domain yet.</p>}
      {visibleModules.map((mod) => (
        <section key={mod.id} style={{ marginBottom: 20 }} aria-label={mod.domainId === 'capstone' ? mod.title : `Domain ${mod.domainNumber}: ${mod.title}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            {mod.domainNumber != null ? (
              <span style={{ ...styles.pill(mod.accent), fontSize: 'var(--ccna-type-micro)', fontWeight: 700 }}>
                DOMAIN {mod.domainNumber} · {mod.examWeight}% EXAM
              </span>
            ) : (
              <span style={{ ...styles.pill(mod.accent), fontSize: 'var(--ccna-type-micro)', fontWeight: 700 }}>
                CAPSTONE
              </span>
            )}
            <span style={{ fontSize: 'var(--ccna-type-lg)', fontWeight: 700, color: COLORS.silver }}>{mod.title}</span>
            <span style={{ ...styles.pill('silver'), fontSize: 'var(--ccna-type-micro)' }}>{mod.labs.length} labs</span>
            <span style={{ ...styles.pill('silver'), fontSize: 'var(--ccna-type-micro)' }}>{mod.level}</span>
          </div>
          {mod.blurb && (
            <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, lineHeight: 1.45, marginBottom: 8 }}>{mod.blurb}</div>
          )}
          {mod.labs.map(labCard)}
        </section>
      ))}
    </div>
  )
}
