/** Runtime reading quality — protect hand-authored tiers, enrich thin factory content. */

function stripMd(text) {
  return String(text || '').replace(/\*\*/g, '').trim()
}

export function wordCount(text) {
  return stripMd(text).split(/\s+/).filter(Boolean).length
}

export function tierWordCount(tiers = {}) {
  return wordCount([tiers.beginner, tiers.intermediate, tiers.examReady].filter(Boolean).join(' '))
}

export function isDraftKbTierText(text) {
  const t = String(text || '').trim()
  if (/Know the core behavior:/i.test(t)) return true
  if (/^Exam Topic \d+\.\d+ —/i.test(t)) return true
  if ((t.match(/Exam Topic \d+\.\d+/gi) || []).length >= 2) return true
  return false
}

function isDraftKbTakeaway(text) {
  const t = String(text || '').trim()
  if (!t) return false
  if (/^Exam Topic \d+\.\d+ —/i.test(t)) return true
  if (/Know the core behavior:/i.test(t)) return true
  return false
}

function isDraftKbKeyPoint(text) {
  return /^Exam Topic \d+\.\d+ —/i.test(String(text || '').trim())
}

function plainForTier(text) {
  return stripMd(text).replace(/`[^`]+`/g, '').replace(/\s+/g, ' ').trim()
}

function limitSentences(text, max = 4) {
  const parts = plainForTier(text).split(/(?<=[.!?])\s+/).filter(Boolean)
  return parts.slice(0, max).join(' ')
}

export function isSubstantialAuthoredTiers(tiers) {
  if (!tiers?.beginner || !tiers?.intermediate || !tiers?.examReady) return false
  for (const text of [tiers.beginner, tiers.intermediate, tiers.examReady]) {
    if (isDraftKbTierText(text)) return false
  }
  if (wordCount(tiers.examReady) >= 35 && wordCount(tiers.intermediate) >= 28) return true
  return tierWordCount(tiers) >= 100 && wordCount(tiers.examReady) >= 30
}

/** Merge KB compiled patch without clobbering quality hand-authored tiers. */
export function mergeKbReadingPatch(baseReading, kbPatch) {
  if (!kbPatch || !baseReading) return baseReading

  const kbTiersAreDraft = ['beginner', 'intermediate', 'examReady'].some(
    tier => isDraftKbTierText(kbPatch.tiers?.[tier]),
  )

  const keepBaseTiers = isSubstantialAuthoredTiers(baseReading.tiers)
    || kbPatch.needsReview
    || kbTiersAreDraft

  const tiers = keepBaseTiers
    ? { ...baseReading.tiers }
    : { ...baseReading.tiers, ...kbPatch.tiers }

  const mergedKeyPoints = keepBaseTiers
    ? baseReading.keyPoints
    : (kbPatch.keyPoints?.length
      ? [...new Set([
        ...(baseReading.keyPoints || []),
        ...kbPatch.keyPoints.filter(kp => !isDraftKbKeyPoint(kp)),
      ])].slice(0, 12)
      : baseReading.keyPoints)

  const bigTakeaway = (keepBaseTiers || isDraftKbTakeaway(kbPatch.bigTakeaway))
    ? baseReading.bigTakeaway
    : (kbPatch.bigTakeaway || baseReading.bigTakeaway)

  return {
    ...baseReading,
    tiers,
    keyPoints: mergedKeyPoints,
    ...(bigTakeaway ? { bigTakeaway } : {}),
  }
}

function joinSentences(parts, maxWords = 90) {
  const text = parts.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim()
  const words = text.split(/\s+/).filter(Boolean)
  if (words.length <= maxWords) return text
  return `${words.slice(0, maxWords).join(' ')}…`
}

function expandThinExamReady(reading, pack = {}) {
  const ckus = pack.ckus || []
  const def = plainForTier(reading?.definition)
  const ckuSummaries = [...new Set(ckus.map(c => plainForTier(c.summary)).filter(Boolean))]
  const keyPlain = [...new Set((reading?.keyPoints || []).map(plainForTier).filter(Boolean))]
  const advanced = plainForTier(reading?.advanced)
  const realWorld = plainForTier(reading?.realWorld)
  const title = pack.title || ''
  const titleLead = title
    ? `For CCNA, ${title.replace(/^(Configure and verify|Configure|Describe|Explain|Compare|Troubleshoot|Differentiate|Interpret)\s+/i, '').toLowerCase()} requires knowing purpose, typical configuration, and how to verify it works.`
    : ''

  const parts = [
    def,
    ...ckuSummaries.filter(s => s !== def),
    ...keyPlain.filter(s => s !== def && !ckuSummaries.includes(s)),
    advanced && advanced !== def ? advanced : '',
    realWorld,
    titleLead,
  ].filter(Boolean)

  return limitSentences(joinSentences(parts, 140), 5)
}

/** Synthesize richer tier prose from CKUs and definition when tiers are thin. */
export function enrichReadingTiers(reading, pack = {}) {
  const tiers = { ...(reading?.tiers || {}) }
  if (isSubstantialAuthoredTiers(tiers)) return tiers

  const ckus = pack.ckus || []
  const def = plainForTier(reading?.definition)
  const ckuSummaries = ckus.map(c => plainForTier(c.summary)).filter(Boolean)
  const firstCku = ckuSummaries[0] || ''
  const ckuTitles = ckus.map(c => c.title).filter(Boolean)

  const examThin = wordCount(tiers.examReady) < 50 || isDraftKbTierText(tiers.examReady)
  const needsEnrich = examThin
    || isDraftKbTierText(tiers.intermediate)
    || tierWordCount(tiers) < 120

  if (!needsEnrich) return tiers

  if (wordCount(tiers.beginner) < 40) {
    tiers.beginner = limitSentences(joinSentences([
      def || (ckus[0] ? `${ckus[0].title}: ${firstCku}` : ''),
      plainForTier(reading?.realWorld),
    ], 80), 3)
  }

  if (wordCount(tiers.intermediate) < 60) {
    tiers.intermediate = limitSentences(joinSentences([
      def,
      ckuSummaries.slice(0, 2).join(' '),
      ckuTitles.length > 1 ? `Covers ${ckuTitles.slice(0, 4).join(', ')}.` : '',
      plainForTier(reading?.advanced),
    ], 95), 4)
  }

  if (examThin) {
    tiers.examReady = expandThinExamReady(reading, pack)
  }

  return tiers
}

export function ensureBigTakeaway(reading) {
  if (!reading) return reading
  if (reading.bigTakeaway?.trim()) return reading
  const takeaway = reading.keyPoints?.[0] || stripMd(reading.definition)?.split(/(?<=[.!?])\s+/)[0]
  if (!takeaway) return reading
  return { ...reading, bigTakeaway: takeaway.slice(0, 220) }
}

/** Configure / verify objectives benefit from expanded real-world block by default. */
export function shouldDefaultOpenRealWorld(pack) {
  const title = pack?.title || ''
  if ((pack?.commands?.length || 0) >= 2) return true
  if (/configure|verify|interpret|troubleshoot|implement|describe and compare/i.test(title)) return true
  return false
}

export function finalizeReading(reading, pack) {
  if (!reading) return reading
  let next = { ...reading, tiers: enrichReadingTiers(reading, pack) }
  next = ensureBigTakeaway(next)
  return next
}
