import React, { useState } from 'react'
import { COLORS, styles } from '../ui/appTheme.js'

export default function EngineerViewSection({ data }) {
  const [open, setOpen] = useState(false)
  if (!data) return null

  return (
    <div
      className="engineer-view-section"
      style={{
        marginTop: 12,
        marginBottom: 12,
        borderRadius: 8,
        border: `1px solid ${COLORS.border}`,
        background: COLORS.surface,
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '10px 12px',
          background: COLORS.surfaceHigh,
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'inherit',
          textAlign: 'left',
        }}
      >
        <div>
          <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 700, color: COLORS.mint, letterSpacing: 0.4 }}>
            ENGINEER VIEW
          </div>
          <div style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.silver, marginTop: 2, lineHeight: 1.4 }}>
            {data.title || 'Verify & troubleshoot'}
            {!open && data.summary && (
              <span style={{ color: COLORS.silverMid }}> — {data.summary}</span>
            )}
          </div>
        </div>
        <span style={{ color: COLORS.silverMid, fontSize: 'var(--ccna-type-sm)', flexShrink: 0, marginLeft: 8 }}>
          {open ? '▾' : '▸'}
        </span>
      </button>

      {open && (
        <div style={{ padding: '10px 12px 12px', fontSize: 'var(--ccna-type-sm)', color: COLORS.silver, lineHeight: 1.5 }}>
          {data.summary && (
            <p style={{ margin: '0 0 10px', color: COLORS.silverMid }}>{data.summary}</p>
          )}

          {data.verifyCommands?.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 700, color: COLORS.silverMid, marginBottom: 6 }}>
                VERIFY COMMANDS
              </div>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {data.verifyCommands.map((c, i) => (
                  <li key={i} style={{ marginBottom: 6 }}>
                    <code style={{ color: COLORS.mint }}>{c.command}</code>
                    {c.purpose && <span style={{ color: COLORS.silverMid }}> — {c.purpose}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data.interpretExample && (
            <div style={{ marginBottom: 10, ...styles.card, padding: '8px 10px' }}>
              <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 700, color: COLORS.silverMid, marginBottom: 4 }}>
                READ ONE LINE
              </div>
              <code style={{ display: 'block', fontSize: 'var(--ccna-type-xs)', color: COLORS.sky, marginBottom: 6, wordBreak: 'break-all' }}>
                {data.interpretExample.line}
              </code>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 'var(--ccna-type-xs)' }}>
                {data.interpretExample.parts.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
          )}

          {data.symptoms?.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 700, color: COLORS.silverMid, marginBottom: 6 }}>
                SYMPTOMS → CHECK
              </div>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {data.symptoms.map((s, i) => <li key={i} style={{ marginBottom: 4 }}>{s}</li>)}
              </ul>
            </div>
          )}

          {data.trapCallout && (
            <div style={{
              padding: '8px 10px',
              borderRadius: 6,
              background: COLORS.amberDim,
              border: `1px solid ${COLORS.amberBorder}`,
            }}
            >
              <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 700, color: COLORS.amber, marginBottom: 4 }}>
                EXAM TRAP
              </div>
              <div style={{ marginBottom: 4 }}><strong>Trap:</strong> {data.trapCallout.trap}</div>
              <div><strong>Fix:</strong> {data.trapCallout.correction}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
