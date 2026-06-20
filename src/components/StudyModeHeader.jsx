import React from 'react'

/** Sticky back + title for scrollable study routes (mobile-safe). */
export default function StudyModeHeader({ title, onBack, backLabel = 'Back', subtitle = null }) {
  return (
    <div className="study-mode-header">
      <button type="button" className="study-mode-back-btn" onClick={onBack} aria-label={backLabel}>
        <span className="study-mode-back-btn__icon" aria-hidden="true">←</span>
        <span className="study-mode-back-btn__label">{backLabel}</span>
      </button>
      {title && <h1 className="study-mode-header__title">{title}</h1>}
      {subtitle && <p className="study-mode-header__subtitle">{subtitle}</p>}
    </div>
  )
}
