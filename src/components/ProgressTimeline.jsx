import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import { COLORS, styles } from '../ui/appTheme.js'

export default function ProgressTimeline({ events = [] }) {
  const timelineData = useMemo(() => {
    const sortedEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date))
    return sortedEvents.map((event, idx) => ({ ...event, index: idx, isFirst: idx === 0, isLast: idx === sortedEvents.length - 1 }))
  }, [events])

  const getEventIcon = (type) => {
    const icons = {
      domain_started: '🚀',
      baseline_passed: '✓',
      weak_areas_fixed: '🔧',
      domain_passed: '🎯',
      domain_mastered: '👑',
      refresh_due: '🔄',
      exam_ready: '🎓',
    }
    return icons[type] || '→'
  }

  const getEventColor = (type) => {
    const colors = {
      domain_started: { accent: 'sky', text: COLORS.sky },
      baseline_passed: { accent: 'sky', text: COLORS.sky },
      weak_areas_fixed: { accent: 'amber', text: COLORS.amber },
      domain_passed: { accent: 'mint', text: COLORS.mint },
      domain_mastered: { accent: 'mint', text: COLORS.mint },
      refresh_due: { accent: 'amber', text: COLORS.amber },
      exam_ready: { accent: 'mint', text: COLORS.mint },
    }
    return colors[type] || { accent: 'purple', text: COLORS.purple }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
  }

  return (
    <div style={{ ...styles.card, padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: 16, borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 600, color: COLORS.silver }}>
          📈 Learning Timeline
        </div>
        <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginTop: 2 }}>
          {timelineData.length} milestones
        </div>
      </div>

      {timelineData.length === 0 ? (
        <div style={{ padding: '40px 16px', textAlign: 'center', color: COLORS.silverMid }}>
          <div style={{ fontSize: 'var(--ccna-type-xs)' }}>
            Start your learning journey to see milestones here
          </div>
        </div>
      ) : (
        <div style={{ padding: '16px 0' }}>
          {timelineData.map((event, idx) => {
            const color = getEventColor(event.type)
            const isAlternate = idx % 2 === 1

            return (
              <div key={event.id || idx} style={{ display: 'grid', gridTemplateColumns: isAlternate ? '1fr auto 1fr' : 'auto 1fr', gap: 12, padding: '12px 16px', alignItems: 'center' }}>
                {isAlternate && (
                  <div style={{ textAlign: 'right', paddingRight: 8 }}>
                    <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 600, color: COLORS.silver, marginBottom: 2 }}>
                      {event.title}
                    </div>
                    <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid }}>
                      {formatDate(event.date)}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                  {!event.isFirst && (
                    <div style={{ width: 2, height: 12, background: COLORS.border, marginBottom: 4 }} />
                  )}
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: COLORS.surface, border: `2px solid ${color.text}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: color.text, fontWeight: 600, flexShrink: 0 }}>
                    {getEventIcon(event.type)}
                  </div>
                  {!event.isLast && (
                    <div style={{ width: 2, height: 12, background: COLORS.border, marginTop: 4 }} />
                  )}
                </div>

                {!isAlternate && (
                  <div style={{ paddingLeft: 8 }}>
                    <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 600, color: COLORS.silver, marginBottom: 2 }}>
                      {event.title}
                    </div>
                    <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid }}>
                      {formatDate(event.date)}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

ProgressTimeline.propTypes = {
  events: PropTypes.array,
}
