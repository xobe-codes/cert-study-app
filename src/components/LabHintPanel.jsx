/**
 * Lab Hint Panel Component (Phase 1 Complete)
 */

import React, { useState, useEffect } from 'react'
import { COLORS, styles } from '../ui/appTheme.js'

export default function LabHintPanel({
  checkpoint,
  attempts = 0,
  hintsUsed = 0,
  currentHintLevel = 0,
  onRequestHint,
  onEscalate,
  compact = false,
}) {
  const [displayedHint, setDisplayedHint] = useState(null)
  const [hintLevel, setHintLevel] = useState(currentHintLevel)

  useEffect(() => {
    if (attempts === 2 && hintsUsed === 0) {
      setDisplayedHint('Need help? Here\'s a nudge...')
    } else if (attempts === 4 && hintsUsed < 2) {
      setDisplayedHint('Still stuck? Here\'s more guidance...')
    } else if (attempts === 6) {
      setDisplayedHint('Here\'s the exact command to run:')
    }
  }, [attempts, hintsUsed])

  const handleRequestHint = (level) => {
    setHintLevel(level)
    onRequestHint?.(level)
  }

  const handleEscalate = () => {
    onEscalate?.()
  }

  const shouldShowEscalation = attempts > 4 && hintsUsed >= 3

  if (compact) {
    return (
      <div
        style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
        }}
      >
        {[1, 2, 3].map((level) => (
          <button
            key={level}
            onClick={() => handleRequestHint(level)}
            disabled={hintLevel >= level}
            style={{
              padding: '6px 12px',
              fontSize: 'var(--ccna-type-xs)',
              fontWeight: 600,
              backgroundColor:
                hintLevel >= level ? COLORS.silver : COLORS.sky,
              color: COLORS.dark,
              border: 'none',
              borderRadius: 'var(--ccna-radius)',
              cursor: hintLevel >= level ? 'default' : 'pointer',
              opacity: hintLevel >= level ? 0.5 : 1,
            }}
          >
            Hint L{level}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div style={{ ...styles.card, marginBottom: 16 }}>
      <div
        style={{
          fontSize: 'var(--ccna-type-sm)',
          fontWeight: 600,
          color: COLORS.white,
          marginBottom: 12,
        }}
      >
        Need Help?
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 12,
          padding: '8px 0',
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silver }}>
          Attempts: <span style={{ fontWeight: 600 }}>{attempts}</span>
        </div>
        <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silver }}>
          Hints used: <span style={{ fontWeight: 600 }}>{hintsUsed}</span>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8,
          marginBottom: 12,
        }}
      >
        {[
          { level: 1, label: 'Nudge', desc: 'Questions' },
          { level: 2, label: 'Guidance', desc: 'Explanations' },
          { level: 3, label: 'Solution', desc: 'Command' },
        ].map(({ level, label, desc }) => (
          <button
            key={level}
            onClick={() => handleRequestHint(level)}
            disabled={hintLevel >= level}
            style={{
              padding: '12px 8px',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              backgroundColor:
                hintLevel >= level ? COLORS.silver : COLORS.sky,
              color: hintLevel >= level ? COLORS.border : COLORS.dark,
              border: 'none',
              borderRadius: 'var(--ccna-radius)',
              cursor: hintLevel >= level ? 'default' : 'pointer',
              opacity: hintLevel >= level ? 0.5 : 1,
              fontSize: 'var(--ccna-type-xs)',
              fontWeight: 600,
              textAlign: 'center',
            }}
          >
            <span>{label}</span>
            <span style={{ fontSize: '10px', opacity: 0.8 }}>L{level}</span>
          </button>
        ))}
      </div>

      {displayedHint && (
        <div
          style={{
            backgroundColor: COLORS.mintDim,
            border: `1px solid ${COLORS.mintBorder}`,
            borderRadius: 'var(--ccna-radius)',
            padding: 12,
            marginBottom: 12,
            fontSize: 'var(--ccna-type-sm)',
            color: COLORS.mint,
            lineHeight: 1.6,
          }}
        >
          {displayedHint}
        </div>
      )}

      {shouldShowEscalation && (
        <div
          style={{
            backgroundColor: COLORS.roseDim,
            border: `1px solid ${COLORS.roseBorder}`,
            borderRadius: 'var(--ccna-radius)',
            padding: 12,
            marginBottom: 12,
            fontSize: 'var(--ccna-type-sm)',
            color: COLORS.rose,
            lineHeight: 1.6,
          }}
        >
          <div style={{ marginBottom: 8 }}>
            You've tried many times on this step.
          </div>
          {onEscalate && (
            <button
              onClick={handleEscalate}
              style={{
                marginTop: 8,
                padding: '8px 12px',
                backgroundColor: COLORS.rose,
                color: COLORS.white,
                border: 'none',
                borderRadius: 'var(--ccna-radius)',
                cursor: 'pointer',
                fontSize: 'var(--ccna-type-xs)',
                fontWeight: 600,
              }}
            >
              Get Expert Help
            </button>
          )}
        </div>
      )}
    </div>
  )
}
