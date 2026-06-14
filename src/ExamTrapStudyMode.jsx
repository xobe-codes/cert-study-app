import { useMemo, useState } from 'react'
import { getAllDomain3ExamTraps, getAllDomain4ExamTraps, getAllDomain5ExamTraps } from './data/knowledgeStudy.js'

const DOMAINS = [
  { id: '3', label: 'Domain 3 — IP Connectivity', getTraps: getAllDomain3ExamTraps },
  { id: '4', label: 'Domain 4 — IP Services', getTraps: getAllDomain4ExamTraps },
  { id: '5', label: 'Domain 5 — Security', getTraps: getAllDomain5ExamTraps },
]

export default function ExamTrapStudyMode({ styles, onBack }) {
  const [domainId, setDomainId] = useState('4')
  const domain = DOMAINS.find(d => d.id === domainId) || DOMAINS[1]
  const traps = useMemo(() => domain.getTraps(), [domain])
  const [idx, setIdx] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const trap = traps[idx]

  if (!traps.length) {
    return (
      <div>
        <button type="button" style={styles.backBtn} onClick={onBack}>‹ Back</button>
        <h1 style={styles.h1}>Exam Trap Drill</h1>
        <div style={styles.small}>No exam traps for {domain.label} yet. Complete reading for those objectives to populate the KB.</div>
        <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
          {DOMAINS.map(d => (
            <button key={d.id} type="button" onClick={() => { setDomainId(d.id); setIdx(0); setRevealed(false) }}
              style={{ ...styles.pill(domainId === d.id ? 'sky' : 'silver'), cursor: 'pointer', border: 'none', fontFamily: 'inherit' }}>
              D{d.id}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <button type="button" style={styles.backBtn} onClick={onBack}>‹ Back</button>
      <h1 style={styles.h1}>Exam Trap Drill</h1>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {DOMAINS.map(d => (
          <button key={d.id} type="button" onClick={() => { setDomainId(d.id); setIdx(0); setRevealed(false) }}
            style={{ ...styles.pill(domainId === d.id ? 'sky' : 'silver'), cursor: 'pointer', border: 'none', fontFamily: 'inherit' }}>
            D{d.id}
          </button>
        ))}
      </div>
      <div style={styles.small}>{domain.label} · static KB, no API</div>
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
