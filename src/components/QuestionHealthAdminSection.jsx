import React, { useMemo, useState } from 'react'
import { COLORS, styles } from '../ui/appTheme.js'
import { listNeedsFixEntries } from '../data/questionHealth.js'
import { SADE_REASON_LABELS } from '../data/questionHealthConstants.js'

function reasonLabel(code) {
  return SADE_REASON_LABELS[code] || code
}

function statusAccent(status) {
  if (status === 'quarantined') return 'rose'
  if (status === 'needs_fix') return 'amber'
  return 'silver'
}

/** Engineer/admin panel — SADE + CI quarantine reasons for an objective (or global). */
export default function QuestionHealthAdminSection({
  objectiveId,
  defaultOpen = false,
  showWhenClean = false,
  embedded = false,
}) {
  const [open, setOpen] = useState(defaultOpen || embedded)
  const entries = useMemo(() => {
    const all = listNeedsFixEntries()
    if (!objectiveId) return all
    return all.filter(e => e.objectiveId === objectiveId || String(e.questionId || '').includes(objectiveId))
  }, [objectiveId])

  const summary = useMemo(() => {
    const quarantined = entries.filter(e => e.status === 'quarantined').length
    const needsFix = entries.filter(e => e.status === 'needs_fix').length
    const sade = entries.filter(e => (e.reasons || []).some(r => String(r.code || '').startsWith('sade_')))
    return { quarantined, needsFix, sade: sade.length, total: entries.length }
  }, [entries])

  if (!objectiveId && !summary.total && !showWhenClean) return null

  const statusLine = summary.total
    ? `${summary.total} flagged — ${summary.quarantined} quarantined, ${summary.needsFix} needs fix`
    : objectiveId
      ? `No SADE/CI flags for ${objectiveId}`
      : 'All 914 clean-bank questions pass SADE audit'

  const body = (
    <div style={{ padding: embedded ? 0 : '10px 12px 12px', fontSize: 'var(--ccna-type-sm)', color: COLORS.silver, lineHeight: 1.5 }}>
      {summary.total === 0 ? (
        <p style={{ margin: 0, color: COLORS.silverMid }}>
          {objectiveId
            ? 'All practice questions for this objective pass SADE distractor audit and compile-time health checks.'
            : 'No questions are quarantined — SADE fallback, low distractor scores, and stem-anchor checks all pass.'}
        </p>
      ) : (
        <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none' }}>
          {entries.map(entry => {
            const accent = statusAccent(entry.status)
            const c = accent === 'rose'
              ? { text: COLORS.rose, border: COLORS.rose, dim: COLORS.roseDim }
              : { text: COLORS.amber, border: COLORS.amberBorder, dim: COLORS.amberDim }
            return (
              <li
                key={entry.questionId}
                style={{
                  ...styles.card,
                  padding: '8px 10px',
                  marginBottom: 8,
                  borderColor: c.border,
                  background: c.dim,
                }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', marginBottom: 6 }}>
                  <code style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.sky }}>{entry.questionId}</code>
                  <span style={{
                    fontSize: 'var(--ccna-type-caption)',
                    fontWeight: 700,
                    color: c.text,
                    textTransform: 'uppercase',
                  }}
                  >
                    {entry.status.replace('_', ' ')}
                  </span>
                  {entry.flagCount > 0 && (
                    <span style={{ fontSize: 'var(--ccna-type-caption)', color: COLORS.silverMid }}>
                      {entry.flagCount} learner flag{entry.flagCount === 1 ? '' : 's'}
                    </span>
                  )}
                </div>
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {(entry.reasons || []).map((r, i) => (
                    <li key={i} style={{ marginBottom: 4, fontSize: 'var(--ccna-type-xs)' }}>
                      <strong style={{ color: r.source === 'sade_audit' ? COLORS.amber : COLORS.silverMid }}>
                        {reasonLabel(r.code)}
                      </strong>
                      {r.detail && (
                        <span style={{ color: COLORS.silverMid }}> — {r.detail}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </li>
            )
          })}
        </ul>
      )}
      <p style={{ margin: '8px 0 0', fontSize: 'var(--ccna-type-caption)', color: COLORS.silverDim }}>
        Quarantined IDs are excluded at compile — learners never see them until resolved.
      </p>
    </div>
  )

  if (embedded) {
    return <div className="question-health-admin">{body}</div>
  }

  return (
    <div
      className="question-health-admin"
      style={{
        marginTop: 12,
        marginBottom: 12,
        borderRadius: 8,
        border: `1px solid ${summary.total ? COLORS.amberBorder : COLORS.border}`,
        background: COLORS.surface,
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '10px 12px',
          background: COLORS.surfaceHigh,
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'inherit',
          textAlign: 'left',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 700, color: COLORS.amber, letterSpacing: 0.4 }}>
            QUESTION HEALTH (ADMIN)
          </div>
          <div style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.silver, marginTop: 2, lineHeight: 1.4 }}>
            {statusLine}
            {!open && summary.sade > 0 && (
              <span style={{ color: COLORS.silverMid }}> — {summary.sade} SADE</span>
            )}
          </div>
        </div>
        <span style={{ color: COLORS.silverMid, fontSize: 'var(--ccna-type-sm)', flexShrink: 0, marginLeft: 8 }}>
          {open ? '▾' : '▸'}
        </span>
      </button>

      {open && body}
    </div>
  )
}
