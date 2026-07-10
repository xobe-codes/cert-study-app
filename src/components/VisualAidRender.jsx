import React from 'react'
import { COLORS, styles } from '../ui/appTheme.js'

function VisualBadge({ children, accent }) {
  const c = accent || COLORS.purpleGlow
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      minWidth: 22, height: 22, borderRadius: 6, fontSize: 'var(--ccna-type-xs)', fontWeight: 700,
      background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: c, padding: '0 6px',
    }}>{children}</span>
  )
}

/** Renders curated or AI visual specs: comparison, layer_stack, flow, command_sequence. */
export default function VisualAidRender({ spec }) {
  if (!spec || !spec.type) return null
  const frame = { ...styles.card, border: `1px solid ${COLORS.skyBorder}`, background: COLORS.skyDim }
  const titleStyle = { fontSize: 'var(--ccna-type-sm)', fontWeight: 700, color: COLORS.sky, marginBottom: 12, letterSpacing: 0.2 }

  if (spec.type === 'command_sequence' || spec.type === 'flow') {
    const horizontal = spec.type === 'flow'
    const steps = spec.steps || []
    return (
      <div style={frame}>
        <div style={titleStyle}>{spec.title}</div>
        <div style={{ display: 'flex', flexDirection: horizontal ? 'row' : 'column', flexWrap: horizontal ? 'wrap' : 'nowrap', gap: 8, alignItems: horizontal ? 'stretch' : 'stretch' }}>
          {steps.map((s, i) => (
            <React.Fragment key={i}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, flex: horizontal ? '1 1 auto' : 'none',
                background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: '8px 10px',
              }}>
                <VisualBadge accent={COLORS.sky}>{i + 1}</VisualBadge>
                <span style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.silver, fontFamily: horizontal ? 'inherit' : 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>{s}</span>
              </div>
              {i < steps.length - 1 && (
                <div style={{ alignSelf: 'center', color: COLORS.silverMid, fontSize: 'var(--ccna-type-md)', lineHeight: 1 }}>
                  {horizontal ? '→' : '↓'}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    )
  }

  if (spec.type === 'comparison') {
    const col = (side, accent, dim, border) => (
      <div style={{ flex: '1 1 0', minWidth: 0, background: dim, border: `1px solid ${border}`, borderRadius: 10, padding: 12 }}>
        <div style={{ fontSize: 'var(--ccna-type-sm)', fontWeight: 700, color: accent, marginBottom: 8 }}>{side?.label}</div>
        {(side?.points || []).map((p, i) => (
          <div key={i} style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silver, lineHeight: 1.45, marginBottom: 4, display: 'flex', gap: 6 }}>
            <span style={{ color: accent }}>•</span><span>{p}</span>
          </div>
        ))}
      </div>
    )
    return (
      <div style={frame}>
        <div style={titleStyle}>{spec.title}</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {col(spec.left, COLORS.mint, COLORS.mintDim, COLORS.mintBorder)}
          {col(spec.right, COLORS.purpleGlow, COLORS.purpleDim, COLORS.borderGlow)}
        </div>
      </div>
    )
  }

  if (spec.type === 'layer_stack') {
    const layers = spec.layers || []
    return (
      <div style={frame}>
        <div style={titleStyle}>{spec.title}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {layers.map((l, i) => (
            <div key={i} style={{
              background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 8,
              padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <VisualBadge accent={COLORS.purpleGlow}>{layers.length - i}</VisualBadge>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 'var(--ccna-type-sm)', fontWeight: 600, color: COLORS.silver }}>{l.label}</div>
                {l.note && <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, lineHeight: 1.4 }}>{l.note}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return null
}

export { VisualAidRender }
