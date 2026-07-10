import React, { useState } from 'react'
import { COLORS, styles } from '../ui/appTheme.js'
import { FLAG_REASONS } from '../data/questionHealthConstants.js'
import { submitQuestionFlag } from '../quiz/questionHealthClient.js'

/** Structured flag CTA after reveal — feeds backend health registry. */
export default function QuestionFlagPanel({ question, objectiveId, selectedIndex = null }) {
  const [sent, setSent] = useState(null)
  const [busy, setBusy] = useState(false)

  if (!question?.id) return null

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

  return (
    <div style={{ ...styles.card, marginTop: 10, padding: 12, border: `1px solid ${COLORS.amberBorder}`, background: COLORS.amberDim }}>
      <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 700, color: COLORS.amber, marginBottom: 8 }}>
        Flag for content fix
      </div>
      {sent ? (
        <p style={{ ...styles.small, margin: 0, color: COLORS.mint }}>
          Thanks — flagged as “{FLAG_REASONS.find(r => r.id === sent)?.label}”. Backend queue updated.
        </p>
      ) : (
        <>
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
        </>
      )}
    </div>
  )
}
