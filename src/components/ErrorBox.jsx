import React from 'react'
import { COLORS, styles } from '../ui/appTheme.js'

export default function ErrorBox({ message, onRetry }) {
  return (
    <div style={{ background: COLORS.roseDim, border: `1px solid ${COLORS.roseBorder}`, borderRadius: 12, padding: 14, marginTop: 10 }}>
      <div style={{ color: COLORS.rose, fontSize: 'var(--ccna-type-md)', marginBottom: onRetry ? 10 : 0 }}>{message}</div>
      {onRetry && (
        <button style={{ ...styles.secondaryBtn, width: 'auto', padding: '8px 16px', minHeight: 40 }} onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  )
}
