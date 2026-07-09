import React from 'react'
import { COLORS, styles } from '../ui/appTheme.js'
import { PREMIUM_COMING_SOON_LABEL } from '../premium/premiumFeatures.js'
import StudyModeHeader from './StudyModeHeader.jsx'

export function PremiumSettingsCard({ premiumUnlocked = false, onTogglePremium, onDonatePreview }) {
  return (
    <div style={{
      ...styles.card,
      marginBottom: 16,
      padding: 14,
      borderColor: premiumUnlocked ? COLORS.mintBorder : COLORS.border,
      background: premiumUnlocked ? COLORS.mintDim : COLORS.surface,
    }}>
      <div style={{ fontSize: 'var(--ccna-type-sm)', fontWeight: 700, color: COLORS.silver, marginBottom: 4 }}>
        {premiumUnlocked ? 'AI Tutor access enabled' : PREMIUM_COMING_SOON_LABEL}
      </div>
      <p style={{ ...styles.small, margin: '0 0 12px', lineHeight: 1.45 }}>
        {premiumUnlocked
          ? 'AI Tutor, Study Lens synthesis, and custom visuals are unlocked on this device.'
          : 'Curated study is complete and free; AI Tutor adds live coaching with supporter access.'}
      </p>
      {onTogglePremium && (
        <button
          type="button"
          onClick={() => onTogglePremium(!premiumUnlocked)}
          style={{ ...styles.primaryBtn, width: '100%', marginBottom: 8 }}
        >
          {premiumUnlocked ? 'Disable supporter access' : 'Enable supporter preview access'}
        </button>
      )}
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
      <StudyModeHeader title={title} onBack={onBack} />
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
