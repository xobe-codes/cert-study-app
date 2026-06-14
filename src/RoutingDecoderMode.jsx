import { useState } from 'react'
import { generateRoutingProblem } from './routingDrill.js'

export default function RoutingDecoderMode({ styles, COLORS, onBack }) {
  const [problem, setProblem] = useState(() => generateRoutingProblem())
  const [answer, setAnswer] = useState('')
  const [checked, setChecked] = useState(false)
  const accepted = [problem.answer, ...(problem.accept || [])].map(a => a.toLowerCase())
  const correct = accepted.includes((answer || '').trim().toLowerCase())

  function next() {
    setProblem(generateRoutingProblem())
    setAnswer('')
    setChecked(false)
  }

  return (
    <div>
      <button type="button" style={styles.backBtn} onClick={onBack}>‹ Back</button>
      <h1 style={styles.h1}>Routing Table Decoder</h1>
      <div style={styles.small}>Read the route line — static KB drill, no API used.</div>
      <div style={{ ...styles.card, marginTop: 12, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 'var(--ccna-type-sm)' }}>
        {problem.line}
      </div>
      <div style={{ ...styles.card, marginTop: 10 }}>
        <div style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 600, marginBottom: 8 }}>{problem.question}</div>
        <input style={styles.input} value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Your answer" />
        {problem.hint && <div style={{ ...styles.small, marginTop: 6 }}>Hint: {problem.hint}</div>}
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <button type="button" style={styles.primaryBtn} onClick={() => setChecked(true)}>Check</button>
          <button type="button" style={styles.secondaryBtn} onClick={next}>Next</button>
        </div>
        {checked && (
          <div style={{ marginTop: 10, fontSize: 'var(--ccna-type-sm)', color: correct ? COLORS.mint : COLORS.rose }}>
            {correct ? '✓ Correct' : `✗ Expected: ${problem.answer}`}
          </div>
        )}
      </div>
    </div>
  )
}
