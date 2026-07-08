import React from 'react'
import { COLORS, styles } from '../../ui/appTheme.js'
import { TRAP_DOMAIN_NUMBERS, trapDomainMeta } from '../../study/trapDomainConstants.js'
import { getTrapDrillCkusForDomain } from './trapDrillQuestions.js'

function DomainChip({ meta, active, count, onClick }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      style={{
        ...styles.pill(active ? meta.accent : 'silver'),
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'inherit',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        fontSize: 'var(--ccna-type-xs)',
      }}
    >
      {meta.chip} · {count}
    </button>
  )
}

/** Domain + pattern picker — scopes trap drill to one domain or one CKU. */
export default function TrapDrillHub({ onBack, prefill, onStartDomain, onStartCku }) {
  const initialDomain = prefill?.domainId ? String(prefill.domainId) : '1'
  const [domainId, setDomainId] = React.useState(initialDomain)
  const meta = trapDomainMeta(domainId)
  const ckus = getTrapDrillCkusForDomain(domainId)

  return (
    <div>
      <button type="button" style={styles.backBtn} onClick={onBack}>‹ Back</button>
      <h1 style={styles.h1}>Trap Drill</h1>
      <div style={{ ...styles.card, background: COLORS.amberDim, border: `1px solid ${COLORS.amberBorder}`, marginBottom: 14 }}>
        <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 700, color: COLORS.amber, marginBottom: 6 }}>HOW IT WORKS</div>
        <p style={{ ...styles.small, margin: 0, lineHeight: 1.5 }}>
          Pick an exam domain, then drill one trap pattern (3 MC questions) or run the whole domain batch.
          No more 180-question marathons — study traps where they live on the blueprint.
        </p>
      </div>

      <div
        className="ccna-h-scroll"
        role="tablist"
        aria-label="Filter trap drill by exam domain"
        style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 14, paddingBottom: 4, flexWrap: 'wrap' }}
      >
        {TRAP_DOMAIN_NUMBERS.map((id) => {
          const m = trapDomainMeta(id)
          const count = getTrapDrillCkusForDomain(id).length
          return (
            <DomainChip
              key={id}
              meta={m}
              count={count}
              active={domainId === id}
              onClick={() => setDomainId(id)}
            />
          )
        })}
      </div>

      <div style={{ ...styles.small, marginBottom: 10 }}>
        {meta.label} · {meta.weight}% exam weight · {ckus.length} trap pattern{ckus.length === 1 ? '' : 's'} · {ckus.length * 3} questions
      </div>

      {ckus.length > 0 && (
        <button
          type="button"
          style={{ ...styles.primaryBtn, marginBottom: 12 }}
          onClick={() => onStartDomain(domainId)}
        >
          Drill all in {meta.short} ({ckus.length * 3} questions)
        </button>
      )}

      {ckus.length === 0 ? (
        <p style={styles.small}>No trap drill patterns for this domain yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ckus.map((cku) => (
            <button
              key={cku.ckuId}
              type="button"
              className="ccna-hover"
              onClick={() => onStartCku(cku.ckuId)}
              style={{
                ...styles.card,
                display: 'block',
                width: '100%',
                textAlign: 'left',
                cursor: 'pointer',
                fontFamily: 'inherit',
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                <span style={{ ...styles.pill('amber'), fontSize: 'var(--ccna-type-micro)', flexShrink: 0 }}>3 Q</span>
                <span style={{ ...styles.pill('silver'), fontSize: 'var(--ccna-type-micro)', flexShrink: 0 }}>{cku.objectiveId}</span>
              </div>
              <div style={{ fontSize: 'var(--ccna-type-sm)', fontWeight: 600, color: COLORS.silver, lineHeight: 1.45 }}>
                {cku.trapLabel}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
