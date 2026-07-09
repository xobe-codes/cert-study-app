import React, { useEffect, useRef, useState } from 'react'
import { isMcQuestion } from '../questionUtils.js'
import { getRevealedChoiceLayout } from '../mcChoicesLogic.js'
import { useMcChoiceShuffle } from '../hooks/useMcChoiceShuffle.js'
import { useMcChoiceShuffleContext } from '../context/McChoiceShuffleContext.jsx'
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

function ChoiceButton({ idx, choice, correctIndex, selected, revealed, onSelect, dimmed = false }) {
  const { bg, border, color, borderWidth, fontWeight } = choiceStyle(idx, { revealed, selected, correctIndex })
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
      <span aria-hidden="true" style={{ fontWeight: 700, marginRight: 8, color: revealed && idx === selected && idx !== correctIndex ? COLORS.rose : COLORS.silverMid }}>
        {revealed && idx === selected && idx !== correctIndex ? '✗ ' : ''}{String.fromCharCode(65 + idx)}.
      </span>
      <span style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>{choice}</span>
    </button>
  )
}

/**
 * MC choice list — shuffles display order per question; parent uses canonical choiceIndex.
 * @param {boolean} shuffleChoices — mix A/B/C/D each time a question loads (default true)
 */
export default function McChoices({
  q,
  selected,
  revealed,
  onSelect,
  accordionOnReveal = true,
  shuffleChoices = true,
}) {
  const groupRef = useRef(null)
  const [othersOpen, setOthersOpen] = useState(false)
  const ctxShuffle = useMcChoiceShuffleContext()
  const localShuffle = useMcChoiceShuffle(q, { enabled: shuffleChoices && !ctxShuffle })
  const { displayQ, toCanonicalIndex, toDisplayIndex, enabled: shuffled } = ctxShuffle || localShuffle
  const isMc = isMcQuestion(q)
  const choiceCount = displayQ?.choices?.length || 0
  const displaySelected = selected == null ? null : toDisplayIndex(selected)
  const displayCorrect = displayQ?.correctIndex ?? q?.correctIndex

  useEffect(() => {
    if (!revealed) setOthersOpen(false)
  }, [revealed, q?.id, q?.question])

  useEffect(() => {
    const root = groupRef.current
    if (!root || !isMc || revealed) return

    function onGroupKeyDown(e) {
      const digit = parseInt(e.key, 10)
      if (digit >= 1 && digit <= choiceCount) {
        e.preventDefault()
        onSelect(toCanonicalIndex(digit - 1))
        return
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault()
        const nextDisplay = displaySelected == null ? 0 : (displaySelected + 1) % choiceCount
        onSelect(toCanonicalIndex(nextDisplay))
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault()
        const nextDisplay = displaySelected == null ? choiceCount - 1 : (displaySelected - 1 + choiceCount) % choiceCount
        onSelect(toCanonicalIndex(nextDisplay))
      }
    }

    root.addEventListener('keydown', onGroupKeyDown)
    return () => root.removeEventListener('keydown', onGroupKeyDown)
  }, [isMc, revealed, displaySelected, choiceCount, onSelect, toCanonicalIndex])

  if (!isMc) return null

  const useAccordion = revealed && accordionOnReveal && choiceCount > 2
  const { primaryIndices, collapsedIndices } = useAccordion
    ? getRevealedChoiceLayout(choiceCount, displayCorrect, displaySelected)
    : { primaryIndices: displayQ.choices.map((_, i) => i), collapsedIndices: [] }

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-label="Answer choices"
      tabIndex={revealed ? -1 : 0}
      className="mc-choices"
      style={{ outline: 'none' }}
      data-choice-shuffle={shuffled ? 'on' : 'off'}
    >
      {useAccordion ? (
        <>
          {primaryIndices.map(idx => (
            <ChoiceButton
              key={idx}
              idx={idx}
              choice={displayQ.choices[idx]}
              correctIndex={displayCorrect}
              selected={displaySelected}
              revealed={revealed}
              onSelect={displayIdx => onSelect(toCanonicalIndex(displayIdx))}
            />
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
                <ChoiceButton
                  key={idx}
                  idx={idx}
                  choice={displayQ.choices[idx]}
                  correctIndex={displayCorrect}
                  selected={displaySelected}
                  revealed={revealed}
                  onSelect={displayIdx => onSelect(toCanonicalIndex(displayIdx))}
                  dimmed
                />
              ))}
            </div>
          )}
        </>
      ) : (
        displayQ.choices.map((choice, idx) => (
          <ChoiceButton
            key={idx}
            idx={idx}
            choice={choice}
            correctIndex={displayCorrect}
            selected={displaySelected}
            revealed={revealed}
            onSelect={displayIdx => onSelect(toCanonicalIndex(displayIdx))}
          />
        ))
      )}
      {!revealed && (
        <div className="mc-choices-tip" style={{ ...styles.small, marginTop: 4 }}>
          Tip: press 1–{Math.min(choiceCount, 9)} or arrow keys to select{shuffled ? ' · choices shuffled' : ''}
        </div>
      )}
    </div>
  )
}
