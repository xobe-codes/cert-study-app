import React from 'react'
import { COLORS, styles } from '../../ui/appTheme.js'
import { getStemReplayLab } from './stemReplayLabs.js'
import { recordLabOutcome } from '../../lab/labOutcome.js'

/** Small banner CTA — open the mapped lab after a missed high-traffic question. */
export default function StemReplayCTA({ questionId, objectiveId, domainId, ckuIds, trapId, onOpenLab }) {
  if (!questionId || !onOpenLab) return null
  const replay = getStemReplayLab(questionId, { objectiveId, domainId, ckuIds, trapId })
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
      onClick={() => {
        recordLabOutcome('user_opened_lab_remediation', replay.lab, {
          surface: 'wrong-answer', questionId, trapId,
          ckuId: ckuIds?.find(id => replay.lab.ckuIds?.includes(id)),
        })
        onOpenLab(replay.labId)
      }}
    >
      Fix this in the lab → {replay.lab.title}
    </button>
  )
}
