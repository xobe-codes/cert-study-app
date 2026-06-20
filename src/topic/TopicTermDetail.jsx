import React from 'react'
import { COLORS, accentColors, styles } from '../ui/appTheme.js'
import { CONCEPT_KIND_LABEL } from './topicIndex.js'

function kindAccent(kind) {
  if (kind === 'trap') return 'rose'
  if (kind === 'glossary') return 'sky'
  if (kind === 'flashcard') return 'mint'
  if (kind === 'mnemonic') return 'amber'
  return 'purple'
}

export default function TopicTermDetail({
  entry,
  index,
  selectedConcepts,
  selectedObjectives,
  onClose,
  onToggleConcept,
  onToggleObjective,
  onSelectAll,
}) {
  if (!entry) return null

  const related = (entry.conceptIds || [])
    .map(id => index.conceptById.get(id))
    .filter(Boolean)
    .slice(0, 12)

  const registryTerm = entry.registryId
    ? index.termRegistry?.find(t => t.id === entry.registryId)
    : null

  return (
    <div className="topic-term-detail" role="dialog" aria-label={`${entry.term} definition`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
        <div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
            <span style={{ ...styles.pill(entry.source === 'registry' ? 'purple' : 'sky'), fontSize: 'var(--ccna-type-micro)' }}>
              {entry.source === 'registry' ? 'CCNA term' : 'Glossary'}
            </span>
            {entry.tags?.slice(0, 3).map(tag => (
              <span key={tag} style={{ ...styles.pill('silver'), fontSize: 'var(--ccna-type-micro)' }}>{tag}</span>
            ))}
          </div>
          <h2 style={{ ...styles.h2, margin: 0, fontSize: 'var(--ccna-type-lg)' }}>{entry.term}</h2>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', color: COLORS.silverMid, fontSize: 'var(--ccna-type-xl)', cursor: 'pointer', padding: 4, lineHeight: 1 }}>×</button>
      </div>

      <p style={{ fontSize: 'var(--ccna-type-sm)', lineHeight: 'var(--ccna-line-read)', color: COLORS.silver, margin: '0 0 12px' }}>
        {entry.definition}
      </p>

      {entry.note && (
        <div style={{ ...styles.card, padding: '8px 10px', marginBottom: 12, border: `1px solid ${COLORS.amberBorder}`, fontSize: 'var(--ccna-type-xs)', color: COLORS.amber, lineHeight: 1.45 }}>
          {entry.note}
        </div>
      )}

      {entry.aliases?.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 6 }}>Also search as</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {entry.aliases.slice(0, 8).map(a => (
              <span key={a} style={{ ...styles.pill('silver'), fontSize: 'var(--ccna-type-micro)' }}>{a}</span>
            ))}
          </div>
        </div>
      )}

      {entry.objectiveIds?.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 6 }}>Blueprint objectives</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {entry.objectiveIds.map(oid => {
              const o = index.objectives.find(x => x.id === oid)
              const sel = selectedObjectives.has(oid)
              return (
                <button
                  key={oid}
                  type="button"
                  onClick={() => onToggleObjective(oid)}
                  style={{ ...styles.pill(sel ? (o?.accent || 'sky') : 'silver'), border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'var(--ccna-type-micro)' }}
                >
                  {oid}{o ? ` · ${o.title.slice(0, 28)}${o.title.length > 28 ? '…' : ''}` : ''}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {related.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 6 }}>
            Related study items ({related.length}{registryTerm?.relatedConceptIds?.length > related.length ? ` of ${registryTerm.relatedConceptIds.length}` : ''})
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {related.map(con => {
              const sel = selectedConcepts.has(con.id)
              return (
                <button
                  key={con.id}
                  type="button"
                  onClick={() => onToggleConcept(con.id)}
                  style={{
                    ...styles.pill(sel ? kindAccent(con.kind) : 'silver'),
                    border: sel ? 'none' : `1px solid ${COLORS.border}`,
                    cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', lineHeight: 1.3, padding: '6px 10px', maxWidth: '100%',
                  }}
                >
                  <span style={{ fontSize: 'var(--ccna-type-micro)', opacity: 0.85 }}>{CONCEPT_KIND_LABEL[con.kind]}</span>
                  <div style={{ fontSize: 'var(--ccna-type-xs)' }}>{con.label}</div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <button type="button" style={{ ...styles.primaryBtn, width: '100%' }} onClick={() => onSelectAll(entry)}>
        Add term + related to quiz selection
      </button>
    </div>
  )
}
