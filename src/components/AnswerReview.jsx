import React, { useState } from 'react'
import { parseRichTextSegments } from '../lesson/richTextParse.js'
import {
  resolveIncorrectItem, buildWrongChoiceItem,
  choiceLetterForIndex, formatYourWrongHeader, formatOtherWrongHeader,
} from '../answerReviewLogic.js'
import { isMcQuestion, isCliQuestion, isOrderingQuestion, correctAnswerLabel, gradeQuestion } from '../questionUtils.js'
import { cliStringsEquivalent } from '../lab/cliGrading.js'
import { goldCliReviewFor } from '../answerReview/goldAnswerReviewsCliSkill.js'
import QuestionFlagPanel from './QuestionFlagPanel.jsx'
import StemReplayCTA from '../features/stemReplay/StemReplayCTA.jsx'
import QuestionUnderReviewBanner from './QuestionUnderReviewBanner.jsx'
import { useCompactMobile } from '../hooks/useCompactMobile.js'
import { useMcChoiceShuffleContext } from '../context/McChoiceShuffleContext.jsx'
import { COLORS, accentColors } from '../ui/appTheme.js'

const CHOICE_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

function orderingMismatches(correctOrder, given, orderAccept = []) {
  if (!Array.isArray(correctOrder) || !Array.isArray(given)) return []
  return correctOrder.reduce((acc, expected, i) => {
    const got = given[i]
    const alts = orderAccept[i]
    if (!cliStringsEquivalent(got, expected, alts)) {
      acc.push({ step: i + 1, expected, got: got ?? '—' })
    }
    return acc
  }, [])
}

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
    <div className="ccna-review-block" style={{ borderLeft: `3px solid ${c.text}`, background: c.dim, border: `1px solid ${c.border}`, borderRadius: 6, padding: '10px 12px', marginBottom: 8, boxShadow: '0 2px 10px #00000022', minWidth: 0 }}>
      <button
        type="button"
        onClick={() => collapsible && setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', padding: 0, cursor: collapsible ? 'pointer' : 'default', color: c.text, fontFamily: 'inherit' }}
      >
        <span className="ccna-review-block__title" style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 700, letterSpacing: 0.3, textAlign: 'left', overflowWrap: 'anywhere', wordBreak: 'break-word' }}>{icon} {title}</span>
        {collapsible && <span style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.silverMid, flexShrink: 0, marginLeft: 8 }}>{open ? '−' : '+'}</span>}
      </button>
      {open && <div className="ccna-review-block__body" style={{ marginTop: 8, fontSize: 'var(--ccna-type-md)', lineHeight: 1.55, color: COLORS.silver, overflowWrap: 'anywhere', wordBreak: 'break-word' }}>{children}</div>}
    </div>
  )
}

function WrongChoiceReview({ q, item }) {
  let resolved = resolveIncorrectItem(q, item)
  if (!resolved.whatItDoes || !resolved.whyWrongHere) {
    const rebuilt = buildWrongChoiceItem(q, item.choiceIndex)
    resolved = {
      ...resolved,
      explanation: resolved.explanation || rebuilt.explanation,
      whatItDoes: resolved.whatItDoes || rebuilt.whatItDoes,
      whyWrongHere: resolved.whyWrongHere || rebuilt.whyWrongHere,
      misconceptionTested: resolved.misconceptionTested || rebuilt.misconceptionTested,
    }
  }
  const hasStructured = Boolean(resolved.whatItDoes && resolved.whyWrongHere)
  return (
    <>
      {hasStructured ? (
        <>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 700, color: COLORS.silverMid, marginBottom: 4 }}>What this choice implies</div>
            <RichText text={resolved.whatItDoes} />
          </div>
          <div>
            <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 700, color: COLORS.silverMid, marginBottom: 4 }}>Why it is wrong here</div>
            <RichText text={resolved.whyWrongHere} />
          </div>
        </>
      ) : resolved.explanation ? (
        <div>
          <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 700, color: COLORS.silverMid, marginBottom: 4 }}>Why this is wrong</div>
          <RichText text={resolved.explanation} />
        </div>
      ) : null}
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
export default function AnswerReview({ q, selected, cliAnswer, orderAnswer, hideExamTip = false, objectiveId, showQuestionFlag = false, onOpenLab }) {
  const compactMobile = useCompactMobile()
  const shuffle = useMcChoiceShuffleContext()
  const displayLetter = canonicalIdx => {
    const displayIdx = shuffle?.toDisplayIndex ? shuffle.toDisplayIndex(canonicalIdx) : canonicalIdx
    return choiceLetterForIndex(displayIdx) || CHOICE_LETTERS[displayIdx] || displayIdx
  }

  if (isCliQuestion(q)) {
    const correct = correctAnswerLabel(q)
    const userCmd = String(cliAnswer || '').trim()
    const cliGold = goldCliReviewFor(q?.id)
    return (
      <div className={`ccna-answer-review${compactMobile ? ' ccna-answer-review--compact' : ''}`} style={{ marginTop: compactMobile ? 6 : 8, minWidth: 0 }}>
        <QuestionUnderReviewBanner questionId={q?.id} />
        <ReviewBlock icon="✅" title={`CORRECT COMMAND: ${correct}`} accent="mint">
          <RichText text={cliGold?.explanation || q.explanation} />
        </ReviewBlock>
        {!gradeQuestion(q, cliAnswer) && userCmd && (
          <ReviewBlock icon="✗" title={`YOUR COMMAND: ${userCmd}`} accent="rose">
            <div style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.silverMid }}>
              {cliGold?.wrongPattern || 'Accepted forms include shorthand such as sh, conf t, and interface abbreviations.'}
            </div>
          </ReviewBlock>
        )}
        {!hideExamTip && cliGold?.examTip && (
          <ReviewBlock icon="💡" title="EXAM TIP" accent="amber" collapsible defaultOpen={false}>
            <RichText text={cliGold.examTip} />
          </ReviewBlock>
        )}
        {showQuestionFlag && objectiveId && <QuestionFlagPanel questionId={q.id} objectiveId={objectiveId} />}
        <StemReplayCTA questionId={q?.id} onOpenLab={onOpenLab} />
      </div>
    )
  }

  if (isOrderingQuestion(q)) {
    const correctOrder = q.orderItems || []
    const given = orderAnswer || []
    const ok = gradeQuestion(q, given)
    const mismatches = ok ? [] : orderingMismatches(correctOrder, given, q.orderAccept)
    return (
      <div className={`ccna-answer-review${compactMobile ? ' ccna-answer-review--compact' : ''}`} style={{ marginTop: compactMobile ? 6 : 8, minWidth: 0 }}>
        <QuestionUnderReviewBanner questionId={q?.id} />
        <ReviewBlock icon="✅" title="CORRECT ORDER" accent="mint">
          <div style={{ fontSize: 'var(--ccna-type-sm)', lineHeight: 1.5 }}>{correctAnswerLabel(q)}</div>
          {q.explanation && <div style={{ marginTop: 8 }}><RichText text={q.explanation} /></div>}
        </ReviewBlock>
        {!ok && given.length > 0 && (
          <ReviewBlock icon="✗" title="YOUR ORDER" accent="rose">
            <div style={{ fontSize: 'var(--ccna-type-sm)', lineHeight: 1.5 }}>{given.map((s, i) => `${i + 1}. ${s}`).join(' → ')}</div>
            {mismatches.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 700, color: COLORS.silverMid, marginBottom: 4 }}>Where your order breaks down</div>
                {mismatches.map(m => (
                  <div key={m.step} style={{ fontSize: 'var(--ccna-type-sm)', lineHeight: 1.45, marginBottom: 4, color: COLORS.rose }}>
                    Step {m.step}: should be <strong style={{ color: COLORS.silver }}>{m.expected}</strong> — you had {m.got}
                  </div>
                ))}
              </div>
            )}
            {q.explanation && mismatches.length > 0 && (
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${COLORS.roseBorder}` }}>
                <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 700, color: COLORS.silverMid, marginBottom: 4 }}>Why sequence matters</div>
                <RichText text={q.explanation} />
              </div>
            )}
          </ReviewBlock>
        )}
        {showQuestionFlag && objectiveId && <QuestionFlagPanel questionId={q.id} objectiveId={objectiveId} />}
        <StemReplayCTA questionId={q?.id} onOpenLab={onOpenLab} />
      </div>
    )
  }

  if (!isMcQuestion(q)) {
    return <div style={{ fontSize: 'var(--ccna-type-sm)', lineHeight: 1.5 }}><RichText text={q.explanation} /></div>
  }

  const correctIdx = q.correctIndex
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
    <div className={`ccna-answer-review${compactMobile ? ' ccna-answer-review--compact' : ''}`} style={{ marginTop: compactMobile ? 6 : 8, minWidth: 0 }}>
      <QuestionUnderReviewBanner questionId={q?.id} />
      <ReviewBlock icon="✅" title={`CORRECT ANSWER: ${displayLetter(correctIdx)}`} accent="mint" collapsible={selectedWrongIdx != null || compactMobile} defaultOpen={selectedWrongIdx == null && !compactMobile}>
        <RichText text={ar?.correct?.explanation || q.explanation} />
      </ReviewBlock>
      {yourWrong.map(item => {
        const letter = displayLetter(item.choiceIndex)
        const choiceText = q.choices?.[item.choiceIndex] || ''
        return (
          <ReviewBlock
            key={item.choiceIndex}
            icon="❌"
            title={formatYourWrongHeader(letter, choiceText)}
            accent="rose"
          >
            <WrongChoiceReview q={q} item={item} />
          </ReviewBlock>
        )
      })}
      {otherWrong.length > 0 && (
        <ReviewBlock
          icon="📋"
          title={`OTHER OPTIONS (${otherWrong.length})`}
          accent="silver"
          collapsible
          defaultOpen={false}
        >
          {otherWrong.map(item => {
            const letter = displayLetter(item.choiceIndex)
            const choiceText = q.choices?.[item.choiceIndex] || ''
            return (
              <ReviewBlock
                key={item.choiceIndex}
                icon="❌"
                title={formatOtherWrongHeader(letter, choiceText)}
                accent="rose"
                collapsible
                defaultOpen={false}
              >
                <WrongChoiceReview q={q} item={item} />
              </ReviewBlock>
            )
          })}
        </ReviewBlock>
      )}
      {(!hideExamTip && ar?.examTip) && <ReviewBlock icon="💡" title="EXAM TIP" accent="amber" collapsible defaultOpen={false}><RichText text={ar.examTip} /></ReviewBlock>}
      {ar?.memoryHook && (
        <ReviewBlock icon="🧠" title="MEMORY HOOK" accent="purple" collapsible defaultOpen={false}>
          <RichText text={ar.memoryHook} />
        </ReviewBlock>
      )}
      {showQuestionFlag && selected != null && selected !== correctIdx && objectiveId && q?.id && (
        <QuestionFlagPanel question={q} objectiveId={objectiveId} selectedIndex={selected} />
      )}
      {selectedWrongIdx != null && (
        <StemReplayCTA questionId={q?.id} onOpenLab={onOpenLab} />
      )}
    </div>
  )
}
