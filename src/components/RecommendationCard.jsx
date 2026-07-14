import React from 'react'
import PropTypes from 'prop-types'
import { COLORS, accentColors, styles } from '../ui/appTheme.js'

export default function RecommendationCard({ recommendations = [], onActionClick = () => {} }) {
  const getRecommendationStyle = (type) => {
    switch (type) {
      case 'priority':
        return { icon: '🎯', accent: 'mint', label: 'Priority', bgColor: COLORS.mintDim, borderColor: COLORS.mintBorder }
      case 'strategic':
        return { icon: '📈', accent: 'sky', label: 'Strategic', bgColor: COLORS.skyDim, borderColor: COLORS.skyBorder }
      case 'maintenance':
        return { icon: '🔄', accent: 'amber', label: 'Maintenance', bgColor: COLORS.amberDim, borderColor: COLORS.amberBorder }
      case 'warning':
        return { icon: '⚠️', accent: 'rose', label: 'Warning', bgColor: COLORS.roseDim, borderColor: COLORS.roseBorder }
      default:
        return { icon: '→', accent: 'purple', label: 'Recommendation', bgColor: COLORS.purpleDim, borderColor: COLORS.purpleDim }
    }
  }

  return (
    <div style={{ padding: '16px 0', width: '100%' }}>
      {recommendations.length === 0 ? (
        <div style={styles.card}>
          <div style={{ textAlign: 'center', padding: '20px 16px', color: COLORS.silverMid }}>
            <div style={{ fontSize: 'var(--ccna-type-xs)' }}>No recommendations at this time. Keep up the great work!</div>
          </div>
        </div>
      ) : (
        recommendations.map((rec, idx) => {
          const style = getRecommendationStyle(rec.type)
          return (
            <div key={idx} style={{ ...styles.card, background: style.bgColor, border: `1px solid ${style.borderColor}`, marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: '18px' }}>{style.icon}</span>
                <span style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 600, textTransform: 'uppercase', color: COLORS.silver }}>
                  {style.label}
                </span>
              </div>
              <div style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 600, color: COLORS.silver, marginBottom: 8 }}>
                {rec.title}
              </div>
              {rec.description && (
                <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 12, lineHeight: 1.5 }}>
                  {rec.description}
                </div>
              )}
              {rec.timeEstimate && (
                <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 8 }}>
                  ⏱ {rec.timeEstimate}
                </div>
              )}
              {rec.actionLabel && rec.actionId && (
                <button onClick={() => onActionClick(rec.actionId, rec)} style={{ ...styles.secondaryBtn, padding: '10px 14px', minHeight: 40, fontSize: 'var(--ccna-type-xs)' }}>
                  {rec.actionLabel}
                </button>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}

RecommendationCard.propTypes = {
  recommendations: PropTypes.array,
  onActionClick: PropTypes.func,
}
