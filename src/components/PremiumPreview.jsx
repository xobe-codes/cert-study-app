import React from 'react'
import { COLORS, styles } from '../ui/appTheme.js'
import { PREMIUM_COMING_SOON_LABEL } from '../premium/premiumFeatures.js'

export function PremiumSettingsCard({ onDonatePreview }) {
  return (
    <div style={{
      ...styles.card,
      marginBottom: 16,
      padding: 14,
      borderColor: COLORS.border,
      background: COLORS.surface,
      opacity: 0.92,
    }}>
      <div style={{ fontSize: 'var(--ccna-type-sm)', fontWeight: 700, color: COLORS.silver, marginBottom: 4 }}>
        {PREMIUM_COMING_SOON_LABEL}
      </div>
      <p style={{ ...styles.small, margin: '0 0 12px', lineHeight: 1.45 }}>
        AI Tutor and other coach features are in preview. Bundled lessons and quizzes stay free and offline.
      </p>
      <button
        type="button"
        onClick={onDonatePreview}
        style={{
          ...styles.secondaryBtn,
          width: '100%',
          opacity: 0.45,
          cursor: 'not-allowed',
          color: COLORS.silverDim,
          borderColor: COLORS.border,
          pointerEvents: 'auto',
        }}
        aria-disabled="true"
        title="Donations not enabled yet"
      >
        ☕ Donate for coffee (preview)
      </button>
    </div>
  )
}

export function PremiumBlockedShell({ title = 'AI Tutor', onBack, children }) {
  return (
    <div className="tutor-shell">
      <button type="button" style={styles.backBtn} onClick={onBack}>‹ Back</button>
      <h1 style={styles.h1}>{title}</h1>
      <div style={{ ...styles.card, borderColor: COLORS.border, background: COLORS.surface }}>
        <div style={{ fontSize: 'var(--ccna-type-sm)', fontWeight: 700, color: COLORS.silver, marginBottom: 8 }}>
          {PREMIUM_COMING_SOON_LABEL}
        </div>
        {children || (
          <p style={{ ...styles.small, margin: 0, lineHeight: 1.45 }}>
            This coach feature will unlock with supporter access. Your lessons and quiz bank work fully without it.
          </p>
        )}
      </div>
    </div>
  )
}

export function PremiumToast({ message, onDismiss }) {
  if (!message) return null
  return (
    <div
      role="status"
      style={{
        position: 'fixed',
        left: '50%',
        bottom: 88,
        transform: 'translateX(-50%)',
        zIndex: 1200,
        maxWidth: 'min(92vw, 360px)',
        padding: '10px 14px',
        borderRadius: 10,
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        boxShadow: '0 8px 24px #00000055',
        fontSize: 'var(--ccna-type-sm)',
        color: COLORS.silver,
        textAlign: 'center',
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{PREMIUM_COMING_SOON_LABEL}</div>
      <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid }}>{message}</div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          style={{ marginTop: 8, ...styles.secondaryBtn, minHeight: 32, fontSize: 'var(--ccna-type-xs)' }}
        >
          OK
        </button>
      )}
    </div>
  )
}
