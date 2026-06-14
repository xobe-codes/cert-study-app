/** Pilot objectives with authored short Explanation + Big Takeaway content. */
export const EXPLANATION_PILOT_IDS = new Set([
  '3.2',
  '4.1', '4.2', '4.3', '4.4', '4.5', '4.6', '4.7', '4.8', '4.9', '4.10',
])

const COMMAND_IN_BODY = /`(?:show|ip|ntp|clock|logging|access-list|standby|channel-group)\b/i

export function countSentences(text = '') {
  const cleaned = String(text).replace(/\*\*/g, '').trim()
  if (!cleaned) return 0
  return cleaned.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0).length
}

export function wordCount(text = '') {
  return String(text).replace(/\*\*/g, '').trim().split(/\s+/).filter(Boolean).length
}

/** Explanation body for curated reading at the active tier. */
export function explanationBodyFromReading(reading, tier = 'intermediate') {
  if (!reading) return ''
  const tiers = reading.tiers || {}
  return tiers[tier] || tiers.intermediate || tiers.beginner || reading.definition || ''
}

/** Resolve one-sentence takeaway: authored → first key point → definition lead. */
export function resolveBigTakeaway(source = {}) {
  if (source.bigTakeaway?.trim()) return source.bigTakeaway.trim()
  if (source.keyPoints?.[0]?.trim()) return source.keyPoints[0].trim()
  const def = source.definition?.trim()
  if (!def) return null
  const first = def.split(/(?<=[.!?])\s+/)[0]
  return first || def
}

/** AI explanation body (definition field holds short prose). */
export function explanationBodyFromAi(data = {}) {
  return data.definition?.trim() || ''
}

export function resolveAiTakeaway(data = {}) {
  return resolveBigTakeaway({
    bigTakeaway: data.bigTakeaway,
    keyPoints: data.keyPoints,
    definition: data.definition,
  })
}

/** Validation for pilot reading explanations. Returns string[] errors. */
export function validateReadingExplanation(reading, objectiveId, { pilotOnly = true } = {}) {
  const errors = []
  if (!reading) return errors
  if (pilotOnly && !EXPLANATION_PILOT_IDS.has(objectiveId)) return errors

  if (!reading.bigTakeaway?.trim()) {
    errors.push(`${objectiveId}: missing bigTakeaway`)
  } else if (wordCount(reading.bigTakeaway) > 28) {
    errors.push(`${objectiveId}: bigTakeaway too long (${wordCount(reading.bigTakeaway)} words)`)
  }

  for (const [tier, text] of Object.entries(reading.tiers || {})) {
    const sentences = countSentences(text)
    if (sentences > 5) errors.push(`${objectiveId}: tiers.${tier} has ${sentences} sentences (max 5)`)
    if (COMMAND_IN_BODY.test(text)) errors.push(`${objectiveId}: tiers.${tier} contains commands (move to Key Points)`)
  }

  const mistakes = (reading.commonMistakes || []).join(' ').toLowerCase()
  for (const [, text] of Object.entries(reading.tiers || {})) {
    const lower = String(text).toLowerCase()
    for (const m of reading.commonMistakes || []) {
      const snippet = String(m).toLowerCase().slice(0, 40)
      if (snippet.length > 20 && lower.includes(snippet)) {
        errors.push(`${objectiveId}: tier duplicates commonMistakes`)
        break
      }
    }
    if (mistakes && lower.length > 80 && mistakes.split('. ').some(ms => ms.length > 25 && lower.includes(ms.slice(0, 30)))) {
      errors.push(`${objectiveId}: tier overlaps commonMistakes phrasing`)
      break
    }
  }

  return errors
}
