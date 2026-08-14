/**
 * Lab Checkpoint Status Component (Phase 1 Complete)
 */

import React, { useMemo } from 'react'
import { COLORS, styles } from '../ui/appTheme.js'

export default function LabCheckpointStatus({
  checkpoint,
  checkpointStatuses = [],
  currentCheckpointIdx = 0,
}) {
  const totalCheckpoints = checkpointStatuses.length
  const completedCount = checkpointStatuses.filter((s) => s.completed).length
  const percentComplete = totalCheckpoints > 0
    ? Math.round((completedCount / totalCheckpoints) * 100)
    : 0

  const currentStatus = useMemo(() => {
    if (!checkpoint) return null
    return checkpointStatuses.find((s) => s.checkpoint.id === checkpoint.id)
  }, [checkpoint, checkpointStatuses])

  return (
    <div style={{ ...styles.card, marginBottom: 16 }}>
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 8,
            fontSize: 'var(--ccna-type-xs)',
            color: COLORS.silver,
          }}
        >
          <span>Progress</span>
          <span style={{ fontWeight: 600 }}>
            {completedCount} / {totalCheckpoints}
          </span>
        </div>

        <div
          style={{
            width: '100%',
            height: 8,
            backgroundColor: COLORS.border,
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              backgroundColor: percentComplete === 100 ? COLORS.mint : COLORS.sky,
              width: `${percentComplete}%`,
              transition: 'width 0.3s ease',
            }}
          />
        </div>

        <div
          style={{
            marginTop: 6,
            fontSize: 'var(--ccna-type-xs)',
            color: COLORS.silver,
            textAlign: 'right',
          }}
        >
          {percentComplete}% complete
        </div>
      </div>

      {checkpoint && (
        <>
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                fontSize: 'var(--ccna-type-sm)',
                fontWeight: 600,
                color: COLORS.white,
                marginBottom: 6,
              }}
            >
              Step {currentCheckpointIdx + 1}: {checkpoint.title}
            </div>
            <p
              style={{
                fontSize: 'var(--ccna-type-sm)',
                color: COLORS.silver,
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {checkpoint.description}
            </p>
          </div>

          <div
            style={{
              backgroundColor: COLORS.dark,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 'var(--ccna-radius)',
              padding: 12,
              marginBottom: 16,
              fontFamily: 'Monaco, Courier New, monospace',
              fontSize: 'var(--ccna-type-xs)',
            }}
          >
            <div style={{ color: COLORS.silver, marginBottom: 4 }}>Command to run:</div>
            <div style={{ color: COLORS.sky, fontWeight: 600 }}>
              {checkpoint.requiredCommand}
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div
              style={{
                fontSize: 'var(--ccna-type-xs)',
                fontWeight: 600,
                color: COLORS.silver,
                marginBottom: 4,
              }}
            >
              Expected output should contain:
            </div>
            <div
              style={{
                fontSize: 'var(--ccna-type-sm)',
                color: COLORS.silver,
                backgroundColor: COLORS.dark,
                padding: 8,
                borderRadius: 'var(--ccna-radius)',
                borderLeft: `3px solid ${COLORS.mint}`,
              }}
            >
              {checkpoint.expectedOutput}
            </div>
          </div>

          {currentStatus && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 12,
                backgroundColor: currentStatus.completed ? COLORS.mintDim : COLORS.card,
                borderRadius: 'var(--ccna-radius)',
                border: `1px solid ${
                  currentStatus.completed ? COLORS.mintBorder : COLORS.border
                }`,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 'var(--ccna-type-xs)',
                    color: COLORS.silver,
                    marginBottom: 4,
                  }}
                >
                  Attempts: {currentStatus.attempts}
                </div>
                <div
                  style={{
                    fontSize: 'var(--ccna-type-xs)',
                    color: COLORS.silver,
                  }}
                >
                  Hints used: {currentStatus.hintsUsed}
                </div>
              </div>
              <div
                style={{
                  fontSize: 'var(--ccna-type-lg)',
                  color: currentStatus.completed ? COLORS.mint : COLORS.silver,
                }}
              >
                {currentStatus.completed ? '✓' : '○'}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
