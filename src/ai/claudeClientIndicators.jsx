import React from 'react'
import { COLORS } from '../ui/appTheme.js'
import { useAiCallCount } from './claudeClient.js'

const AI_BUDGET_LIMIT = 20

export function AiBudgetWarning() {
  const count = useAiCallCount()
  if (count <= AI_BUDGET_LIMIT) return null
  return (
    <div style={{
      background: COLORS.amberDim, border: `1px solid ${COLORS.amberBorder}`,
      borderRadius: 8, padding: '6px 10px', fontSize: 'var(--ccna-type-xs)', color: COLORS.amber,
      marginBottom: 8,
    }}>
      ⚠ High API usage today ({count} calls) — consider packaging this objective offline for faster, free access.
    </div>
  )
}

export function AiCallsIndicator() {
  const count = useAiCallCount()
  if (count === 0) return null
  const overBudget = count > AI_BUDGET_LIMIT
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      fontSize: 'var(--ccna-type-xs)', color: overBudget ? COLORS.amber : COLORS.silverMid,
      marginBottom: 12,
    }}>
      <span style={{ opacity: 0.7 }}>🤖</span>
      <span>{count} AI call{count === 1 ? '' : 's'} this session</span>
      {overBudget && <span style={{ color: COLORS.amber, fontWeight: 600 }}>· High usage</span>}
    </div>
  )
}
