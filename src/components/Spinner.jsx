import React from 'react'
import { COLORS } from '../ui/appTheme.js'

export default function Spinner({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '20px 0', color: COLORS.sky }}>
      <div style={{
        width: 18, height: 18, borderRadius: '50%',
        border: `2px solid ${COLORS.skyBorder}`, borderTopColor: COLORS.sky,
        animation: 'ccna-spin 0.8s linear infinite',
      }} />
      <span style={{ fontSize: 14 }}>{label || 'Asking Claude...'}</span>
      <style>{`@keyframes ccna-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
