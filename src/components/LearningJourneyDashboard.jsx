import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import { COLORS, styles } from '../ui/appTheme.js'
import ProgressBar from './ProgressBar.jsx'

/**
 * Learning Journey Dashboard (Main entry point)
 * Shows progress through 6 domains with critical path and recommendations
 */
export default function LearningJourneyDashboard({
  learningState = null,
  onNavigateToDomain = () => {},
  onStartDomainPass = () => {},
  onRefreshDomain = () => {},
}) {
  const dashboardData = useMemo(() => {
    if (!learningState) {
      return {
        masteredCount: 0,
        totalDomains: 6,
        domainStates: [],
        nextStep: null,
        examReadyDate: null,
        maintenanceNeeded: [],
      }
    }

    const domains = learningState.domains || {}
    const domainEntries = Object.entries(domains).slice(0, 6) // D1-D6

    const domainStates = domainEntries.map(([key, domain]) => {
      const status = domain.status || 'NOT_STARTED'
      const statusDisplay = {
        MASTERED: { icon: '✓', label: 'Mastered', color: 'mint' },
        CERTIFIED: { icon: '✓', label: 'Certified', color: 'mint' },
        IN_PROGRESS: { icon: '⏱', label: 'In Progress', color: 'sky' },
        NOT_STARTED: { icon: '⭕', label: 'Not Started', color: 'silver' },
      }[status] || { icon: '⭕', label: 'Not Started', color: 'silver' }

      return {
        domainId: key,
        name: domain.name || `Domain ${key}`,
        status,
        statusDisplay,
        masteredAt: domain.masteredAt,
        refreshDueAt: domain.refreshDueAt,
        progress: domain.progress || 0,
      }
    })

    const masteredCount = domainStates.filter(d => d.status === 'MASTERED' || d.status === 'CERTIFIED').length

    // Determine next step
    let nextStep = null
    const inProgressDomain = domainStates.find(d => d.status === 'IN_PROGRESS')
    const notStartedDomain = domainStates.find(d => d.status === 'NOT_STARTED')

    if (inProgressDomain && inProgressDomain.progress >= 80) {
      nextStep = {
        type: 'domain_pass_ready',
        domain: inProgressDomain.name,
        action: 'Take Domain Pass',
        actionType: 'startDomainPass',
        estimate: '45-60 minutes',
      }
    } else if (inProgressDomain) {
      nextStep = {
        type: 'continue_learning',
        domain: inProgressDomain.name,
        action: 'Continue Study',
        actionType: 'navigateToDomain',
        estimate: `Complete weak areas (${Math.round(100 - inProgressDomain.progress)}% remaining)`,
      }
    } else if (notStartedDomain) {
      nextStep = {
        type: 'start_baseline',
        domain: notStartedDomain.name,
        action: 'Start Baseline',
        actionType: 'startBaseline',
        estimate: '30-40 minutes',
      }
    }

    // Find refresh maintenance needed
    const now = new Date()
    const maintenanceNeeded = domainStates.filter(d => {
      if (!d.refreshDueAt) return false
      return new Date(d.refreshDueAt) <= now && d.status === 'MASTERED'
    })

    // Calculate exam readiness date (rough estimate: 2-3 weeks per remaining domain)
    const remainingDomains = 6 - masteredCount
    const daysPerDomain = 14
    const estimatedDays = remainingDomains * daysPerDomain
    const examReadyDate = new Date()
    examReadyDate.setDate(examReadyDate.getDate() + estimatedDays)

    return {
      masteredCount,
      totalDomains: 6,
      domainStates,
      nextStep,
      examReadyDate,
      maintenanceNeeded,
    }
  }, [learningState])

  const handleNextStepClick = () => {
    if (!dashboardData.nextStep) return
    const { actionType } = dashboardData.nextStep
    if (actionType === 'startDomainPass') {
      onStartDomainPass(dashboardData.nextStep.domain)
    } else if (actionType === 'navigateToDomain') {
      onNavigateToDomain(dashboardData.nextStep.domain)
    }
  }

  const formatDate = (date) => {
    if (!date) return ''
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date)
  }

  return (
    <div style={{ padding: '16px 0', width: '100%' }}>
      {/* Progress Header */}
      <div style={styles.card}>
        <div style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 600, marginBottom: 12, color: COLORS.silver }}>
          Learning Progress
        </div>
        <ProgressBar
          value={dashboardData.masteredCount}
          max={dashboardData.totalDomains}
          label={`${dashboardData.masteredCount}/${dashboardData.totalDomains} Domains Mastered`}
          sublabel={`${Math.round((dashboardData.masteredCount / dashboardData.totalDomains) * 100)}%`}
          accent="mint"
        />
      </div>

      {/* Critical Path */}
      <div style={styles.card}>
        <div style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 600, marginBottom: 16, color: COLORS.silver }}>
          Critical Path
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', overflowX: 'auto', paddingBottom: 8 }}>
          {dashboardData.domainStates.map((domain, idx) => (
            <div key={domain.domainId} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div
                style={{
                  background: domain.status === 'MASTERED' || domain.status === 'CERTIFIED' ? COLORS.mint : domain.status === 'IN_PROGRESS' ? COLORS.sky : COLORS.surface,
                  border: `1px solid ${domain.status === 'MASTERED' || domain.status === 'CERTIFIED' ? COLORS.mintBorder : domain.status === 'IN_PROGRESS' ? COLORS.skyBorder : COLORS.border}`,
                  borderRadius: 8,
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: domain.status === 'MASTERED' || domain.status === 'CERTIFIED' ? COLORS.mint : domain.status === 'IN_PROGRESS' ? COLORS.sky : COLORS.silverMid,
                }}
              >
                {domain.statusDisplay.icon}
              </div>
              {idx < dashboardData.domainStates.length - 1 && (
                <div style={{ width: 24, height: 2, background: COLORS.border, borderRadius: 1 }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Next Steps */}
      {dashboardData.nextStep && (
        <div
          style={{
            ...styles.card,
            background: dashboardData.nextStep.type === 'domain_pass_ready' ? COLORS.mintDim : COLORS.card,
            border: `1px solid ${dashboardData.nextStep.type === 'domain_pass_ready' ? COLORS.mintBorder : COLORS.border}`,
          }}
        >
          <div style={{ fontSize: 'var(--ccna-type-sm)', fontWeight: 600, color: dashboardData.nextStep.type === 'domain_pass_ready' ? COLORS.mint : COLORS.brand, marginBottom: 8 }}>
            {dashboardData.nextStep.type === 'domain_pass_ready' ? '🎯 Ready!' : '→ Next Step'}
          </div>
          <div style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 600, color: COLORS.silver, marginBottom: 4 }}>
            {dashboardData.nextStep.action}: {dashboardData.nextStep.domain}
          </div>
          <button
            onClick={handleNextStepClick}
            style={{
              ...styles.primaryBtn,
              background: `linear-gradient(135deg, ${COLORS.brand}, ${COLORS.brandM})`,
              marginTop: 12,
            }}
          >
            {dashboardData.nextStep.action}
          </button>
        </div>
      )}

      {/* Timeline */}
      <div style={styles.card}>
        <div style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 600, marginBottom: 12, color: COLORS.silver }}>
          Exam Timeline
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 4 }}>
              Estimated Exam Ready
            </div>
            <div style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 700, color: COLORS.silver }}>
              {formatDate(dashboardData.examReadyDate)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

LearningJourneyDashboard.propTypes = {
  learningState: PropTypes.object,
  onNavigateToDomain: PropTypes.func,
  onStartDomainPass: PropTypes.func,
  onRefreshDomain: PropTypes.func,
}
