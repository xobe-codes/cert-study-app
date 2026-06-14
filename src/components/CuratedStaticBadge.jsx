import React from 'react'
import { hasCuratedQuestions, hasCuratedReading } from '../data/ccnaCurated.js'
import { getObjectiveDifficulty } from '../curatedDisplay.js'
import { COLORS } from '../ui/appTheme.js'
import DifficultyPill from './DifficultyPill.jsx'

/** Difficulty pill + static "no API used" label for bundled curated content. */
export default function CuratedStaticBadge({
  objectiveId,
  fontSize = 10,
  noApiLabel = 'no API used',
  showNoApi = true,
}) {
  const difficulty = getObjectiveDifficulty(objectiveId)
  const isStatic = hasCuratedReading(objectiveId) || hasCuratedQuestions(objectiveId)
  if (!isStatic) return null

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
      <DifficultyPill difficulty={difficulty} fontSize={fontSize} style={{ marginLeft: 0 }} />
      {showNoApi && (
        <span style={{ fontSize: fontSize <= 9 ? 'var(--ccna-type-micro)' : 'var(--ccna-type-xs)', color: COLORS.silverMid }}>{noApiLabel}</span>
      )}
    </span>
  )
}
