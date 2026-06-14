import React from 'react'
import { COLORS, styles } from '../ui/appTheme.js'
import { useStudyBlock } from './StudyBlockProvider.jsx'

export default function StudyBlockCompleteCard({ objectiveId, masteryPct, onQuiz, onDismiss }) {
  const { state, dismissComplete, skipBreakPhase } = useStudyBlock()

  if (!state.showCompleteCard) return null
  if (state.lastCompletedObjectiveId && state.lastCompletedObjectiveId !== objectiveId) return null

  const isBreak = state.status === 'break'

  return (
    <div className="study-block-complete-card" style={styles.card}>
      <h2 style={{ ...styles.h2, margin: '0 0 4px' }}>
        {isBreak ? 'Focus block complete' : 'Deep work block complete'}
      </h2>
      <p style={{ ...styles.small, margin: '0 0 10px' }}>
        {isBreak
          ? `Nice work on ${objectiveId}. Break timer is running — quiz when you're ready.`
          : `You finished your deep work block on ${objectiveId}.`}
        {typeof masteryPct === 'number' && ` Mastery ${masteryPct}%.`}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <button type="button" style={styles.primaryBtn} onClick={() => { dismissComplete(); onQuiz?.() }}>
          Quiz now
        </button>
        {isBreak && (
          <button type="button" style={styles.secondaryBtn} onClick={() => { dismissComplete(); skipBreakPhase() }}>
            Skip break
          </button>
        )}
        <button type="button" style={styles.secondaryBtn} onClick={() => { dismissComplete(); onDismiss?.() }}>
          Done
        </button>
      </div>
    </div>
  )
}
