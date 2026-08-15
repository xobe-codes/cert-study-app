import { useState } from 'react'
import { answersMatchShorthand } from './lab/cliEngine.js'
import { generateRoutingProblem } from './routingDrill.js'
import { STATIC_COPY } from './ui/staticContentCopy.js'
import StudyModeHeader from './components/StudyModeHeader.jsx'
import { useMasteryProgress } from './features/progress/MasteryProgressContext.jsx'
import { ENGAGEMENT_KINDS } from './features/progress/masteryEngagement.js'
import { parseRichTextSegments } from './lesson/richTextParse.js'

const SESSION_LENGTH = 10

function ExplanationText({ text, COLORS }) {
  if (text == null) return null
  return parseRichTextSegments(text).map((seg, i) => {
    if (seg.type === 'bold') return <strong key={i} style={{ color: COLORS.silver, fontWeight: 700 }}>{seg.value}</strong>
    if (seg.type === 'code') {
      return (
        <code key={i} style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 5, padding: '1px 5px', fontSize: 'var(--ccna-type-sm)', color: COLORS.sky }}>{seg.value}</code>
      )
    }
    return <span key={i}>{seg.value}</span>
  })
}

export default function RoutingDecoderMode({ styles, COLORS, onBack }) {
  const { recordEngagement } = useMasteryProgress()
  const [problem, setProblem] = useState(() => generateRoutingProblem())
  const [answer, setAnswer] = useState('')
  const [checked, setChecked] = useState(false)
  const [answered, setAnswered] = useState(0)
  const [correct, setCorrect] = useState(0)
  const accepted = [problem.answer, ...(problem.accept || [])]
  const isCorrect = answersMatchShorthand(answer, problem.answer, problem.accept || [])
  const sessionDone = answered >= SESSION_LENGTH

  function check() {
    if (checked) return
    setChecked(true)
    setAnswered(a => a + 1)
    if (isCorrect) setCorrect(c => c + 1)
    if (problem.objectiveId) {
      recordEngagement?.(problem.objectiveId, {
        kind: ENGAGEMENT_KINDS.ROUTING_DECODER,
        correct: isCorrect ? 1 : 0,
        total: 1,
      })
    }
  }

  function next() {
    setProblem(generateRoutingProblem())
    setAnswer('')
    setChecked(false)
  }

  function restart() {
    setAnswered(0)
    setCorrect(0)
    next()
  }

  function onKeyDown(e) {
    if (e.key !== 'Enter') return
    e.preventDefault()
    if (checked) next()
    else check()
  }

  if (sessionDone) {
    const pct = answered > 0 ? Math.round((correct / answered) * 100) : 0
    return (
      <div>
        <StudyModeHeader title="Routing Table Decoder" onBack={onBack} />
        <div style={{ ...styles.card, marginTop: 12 }}>
          <div style={{ fontSize: 'var(--ccna-type-display)', fontWeight: 700, color: pct >= 70 ? COLORS.mint : COLORS.amber }}>{pct}%</div>
          <div style={styles.small}>{correct} / {answered} correct</div>
        </div>
        <button type="button" style={styles.primaryBtn} onClick={restart}>Drill again</button>
        <button type="button" style={{ ...styles.secondaryBtn, marginTop: 8 }} onClick={onBack}>Done</button>
      </div>
    )
  }

  return (
    <div>
      <StudyModeHeader title="Routing Table Decoder" onBack={onBack} subtitle={`Read the route line — ${STATIC_COPY.routingDrill}.`} />
      <div style={styles.small}>Question {answered + 1} / {SESSION_LENGTH}</div>
      <div style={{ ...styles.card, marginTop: 8, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 'var(--ccna-type-sm)', whiteSpace: 'pre-wrap' }}>
        {problem.line}
      </div>
      <div style={{ ...styles.card, marginTop: 10 }}>
        <div style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 600, marginBottom: 8 }}>{problem.question}</div>
        <input
          style={styles.input}
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Your answer"
          disabled={checked}
          autoFocus
        />
        {problem.hint && !checked && <div style={{ ...styles.small, marginTop: 6 }}>Hint: {problem.hint}</div>}
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          {!checked ? (
            <button type="button" style={styles.primaryBtn} onClick={check}>Check</button>
          ) : (
            <button type="button" style={styles.primaryBtn} onClick={next}>Next</button>
          )}
        </div>
        {checked && (
          <div
            className="ccna-quiz-reveal"
            style={{
              marginTop: 10, padding: 12, borderRadius: 10,
              background: isCorrect ? COLORS.mintDim : COLORS.roseDim,
              border: `2px solid ${isCorrect ? COLORS.mintBorder : COLORS.rose}`,
            }}
          >
            <div style={{ fontWeight: 700, color: isCorrect ? COLORS.mint : COLORS.rose, marginBottom: 6, fontSize: 'var(--ccna-type-sm)' }}>
              {isCorrect ? '✓ Correct' : `✗ Expected: ${accepted[0]}`}
            </div>
            {problem.explanation && (
              <div style={{ fontSize: 'var(--ccna-type-sm)', lineHeight: 1.5 }}>
                <ExplanationText text={problem.explanation} COLORS={COLORS} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
