import React, { useMemo } from 'react'
import { DOMAINS } from '../data/ccnaDomains.js'
import { COLORS, styles } from '../ui/appTheme.js'

/**
 * Domain Completion Roadmap
 * Shows exact path to 100% domain mastery with clear gaps and next steps
 */
export default function DomainCompletionRoadmap({ progress = {}, onSelectDomain }) {
  const roadmapData = useMemo(() => {
    return DOMAINS.map(domain => {
      const domainObjectives = domain.objectives || []
      const masteredObjectives = domainObjectives.filter(obj => progress[obj.id]?.status === 'mastered')
      const objectiveCompletion = domainObjectives.length > 0
        ? Math.round((masteredObjectives.length / domainObjectives.length) * 100)
        : 0

      // Calculate overall completion based on multi-factor scoring
      const hasBaseline = !!progress[`${domain.id}-baseline`]?.completed
      const domainPassScore = Math.max(...(domainObjectives.map(obj => progress[obj.id]?.masteryScore || 0)), 0)
      const isDomainPassed = domainPassScore >= 80
      const allObjectivesMastered = masteredObjectives.length === domainObjectives.length

      // Completion percentage breakdown:
      // 25% = Baseline established
      // 35% = Domain Pass (80%+)
      // 25% = All objectives mastered
      // 15% = Mock exam ready + trap drills
      const baselineScore = hasBaseline ? 25 : 0
      const domainPassScore2 = isDomainPassed ? 35 : Math.min(domainPassScore * 0.35, 34)
      const objectivesMasteredScore = allObjectivesMastered ? 25 : (objectiveCompletion * 0.25) / 100
      const trapDrillScore = 15 * Math.min(masteredObjectives.length / Math.max(1, domainObjectives.length), 1)

      const totalCompletion = Math.round(baselineScore + domainPassScore2 + objectivesMasteredScore + trapDrillScore)

      // Identify specific gaps
      const gaps = []
      if (!hasBaseline) gaps.push('Complete baseline assessment')
      if (!isDomainPassed) gaps.push(`Raise domain pass score from ${Math.round(domainPassScore)}% to 80%+`)
      if (!allObjectivesMastered) gaps.push(`Master remaining ${domainObjectives.length - masteredObjectives.length} objectives`)

      return {
        domain,
        domainId: domain.id,
        domainName: domain.name,
        examWeight: domain.examWeight || 0,
        objectiveCount: domainObjectives.length,
        masteredCount: masteredObjectives.length,
        objectiveCompletion,
        hasBaseline,
        domainPassScore: Math.round(domainPassScore),
        isDomainPassed,
        allObjectivesMastered,
        totalCompletion,
        gaps,
        breakdown: {
          baseline: baselineScore,
          domainPass: Math.round(domainPassScore2),
          objectives: Math.round(objectivesMasteredScore),
          trapDrill: Math.round(trapDrillScore),
        },
      }
    })
  }, [progress])

  const overallCompletion = Math.round(
    roadmapData.reduce((sum, d) => sum + d.totalCompletion, 0) / roadmapData.length
  )

  return (
    <div style={{ padding: '16px 0' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 700, marginBottom: 8 }}>
          📊 Exam Readiness
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 16px',
          background: COLORS.mintDim,
          borderRadius: 8,
          border: `2px solid ${COLORS.mintBorder}`,
        }}>
          <div style={{ fontSize: 48, fontWeight: 700, color: COLORS.mint }}>{overallCompletion}%</div>
          <div>
            <div style={{ fontSize: 'var(--ccna-type-sm)', fontWeight: 600, color: COLORS.mint }}>
              Overall Progress
            </div>
            <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginTop: 4 }}>
              {roadmapData.filter(d => d.isDomainPassed).length} / {roadmapData.length} domains passed
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 'var(--ccna-type-sm)', fontWeight: 700, marginBottom: 12 }}>
          COMPLETION BREAKDOWN
        </div>

        {roadmapData.map(data => (
          <div
            key={data.domainId}
            onClick={() => onSelectDomain?.(data.domainId)}
            style={{
              marginBottom: 12,
              padding: '12px',
              background: COLORS.cardBg,
              borderRadius: 8,
              border: `1px solid ${COLORS.cardBorder}`,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              ':hover': { transform: 'translateY(-2px)' },
            }}
          >
            {/* Domain Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 'var(--ccna-type-sm)', fontWeight: 700 }}>
                  {data.domain.label}
                </div>
                <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginTop: 2 }}>
                  {data.examWeight}% exam weight • {data.masteredCount} / {data.objectiveCount} objectives mastered
                </div>
              </div>
              <div style={{
                fontSize: 24,
                fontWeight: 700,
                color: data.totalCompletion >= 80 ? COLORS.mint : data.totalCompletion >= 50 ? COLORS.amber : COLORS.rose,
              }}>
                {data.totalCompletion}%
              </div>
            </div>

            {/* Completion Factors */}
            <div style={{ marginBottom: 10 }}>
              <CompletionFactor
                label="Baseline"
                score={data.breakdown.baseline}
                maxScore={25}
                completed={data.hasBaseline}
                status={data.hasBaseline ? '✓ Established' : '○ Not started'}
              />
              <CompletionFactor
                label="Domain Pass"
                score={data.breakdown.domainPass}
                maxScore={35}
                completed={data.isDomainPassed}
                status={data.isDomainPassed ? `✓ ${data.domainPassScore}%` : `${data.domainPassScore}% (need 80%)`}
              />
              <CompletionFactor
                label="Objectives"
                score={data.breakdown.objectives}
                maxScore={25}
                completed={data.allObjectivesMastered}
                status={data.allObjectivesMastered ? '✓ All mastered' : `${data.masteredCount}/${data.objectiveCount}`}
              />
              <CompletionFactor
                label="Trap Drills"
                score={data.breakdown.trapDrill}
                maxScore={15}
                completed={data.allObjectivesMastered}
                status={data.allObjectivesMastered ? '✓ Ready' : 'Locked'}
              />
            </div>

            {/* Gaps / Next Steps */}
            {data.gaps.length > 0 && (
              <div style={{
                padding: '8px 10px',
                background: COLORS.roseDim,
                borderLeft: `3px solid ${COLORS.rose}`,
                borderRadius: 4,
              }}>
                <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 600, color: COLORS.rose, marginBottom: 4 }}>
                  ⚠ Next Steps:
                </div>
                {data.gaps.map((gap, i) => (
                  <div key={i} style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.rose, marginBottom: i < data.gaps.length - 1 ? 3 : 0 }}>
                    • {gap}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Completion Legend */}
      <div style={{
        padding: '12px',
        background: COLORS.cardBg,
        borderRadius: 8,
        border: `1px solid ${COLORS.cardBorder}`,
      }}>
        <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 600, marginBottom: 8 }}>
          📖 HOW TO REACH 100%
        </div>
        <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, lineHeight: 1.6 }}>
          <div style={{ marginBottom: 6 }}>
            <strong>Baseline (25%):</strong> Complete 15-question domain overview
          </div>
          <div style={{ marginBottom: 6 }}>
            <strong>Domain Pass (35%):</strong> Score 80%+ on all domain questions
          </div>
          <div style={{ marginBottom: 6 }}>
            <strong>Master Objectives (25%):</strong> Achieve "Mastered" status on all objectives
          </div>
          <div>
            <strong>Trap Drills (15%):</strong> Complete trap drill patterns for weak areas
          </div>
        </div>
      </div>
    </div>
  )
}

function CompletionFactor({ label, score, maxScore, completed, status }) {
  const percentage = Math.round((score / maxScore) * 100)
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid }}>{status}</span>
      </div>
      <div style={{
        height: 6,
        background: COLORS.cardBorder,
        borderRadius: 3,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${percentage}%`,
          background: completed ? COLORS.mint : COLORS.amber,
          transition: 'width 0.3s ease',
        }} />
      </div>
    </div>
  )
}
