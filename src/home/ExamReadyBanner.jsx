import React from 'react'
import { COLORS, styles } from '../ui/appTheme.js'
import { homeCard, homeSectionLabel, homeBodySm } from './homeUi.js'

function daysUntilExam(isoDate) {
  if (!isoDate) return null
  const exam = new Date(isoDate)
  if (Number.isNaN(exam.getTime())) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  exam.setHours(0, 0, 0, 0)
  return Math.ceil((exam - today) / 86400000)
}

/**
 * Shown on home when Domain Pass is 6/6 — exam countdown + timed mock CTA.
 */
export default function ExamReadyBanner({ examDate, onOpenMock, onOpenSettings }) {
  const days = daysUntilExam(examDate)

  return (
    <div
      style={homeCard({
        marginBottom: 12,
        border: `1px solid ${COLORS.mintBorder}`,
        background: COLORS.mintDim,
      })}
    >
      <div style={homeSectionLabel(COLORS.mint)}>EXAM READY</div>
      <div style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 700, color: COLORS.mint, marginBottom: 6, lineHeight: 1.35 }}>
        Blueprint complete — time for a full mock
      </div>
      <p style={{ ...homeBodySm, margin: '0 0 12px' }}>
        {days != null && days >= 0 ? (
          <>
            <strong>{days === 0 ? 'Exam day' : `${days} day${days === 1 ? '' : 's'} to exam`}</strong>
            {' '}— run a timed mock under exam settings to validate pacing.
          </>
        ) : (
          <>Set your exam date in Settings for a countdown, then run a timed mock.</>
        )}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <button type="button" style={styles.primaryBtn} onClick={onOpenMock}>
          {days != null && days <= 14 ? 'Start timed mock →' : 'Full mock exam →'}
        </button>
        {days == null && onOpenSettings && (
          <button type="button" style={styles.secondaryBtn} onClick={onOpenSettings}>
            Set exam date
          </button>
        )}
      </div>
    </div>
  )
}
