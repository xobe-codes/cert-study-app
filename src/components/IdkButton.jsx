import React from 'react'
import { styles } from '../ui/appTheme.js'

/** WB-1 — honest miss control (practice paths only). */
export default function IdkButton({ onClick, disabled = false, label = "I don't know" }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label="Mark as I do not know"
      style={{
        ...styles.secondaryBtn,
        marginTop: 8,
        opacity: disabled ? 0.5 : 0.92,
        fontSize: 'var(--ccna-type-xs)',
      }}
    >
      {label}
    </button>
  )
}
