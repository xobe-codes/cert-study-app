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
        let bg = COLORS.surface, border = COLORS.border, color = COLORS.silver
        if (revealed) {
          if (idx === q.correctIndex) { bg = COLORS.mintDim; border = COLORS.mintBorder; color = COLORS.mint }
          else if (idx === selected) { bg = COLORS.roseDim; border = COLORS.roseBorder; color = COLORS.rose }
        } else if (selected === idx) {
          bg = COLORS.purpleDim
          border = COLORS.purpleGlow
          color = COLORS.purpleGlow
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
              display: 'block', width: '100%', textAlign: 'left', minHeight: 44, marginBottom: 8,
              background: bg, border: `1px solid ${border}`, color, borderRadius: 10,
              padding: '12px 14px', fontSize: 14, cursor: revealed ? 'default' : 'pointer', lineHeight: 1.4,
            }}
          >
            <span aria-hidden="true" style={{ fontWeight: 700, marginRight: 8, color: COLORS.silverMid }}>
              {String.fromCharCode(65 + idx)}.
            </span>
            {choice}
          </button>
        )
      })}
      {!revealed && (
        <div style={{ ...styles.small, marginTop: 4 }}>Tip: press 1–{Math.min(choiceCount, 4)} or arrow keys to select</div>
      )}
    </div>
  )
}
