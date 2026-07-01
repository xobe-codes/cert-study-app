import React from 'react'
import { COLORS, styles } from '../../ui/appTheme.js'
import { getStemReplayLab } from './stemReplayLabs.js'

/** Small banner CTA — open the mapped lab after a missed high-traffic question. */
export default function StemReplayCTA({ questionId, onOpenLab }) {
  if (!questionId || !onOpenLab) return null
  const replay = getStemReplayLab(questionId)
  if (!replay) return null

  return (
    <button
      type="button"
      className="ccna-stem-replay-cta"
      style={{
        ...styles.secondaryBtn,
        marginTop: 10,
        width: '100%',
        borderColor: COLORS.skyBorder,
        background: COLORS.skyDim,
        color: COLORS.sky,
      }}
      onClick={() => onOpenLab(replay.labId)}
    >
      Fix this in the lab → {replay.lab.title}
    </button>
  )
}
