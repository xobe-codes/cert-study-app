import React, { useMemo, useState } from 'react'
import { ALL_OBJECTIVES } from '../data/ccnaDomains.js'
import { BOOK_REF } from '../data/bookRefFull.js'
import { COLORS } from '../ui/appTheme.js'

export default function DebriefObjectiveFooter({ objectiveId }) {
  const [open, setOpen] = useState(false)
  const objective = useMemo(
    () => ALL_OBJECTIVES.find(item => item.id === objectiveId),
    [objectiveId],
  )
  const notes = BOOK_REF[objectiveId]
  if (!objectiveId || !notes) return null

  return (
    <div
      className="ccna-debrief-objective-footer"
      style={{
        marginTop: 10,
        padding: '10px 12px',
        borderRadius: 8,
        border: `1px solid ${COLORS.skyBorder}`,
        background: COLORS.skyDim,
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(value => !value)}
        style={{
          display: 'flex',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          padding: 0,
          border: 0,
          background: 'none',
          color: COLORS.sky,
          cursor: 'pointer',
          fontFamily: 'inherit',
          textAlign: 'left',
        }}
      >
        <span style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 800 }}>
          📚 OBJECTIVE {objectiveId}{objective?.title ? ` · ${objective.title}` : ''}
        </span>
        <span aria-hidden="true" style={{ flexShrink: 0 }}>{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div style={{ marginTop: 8, color: COLORS.silver, fontSize: 'var(--ccna-type-sm)', lineHeight: 1.55 }}>
          {notes}
        </div>
      )}
    </div>
  )
}
