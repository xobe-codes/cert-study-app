import React from 'react'
import { COLORS, accentColors, styles } from '../ui/appTheme.js'
import CuratedDiagram from '../components/CuratedDiagram.jsx'

function LabInfoBlock({ icon, title, accent, children }) {
  const c = accentColors(accent)
  return (
    <div style={{ borderLeft: `3px solid ${c.text}`, background: c.dim, border: `1px solid ${c.border}`, borderRadius: 10, padding: '10px 12px', marginBottom: 10 }}>
      <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 700, color: c.text, letterSpacing: 0.3, marginBottom: 8 }}>{icon} {title}</div>
      <div style={{ fontSize: 'var(--ccna-type-sm)', lineHeight: 1.55, color: COLORS.silver }}>{children}</div>
    </div>
  )
}

export default function LabLearnPanel({ lab, topology, diagram, packetFlows, onStart }) {
  const flow = packetFlows?.[0]
  const flowSteps = flow?.steps?.slice(0, 4) || []

  return (
    <div>
      <LabInfoBlock icon="📖" title="LEARN FIRST" accent="sky">
        <p style={{ margin: '0 0 10px' }}>{lab.scenario}</p>
        {lab.learningGoals?.length > 0 && (
          <>
            <div style={{ fontWeight: 600, marginBottom: 6, color: COLORS.silver }}>What you will practice</div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {lab.learningGoals.map((g, i) => (
                <li key={i} style={{ marginBottom: 4 }}>{g}</li>
              ))}
            </ul>
          </>
        )}
      </LabInfoBlock>

      {flowSteps.length > 0 && (
        <LabInfoBlock icon="🔀" title="HOW TRAFFIC / CONFIG FLOWS" accent="purple">
          <ol style={{ margin: 0, paddingLeft: 18 }}>
            {flowSteps.map(s => (
              <li key={s.id} style={{ marginBottom: 6 }}>
                <strong>{s.title}</strong> — {s.action}
              </li>
            ))}
          </ol>
        </LabInfoBlock>
      )}

      <div style={{ ...styles.card, marginBottom: 12 }}>
        <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 700, color: COLORS.silverMid, marginBottom: 8 }}>TOPOLOGY</div>
        <CuratedDiagram diagram={topology} compact />
      </div>

      {diagram && diagram.id !== topology?.id && (
        <div style={{ ...styles.card, marginBottom: 12 }}>
          <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 700, color: COLORS.silverMid, marginBottom: 8 }}>{diagram.title?.toUpperCase() || 'CONCEPT'}</div>
          <CuratedDiagram diagram={diagram} compact />
        </div>
      )}

      {lab.commonMistakes?.length > 0 && (
        <LabInfoBlock icon="⚠️" title="WATCH FOR THESE TRAPS" accent="rose">
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {lab.commonMistakes.slice(0, 3).map((m, i) => (
              <li key={i} style={{ marginBottom: 4 }}>{m}</li>
            ))}
          </ul>
        </LabInfoBlock>
      )}

      <button type="button" className="ccna-hover" style={styles.primaryBtn} onClick={onStart}>
        Start hands-on lab →
      </button>
      <p style={{ ...styles.small, marginTop: 10, marginBottom: 0 }}>
        The terminal below uses a Cisco IOS-style prompt. Navigate modes with <code>enable</code>, <code>configure terminal</code>, and <code>interface …</code>. Type <code>hint</code> anytime.
      </p>
    </div>
  )
}
