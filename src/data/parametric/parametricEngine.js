/**
 * Parametric + pattern-clone expansion for CCNA quiz families.
 * Answers must be computed/table-driven — never free-form guessed.
 */

function shuffleChoices(choices, correctIndex) {
  const tagged = choices.map((text, i) => ({ text, correct: i === correctIndex }))
  for (let i = tagged.length - 1; i > 0; i--) {
    const j = (i * 17 + correctIndex * 3) % (i + 1)
    ;[tagged[i], tagged[j]] = [tagged[j], tagged[i]]
  }
  return {
    choices: tagged.map(t => t.text),
    correctIndex: tagged.findIndex(t => t.correct),
  }
}

/** Expand one family into quiz-shaped MC objects (no objectiveId on items). */
export function expandFamily(family) {
  if (!family?.build) return []
  const rows = family.parameters || family.clones || []
  const out = []
  let idx = 0
  for (const param of rows) {
    if (family.skip?.(param)) continue
    const built = family.build(param)
    if (!built?.question || !Array.isArray(built.choices) || built.choices.length < 2) continue
    if (typeof built.correctIndex !== 'number' || built.correctIndex < 0) continue

    const key = family.paramKey ? family.paramKey(param, idx) : String(idx + 1)
    idx += 1
    const shuffled = family.shuffle === false
      ? { choices: built.choices, correctIndex: built.correctIndex }
      : shuffleChoices(built.choices, built.correctIndex)

    out.push({
      id: `${family.idPrefix}-${key}`,
      question: built.question,
      choices: shuffled.choices,
      correctIndex: shuffled.correctIndex,
      explanation: built.explanation,
      type: built.type || family.type || 'application',
      difficulty: built.difficulty || family.difficulty || 'medium',
      concept: built.concept || family.concept,
      ckuIds: built.ckuIds || family.ckuIds || [],
      skill: built.skill || family.skill,
      parametricFamily: family.id,
      parametricKind: family.kind || (family.parameters ? 'parametric' : 'clone'),
    })
  }
  return out
}

/** Expand many families → { [objectiveId]: Question[] }. */
export function expandFamiliesToObjectiveMap(families) {
  const map = {}
  for (const family of families || []) {
    const oid = family.objectiveId
    if (!oid) continue
    const qs = expandFamily(family)
    if (!qs.length) continue
    if (!map[oid]) map[oid] = []
    map[oid].push(...qs)
  }
  return map
}

export function countExpandedQuestions(map) {
  return Object.values(map || {}).reduce((n, list) => n + (list?.length || 0), 0)
}

/** IPv4 dotted mask for prefix length 0–32. */
export function dottedMaskFromPrefix(prefix) {
  const p = Number(prefix)
  let n = p === 0 ? 0 : (~0 >>> 0) << (32 - p)
  n = n >>> 0
  return [
    (n >>> 24) & 255,
    (n >>> 16) & 255,
    (n >>> 8) & 255,
    n & 255,
  ].join('.')
}

export function usableHostsForPrefix(prefix) {
  const hostBits = 32 - Number(prefix)
  if (hostBits <= 0) return 0
  if (hostBits === 1) return 2 // /31 point-to-point (RFC 3021)
  return (2 ** hostBits) - 2
}

export function blockSizeForPrefix(prefix) {
  const p = Number(prefix)
  if (p < 24 || p > 30) return null
  return 2 ** (32 - p)
}
