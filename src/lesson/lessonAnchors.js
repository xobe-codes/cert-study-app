import { CKU_ALIASES } from '../data/ckuAliasMap.js'

const SAFE_ANCHOR = /[^a-z0-9]+/g

/** Map a synonym CKU id onto the canonical one the lessons render. */
export function canonicalCkuId(ckuId) {
  if (!ckuId) return ckuId
  const key = String(ckuId).toUpperCase()
  return CKU_ALIASES[key] || ckuId
}

export function lessonSectionAnchor(objectiveId, section = 'plain') {
  return `lesson-${String(objectiveId || 'unknown').toLowerCase().replace(SAFE_ANCHOR, '-')}-${String(section).toLowerCase().replace(SAFE_ANCHOR, '-')}`
}

export function lessonCkuAnchor(objectiveId, ckuId) {
  return lessonSectionAnchor(objectiveId, `concept-${canonicalCkuId(ckuId) || 'overview'}`)
}

export function primaryLessonAnchor(objectiveId, ckuIds = []) {
  return ckuIds[0] ? lessonCkuAnchor(objectiveId, ckuIds[0]) : lessonSectionAnchor(objectiveId)
}

/**
 * Pick an anchor that is actually on the page.
 *
 * Questions carry a wider CKU vocabulary than the lessons define, so the
 * preferred anchor often names a concept this lesson does not render. The
 * "Review the exact lesson concept" CTA used to scroll to a missing element and
 * silently do nothing. Try the preferred anchor, then the question's other
 * concepts, then the concepts block, then the top of the lesson.
 *
 * @param exists predicate telling whether an id is present in the document
 */
export function resolveLessonAnchor(token, objectiveId, exists) {
  const seen = new Set()
  const candidates = []
  const push = (id) => {
    if (id && !seen.has(id)) { seen.add(id); candidates.push(id) }
  }

  push(token?.lessonAnchor)
  for (const ckuId of token?.ckuIds || []) push(lessonCkuAnchor(objectiveId, ckuId))
  push(lessonSectionAnchor(objectiveId, 'concepts'))
  push(lessonSectionAnchor(objectiveId, 'plain'))

  return candidates.find(id => exists(id)) || null
}
