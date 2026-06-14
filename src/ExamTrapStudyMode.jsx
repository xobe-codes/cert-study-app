import { useMemo, useState } from 'react'
import { getAllDomain4ExamTraps } from './data/knowledgeStudy.js'

export default function ExamTrapStudyMode({ styles, onBack }) {
  const traps = useMemo(() => getAllDomain4ExamTraps(), [])
  const [idx, setIdx] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const trap = traps[idx]
  if (!traps.length) {
    return (
      <div>
        <button type="button" style={styles.backBtn} onClick={onBack}>‹ Back</button>
        <div style={styles.small}>No exam traps in the knowledge base yet.</div>
      </div>
    )
  }
  return (
    <div>
      <button type="button" style={styles.backBtn} onClick={onBack}>‹ Back</button>
      <h1 style={styles.h1}>Exam Trap Drill</h1>
      <div style={styles.small}>Domain 4 — IP Services · static KB, no API</div>
      <div style={{ ...styles.card, marginTop: 12 }}>
        <div style={{ ...styles.pill('amber'), fontSize: 10, marginBottom: 8 }}>TRAP {idx + 1} / {traps.length}</div>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>{trap.trap || trap.title}</div>
        {!revealed
          ? <button type="button" style={styles.primaryBtn} onClick={() => setRevealed(true)}>Reveal how to avoid it</button>
          : (
            <div style={{ fontSize: 13, lineHeight: 1.5 }}>
              {trap.avoid || trap.correction || trap.explanation || 'Review the related objective reading and quiz explanations.'}
            </div>
          )}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button type="button" style={styles.secondaryBtn} disabled={idx === 0} onClick={() => { setIdx(i => i - 1); setRevealed(false) }}>Previous</button>
        <button type="button" style={styles.secondaryBtn} disabled={idx >= traps.length - 1} onClick={() => { setIdx(i => i + 1); setRevealed(false) }}>Next</button>
      </div>
    </div>
  )
}
