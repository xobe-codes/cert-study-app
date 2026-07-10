import React from 'react'
import { COLORS, styles } from '../ui/appTheme.js'
import CuratedDiagram from './CuratedDiagram.jsx'
import CuratedStaticBadge from './CuratedStaticBadge.jsx'
import VisualAidRender from './VisualAidRender.jsx'

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

export function CuratedPacketFlow({ data }) {
  const pf = data?.packetFlow
  if (!pf?.steps?.length) return null
  return (
    <div style={{ ...styles.card, border: `1px solid ${COLORS.mintBorder}`, background: COLORS.mintDim, marginTop: 8, marginBottom: 12 }}>
      <div style={{ fontSize: 'var(--ccna-type-sm)', fontWeight: 700, color: COLORS.mint, marginBottom: 10 }}>{pf.title}</div>
      {pf.steps.map((s, i) => (
        <div key={s.id} style={{ display: 'flex', gap: 8, marginBottom: i < pf.steps.length - 1 ? 8 : 0, alignItems: 'flex-start' }}>
          <VisualBadge accent={COLORS.mint}>{s.order}</VisualBadge>
          <div>
            <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 600, color: COLORS.silver }}>{s.title}</div>
            <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, lineHeight: 1.45 }}>{s.action}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function VisualTrapStrip({ traps }) {
  if (!traps?.length) return null
  return (
    <div style={{
      ...styles.card,
      marginTop: 8,
      marginBottom: 8,
      border: `1px solid ${COLORS.amberBorder}`,
      background: COLORS.amberDim,
      padding: '10px 12px',
    }}>
      <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 700, color: COLORS.amber, marginBottom: 6, letterSpacing: 0.3 }}>
        EXAM TRAPS (from the diagram)
      </div>
      {traps.map((t, i) => (
        <div key={i} style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silver, lineHeight: 1.45, marginBottom: i < traps.length - 1 ? 4 : 0, display: 'flex', gap: 6 }}>
          <span style={{ color: COLORS.amber }}>⚑</span>
          <span>{t}</span>
        </div>
      ))}
    </div>
  )
}

/**
 * Curated visual pack: hero diagram + compare/stack + trap strip + process flow.
 * Used on Study (Domain 6 above-fold) and Visual tab.
 */
export default function CuratedVisualBundle({ data, showBadge = false }) {
  if (!data) return null
  const hasAnything = data.diagram || data.visualCompare || data.visualTraps?.length || data.packetFlow?.steps?.length
  if (!hasAnything) return null

  return (
    <div className="ccna-curated-visual-bundle" style={{ maxWidth: '100%', minWidth: 0 }}>
      {showBadge && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
          <CuratedStaticBadge objectiveId={data.objectiveId} fontSize={10} />
        </div>
      )}
      {data.diagram && <CuratedDiagram diagram={data.diagram} />}
      {data.visualCompare && (
        <div style={{ marginTop: 8 }}>
          <VisualAidRender spec={data.visualCompare} />
        </div>
      )}
      <VisualTrapStrip traps={data.visualTraps} />
      <CuratedPacketFlow data={data} />
    </div>
  )
}
