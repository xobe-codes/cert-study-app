import React from 'react'
import { COLORS } from '../ui/appTheme.js'
import { computeTrapWeakness, trapWeakTap } from '../weaknessUtils.js'
import { buildStudyObjectiveHandoff } from '../study/studyObjectiveHandoff.js'
import OverflowMarquee from '../components/OverflowMarquee.jsx'
import { homeAccentStrip, homePill, homeSectionLabel } from './homeUi.js'

export default function TrapHeatmapStrip({ missed, onOpenTrapDrill, onOpenExamTraps, onOpenMissed, onSelectObjective }) {
  const traps = computeTrapWeakness(missed || []).slice(0, 5)
  if (!traps.length) return null

  const maxCount = traps[0]?.count || 1

  function handleTrapTap(trap) {
    trapWeakTap(trap, missed, {
      onOpenTrapDrill,
      onOpenExamTraps,
      onStudyObjective: (objectiveId) => {
        const handoff = buildStudyObjectiveHandoff(objectiveId, { tab: 'Practice' })
        if (handoff) onSelectObjective?.(handoff)
      },
    })
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={homeSectionLabel(COLORS.rose)}>TRAP WEAKNESS</div>
        {onOpenMissed && (
          <button
            type="button"
            onClick={onOpenMissed}
            style={{ background: 'none', border: 'none', color: COLORS.rose, fontSize: 'var(--ccna-type-xs)', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}
          >
            All missed →
          </button>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {traps.map(({ trap, count }) => {
          const intensity = Math.max(0.25, count / maxCount)
          return (
            <button
              key={trap}
              type="button"
              className="ccna-hover"
              onClick={() => handleTrapTap(trap)}
              style={{
                ...homeAccentStrip('rose'),
                padding: '8px 12px',
                textAlign: 'left',
                cursor: onOpenTrapDrill ? 'pointer' : 'default',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <span style={{ ...homePill('rose'), flexShrink: 0 }}>{count}×</span>
                <OverflowMarquee
                  text={trap}
                  style={{ flex: 1, fontSize: 'var(--ccna-type-xs)', color: COLORS.silver, lineHeight: 1.35 }}
                />
                <div
                  aria-hidden="true"
                  style={{
                    width: 48, height: 6, borderRadius: 999, background: COLORS.surface, overflow: 'hidden', flexShrink: 0,
                  }}
                >
                  <div style={{ height: '100%', width: `${Math.round(intensity * 100)}%`, background: COLORS.rose, borderRadius: 999 }} />
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
