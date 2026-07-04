import React, { useState, useEffect } from 'react'
import { DOMAINS } from '../data/ccnaDomains.js'
import { labsByDomain, troubleshootingLabs } from '../data/ccnaLabs.js'
import { getInterpretAlternate } from '../data/labTierStrategy.js'
import { COLORS, styles } from '../ui/appTheme.js'
import { STATIC_COPY } from '../ui/staticContentCopy.js'
import { loadLabDone } from './labStorage.js'
import { LabTierBadge } from './LabTierBadge.jsx'

const LAB_DIFF_ACCENT = { beginner: 'mint', intermediate: 'sky', advanced: 'amber' }

export default function LabsHub({ onBack, onOpenLab }) {
  const [done, setDone] = useState([])
  useEffect(() => { loadLabDone().then(setDone) }, [])

  const byDomain = labsByDomain()
  const tsLabs = troubleshootingLabs()
  const domainName = (id) => DOMAINS.find(d => d.id === id)?.name || id

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
      </div>

      {tsLabs.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ ...styles.small, fontWeight: 700, color: COLORS.amber, marginBottom: 8, letterSpacing: 0.4 }}>🔧 TROUBLESHOOTING SCENARIOS</div>
          {tsLabs.map(labCard)}
        </div>
      )}

      {Object.keys(byDomain).length === 0 && <p style={styles.small}>No labs available yet.</p>}
      {Object.entries(byDomain).map(([domainId, labs]) => (
        <div key={domainId} style={{ marginBottom: 16 }}>
          <div style={{ ...styles.small, fontWeight: 700, color: COLORS.silver, marginBottom: 8, letterSpacing: 0.4 }}>{domainName(domainId).toUpperCase()}</div>
          {labs.filter(l => l.labType !== 'troubleshooting').map(labCard)}
        </div>
      ))}
    </div>
  )
}
