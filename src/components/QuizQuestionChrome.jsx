import React, { useEffect, useState } from 'react'
import { COLORS, styles } from '../ui/appTheme.js'
import { TYPE_LABEL, SKILL_LABEL, inferSkill } from '../questionUtils.js'
import { cliStringsEquivalent } from '../lab/cliGrading.js'
import { parseRichTextSegments } from '../lesson/richTextParse.js'
import { splitQuizStem, parseExhibitLines, looksLikeCliChoice } from '../quiz/quizStemExhibit.js'
import { resolveCliModeContext, CLI_MODES } from '../lab/cliModeContext.js'

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

/**
 * Same as QuizRichText, plus a whole-choice monospace treatment when the
 * text itself reads as IOS CLI syntax (looksLikeCliChoice) — even when the
 * bank content has no explicit `code` markup, which is the common case for
 * answer choices (see quizStemExhibit.js for why this is heuristic rather
 * than markup-only: choices are atomic, either all-CLI or all-prose, unlike
 * a stem sentence that mixes the two and needs authors to mark spans).
 */
export function QuizChoiceText({ text }) {
  if (!looksLikeCliChoice(text)) return <QuizRichText text={text} />
  return (
    <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', color: COLORS.sky, fontSize: 'var(--ccna-type-sm)' }}>
      <QuizRichText text={text} />
    </span>
  )
}

const ROUTE_CODE_COLOR = {
  C: COLORS.mint,
  L: COLORS.mint,
  S: COLORS.sky,
  O: COLORS.amber,
  D: COLORS.purple,
  R: COLORS.rose,
  B: COLORS.sky,
}

function routeCodeColor(code) {
  const key = String(code || '').trim().charAt(0)
  return ROUTE_CODE_COLOR[key] || COLORS.silver
}

function QuizExhibitBlock({ exhibit, label }) {
  const lines = parseExhibitLines(exhibit)
  return (
    <div className="ccna-quiz-exhibit" role="group" aria-label={label || 'Exhibit'}>
      <div className="ccna-quiz-exhibit__chrome">
        <span className="ccna-quiz-exhibit__dot" aria-hidden />
        <span className="ccna-quiz-exhibit__dot" aria-hidden />
        <span className="ccna-quiz-exhibit__dot" aria-hidden />
        <span className="ccna-quiz-exhibit__label">{label || 'Exhibit'}</span>
      </div>
      <div className="ccna-quiz-exhibit__body ccna-h-scroll" tabIndex={0} role="group" aria-label={`${label || 'Exhibit'} content, scrollable`}>
        {lines.map((line, i) => {
          if (line.type === 'blank') return <div key={i} className="ccna-quiz-exhibit__blank" />
          if (line.type === 'title') {
            return <div key={i} className="ccna-quiz-exhibit__title">{line.text}</div>
          }
          if (line.type === 'meta') {
            return <div key={i} className="ccna-quiz-exhibit__meta">{line.text}</div>
          }
          if (line.type === 'legend') {
            return <div key={i} className="ccna-quiz-exhibit__legend">{line.text}</div>
          }
          if (line.type === 'route') {
            return (
              <div key={i} className="ccna-quiz-exhibit__route">
                <span className="ccna-quiz-exhibit__code" style={{ color: routeCodeColor(line.code), borderColor: routeCodeColor(line.code) }}>
                  {line.code}
                </span>
                <span className="ccna-quiz-exhibit__prefix">{line.prefix}</span>
                {line.detail ? <span className="ccna-quiz-exhibit__detail">{line.detail}</span> : null}
              </div>
            )
          }
          return <div key={i} className="ccna-quiz-exhibit__text">{line.text}</div>
        })}
      </div>
    </div>
  )
}

/** Split inline exhibit block from the question; format routing-table / IOS output clearly. */
export function QuizQuestionStem({ text }) {
  if (text == null) return null
  const { exhibit, question, label } = splitQuizStem(text)
  if (!exhibit) {
    return (
      <div className="ccna-quiz-stem" style={{ maxWidth: '100%', fontSize: 'var(--ccna-type-md)', fontWeight: 600, lineHeight: 1.5, overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
        <QuizRichText text={question} />
      </div>
    )
  }
  return (
    <div className="ccna-quiz-stem" style={{ maxWidth: '100%', marginBottom: 14 }}>
      <QuizExhibitBlock exhibit={exhibit} label={label} />
      {question && (
        <div style={{ maxWidth: '100%', fontSize: 'var(--ccna-type-md)', fontWeight: 600, lineHeight: 1.5, overflowWrap: 'anywhere', wordBreak: 'break-word', marginTop: 12 }}>
          <QuizRichText text={question} />
        </div>
      )}
    </div>
  )
}

export function DomainObjectivePill({ objectiveId, accent = 'silver' }) {
  if (!objectiveId) return null
  const domainNum = objectiveId.split('.')[0]
  return (
    <span style={{ ...styles.pill(accent), fontSize: 'var(--ccna-type-micro)' }}>
      D{domainNum} · {objectiveId}
    </span>
  )
}

export function QuestionMeta({ q }) {
  if (!q || (!q.type && !q.difficulty && !q.skill && !q.objectiveId)) return null
  const skill = q.skill || inferSkill(q)
  const dAccent = q.difficulty === 'hard' ? 'amber' : q.difficulty === 'medium' ? 'sky' : 'mint'
  const skillAccent = skill === 'troubleshoot' ? 'amber' : skill === 'implement' ? 'sky' : 'mint'
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
      {q.objectiveId && <DomainObjectivePill objectiveId={q.objectiveId} />}
      {q.difficulty && <span style={{ ...styles.pill(dAccent), fontSize: 'var(--ccna-type-micro)' }}>{q.difficulty.toUpperCase()}</span>}
      {q.type && <span style={{ ...styles.pill(q.type === 'troubleshooting' || q.type === 'ordering' || q.type === 'cli' || q.type === 'multi' || q.type === 'select-all' ? 'sky' : 'silver'), fontSize: 'var(--ccna-type-micro)' }}>{TYPE_LABEL[q.type] || q.type}</span>}
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
          const ok = cliStringsEquivalent(item, correctOrder[idx])
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
            <span style={{ flex: 1, minWidth: 0, overflowWrap: 'anywhere', wordBreak: 'break-word' }}><QuizChoiceText text={item} /></span>
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
        <div style={{ ...styles.small, marginTop: 4 }}>
          Correct order: {correctOrder.map((s, i) => (
            <React.Fragment key={i}>
              {i > 0 && ' → '}
              {i + 1}. <QuizChoiceText text={s} />
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  )
}

export function CliModeBanner({ question, compact = false }) {
  if (!question) return null
  const ctx = resolveCliModeContext(question)
  if (!ctx?.prompt) return null
  const short = CLI_MODES[ctx.mode]?.short || ctx.label
  return (
    <div
      className="ccna-cli-mode"
      role="group"
      aria-label={`Current IOS mode: ${ctx.label}`}
      style={{
        marginBottom: compact ? 8 : 10,
        borderRadius: 10,
        border: `1px solid ${COLORS.skyBorder}`,
        background: COLORS.skyDim,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: compact ? '6px 10px' : '8px 12px',
          borderBottom: `1px solid ${COLORS.skyBorder}`,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontSize: 'var(--ccna-type-sm)',
          fontWeight: 700,
          color: COLORS.mint,
        }}
      >
        <span aria-hidden style={{ color: COLORS.sky }}>●</span>
        <span>{ctx.prompt}</span>
        <span style={{ ...styles.pill('sky'), marginLeft: 'auto', fontSize: 'var(--ccna-type-micro)' }}>{short}</span>
      </div>
      <div style={{ padding: compact ? '6px 10px 8px' : '8px 12px 10px', fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, lineHeight: 1.45 }}>
        {ctx.blurb}
      </div>
    </div>
  )
}

export function CliAnswerInput({ value, onChange, onSubmit, revealed, question, disabled }) {
  return (
    <div>
      <CliModeBanner question={question} />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && !revealed && onSubmit) onSubmit() }}
        placeholder="Type next IOS command…"
        disabled={disabled || revealed}
        autoComplete="off"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        aria-label="IOS command answer"
        style={{
          ...styles.input,
          width: '100%',
          boxSizing: 'border-box',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          marginBottom: 8,
        }}
      />
      {question?.hint && !revealed && (
        <div style={{ ...styles.small, marginBottom: 8, color: COLORS.silverMid }}>Hint: {question.hint}</div>
      )}
    </div>
  )
}
