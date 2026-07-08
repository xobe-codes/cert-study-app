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
import { TRAP_DOMAIN_NUMBERS, trapDomainMeta } from './study/trapDomainConstants.js'
import { useMasteryProgress } from './features/progress/MasteryProgressContext.jsx'
import { ENGAGEMENT_KINDS } from './features/progress/masteryEngagement.js'

const DOMAINS = [
  { id: '1', getTraps: getAllDomain1ExamTraps },
  { id: '2', getTraps: getAllDomain2ExamTraps },
  { id: '3', getTraps: getAllDomain3ExamTraps },
  { id: '4', getTraps: getAllDomain4ExamTraps },
  { id: '5', getTraps: getAllDomain5ExamTraps },
  { id: '6', getTraps: getAllDomain6ExamTraps },
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

function uniqueObjectiveIds(traps) {
  return [...new Set((traps || []).map(t => t.objectiveId).filter(Boolean))].sort()
}

function DomainPicker({ domainId, onChange, styles, trapCounts }) {
  return (
    <div
      className="ccna-h-scroll"
      role="tablist"
      aria-label="Filter exam traps by domain"
      style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap', overflowX: 'auto', paddingBottom: 4 }}
    >
      {TRAP_DOMAIN_NUMBERS.map((id) => {
        const meta = trapDomainMeta(id)
        const count = trapCounts[id] ?? 0
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={domainId === id}
            onClick={() => onChange(id)}
            style={{
              ...styles.pill(domainId === id ? meta.accent : 'silver'),
              cursor: 'pointer',
              border: 'none',
              fontFamily: 'inherit',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              fontSize: 'var(--ccna-type-xs)',
            }}
          >
            {meta.chip} · {count}
          </button>
        )
      })}
    </div>
  )
}

function ObjectiveFilter({ objectiveId, objectives, onChange, styles }) {
  if (objectives.length < 2) return null
  return (
    <div
      className="ccna-h-scroll"
      role="tablist"
      aria-label="Filter by objective"
      style={{ display: 'flex', gap: 6, marginBottom: 12, overflowX: 'auto', paddingBottom: 2 }}
    >
      <button
        type="button"
        role="tab"
        aria-selected={!objectiveId}
        onClick={() => onChange(null)}
        style={{ ...styles.pill(!objectiveId ? 'sky' : 'silver'), border: 'none', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0, fontSize: 'var(--ccna-type-xs)' }}
      >
        All objectives
      </button>
      {objectives.map((oid) => (
        <button
          key={oid}
          type="button"
          role="tab"
          aria-selected={objectiveId === oid}
          onClick={() => onChange(oid)}
          style={{ ...styles.pill(objectiveId === oid ? 'sky' : 'silver'), border: 'none', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0, fontSize: 'var(--ccna-type-xs)' }}
        >
          {oid}
        </button>
      ))}
    </div>
  )
}

export default function ExamTrapStudyMode({ styles, onBack, prefill, onPrefillConsumed }) {
  const { recordEngagement } = useMasteryProgress()
  const trapCounts = useMemo(() => {
    const counts = {}
    for (const d of DOMAINS) counts[d.id] = d.getTraps().length
    return counts
  }, [])

  const [domainId, setDomainId] = useState(() => String(prefill?.domainId || '1'))
  const [objectiveFilter, setObjectiveFilter] = useState(null)
  const [trapFilter, setTrapFilter] = useState(() => (
    prefill?.trapId || prefill?.trapLabel
      ? { trapId: prefill.trapId, trapLabel: prefill.trapLabel }
      : null
  ))
  const [showIndex, setShowIndex] = useState(false)

  const domain = DOMAINS.find(d => d.id === domainId) || DOMAINS[0]
  const domainMeta = trapDomainMeta(domainId)
  const domainTraps = useMemo(() => domain.getTraps(), [domain])

  const traps = useMemo(() => {
    let raw = domainTraps
    const matched = matchExamTraps(raw, trapFilter)
    if (matched.length) return matched
    if (objectiveFilter) raw = raw.filter(t => t.objectiveId === objectiveFilter)
    return randomizeQuestionOrder(raw)
  }, [domainTraps, trapFilter, objectiveFilter])

  const objectives = useMemo(() => uniqueObjectiveIds(domainTraps), [domainTraps])

  const [idx, setIdx] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const trap = traps[idx]
  const filteredFromMiss = Boolean(trapFilter && matchExamTraps(domainTraps, trapFilter).length)
  const atEnd = traps.length > 0 && idx >= traps.length - 1 && revealed

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
    setObjectiveFilter(null)
    setTrapFilter(null)
    setIdx(0)
    setRevealed(false)
    setShowIndex(false)
  }

  function clearTrapFilter() {
    setTrapFilter(null)
    setIdx(0)
    setRevealed(false)
  }

  function jumpToTrap(i) {
    setIdx(i)
    setRevealed(false)
    setShowIndex(false)
  }

  if (!traps.length) {
    return (
      <div>
        <button type="button" style={styles.backBtn} onClick={onBack}>‹ Back</button>
        <h1 style={styles.h1}>Exam Trap Drill</h1>
        <DomainPicker domainId={domainId} onChange={switchDomain} styles={styles} trapCounts={trapCounts} />
        <ObjectiveFilter objectiveId={objectiveFilter} objectives={objectives} onChange={setObjectiveFilter} styles={styles} />
        <div style={styles.small}>
          No exam traps for {domainMeta.label} with this filter.
          {domainId === '6' ? ' Automation traps are sparse — review curated reading and quiz explanations.' : ' Try another objective or domain.'}
        </div>
      </div>
    )
  }

  return (
    <div className="exam-trap-study">
      <div className="trap-drill-sticky-header">
        <button type="button" style={styles.backBtn} onClick={onBack}>‹ Back</button>
      </div>
      <h1 style={styles.h1}>Exam Trap Drill</h1>
      <DomainPicker domainId={domainId} onChange={switchDomain} styles={styles} trapCounts={trapCounts} />
      {!trapFilter && (
        <ObjectiveFilter
          objectiveId={objectiveFilter}
          objectives={objectives}
          onChange={(oid) => { setObjectiveFilter(oid); setIdx(0); setRevealed(false) }}
          styles={styles}
        />
      )}
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
      <div style={styles.small}>
        {domainMeta.label} · {traps.length} trap{traps.length === 1 ? '' : 's'} · {STATIC_COPY.examTraps}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 10, marginBottom: 8, flexWrap: 'wrap' }}>
        <button type="button" style={{ ...styles.secondaryBtn, flex: '1 1 auto', marginBottom: 0, minHeight: 40 }} onClick={() => setShowIndex(v => !v)}>
          {showIndex ? 'Hide trap list' : 'Browse traps'}
        </button>
        {trap?.objectiveId && (
          <span style={{ ...styles.pill('silver'), fontSize: 'var(--ccna-type-micro)', alignSelf: 'center' }}>{trap.objectiveId}</span>
        )}
      </div>

      {showIndex && (
        <div style={{ ...styles.card, marginBottom: 12, maxHeight: 'min(40dvh, 320px)', overflowY: 'auto' }}>
          {traps.map((t, i) => (
            <button
              key={t.id || `${t.objectiveId}-${i}`}
              type="button"
              onClick={() => jumpToTrap(i)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                background: i === idx ? COLORS.skyDim : 'none',
                border: 'none',
                borderBottom: `1px solid ${COLORS.border}`,
                padding: '10px 4px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                color: COLORS.silver,
              }}
            >
              <span style={{ ...styles.pill(i === idx ? 'sky' : 'silver'), fontSize: 'var(--ccna-type-micro)', marginRight: 6 }}>{i + 1}</span>
              <span style={{ fontSize: 'var(--ccna-type-sm)', lineHeight: 1.4 }}>{t.trap || t.title}</span>
            </button>
          ))}
        </div>
      )}

      <div style={{ ...styles.card, marginTop: 4 }}>
        <div style={{ ...styles.pill('amber'), fontSize: 'var(--ccna-type-micro)', marginBottom: 8 }}>TRAP {idx + 1} / {traps.length}</div>
        <div style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 600, marginBottom: 12 }}>{trap.trap || trap.title}</div>
        {!revealed
          ? <button type="button" style={styles.primaryBtn} onClick={() => {
            setRevealed(true)
            if (trap?.objectiveId) {
              recordEngagement?.(trap.objectiveId, { kind: ENGAGEMENT_KINDS.EXAM_TRAP, correct: 1, total: 1 })
            }
          }}>Reveal how to avoid it</button>
          : (
            <div style={{ fontSize: 'var(--ccna-type-sm)', lineHeight: 1.5 }}>
              {trap.avoid || trap.correction || trap.explanation || 'Review the related objective reading and quiz explanations.'}
            </div>
          )}
      </div>

      {atEnd && (
        <div style={{ ...styles.card, marginTop: 12, background: COLORS.mintDim, border: `1px solid ${COLORS.mintBorder}` }}>
          <div style={{ fontWeight: 700, color: COLORS.mint, marginBottom: 6 }}>Domain batch complete</div>
          <div style={{ ...styles.small, marginBottom: 10 }}>
            You reviewed all {traps.length} traps in {domainMeta.short}. Switch domain or head back home.
          </div>
          <button type="button" style={styles.primaryBtn} onClick={onBack}>Done</button>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
        <button type="button" style={{ ...styles.secondaryBtn, flex: 1, marginBottom: 0 }} disabled={idx === 0} onClick={() => { setIdx(i => i - 1); setRevealed(false) }}>Previous</button>
        <button type="button" style={{ ...styles.secondaryBtn, flex: 1, marginBottom: 0 }} disabled={idx >= traps.length - 1} onClick={() => { setIdx(i => i + 1); setRevealed(false) }}>Next</button>
      </div>
    </div>
  )
}
