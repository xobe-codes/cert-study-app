import React, { useState } from 'react'
import { COLORS, styles } from '../ui/appTheme.js'
import {
  CATEGORY_LABEL, MODE_LABEL, DEVICE_LABEL, EXAM_WEIGHT_LABEL,
} from './commandWorkflows.js'

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

function weightAccent(weight) {
  if (weight === 'must-config') return 'mint'
  if (weight === 'must-verify') return 'sky'
  return 'silver'
}

export default function CommandDetailPanel({
  command,
  index,
  onClose,
  onOpenCommand,
  onOpenObjective,
}) {
  const [copied, setCopied] = useState(false)
  if (!command) return null

  const related = (command.relatedCommandIds || [])
    .map(id => index.commandById.get(id))
    .filter(Boolean)
    .slice(0, 8)

  async function handleCopy(text) {
    const ok = await copyText(text)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }

  return (
    <div className="command-detail-panel" role="dialog" aria-label={`${command.command} reference`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
            <span style={{ ...styles.pill(command.category === 'verify' ? 'sky' : 'mint'), fontSize: 'var(--ccna-type-micro)' }}>
              {CATEGORY_LABEL[command.category] || command.category}
            </span>
            <span style={{ ...styles.pill('purple'), fontSize: 'var(--ccna-type-micro)' }}>
              {MODE_LABEL[command.mode] || command.mode}
            </span>
            <span style={{ ...styles.pill('silver'), fontSize: 'var(--ccna-type-micro)' }}>
              {DEVICE_LABEL[command.device] || command.device}
            </span>
            <span style={{ ...styles.pill(weightAccent(command.examWeight)), fontSize: 'var(--ccna-type-micro)' }}>
              {EXAM_WEIGHT_LABEL[command.examWeight] || command.examWeight}
            </span>
          </div>
          <code style={{ display: 'block', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 'var(--ccna-type-md)', fontWeight: 700, color: COLORS.sky, wordBreak: 'break-word', lineHeight: 1.4 }}>
            {command.command}
          </code>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', color: COLORS.silverMid, fontSize: 'var(--ccna-type-xl)', cursor: 'pointer', padding: 4, lineHeight: 1 }}>×</button>
      </div>

      <p style={{ fontSize: 'var(--ccna-type-sm)', lineHeight: 'var(--ccna-line-read)', color: COLORS.silver, margin: '0 0 12px' }}>
        {command.purpose}
      </p>

      {command.example && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 6 }}>Example</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <pre style={{ flex: 1, margin: 0, padding: '10px 12px', borderRadius: 8, background: COLORS.surface, border: `1px solid ${COLORS.border}`, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 'var(--ccna-type-xs)', color: COLORS.mint, overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
              {command.example}
            </pre>
            <button type="button" style={{ ...styles.secondaryBtn, fontSize: 'var(--ccna-type-xs)', flexShrink: 0 }} onClick={() => handleCopy(command.example)}>
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      )}

      {command.syntaxNotes && (
        <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 12, lineHeight: 1.45 }}>
          <strong style={{ color: COLORS.silver }}>Syntax:</strong> {command.syntaxNotes}
        </div>
      )}

      {command.note && (
        <div style={{ ...styles.card, padding: '8px 10px', marginBottom: 12, border: `1px solid ${COLORS.amberBorder}`, fontSize: 'var(--ccna-type-xs)', color: COLORS.amber, lineHeight: 1.45 }}>
          {command.note}
        </div>
      )}

      {command.aliases?.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 6 }}>Also search as</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {command.aliases.slice(0, 8).map(a => (
              <span key={a} style={{ ...styles.pill('silver'), fontSize: 'var(--ccna-type-micro)', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>{a}</span>
            ))}
          </div>
        </div>
      )}

      {command.sampleOutput && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 6 }}>Sample output</div>
          <pre style={{ margin: 0, padding: '10px 12px', borderRadius: 8, background: COLORS.surface, border: `1px solid ${COLORS.border}`, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 'var(--ccna-type-micro)', color: COLORS.silverMid, overflowX: 'auto', whiteSpace: 'pre-wrap', maxHeight: 220, overflowY: 'auto' }}>
            {command.sampleOutput}
          </pre>
        </div>
      )}

      {command.objectiveIds?.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 6 }}>Blueprint objectives</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {command.objectiveIds.map(oid => {
              const o = index.objectives.find(x => x.id === oid)
              return (
                <button
                  key={oid}
                  type="button"
                  onClick={() => onOpenObjective?.(oid)}
                  style={{ ...styles.pill(o?.accent || 'sky'), border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'var(--ccna-type-micro)' }}
                >
                  {oid}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {related.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 6 }}>
            Related {command.category === 'config' ? 'verify' : 'commands'}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {related.map(rel => (
              <button
                key={rel.id}
                type="button"
                onClick={() => onOpenCommand(rel)}
                style={{ ...styles.pill(rel.category === 'verify' ? 'sky' : 'mint'), border: 'none', cursor: 'pointer', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 'var(--ccna-type-micro)', textAlign: 'left' }}
              >
                {rel.command.length > 36 ? `${rel.command.slice(0, 36)}…` : rel.command}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
