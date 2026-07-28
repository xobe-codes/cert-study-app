const SAFE_ANCHOR = /[^a-z0-9]+/g

export function lessonSectionAnchor(objectiveId, section = 'plain') {
  return `lesson-${String(objectiveId || 'unknown').toLowerCase().replace(SAFE_ANCHOR, '-')}-${String(section).toLowerCase().replace(SAFE_ANCHOR, '-')}`
}

export function lessonCkuAnchor(objectiveId, ckuId) {
  return lessonSectionAnchor(objectiveId, `concept-${ckuId || 'overview'}`)
}

export function primaryLessonAnchor(objectiveId, ckuIds = []) {
  return ckuIds[0] ? lessonCkuAnchor(objectiveId, ckuIds[0]) : lessonSectionAnchor(objectiveId)
}
