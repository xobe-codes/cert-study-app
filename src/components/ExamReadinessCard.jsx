import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import { COLORS, accentColors, styles } from '../ui/appTheme.js'
import ProgressBar from './ProgressBar.jsx'

export default function ExamReadinessCard({
  readinessScore = 72,
  domainProgress = {},
  criteria = [],
  daysToReadiness = 14,
  confidenceLevel = 'medium',
}) {
  const readinessData = useMemo(() => {
    const domains = Object.entries(domainProgress).slice(0, 6)
    const domainSegments = domains.map(([id, progress]) => ({
      id,
      progress: Math.min(progress || 0, 100),
    }))

    const evaluatedCriteria = criteria.map(crit => ({
      ...crit,
      isMet: crit.isMet !== false,
    }))

    const metCount = evaluatedCriteria.filter(c => c.isMet).length
    const risks = []
    if (readinessScore < 70) {
      risks.push({ type: 'warning', message: 'Score below 70%. Increase study intensity.' })
    }

    return {
      score: readinessScore,
      domainSegments,
      criteria: evaluatedCriteria,
      metCount,
      totalCount: evaluatedCriteria.length,
      risks,
    }
  }, [readinessScore, domainProgress, criteria])

  const getSegmentColor = (progress) => {
    if (progress >= 95) return COLORS.mint
    if (progress >= 80) return COLORS.sky
    if (progress >= 60) return COLORS.amber
    return COLORS.border
  }

  return (
    <div style={styles.card}>
      <div style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 600, marginBottom: 16, color: COLORS.silver }}>
        📋 Exam Readiness
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: COLORS.surface, borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 4 }}>
            Overall Readiness
          </div>
          <div style={{ fontSize: 'var(--ccna-type-xl)', fontWeight: 700, color: COLORS.silver }}>
            {readinessData.score}/100
          </div>
        </div>
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: `conic-gradient(${COLORS.mint} 0deg ${(readinessData.score / 100) * 360}deg, ${COLORS.surface} ${(readinessData.score / 100) * 360}deg)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--ccna-type-md)',
            fontWeight: 700,
            color: COLORS.mint,
          }}
        >
          {readinessData.score}%
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 8, fontWeight: 500 }}>
          Domain Progress
        </div>
        <div style={{ display: 'flex', gap: 4, height: 24, borderRadius: 999, overflow: 'hidden', border: `1px solid ${COLORS.border}` }}>
          {readinessData.domainSegments.map((segment, idx) => (
            <div
              key={segment.id}
              style={{
                flex: 1,
                background: getSegmentColor(segment.progress),
                opacity: segment.progress > 0 ? 1 : 0.3,
              }}
            />
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 8, fontWeight: 500 }}>
          Readiness Criteria ({readinessData.metCount}/{readinessData.totalCount})
        </div>
        <div style={{ background: COLORS.surface, borderRadius: 10, padding: 12 }}>
          {readinessData.criteria.map((crit, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 8, paddingBottom: 8, marginBottom: idx < readinessData.criteria.length - 1 ? 8 : 0, borderBottom: idx < readinessData.criteria.length - 1 ? `1px solid ${COLORS.border}` : 'none' }}>
              <div style={{ width: 20, height: 20, borderRadius: 4, background: crit.isMet ? COLORS.mint : COLORS.surface, border: `1px solid ${crit.isMet ? COLORS.mintBorder : COLORS.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: crit.isMet ? COLORS.mint : COLORS.silverMid, fontSize: 'var(--ccna-type-xs)', fontWeight: 700, flexShrink: 0 }}>
                {crit.isMet ? '✓' : '○'}
              </div>
              <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silver }}>
                {crit.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <ProgressBar value={readinessData.metCount} max={readinessData.totalCount} label="Criteria Completion" sublabel={`${Math.round((readinessData.metCount / readinessData.totalCount) * 100)}%`} accent="mint" height={8} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: 12, background: COLORS.surface, borderRadius: 10, marginTop: 16 }}>
        <div>
          <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 4 }}>Days to Readiness</div>
          <div style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 700, color: COLORS.silver }}>{daysToReadiness} days</div>
        </div>
        <div>
          <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 4 }}>Confidence</div>
          <div style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 700, color: COLORS.silver }}>
            {confidenceLevel === 'high' ? '🚀 High (75%)' : confidenceLevel === 'low' ? '⚠️ Low (45%)' : '📊 Medium (60%)'}
          </div>
        </div>
      </div>

      {readinessData.risks.length > 0 && (
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {readinessData.risks.map((risk, idx) => (
            <div key={idx} style={{ background: COLORS.amberDim, border: `1px solid ${COLORS.amberBorder}`, borderRadius: 8, padding: 10, fontSize: 'var(--ccna-type-xs)', color: COLORS.amber, fontWeight: 500 }}>
              ⚠️ {risk.message}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

ExamReadinessCard.propTypes = {
  readinessScore: PropTypes.number,
  domainProgress: PropTypes.object,
  criteria: PropTypes.array,
  daysToReadiness: PropTypes.number,
  confidenceLevel: PropTypes.oneOf(['high', 'medium', 'low']),
}
