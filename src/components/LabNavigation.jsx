import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import { COLORS, styles } from '../ui/appTheme.js'
import ProgressBar from './ProgressBar.jsx'

export default function LabNavigation({
  currentLabIndex = 0,
  totalLabs = 1,
  currentLab = null,
  isCompleted = false,
  onPreviousLab = () => {},
  onNextLab = () => {},
  onRetakeLab = () => {},
}) {
  const navigationData = useMemo(() => {
    const labNumber = currentLabIndex + 1
    const totalNumber = totalLabs
    const progressPercentage = totalNumber > 0 ? Math.round((labNumber / totalNumber) * 100) : 0
    return {
      labNumber,
      totalNumber,
      progressPercentage,
      canGoPrevious: currentLabIndex > 0,
      canGoNext: currentLabIndex < totalNumber - 1,
      isFirstLab: currentLabIndex === 0,
      isLastLab: currentLabIndex === totalNumber - 1,
    }
  }, [currentLabIndex, totalLabs])

  const labTitle = currentLab?.title || currentLab?.name || `Lab ${navigationData.labNumber}`

  return (
    <div style={styles.card}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 600, color: COLORS.silver, marginBottom: 4 }}>
          {labTitle}
        </div>
        {navigationData.totalNumber > 1 && (
          <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid }}>
            Lab {navigationData.labNumber} of {navigationData.totalNumber}
          </div>
        )}
      </div>

      <div style={{ marginBottom: 16 }}>
        <ProgressBar
          value={navigationData.labNumber}
          max={navigationData.totalNumber}
          sublabel={`${navigationData.progressPercentage}%`}
          height={8}
          accent={isCompleted ? 'mint' : 'sky'}
        />
      </div>

      {isCompleted && (
        <div style={{ background: COLORS.mintDim, border: `1px solid ${COLORS.mintBorder}`, borderRadius: 10, padding: 12, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: '18px' }}>✓</div>
          <div>
            <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.mint, fontWeight: 600 }}>Lab Complete!</div>
            <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.mint, opacity: 0.8 }}>Good work. Ready for the next challenge?</div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <button onClick={onPreviousLab} disabled={!navigationData.canGoPrevious} style={{ ...styles.secondaryBtn, opacity: navigationData.canGoPrevious ? 1 : 0.5, cursor: navigationData.canGoPrevious ? 'pointer' : 'not-allowed', padding: '10px 12px', minHeight: 40, fontSize: 'var(--ccna-type-xs)' }}>
          ← Previous
        </button>
        <button onClick={isCompleted ? onNextLab : undefined} disabled={!navigationData.canGoNext} style={{ ...styles.secondaryBtn, opacity: navigationData.canGoNext ? 1 : 0.5, cursor: navigationData.canGoNext ? 'pointer' : 'not-allowed', padding: '10px 12px', minHeight: 40, fontSize: 'var(--ccna-type-xs)' }}>
          Next →
        </button>
      </div>

      {isCompleted && navigationData.isLastLab && (
        <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.mint, textAlign: 'center', marginTop: 12, fontWeight: 500 }}>
          🎉 You've completed all labs!
        </div>
      )}
    </div>
  )
}

LabNavigation.propTypes = {
  currentLabIndex: PropTypes.number,
  totalLabs: PropTypes.number,
  currentLab: PropTypes.object,
  isCompleted: PropTypes.bool,
  onPreviousLab: PropTypes.func,
  onNextLab: PropTypes.func,
  onRetakeLab: PropTypes.func,
}
