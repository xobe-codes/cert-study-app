/**
 * Lab Readiness Checklist Component (Phase 1 Complete)
 */

import React, { useMemo } from 'react'
import { COLORS, styles } from '../ui/appTheme.js'

export default function LabReadinessChecklist({
  checkpointStatuses = [],
  isReady = false,
  onSubmit,
  submitting = false,
}) {
  const completedCount = checkpointStatuses.filter((s) => s.completed).length
  const totalCount = checkpointStatuses.length

  const encouragementMessage = useMemo(() => {
    if (completedCount === totalCount && totalCount > 0) {
      return 'All steps complete! Ready to submit.'
    }
    if (completedCount >= totalCount * 0.75) {
      return `You're almost done! ${totalCount - completedCount} step${totalCount - completedCount > 1 ? 's' : ''} remaining.`
    }
    if (completedCount >= totalCount * 0.5) {
      return `Halfway there! ${Math.ceil((totalCount - completedCount) / 2)} more steps.`
    }
    if (completedCount > 0) {
      return `Great start! ${completedCount} step${completedCount > 1 ? 's' : ''} complete.`
    }
    return 'Complete all steps to submit the lab.'
  }, [completedCount, totalCount])

  return (
    <div style={{ ...styles.card }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          paddingBottom: 12,
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        <div
          style={{
            fontSize: 'var(--ccna-type-sm)',
            fontWeight: 600,
            color: COLORS.white,
          }}
        >
          Completion Checklist
        </div>
        <div
          style={{
            fontSize: 'var(--ccna-type-lg)',
            fontWeight: 700,
            color: isReady ? COLORS.mint : COLORS.silver,
          }}
        >
          {completedCount}/{totalCount}
        </div>
      </div>

      <div
        style={{
          backgroundColor: isReady ? COLORS.mintDim : COLORS.card,
          border: `1px solid ${isReady ? COLORS.mintBorder : COLORS.border}`,
          borderRadius: 'var(--ccna-radius)',
          padding: 12,
          marginBottom: 16,
          fontSize: 'var(--ccna-type-sm)',
          color: isReady ? COLORS.mint : COLORS.silver,
          lineHeight: 1.6,
        }}
      >
        {encouragementMessage}
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 12 }}>
          {checkpointStatuses.map((status) => (
            <div
              key={status.checkpoint.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                marginBottom: 8,
                backgroundColor: status.completed ? COLORS.mintDim : COLORS.card,
                border: `1px solid ${
                  status.completed ? COLORS.mintBorder : COLORS.border
                }`,
                borderRadius: 'var(--ccna-radius)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  backgroundColor: status.completed ? COLORS.mint : COLORS.border,
                  color: status.completed ? COLORS.dark : COLORS.silver,
                  fontSize: 'var(--ccna-type-sm)',
                  fontWeight: 700,
                }}
              >
                {status.completed ? '✓' : '○'}
              </div>

              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 'var(--ccna-type-sm)',
                    fontWeight: 600,
                    color: status.completed ? COLORS.mint : COLORS.white,
                  }}
                >
                  {status.checkpoint.title}
                </div>
              </div>

              <div
                style={{
                  fontSize: 'var(--ccna-type-xs)',
                  color: COLORS.silver,
                  textAlign: 'right',
                }}
              >
                {status.attempts > 0 && (
                  <div>
                    {status.attempts} attempt{status.attempts > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onSubmit}
        disabled={!isReady || submitting}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: isReady ? COLORS.mint : COLORS.silver,
          color: COLORS.dark,
          border: 'none',
          borderRadius: 'var(--ccna-radius)',
          fontSize: 'var(--ccna-type-sm)',
          fontWeight: 700,
          cursor: isReady && !submitting ? 'pointer' : 'default',
          opacity: isReady && !submitting ? 1 : 0.5,
        }}
      >
        {submitting ? 'Submitting...' : 'Submit Lab'}
      </button>

      <div
        style={{
          marginTop: 12,
          fontSize: 'var(--ccna-type-xs)',
          color: COLORS.silver,
          textAlign: 'center',
          borderTop: `1px solid ${COLORS.border}`,
          paddingTop: 12,
        }}
      >
        {isReady
          ? 'All steps complete! Submit to see your score.'
          : `Complete all ${totalCount} step${totalCount > 1 ? 's' : ''} to submit`}
      </div>
    </div>
  )
}
