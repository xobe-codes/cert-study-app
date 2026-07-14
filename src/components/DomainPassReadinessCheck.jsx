import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import { COLORS, styles } from '../ui/appTheme.js'
import ProgressBar from './ProgressBar.jsx'

export default function DomainPassReadinessCheck({
  domainName = 'Domain',
  isBaselineMastered = false,
  weakAreasFixed = 0,
  totalWeakAreas = 0,
  readinessPercentage = 0,
  isReady = false,
  onStartDomainPass = () => {},
  onReviewWeakAreas = () => {},
}) {
  const readinessData = useMemo(() => {
    const checklistItems = [
      { label: 'Baseline Mastered (90%+)', isMet: isBaselineMastered, description: 'Complete the baseline assessment with 90%+' },
      { label: `Weak Areas Fixed (${weakAreasFixed}/${totalWeakAreas})`, isMet: weakAreasFixed >= totalWeakAreas, description: 'Complete weak area drills' },
      { label: `Ready to Test (${Math.round(readinessPercentage)}%)`, isMet: isReady, description: 'All preparation work is complete' },
    ]
    const metCount = checklistItems.filter(c => c.isMet).length
    return { checklistItems, metCount, totalCount: checklistItems.length, canTakeDomainPass: isReady && metCount === checklistItems.length }
  }, [isBaselineMastered, weakAreasFixed, totalWeakAreas, readinessPercentage, isReady])

  const getStatusDisplay = () => {
    if (readinessData.canTakeDomainPass) {
      return { icon: '✓', status: 'Ready to Test', color: 'mint', message: 'You\'ve mastered all prerequisites. Click below to start.' }
    }
    if (readinessData.metCount >= 2) {
      return { icon: '⏱', status: 'Almost Ready', color: 'sky', message: `Complete remaining items (${totalWeakAreas - weakAreasFixed} weak areas left).` }
    }
    return { icon: '⭕', status: 'Not Ready', color: 'rose', message: 'Complete prerequisites before taking the domain pass.' }
  }

  const statusDisplay = getStatusDisplay()

  return (
    <div style={styles.card}>
      <div style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 600, marginBottom: 4, color: COLORS.silver }}>
        {domainName} Domain Pass
      </div>
      <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 16 }}>
        Readiness Check
      </div>

      <div style={{ background: statusDisplay.color === 'mint' ? COLORS.mintDim : statusDisplay.color === 'sky' ? COLORS.skyDim : COLORS.roseDim, border: `1px solid ${statusDisplay.color === 'mint' ? COLORS.mintBorder : statusDisplay.color === 'sky' ? COLORS.skyBorder : COLORS.roseBorder}`, borderRadius: 10, padding: 12, marginBottom: 16, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ fontSize: '20px' }}>{statusDisplay.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 'var(--ccna-type-sm)', fontWeight: 600, color: statusDisplay.color === 'mint' ? COLORS.mint : statusDisplay.color === 'sky' ? COLORS.sky : COLORS.rose, marginBottom: 2 }}>
            {statusDisplay.status}
          </div>
          <div style={{ fontSize: 'var(--ccna-type-xs)', color: statusDisplay.color === 'mint' ? COLORS.mint : statusDisplay.color === 'sky' ? COLORS.sky : COLORS.rose, opacity: 0.9, lineHeight: 1.4 }}>
            {statusDisplay.message}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <ProgressBar value={readinessData.metCount} max={readinessData.totalCount} label="Overall Readiness" sublabel={`${Math.round((readinessData.metCount / readinessData.totalCount) * 100)}%`} accent={readinessData.canTakeDomainPass ? 'mint' : 'sky'} height={8} />
      </div>

      <div style={{ background: COLORS.surface, borderRadius: 10, padding: 12, marginBottom: 16 }}>
        <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 600, color: COLORS.silverMid, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Prerequisites
        </div>
        {readinessData.checklistItems.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', gap: 12, paddingBottom: 12, marginBottom: idx < readinessData.checklistItems.length - 1 ? 12 : 0, borderBottom: idx < readinessData.checklistItems.length - 1 ? `1px solid ${COLORS.border}` : 'none' }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: item.isMet ? COLORS.mint : COLORS.surface, border: `1px solid ${item.isMet ? COLORS.mintBorder : COLORS.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.isMet ? COLORS.mint : COLORS.silverMid, fontSize: 'var(--ccna-type-sm)', fontWeight: 700, flexShrink: 0, marginTop: 2 }}>
              {item.isMet ? '✓' : ''}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 600, color: COLORS.silver, marginBottom: 2, textDecoration: item.isMet ? 'line-through' : 'none', opacity: item.isMet ? 0.7 : 1 }}>
                {item.label}
              </div>
              <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, lineHeight: 1.4 }}>
                {item.description}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button onClick={onStartDomainPass} disabled={!readinessData.canTakeDomainPass} style={{ ...styles.primaryBtn, opacity: readinessData.canTakeDomainPass ? 1 : 0.6, cursor: readinessData.canTakeDomainPass ? 'pointer' : 'not-allowed' }}>
          {readinessData.canTakeDomainPass ? 'Start Domain Pass' : 'Unlock Domain Pass'}
        </button>
        {!readinessData.canTakeDomainPass && (
          <button onClick={onReviewWeakAreas} style={{ ...styles.secondaryBtn, padding: '10px 14px', minHeight: 40, fontSize: 'var(--ccna-type-xs)' }}>
            Review Weak Areas
          </button>
        )}
      </div>

      <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginTop: 12, padding: '8px 12px', background: COLORS.surface, borderRadius: 8, lineHeight: 1.5 }}>
        <strong>💡 Tip:</strong> Make sure you complete baseline and fix all weak areas first.
      </div>
    </div>
  )
}

DomainPassReadinessCheck.propTypes = {
  domainName: PropTypes.string,
  isBaselineMastered: PropTypes.bool,
  weakAreasFixed: PropTypes.number,
  totalWeakAreas: PropTypes.number,
  readinessPercentage: PropTypes.number,
  isReady: PropTypes.bool,
  onStartDomainPass: PropTypes.func,
  onReviewWeakAreas: PropTypes.func,
}
