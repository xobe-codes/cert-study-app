import React, { useEffect, useRef, useState } from 'react'
import { isMcQuestion } from '../questionUtils.js'
import { getRevealedChoiceLayout } from '../mcChoicesLogic.js'
import { COLORS, styles } from '../ui/appTheme.js'

function choiceStyle(idx, { revealed, selected, correctIndex }) {
  let bg = COLORS.surface
  let border = COLORS.border
  let color = COLORS.silver
  let borderWidth = 1
  let fontWeight = 400
  if (revealed) {
    if (idx === correctIndex) {
      bg = COLORS.mintDim
      border = COLORS.mintBorder
      color = COLORS.mint
      fontWeight = 600
    } else if (idx === selected) {
      bg = COLORS.roseDim
      border = COLORS.rose
      color = COLORS.rose
      borderWidth = 2
      fontWeight = 700
    } else {
      bg = COLORS.surface
      border = COLORS.border
      color = COLORS.silverMid
      fontWeight = 400
    }
  } else if (selected === idx) {
    bg = COLORS.brandDim
    border = COLORS.brandGlow
    color = COLORS.brandGlow
  }
  return { bg, border, color, borderWidth, fontWeight }
}

function ChoiceButton({ idx, choice, q, selected, revealed, onSelect, dimmed = false }) {
  const { bg, border, color, borderWidth, fontWeight } = choiceStyle(idx, { revealed, selected, correctIndex: q.correctIndex })
  return (
    <button
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
        padding: '12px 14px', fontSize: 'var(--ccna-type-md)', cursor: revealed ? 'default' : 'pointer', lineHeight: 1.4,
        fontWeight, fontFamily: 'inherit', boxSizing: 'border-box', overflowWrap: 'anywhere', wordBreak: 'break-word',
        opacity: dimmed ? 0.88 : 1,
      }}
    >
      <span aria-hidden="true" style={{ fontWeight: 700, marginRight: 8, color: revealed && idx === q.correctIndex ? COLORS.mint : revealed && idx === selected ? COLORS.rose : COLORS.silverMid }}>
        {revealed && idx === q.correctIndex ? '✓ ' : revealed ? '✗ ' : ''}{String.fromCharCode(65 + idx)}.
      </span>
      <span style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>{choice}</span>
    </button>
  )
}

export default function McChoices({ q, selected, revealed, onSelect, accordionOnReveal = true }) {
  const groupRef = useRef(null)
  const [othersOpen, setOthersOpen] = useState(false)
  const isMc = isMcQuestion(q)
  const choiceCount = q?.choices?.length || 0

  useEffect(() => {
    if (!revealed) setOthersOpen(false)
  }, [revealed, q?.question])

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

  const useAccordion = revealed && accordionOnReveal && choiceCount > 2
  const { primaryIndices, collapsedIndices } = useAccordion
    ? getRevealedChoiceLayout(choiceCount, q.correctIndex, selected)
    : { primaryIndices: q.choices.map((_, i) => i), collapsedIndices: [] }

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-label="Answer choices"
      tabIndex={revealed ? -1 : 0}
      className="mc-choices"
      style={{ outline: 'none' }}
    >
      {useAccordion ? (
        <>
          {primaryIndices.map(idx => (
            <ChoiceButton key={idx} idx={idx} choice={q.choices[idx]} q={q} selected={selected} revealed={revealed} onSelect={onSelect} />
          ))}
          {collapsedIndices.length > 0 && (
            <div className="mc-choices-accordion">
              <button
                type="button"
                className="mc-choices-accordion__toggle"
                aria-expanded={othersOpen}
                onClick={() => setOthersOpen(o => !o)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
                  minHeight: 40, marginBottom: othersOpen ? 8 : 0, padding: '8px 12px', borderRadius: 10,
                  border: `1px solid ${COLORS.border}`, background: COLORS.surface, color: COLORS.silverMid,
                  fontSize: 'var(--ccna-type-sm)', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                <span>{othersOpen ? 'Hide' : 'Show'} {collapsedIndices.length} other option{collapsedIndices.length === 1 ? '' : 's'}</span>
                <span aria-hidden="true">{othersOpen ? '−' : '+'}</span>
              </button>
              {othersOpen && collapsedIndices.map(idx => (
                <ChoiceButton key={idx} idx={idx} choice={q.choices[idx]} q={q} selected={selected} revealed={revealed} onSelect={onSelect} dimmed />
              ))}
            </div>
          )}
        </>
      ) : (
        q.choices.map((choice, idx) => (
          <ChoiceButton key={idx} idx={idx} choice={choice} q={q} selected={selected} revealed={revealed} onSelect={onSelect} />
        ))
      )}
      {!revealed && (
        <div className="mc-choices-tip" style={{ ...styles.small, marginTop: 4 }}>Tip: press 1–{Math.min(choiceCount, 4)} or arrow keys to select</div>
      )}
    </div>
  )
}
