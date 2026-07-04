import { getStemReplayLab } from '../stemReplay/stemReplayLabs.js'
import { resolveTrapDrillCku } from '../trapDrill/trapDrillQuestions.js'

/** One ranked next step from placement debrief. */
export function pickPlacementCta(report) {
  if (!report) return null

  const topTrap = report.trapMisses?.[0]
  if (topTrap?.trap) {
    const trapCku = resolveTrapDrillCku({ trapLabel: topTrap.trap })
    if (trapCku) {
      return {
        kind: 'trapDrill',
        label: `Drill trap: ${topTrap.trap}`,
        payload: { ckuId: trapCku.ckuId, trapLabel: trapCku.trapLabel },
      }
    }
  }

  const weakOid = report.weakestObjective
  if (weakOid) {
    const wrongQ = report.wrongQuestions?.find(w => w.objectiveId === weakOid)
      || report.trapMisses?.find(t => t.objectiveId === weakOid)
    const replay = wrongQ ? getStemReplayLab(wrongQ.questionId) : null
    if (replay) {
      return {
        kind: 'lab',
        label: `Lab replay · ${replay.lab.title}`,
        payload: { labId: replay.labId },
      }
    }
    return {
      kind: 'study',
      label: `Study objective ${weakOid}`,
      payload: { objectiveId: weakOid },
    }
  }

  return null
}
