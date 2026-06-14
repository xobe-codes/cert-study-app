import React from 'react'
import { COLORS } from '../ui/appTheme.js'
import { getMasteryChecklist } from '../lesson/masteryCriteria.js'

export default function MasteryChecklist({ progressEntry, compact = false }) {
  const rows = getMasteryChecklist(progressEntry)
  const done = rows.filter(r => r.id !== 'mastered' && r.met).length
  return (
    <div style={{
      padding: compact ? '8px 10px' : '10px 12px',
      borderRadius: 8,
      border: `1px solid ${COLORS.border}`,
      background: COLORS.surface,
      marginBottom: compact ? 6 : 10,
    }}
    >
      <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 700, color: COLORS.silverMid, marginBottom: 6 }}>
        Mastery checklist · {done}/{rows.length - 1}
      </div>
      <ul style={{ margin: 0, paddingLeft: 16, fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, lineHeight: 1.55 }}>
        {rows.filter(r => r.id !== 'mastered').map(r => (
          <li key={r.id} style={{ color: r.met ? COLORS.mint : COLORS.silverMid }}>
            {r.met ? '✓' : '○'} {r.label}{r.detail && r.detail !== '—' && r.detail !== '✓' ? ` (${r.detail})` : ''}
          </li>
        ))}
      </ul>
    </div>
  )
}
