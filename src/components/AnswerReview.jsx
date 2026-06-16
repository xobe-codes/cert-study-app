import React, { useState } from 'react'
import { parseRichTextSegments } from '../lesson/richTextParse.js'
import { resolveIncorrectItem } from '../answerReviewLogic.js'
import { getCurated } from '../data/ccnaCurated.js'
import { COLORS, accentColors } from '../ui/appTheme.js'

function _objectiveIdFromQuestion(q) {
  if (q.objectiveId) return q.objectiveId
  const m = String(q.id || '').match(/^(?:obj-|supp-)?(\d+\.\d+)/)
  return m?.[1] || null
}

const CHOICE_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

function RichText({ text }) {
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

function ReviewBlock({ icon, title, accent, children, collapsible, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  const c = accentColors(accent)
  return (
    <div style={{ borderLeft: `3px solid ${c.text}`, background: c.dim, border: `1px solid ${c.border}`, borderRadius: 6, padding: '10px 12px', marginBottom: 8, boxShadow: '0 2px 10px #00000022' }}>
      <button
        type="button"
        onClick={() => collapsible && setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', padding: 0, cursor: collapsible ? 'pointer' : 'default', color: c.text, fontFamily: 'inherit' }}
      >
        <span style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 700, letterSpacing: 0.3, textAlign: 'left' }}>{icon} {title}</span>
        {collapsible && <span style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.silverMid, flexShrink: 0, marginLeft: 8 }}>{open ? '−' : '+'}</span>}
      </button>
      {open && <div style={{ marginTop: 8, fontSize: 'var(--ccna-type-md)', lineHeight: 1.55, color: COLORS.silver }}>{children}</div>}
    </div>
  )
}

function CuratedInsights({ q }) {
  const objectiveId = _objectiveIdFromQuestion(q)
  if (!objectiveId) return null
  const curated = getCurated(objectiveId)
  if (!curated) return null
  const ckuIds = new Set(q.ckuIds || [])
  if (ckuIds.size === 0) return null

  const traps = (curated.examTraps || []).filter(t => t.ckuIds?.some(id => ckuIds.has(id)))
  const misconceptions = (curated.misconceptions || []).filter(m => m.ckuIds?.some(id => ckuIds.has(id)))
  const cku = (curated.ckus || []).find(k => ckuIds.has(k.id))

  if (traps.length === 0 && misconceptions.length === 0 && !cku) return null
  return (
    <>
      {traps.map(t => (
        <ReviewBlock key={t.id} icon="⚠️" title="EXAM TRAP" accent="amber">
          <div style={{ marginBottom: 4 }}><RichText text={t.trap} /></div>
          <div style={{ fontSize: 'var(--ccna-type-sm)' }}>
            <strong style={{ color: COLORS.amber }}>Correction: </strong><RichText text={t.correction} />
          </div>
        </ReviewBlock>
      ))}
      {misconceptions.map(m => (
        <ReviewBlock key={m.id} icon="💡" title="COMMON MIX-UP" accent="purple" collapsible defaultOpen={false}>
          <div style={{ marginBottom: 4 }}><RichText text={m.misconception} /></div>
          <div style={{ fontSize: 'var(--ccna-type-sm)' }}>
            <strong style={{ color: accentColors('purple').text }}>Reality: </strong><RichText text={m.reality} />
          </div>
        </ReviewBlock>
      ))}
      {cku && (
        <ReviewBlock icon="📖" title={`CONCEPT: ${cku.title.toUpperCase()}`} accent="sky" collapsible defaultOpen={false}>
          <RichText text={cku.summary} />
        </ReviewBlock>
      )}
    </>
  )
}

function WrongChoiceReview({ q, item }) {
  const resolved = resolveIncorrectItem(q, item)
  const letter = CHOICE_LETTERS[resolved.choiceIndex] || resolved.choiceIndex
  return (
    <>
      <RichText text={resolved.explanation} />
      {resolved.misconceptionTested && (
        <div style={{ marginTop: 8, fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid }}>
          Trap tested: {resolved.misconceptionTested}
        </div>
      )}
      {resolved.needsExplanationReview && (
        <div style={{ marginTop: 6, fontSize: 'var(--ccna-type-xs)', color: COLORS.amber }}>⚠ Explanation pending review</div>
      )}
    </>
  )
}

/** Post-reveal breakdown — correct + your pick expanded; other distractors collapsed. */
export default function AnswerReview({ q, selected, hideExamTip = false }) {
  const correctIdx = q.correctIndex
  if (!Array.isArray(q.choices) || typeof correctIdx !== 'number') {
    return <div style={{ fontSize: 'var(--ccna-type-sm)', lineHeight: 1.5 }}>{q.explanation}</div>
  }
  const ar = q.answerReview
  const incorrect = ar
    ? (ar.incorrect || []).filter(item => item.choiceIndex !== correctIdx)
    : q.choices.map((_, choiceIndex) => ({ choiceIndex })).filter(item => item.choiceIndex !== correctIdx)

  const selectedWrongIdx = selected != null && selected !== correctIdx ? selected : null
  const yourWrong = selectedWrongIdx != null
    ? incorrect.filter(item => item.choiceIndex === selectedWrongIdx)
    : []
  const otherWrong = incorrect.filter(item => item.choiceIndex !== selectedWrongIdx)

  return (
    <div style={{ marginTop: 8 }}>
      <ReviewBlock icon="✅" title={`CORRECT ANSWER: ${CHOICE_LETTERS[correctIdx] || correctIdx}`} accent="mint">
        <RichText text={ar?.correct?.explanation || q.explanation} />
      </ReviewBlock>
      {yourWrong.map(item => (
        <ReviewBlock
          key={item.choiceIndex}
          icon="❌"
          title={`WHY ${CHOICE_LETTERS[item.choiceIndex]} IS WRONG`}
          accent="rose"
        >
          <WrongChoiceReview q={q} item={item} />
        </ReviewBlock>
      ))}
      {otherWrong.length > 0 && (
        <ReviewBlock
          icon="📋"
          title={`OTHER OPTIONS (${otherWrong.length})`}
          accent="silver"
          collapsible
          defaultOpen={false}
        >
          {otherWrong.map(item => (
            <ReviewBlock
              key={item.choiceIndex}
              icon="❌"
              title={`WHY ${CHOICE_LETTERS[item.choiceIndex]} IS WRONG`}
              accent="rose"
              collapsible
              defaultOpen={false}
            >
              <WrongChoiceReview q={q} item={item} />
            </ReviewBlock>
          ))}
        </ReviewBlock>
      )}
      {(!hideExamTip && ar?.examTip) && <ReviewBlock icon="💡" title="EXAM TIP" accent="amber"><RichText text={ar.examTip} /></ReviewBlock>}
      {ar?.memoryHook && (
        <ReviewBlock icon="🧠" title="MEMORY HOOK" accent="purple" collapsible defaultOpen={false}>
          <RichText text={ar.memoryHook} />
        </ReviewBlock>
      )}
      {selectedWrongIdx != null && <CuratedInsights q={q} />}
    </div>
  )
}
