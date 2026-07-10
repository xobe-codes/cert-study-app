import React, { useEffect, useRef } from 'react'
import { isMultiQuestion, multiCorrectIndexes } from '../questionUtils.js'
import { useMcChoiceShuffle } from '../hooks/useMcChoiceShuffle.js'
import { useMcChoiceShuffleContext } from '../context/McChoiceShuffleContext.jsx'
import { COLORS, styles } from '../ui/appTheme.js'

function multiChoiceStyle(idx, { revealed, selectedSet, correctSet }) {
  let bg = COLORS.surface
  let border = COLORS.border
  let color = COLORS.silver
  let borderWidth = 1
  let fontWeight = 400
  const picked = selectedSet.has(idx)
  const isCorrect = correctSet.has(idx)
  if (revealed) {
    if (isCorrect) {
      bg = COLORS.mintDim
      border = COLORS.mintBorder
      color = COLORS.mint
      fontWeight = 600
    } else if (picked) {
      bg = COLORS.roseDim
      border = COLORS.rose
      color = COLORS.rose
      borderWidth = 2
      fontWeight = 700
    } else {
      color = COLORS.silverMid
    }
  } else if (picked) {
    bg = COLORS.brandDim
    border = COLORS.brandGlow
    color = COLORS.brandGlow
  }
  return { bg, border, color, borderWidth, fontWeight, picked, isCorrect }
}

/**
 * Select-all-that-apply choices — toggle checkboxes; parent grades on Check.
 * Parent stores canonical indexes; shuffle remaps display ↔ canonical.
 */
export default function MultiChoices({
  q,
  selectedIndexes = [],
  revealed,
  onToggle,
  shuffleChoices = true,
}) {
  const groupRef = useRef(null)
  const ctxShuffle = useMcChoiceShuffleContext()
  const localShuffle = useMcChoiceShuffle(q, { enabled: shuffleChoices && !ctxShuffle })
  const { displayQ, toCanonicalIndex, toDisplayIndex, enabled: shuffled } = ctxShuffle || localShuffle
  const isMulti = isMultiQuestion(q)
  const choiceCount = displayQ?.choices?.length || 0
  const selectedSet = new Set(
    (selectedIndexes || []).map(i => toDisplayIndex(i)).filter(i => typeof i === 'number'),
  )
  const displayCorrectSet = new Set(multiCorrectIndexes(displayQ || q))

  useEffect(() => {
    const root = groupRef.current
    if (!root || !isMulti || revealed) return

    function onGroupKeyDown(e) {
      const digit = parseInt(e.key, 10)
      if (digit >= 1 && digit <= choiceCount) {
        e.preventDefault()
        onToggle(toCanonicalIndex(digit - 1))
      }
    }

    root.addEventListener('keydown', onGroupKeyDown)
    return () => root.removeEventListener('keydown', onGroupKeyDown)
  }, [isMulti, revealed, choiceCount, onToggle, toCanonicalIndex])

  if (!isMulti) return null

  const needCount = multiCorrectIndexes(q).length

  return (
    <div
      ref={groupRef}
      role="group"
      aria-label="Select all that apply"
      tabIndex={revealed ? -1 : 0}
      className="multi-choices"
      style={{ outline: 'none' }}
      data-choice-shuffle={shuffled ? 'on' : 'off'}
      data-multi-select="true"
    >
      <div style={{ ...styles.small, marginBottom: 8, color: COLORS.sky }}>
        Select all that apply{needCount ? ` · choose ${needCount}` : ''}
      </div>
      {(displayQ?.choices || []).map((choice, idx) => {
        const { bg, border, color, borderWidth, fontWeight, picked, isCorrect } = multiChoiceStyle(idx, {
          revealed,
          selectedSet,
          correctSet: displayCorrectSet,
        })
        const mark = revealed
          ? (isCorrect ? '✓ ' : (picked ? '✗ ' : ''))
          : (picked ? '☑ ' : '☐ ')
        return (
          <button
            key={idx}
            type="button"
            role="checkbox"
            aria-checked={picked}
            disabled={revealed}
            aria-label={`Choice ${String.fromCharCode(65 + idx)}: ${choice}`}
            onClick={() => !revealed && onToggle(toCanonicalIndex(idx))}
            style={{
              display: 'block', width: '100%', maxWidth: '100%', textAlign: 'left', minHeight: 44, marginBottom: 8,
              background: bg, border: `${borderWidth}px solid ${border}`, color, borderRadius: 10,
              padding: '12px 14px', fontSize: 'var(--ccna-type-md)', cursor: revealed ? 'default' : 'pointer', lineHeight: 1.4,
              fontWeight, fontFamily: 'inherit', boxSizing: 'border-box', overflowWrap: 'anywhere', wordBreak: 'break-word',
            }}
          >
            <span aria-hidden="true" style={{ fontWeight: 700, marginRight: 8, color: COLORS.silverMid }}>
              {mark}{String.fromCharCode(65 + idx)}.
            </span>
            <span style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>{choice}</span>
          </button>
        )
      })}
      {!revealed && (
        <div className="multi-choices-tip" style={{ ...styles.small, marginTop: 4 }}>
          Tip: tap to toggle · press 1–{Math.min(choiceCount, 9)}{shuffled ? ' · choices shuffled' : ''}
        </div>
      )}
    </div>
  )
}
