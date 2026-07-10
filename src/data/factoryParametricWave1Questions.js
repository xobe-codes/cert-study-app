/** Factory wave — bank-wide parametric + pattern-clone expansions (waves 1–2). */
import { CCNA_PARAMETRIC_FAMILIES } from './parametric/ccnaParametricFamilies.js'
import { CCNA_PARAMETRIC_FAMILIES_WAVE2 } from './parametric/ccnaParametricFamiliesWave2.js'
import { expandFamiliesToObjectiveMap } from './parametric/parametricEngine.js'

function mergeObjectiveMaps(...maps) {
  const out = {}
  for (const map of maps) {
    for (const [oid, list] of Object.entries(map || {})) {
      if (!out[oid]) out[oid] = []
      out[oid].push(...list)
    }
  }
  return out
}

export const ALL_PARAMETRIC_FAMILIES = [
  ...CCNA_PARAMETRIC_FAMILIES,
  ...CCNA_PARAMETRIC_FAMILIES_WAVE2,
]

export const FACTORY_PARAMETRIC_WAVE1_QUESTIONS = mergeObjectiveMaps(
  expandFamiliesToObjectiveMap(CCNA_PARAMETRIC_FAMILIES),
  expandFamiliesToObjectiveMap(CCNA_PARAMETRIC_FAMILIES_WAVE2),
)
