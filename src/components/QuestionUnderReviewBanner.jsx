import React from 'react'
import { getQuestionHealthEntry } from '../data/questionHealth.js'
import { COLORS } from '../ui/appTheme.js'

const DEBUG_FLAG = 'ccna_show_qhr_debug'

function isQhrDebugEnabled() {
  try {
    return localStorage.getItem(DEBUG_FLAG) === '1'
  } catch {
    return false
  }
}

/** Amber banner when QHR marks a question under review — debug flag only. */
export default function QuestionUnderReviewBanner({ questionId }) {
  if (!questionId || !isQhrDebugEnabled()) return null
  const entry = getQuestionHealthEntry(questionId)
  if (!entry || (entry.status !== 'quarantined' && entry.status !== 'needs_fix')) return null
  return (
    <div
      role="status"
      style={{
        marginBottom: 8,
        padding: '8px 10px',
        borderRadius: 6,
        border: `1px solid ${COLORS.amberBorder}`,
        background: COLORS.amberDim,
        color: COLORS.amber,
        fontSize: 'var(--ccna-type-xs)',
        lineHeight: 1.45,
      }}
    >
      This question is under content review ({entry.status.replace('_', ' ')}).
    </div>
  )
}

export { isQhrDebugEnabled, DEBUG_FLAG as QHR_DEBUG_FLAG }
