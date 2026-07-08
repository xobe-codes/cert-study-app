import { useEffect, useMemo, useState } from 'react'
import { randomizeQuestionOrder } from './questionUtils.js'
import {
  getAllDomain1ExamTraps,
  getAllDomain2ExamTraps,
  getAllDomain3ExamTraps,
  getAllDomain4ExamTraps,
  getAllDomain5ExamTraps,
  getAllDomain6ExamTraps,
} from './data/knowledgeStudy.js'
import { STATIC_COPY } from './ui/staticContentCopy.js'
import { COLORS } from './ui/appTheme.js'

const DOMAINS = [
  { id: '1', label: 'Domain 1 — Network Fundamentals', getTraps: getAllDomain1ExamTraps },
  { id: '2', label: 'Domain 2 — Network Access', getTraps: getAllDomain2ExamTraps },
  { id: '3', label: 'Domain 3 — IP Connectivity', getTraps: getAllDomain3ExamTraps },
  { id: '4', label: 'Domain 4 — IP Services', getTraps: getAllDomain4ExamTraps },
  { id: '5', label: 'Domain 5 — Security', getTraps: getAllDomain5ExamTraps },
  { id: '6', label: 'Domain 6 — Automation', getTraps: getAllDomain6ExamTraps },
]

function normTrapLabel(s) {
  return String(s || '').trim().toLowerCase().replace(/\s+/g, ' ')
}

/** Match KB exam traps by id or trap label (exact then partial). */
export function matchExamTraps(traps, filter) {
  const { trapId, trapLabel } = filter || {}
  if (!traps?.length) return []
  if (trapId) {
    const byId = traps.filter(t => t.id === trapId)
    if (byId.length) return byId
  }
  if (!trapLabel) return []
  const label = normTrapLabel(trapLabel)
  const exact = traps.filter(t => normTrapLabel(t.trap || t.title) === label)
  if (exact.length) return exact
  return traps.filter(t => {
    const tt = normTrapLabel(t.trap || t.title)
    return tt.includes(label) || label.includes(tt)
  })
}

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

export default function ExamTrapStudyMode({ styles, onBack, prefill, onPrefillConsumed }) {
  const [domainId, setDomainId] = useState(() => String(prefill?.domainId || '1'))
  const [trapFilter, setTrapFilter] = useState(() => (
    prefill?.trapId || prefill?.trapLabel
      ? { trapId: prefill.trapId, trapLabel: prefill.trapLabel }
      : null
  ))
  const domain = DOMAINS.find(d => d.id === domainId) || DOMAINS[0]
  const traps = useMemo(() => {
    const raw = domain.getTraps()
    const matched = matchExamTraps(raw, trapFilter)
    if (matched.length) return matched
    return randomizeQuestionOrder(raw)
  }, [domain, trapFilter])
  const [idx, setIdx] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const trap = traps[idx]
  const filteredFromMiss = Boolean(trapFilter && matchExamTraps(domain.getTraps(), trapFilter).length)

  useEffect(() => {
    if (!prefill) return
    if (prefill.domainId) setDomainId(String(prefill.domainId))
    if (prefill.trapId || prefill.trapLabel) {
      setTrapFilter({ trapId: prefill.trapId, trapLabel: prefill.trapLabel })
    }
    setIdx(0)
    setRevealed(false)
    onPrefillConsumed?.()
  }, [prefill, onPrefillConsumed])

  function switchDomain(id) {
    setDomainId(id)
    setTrapFilter(null)
    setIdx(0)
    setRevealed(false)
  }

  function clearTrapFilter() {
    setTrapFilter(null)
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
      {filteredFromMiss && (
        <div style={{ ...styles.card, marginBottom: 12, padding: 10, borderColor: COLORS.amberBorder, background: COLORS.amberDim }}>
          <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.amber, fontWeight: 600, marginBottom: 6 }}>
            From your missed question
          </div>
          <div style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.silver, lineHeight: 1.45, marginBottom: 8 }}>
            {trapFilter?.trapLabel || trap?.trap || trap?.title}
          </div>
          <button type="button" style={{ ...styles.secondaryBtn, minHeight: 40 }} onClick={clearTrapFilter}>
            Show all domain traps
          </button>
        </div>
      )}
      <div style={styles.small}>{domain.label} · {traps.length} trap{traps.length === 1 ? '' : 's'} · {STATIC_COPY.examTraps}</div>
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
