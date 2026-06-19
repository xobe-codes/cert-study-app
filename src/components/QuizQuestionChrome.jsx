import React, { useEffect, useState } from 'react'
import { COLORS, styles } from '../ui/appTheme.js'
import { TYPE_LABEL, SKILL_LABEL, inferSkill } from '../questionUtils.js'
import { parseRichTextSegments } from '../lesson/richTextParse.js'

export function QuizRichText({ text }) {
  if (text == null) return null
  const segments = parseRichTextSegments(text)
  return segments.map((seg, i) => {
    if (seg.type === 'code') {
      return (
        <code key={i} style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 5, padding: '1px 5px', fontSize: 'var(--ccna-type-sm)', color: COLORS.sky, overflowWrap: 'anywhere', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{seg.value}</code>
      )
    }
    if (seg.type === 'bold') {
      return <strong key={i} style={{ color: COLORS.silver, fontWeight: 700 }}>{seg.value}</strong>
    }
    return <span key={i}>{seg.value}</span>
  })
}

export function QuestionMeta({ q }) {
  if (!q || (!q.type && !q.difficulty && !q.skill)) return null
  const skill = q.skill || inferSkill(q)
  const dAccent = q.difficulty === 'hard' ? 'amber' : q.difficulty === 'medium' ? 'sky' : 'mint'
  const skillAccent = skill === 'troubleshoot' ? 'amber' : skill === 'implement' ? 'sky' : 'mint'
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
      {q.difficulty && <span style={{ ...styles.pill(dAccent), fontSize: 'var(--ccna-type-micro)' }}>{q.difficulty.toUpperCase()}</span>}
      {q.type && <span style={{ ...styles.pill(q.type === 'troubleshooting' || q.type === 'ordering' ? 'sky' : 'silver'), fontSize: 'var(--ccna-type-micro)' }}>{TYPE_LABEL[q.type] || q.type}</span>}
      {skill && <span style={{ ...styles.pill(skillAccent), fontSize: 'var(--ccna-type-micro)' }}>{SKILL_LABEL[skill] || skill}</span>}
      {q.concept && <span style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, alignSelf: 'center' }}>{q.concept}</span>}
    </div>
  )
}

function moveOrderItem(list, from, to) {
  const next = [...list]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

export function OrderingQuestion({ items, onChange, revealed, correctOrder }) {
  const [dragIdx, setDragIdx] = useState(null)
  const [coarsePointer, setCoarsePointer] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(pointer: coarse)')
    setCoarsePointer(mq.matches)
    const onChangeMq = () => setCoarsePointer(mq.matches)
    mq.addEventListener?.('change', onChangeMq)
    return () => mq.removeEventListener?.('change', onChangeMq)
  }, [])

  function reorder(from, to) {
    if (revealed || from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) return
    onChange(moveOrderItem(items, from, to))
  }

  return (
    <div className="ordering-touch-first">
      {!coarsePointer && (
        <div style={{ ...styles.small, marginBottom: 8 }}>Drag items into order, or use ↑ ↓ on mobile.</div>
      )}
      {coarsePointer && (
        <div className="ordering-touch-hint" style={{ ...styles.small, marginBottom: 8, fontWeight: 600, color: COLORS.sky }}>Use ↑ ↓ to reorder</div>
      )}
      {items.map((item, idx) => {
        let bg = COLORS.surface
        let border = COLORS.border
        let color = COLORS.silver
        let borderWidth = 1
        if (revealed && correctOrder) {
          const ok = item === correctOrder[idx]
          if (ok) { bg = COLORS.mintDim; border = COLORS.mintBorder; color = COLORS.mint }
          else { bg = COLORS.roseDim; border = COLORS.rose; color = COLORS.rose; borderWidth = 2 }
        }
        return (
          <div
            key={`${idx}-${item.slice(0, 24)}`}
            draggable={!revealed && !coarsePointer}
            onDragStart={() => setDragIdx(idx)}
            onDragOver={e => { e.preventDefault() }}
            onDrop={() => { reorder(dragIdx, idx); setDragIdx(null) }}
            onDragEnd={() => setDragIdx(null)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, padding: '10px 12px',
              background: bg, border: `${borderWidth}px solid ${border}`, borderRadius: 10, color,
              cursor: revealed ? 'default' : 'grab', lineHeight: 1.4, fontSize: 'var(--ccna-type-md)',
              opacity: dragIdx === idx ? 0.55 : 1,
            }}
          >
            <span style={{ ...styles.pill('purple'), fontSize: 'var(--ccna-type-micro)', flexShrink: 0, minWidth: 22, textAlign: 'center' }}>{idx + 1}</span>
            <span style={{ flex: 1, minWidth: 0, overflowWrap: 'anywhere', wordBreak: 'break-word' }}>{item}</span>
            {!revealed && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
                <button type="button" onClick={() => reorder(idx, idx - 1)} disabled={idx === 0}
                  style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, color: COLORS.silverMid, borderRadius: 8, width: 44, height: 44, cursor: idx === 0 ? 'default' : 'pointer', fontSize: 'var(--ccna-type-md)', padding: 0 }}>↑</button>
                <button type="button" onClick={() => reorder(idx, idx + 1)} disabled={idx === items.length - 1}
                  style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, color: COLORS.silverMid, borderRadius: 8, width: 44, height: 44, cursor: idx === items.length - 1 ? 'default' : 'pointer', fontSize: 'var(--ccna-type-md)', padding: 0 }}>↓</button>
              </div>
            )}
          </div>
        )
      })}
      {revealed && correctOrder && (
        <div style={{ ...styles.small, marginTop: 4 }}>Correct order: {correctOrder.map((s, i) => `${i + 1}. ${s}`).join(' → ')}</div>
      )}
    </div>
  )
}
