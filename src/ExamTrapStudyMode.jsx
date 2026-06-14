import { useMemo, useState } from 'react'
import { randomizeQuestionOrder } from './questionUtils.js'
import {
  getAllDomain1ExamTraps,
  getAllDomain2ExamTraps,
  getAllDomain3ExamTraps,
  getAllDomain4ExamTraps,
  getAllDomain5ExamTraps,
  getAllDomain6ExamTraps,
} from './data/knowledgeStudy.js'

const DOMAINS = [
  { id: '1', label: 'Domain 1 — Network Fundamentals', getTraps: getAllDomain1ExamTraps },
  { id: '2', label: 'Domain 2 — Network Access', getTraps: getAllDomain2ExamTraps },
  { id: '3', label: 'Domain 3 — IP Connectivity', getTraps: getAllDomain3ExamTraps },
  { id: '4', label: 'Domain 4 — IP Services', getTraps: getAllDomain4ExamTraps },
  { id: '5', label: 'Domain 5 — Security', getTraps: getAllDomain5ExamTraps },
  { id: '6', label: 'Domain 6 — Automation', getTraps: getAllDomain6ExamTraps },
]

function DomainPicker({ domainId, onChange, styles }) {
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
      {DOMAINS.map(d => (
        <button
          key={d.id}
          type="button"
          onClick={() => onChange(d.id)}
          style={{ ...styles.pill(domainId === d.id ? 'sky' : 'silver'), cursor: 'pointer', border: 'none', fontFamily: 'inherit' }}
        >
          D{d.id}
        </button>
      ))}
    </div>
  )
}

export default function ExamTrapStudyMode({ styles, onBack }) {
  const [domainId, setDomainId] = useState('1')
  const domain = DOMAINS.find(d => d.id === domainId) || DOMAINS[0]
  const traps = useMemo(() => randomizeQuestionOrder(domain.getTraps()), [domain])
  const [idx, setIdx] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const trap = traps[idx]

  function switchDomain(id) {
    setDomainId(id)
    setIdx(0)
    setRevealed(false)
  }

  if (!traps.length) {
    return (
      <div>
        <button type="button" style={styles.backBtn} onClick={onBack}>‹ Back</button>
        <h1 style={styles.h1}>Exam Trap Drill</h1>
        <DomainPicker domainId={domainId} onChange={switchDomain} styles={styles} />
        <div style={styles.small}>
          No exam traps for {domain.label} in the KB yet.
          {domainId === '6' ? ' Automation traps are sparse — review curated reading and quiz explanations.' : ' Complete reading for those objectives to populate traps.'}
        </div>
      </div>
    )
  }

  return (
    <div>
      <button type="button" style={styles.backBtn} onClick={onBack}>‹ Back</button>
      <h1 style={styles.h1}>Exam Trap Drill</h1>
      <DomainPicker domainId={domainId} onChange={switchDomain} styles={styles} />
      <div style={styles.small}>{domain.label} · {traps.length} traps · static KB, no API used</div>
      <div style={{ ...styles.card, marginTop: 12 }}>
        <div style={{ ...styles.pill('amber'), fontSize: 'var(--ccna-type-micro)', marginBottom: 8 }}>TRAP {idx + 1} / {traps.length}</div>
        <div style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 600, marginBottom: 12 }}>{trap.trap || trap.title}</div>
        {!revealed
          ? <button type="button" style={styles.primaryBtn} onClick={() => setRevealed(true)}>Reveal how to avoid it</button>
          : (
            <div style={{ fontSize: 'var(--ccna-type-sm)', lineHeight: 1.5 }}>
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
