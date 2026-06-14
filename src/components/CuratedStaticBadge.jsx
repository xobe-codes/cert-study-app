import React from 'react'
import { hasCuratedQuestions, hasCuratedReading } from '../data/ccnaCurated.js'
import { getCuratedBundleLabel, getObjectiveDifficulty } from '../curatedDisplay.js'
import { COLORS } from '../ui/appTheme.js'
import { STATIC_COPY } from '../ui/staticContentCopy.js'
import DifficultyPill from './DifficultyPill.jsx'

/** Difficulty pill + what's-included label for curated content. */
export default function CuratedStaticBadge({
  objectiveId,
  fontSize = 10,
  staticLabel,
  /** @deprecated use staticLabel */
  noApiLabel,
  showStatic = true,
  /** @deprecated use showStatic */
  showNoApi,
}) {
  const difficulty = getObjectiveDifficulty(objectiveId)
  const isStatic = hasCuratedReading(objectiveId) || hasCuratedQuestions(objectiveId)
  const label = noApiLabel || staticLabel || getCuratedBundleLabel(objectiveId) || STATIC_COPY.badge
  const visible = showNoApi !== undefined ? showNoApi : showStatic
  if (!isStatic) return null

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
      <DifficultyPill difficulty={difficulty} fontSize={fontSize} style={{ marginLeft: 0 }} />
      {visible && (
        <span style={{
          fontSize: fontSize <= 9 ? 'var(--ccna-type-micro)' : 'var(--ccna-type-xs)',
          color: COLORS.mint,
          fontWeight: 600,
          letterSpacing: 0.2,
        }}
        >
          {label}
        </span>
      )}
    </span>
  )
}
