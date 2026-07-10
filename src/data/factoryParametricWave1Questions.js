/** Factory wave — bank-wide parametric + pattern-clone expansions. */
import { CCNA_PARAMETRIC_FAMILIES } from './parametric/ccnaParametricFamilies.js'
import { expandFamiliesToObjectiveMap } from './parametric/parametricEngine.js'

export const FACTORY_PARAMETRIC_WAVE1_QUESTIONS = expandFamiliesToObjectiveMap(CCNA_PARAMETRIC_FAMILIES)
