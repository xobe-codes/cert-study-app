import React, { useEffect, useRef } from 'react'
import { isMcQuestion } from '../questionUtils.js'
import { COLORS, styles } from '../ui/appTheme.js'

export default function McChoices({ q, selected, revealed, onSelect }) {
  const groupRef = useRef(null)
  const isMc = isMcQuestion(q)
  const choiceCount = q?.choices?.length || 0

  useEffect(() => {
    const root = groupRef.current
    if (!root || !isMc || revealed) return

    function onGroupKeyDown(e) {
      const digit = parseInt(e.key, 10)
      if (digit >= 1 && digit <= choiceCount) {
        e.preventDefault()
        onSelect(digit - 1)
        return
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault()
        onSelect(selected == null ? 0 : (selected + 1) % choiceCount)
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault()
        onSelect(selected == null ? choiceCount - 1 : (selected - 1 + choiceCount) % choiceCount)
      }
    }

    root.addEventListener('keydown', onGroupKeyDown)
    return () => root.removeEventListener('keydown', onGroupKeyDown)
  }, [isMc, revealed, selected, choiceCount, onSelect])

  if (!isMc) return null

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-label="Answer choices"
      tabIndex={revealed ? -1 : 0}
      style={{ outline: 'none' }}
    >
      {q.choices.map((choice, idx) => {
        let bg = COLORS.surface, border = COLORS.border, color = COLORS.silver, borderWidth = 1, fontWeight = 400
        if (revealed) {
          if (idx === q.correctIndex) {
            bg = COLORS.mintDim; border = COLORS.mintBorder; color = COLORS.mint; fontWeight = 600
          } else if (idx === selected) {
            bg = COLORS.roseDim; border = COLORS.rose; color = COLORS.rose; borderWidth = 2; fontWeight = 700
          }
        } else if (selected === idx) {
          bg = COLORS.brandDim
          border = COLORS.brandGlow
          color = COLORS.brandGlow
        }
        return (
          <button
            key={idx}
            type="button"
            role="radio"
            aria-checked={selected === idx}
            tabIndex={-1}
            aria-label={`Choice ${String.fromCharCode(65 + idx)}: ${choice}`}
            onClick={() => onSelect(idx)}
            onKeyDown={e => { if (!revealed && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onSelect(idx) } }}
            style={{
              display: 'block', width: '100%', maxWidth: '100%', textAlign: 'left', minHeight: 44, marginBottom: 8,
              background: bg, border: `${borderWidth}px solid ${border}`, color, borderRadius: 10,
              padding: '12px 14px', fontSize: 14, cursor: revealed ? 'default' : 'pointer', lineHeight: 1.4,
              fontWeight, fontFamily: 'inherit', boxSizing: 'border-box', overflowWrap: 'anywhere', wordBreak: 'break-word',
            }}
          >
            <span aria-hidden="true" style={{ fontWeight: 700, marginRight: 8, color: revealed && idx === selected && idx !== q.correctIndex ? COLORS.rose : COLORS.silverMid }}>
              {revealed && idx === selected && idx !== q.correctIndex ? '✗ ' : ''}{String.fromCharCode(65 + idx)}.
            </span>
            <span style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>{choice}</span>
          </button>
        )
      })}
      {!revealed && (
        <div className="mc-choices-tip" style={{ ...styles.small, marginTop: 4 }}>Tip: press 1–{Math.min(choiceCount, 4)} or arrow keys to select</div>
      )}
    </div>
  )
}
