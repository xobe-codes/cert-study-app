import React from 'react'
import { isCuratedPack } from '../curatedDisplay.js'
import { getObjectiveDifficulty } from '../curatedDisplay.js'
import { COLORS } from '../ui/appTheme.js'
import { STATIC_COPY } from '../ui/staticContentCopy.js'
import DifficultyPill from './DifficultyPill.jsx'

/** Difficulty pill + optional curated pack chip. */
export default function CuratedStaticBadge({
  objectiveId,
  fontSize = 10,
  staticLabel,
  /** @deprecated use staticLabel */
  noApiLabel,
  showBundle = false,
  /** @deprecated use showBundle */
  showStatic,
  /** @deprecated use showBundle */
  showNoApi,
  showIncluded = false,
}) {
  const difficulty = getObjectiveDifficulty(objectiveId)
  if (!isCuratedPack(objectiveId)) return null

  const label = noApiLabel || staticLabel || STATIC_COPY.badge
  const visible = showNoApi !== undefined ? showNoApi : (showStatic !== undefined ? showStatic : showBundle)

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
      {showIncluded && (
        <span style={{
          fontSize: fontSize <= 9 ? 'var(--ccna-type-micro)' : 'var(--ccna-type-xs)',
          color: COLORS.mint,
          fontWeight: 600,
        }}
        >
          included
        </span>
      )}
    </span>
  )
}
