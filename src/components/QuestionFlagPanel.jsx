import React, { useEffect, useState } from 'react'
import { COLORS, styles } from '../ui/appTheme.js'
import { FLAG_REASONS } from '../data/questionHealthConstants.js'
import { submitQuestionFlag } from '../quiz/questionHealthClient.js'

/** Compact flag affordance — expands only when the learner opens it. */
export default function QuestionFlagPanel({ question, objectiveId, selectedIndex = null }) {
  const [open, setOpen] = useState(false)
  const [sent, setSent] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setOpen(false)
    setSent(null)
    setBusy(false)
  }, [question?.id])

  if (!question?.id || !objectiveId) return null

  async function onFlag(reason) {
    if (busy || sent) return
    setBusy(true)
    const result = await submitQuestionFlag({
      questionId: question.id,
      objectiveId,
      reason,
      choiceIndex: selectedIndex,
      trapId: question.trapId || null,
    })
    setBusy(false)
    if (result.ok) setSent(reason)
  }

  if (sent) {
    return (
      <p style={{ ...styles.small, margin: '10px 0 0', color: COLORS.mint }}>
        Flagged as “{FLAG_REASONS.find(r => r.id === sent)?.label}”. Thanks — fix queue updated.
      </p>
    )
  }

  if (!open) {
    return (
      <button
        type="button"
        aria-label="Flag question for content fix"
        onClick={() => setOpen(true)}
        style={{
          ...styles.secondaryBtn,
          marginTop: 10,
          width: 'auto',
          minHeight: 32,
          padding: '6px 10px',
          fontSize: 'var(--ccna-type-xs)',
          color: COLORS.amber,
          borderColor: COLORS.amberBorder,
          background: 'transparent',
        }}
      >
        ⚑ Flag
      </button>
    )
  }

  return (
    <div style={{ ...styles.card, marginTop: 10, padding: 12, border: `1px solid ${COLORS.amberBorder}`, background: COLORS.amberDim }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
        <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 700, color: COLORS.amber }}>
          Flag for content fix
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          style={{
            background: 'none',
            border: 'none',
            color: COLORS.silverMid,
            fontSize: 'var(--ccna-type-xs)',
            cursor: 'pointer',
            fontFamily: 'inherit',
            padding: 0,
          }}
        >
          Cancel
        </button>
      </div>
      <p style={{ ...styles.small, margin: '0 0 8px', lineHeight: 1.45 }}>
        Something wrong with this question? One tap sends it to the fix queue (no free text).
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {FLAG_REASONS.map(r => (
          <button
            key={r.id}
            type="button"
            disabled={busy}
            onClick={() => onFlag(r.id)}
            style={{
              ...styles.secondaryBtn,
              minHeight: 32,
              padding: '6px 10px',
              fontSize: 'var(--ccna-type-xs)',
              flex: '1 1 auto',
            }}
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>
  )
}
