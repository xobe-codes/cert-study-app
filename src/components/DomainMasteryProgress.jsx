import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import { COLORS, accentColors, styles } from '../ui/appTheme.js'
import ProgressBar from './ProgressBar.jsx'

/**
 * Domain Mastery Progress View - shows status, scores, actions for D1-D6
 */
export default function DomainMasteryProgress({
  domains = [],
  onStartBaseline = () => {},
  onTakeDomainPass = () => {},
  onContinue = () => {},
  onRetake = () => {},
}) {
  const domainCards = useMemo(() => {
    return domains.map(domain => {
      const status = domain.status || 'NOT_STARTED'
      const statusConfig = {
        MASTERED: { icon: '✓', label: 'Mastered', accent: 'mint' },
        CERTIFIED: { icon: '✓', label: 'Certified', accent: 'mint' },
        IN_PROGRESS: { icon: '⏱', label: 'In Progress', accent: 'sky' },
        NOT_STARTED: { icon: '⭕', label: 'Not Started', accent: 'silver' },
      }[status] || { icon: '⭕', label: 'Not Started', accent: 'silver' }

      const scoreHistory = {
        best: domain.bestScore || 0,
        latest: domain.latestScore || 0,
        average: domain.averageScore || 0,
        attempts: domain.attemptCount || 0,
      }

      const actions = []
      if (status === 'NOT_STARTED') {
        actions.push({ label: 'Start Baseline', action: 'startBaseline', color: 'mint' })
      } else if (status === 'IN_PROGRESS') {
        actions.push({ label: 'Continue', action: 'continue', color: 'sky' })
        if (domain.progress >= 80) {
          actions.push({ label: 'Take Domain Pass', action: 'takeDomainPass', color: 'mint' })
        }
      }

      return {
        ...domain,
        status,
        statusConfig,
        scoreHistory,
        actions,
      }
    })
  }, [domains])

  const handleAction = (domainId, actionType) => {
    switch (actionType) {
      case 'startBaseline':
        onStartBaseline(domainId)
        break
      case 'takeDomainPass':
        onTakeDomainPass(domainId)
        break
      case 'continue':
        onContinue(domainId)
        break
      case 'retake':
        onRetake(domainId)
        break
      default:
        break
    }
  }

  return (
    <div style={{ padding: '16px 0', width: '100%' }}>
      {domainCards.map((domain, idx) => {
        const statusAccent = accentColors(domain.statusConfig.accent)
        return (
          <div key={domain.id || idx} style={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 600, color: COLORS.silver, marginBottom: 4 }}>
                  {domain.name || `Domain ${idx + 1}`}
                </div>
                <div
                  style={{
                    display: 'inline-block',
                    background: statusAccent.dim,
                    border: `1px solid ${statusAccent.border}`,
                    color: statusAccent.text,
                    padding: '4px 10px',
                    borderRadius: 999,
                    fontSize: 'var(--ccna-type-xs)',
                    fontWeight: 600,
                  }}
                >
                  {domain.statusConfig.icon} {domain.statusConfig.label}
                </div>
              </div>
              {domain.progress !== undefined && (
                <div style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 700, color: COLORS.silver }}>
                  {Math.round(domain.progress)}%
                </div>
              )}
            </div>

            {domain.progress !== undefined && (
              <div style={{ marginBottom: 16 }}>
                <ProgressBar
                  value={domain.progress}
                  max={100}
                  accent={domain.statusConfig.accent}
                  height={6}
                />
              </div>
            )}

            <div style={{ background: COLORS.surface, borderRadius: 10, padding: 12, marginBottom: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 2 }}>Best Score</div>
                  <div style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 700, color: COLORS.silver }}>
                    {domain.scoreHistory.best}%
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 2 }}>Latest</div>
                  <div style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 700, color: COLORS.silver }}>
                    {domain.scoreHistory.latest}%
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 2 }}>Average</div>
                  <div style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 700, color: COLORS.silver }}>
                    {domain.scoreHistory.average}%
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 2 }}>Attempts</div>
                  <div style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 700, color: COLORS.silver }}>
                    {domain.scoreHistory.attempts}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
              {domain.actions.length > 0 ? (
                domain.actions.map((action, aidx) => (
                  <button
                    key={aidx}
                    onClick={() => handleAction(domain.id || domain.domainId, action.action)}
                    style={{
                      ...styles.secondaryBtn,
                      padding: '10px 14px',
                      minHeight: 40,
                      fontSize: 'var(--ccna-type-xs)',
                    }}
                  >
                    {action.label}
                  </button>
                ))
              ) : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}

DomainMasteryProgress.propTypes = {
  domains: PropTypes.array,
  onStartBaseline: PropTypes.func,
  onTakeDomainPass: PropTypes.func,
  onContinue: PropTypes.func,
  onRetake: PropTypes.func,
}
