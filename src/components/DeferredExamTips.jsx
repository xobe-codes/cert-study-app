import React from 'react'
import { COLORS } from '../ui/appTheme.js'
import { parseRichTextSegments } from '../lesson/richTextParse.js'

function RichText({ text }) {
  const segments = parseRichTextSegments(text)
  return segments.map((seg, i) => {
    if (seg.type === 'bold') return <strong key={i} style={{ color: COLORS.silver }}>{seg.value}</strong>
    return <span key={i}>{seg.value}</span>
  })
}

/** Tips collected during exam mode and shown after the session. */
export default function DeferredExamTips({ tips = [] }) {
  if (!tips.length) return null
  const unique = [...new Map(tips.map(t => [t.tip || t.trap, t])).values()]
  return (
    <div style={{ ...{ borderRadius: 10, border: `1px solid ${COLORS.amberBorder}`, background: COLORS.amberDim, padding: '12px 14px', marginTop: 10 } }}>
      <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 700, color: COLORS.amber, marginBottom: 8 }}>💡 EXAM TIPS FROM THIS SESSION</div>
      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 'var(--ccna-type-sm)', color: COLORS.silver, lineHeight: 1.5 }}>
        {unique.slice(0, 6).map((t, i) => (
          <li key={i} style={{ marginBottom: 6 }}>
            {t.trap && <span style={{ display: 'block', fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 2 }}>Trap: {t.trap}</span>}
            {t.tip ? <RichText text={t.tip} /> : null}
          </li>
        ))}
      </ul>
    </div>
  )
}
