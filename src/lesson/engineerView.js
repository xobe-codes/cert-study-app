import { getCurated } from '../data/ccnaCurated.js'

/** Engineer-facing verify/symptom layer for Study tab (when present on curated pack). */
export function getEngineerView(objectiveId) {
  return getCurated(objectiveId)?.engineerView || null
}

export function hasEngineerView(objectiveId) {
  return !!getEngineerView(objectiveId)
}
