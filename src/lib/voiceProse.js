/** Shared prose sanitizer for KB lessons and answer reviews. */

const FACT_FIXES = [
  [/IEEE standard OSPFv2/gi, 'IETF OSPFv2 (RFC 2328)'],
  [/IEEE standard\s+OSPF/gi, 'IETF OSPFv2'],
]

const HEADING_ONLY = /^(what|why|how|when|where)\s+/i
const LABEL_LINE = /^[A-Za-z][\w\s/-]{0,40}\s*:\s*/

export function stripMarkdown(text = '') {
  return String(text)
    .replace(/\*\*/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^#+\s*/gm, '')
    .replace(/^\s*[-*]\s+/gm, '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function applyFactFixes(text = '') {
  let out = text
  for (const [re, rep] of FACT_FIXES) out = out.replace(re, rep)
  return out
}

export function splitSentences(text = '') {
  return stripMarkdown(text)
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 12 && !/^[-*]/.test(s))
}

export function isHeadingFragment(s = '') {
  const t = stripMarkdown(s)
  if (!t) return true
  if (HEADING_ONLY.test(t) && !/\b(is|are|means|uses|lets|allows|forwards)\b/i.test(t)) return true
  if (LABEL_LINE.test(t) && t.split(/\s+/).length < 12) return true
  if (/^OSPF is a:\s*$/i.test(t)) return true
  return false
}

export function firstProseSentence(text = '') {
  for (const s of splitSentences(text)) {
    if (!isHeadingFragment(s)) return applyFactFixes(s)
  }
  const flat = stripMarkdown(text).replace(LABEL_LINE, '')
  if (flat.length > 20 && !isHeadingFragment(flat)) return applyFactFixes(flat)
  return ''
}

export function dedupeJoin(parts = [], maxLen = 600) {
  const seen = new Set()
  const out = []
  for (const p of parts) {
    const s = stripMarkdown(p)
    if (!s || seen.has(s.toLowerCase())) continue
    seen.add(s.toLowerCase())
    out.push(applyFactFixes(s))
  }
  return out.join(' ').slice(0, maxLen)
}

export function sanitizeBulletList(items = []) {
  return items
    .map(item => {
      let s = stripMarkdown(item)
      s = s.replace(LABEL_LINE, (m) => {
        const label = m.replace(':', '').trim()
        return `${label} — `
      })
      return applyFactFixes(s)
    })
    .filter(s => s.length > 8 && !isHeadingFragment(s))
}

export function truncateWords(text = '', max = 28) {
  const words = stripMarkdown(text).split(/\s+/).filter(Boolean)
  if (words.length <= max) return words.join(' ')
  return words.slice(0, max).join(' ').replace(/[,;]$/, '') + '.'
}

export function buildVoiceTiers({ operatorSummary = '', keyPoints = [], learningOutcomes = [], examBoundary = '' } = {}) {
  const points = sanitizeBulletList(keyPoints)
  const outcomes = sanitizeBulletList(learningOutcomes)
  const op = firstProseSentence(operatorSummary) || firstProseSentence(points.join(' '))

  const beginner = [op, firstProseSentence(points[0] || '')].filter(Boolean).slice(0, 2).join(' ')
  const intermediate = dedupeJoin([op, ...points.slice(0, 3)], 520)
  const examFromOutcome = outcomes.find(o => /exam|ccna|must|know|expect/i.test(o))
  const examReady = stripMarkdown(examBoundary)
    || examFromOutcome
    || points.find(p => /exam|must|know|remember|trap/i.test(p))
    || `Know the core behavior: ${truncateWords(op || points[0] || 'review key points', 18)}`

  let bigTakeaway = firstProseSentence(op) || firstProseSentence(points[0] || '')
  if (!bigTakeaway || isHeadingFragment(bigTakeaway)) {
    bigTakeaway = truncateWords(intermediate, 22)
  }
  bigTakeaway = truncateWords(bigTakeaway, 28)

  return {
    tiers: {
      beginner: truncateWords(beginner, 40) || bigTakeaway,
      intermediate: intermediate || beginner || bigTakeaway,
      examReady: truncateWords(examReady, 36),
    },
    bigTakeaway,
  }
}

export function rewriteStemTemplate(explanation = '', wrong = '', correctFact = '') {
  const m = explanation.match(/^\*\*(.+?)\*\*\s+does not answer .+?\.\s*(.*)$/i)
    || explanation.match(/^(.+?)\s+does not answer .+?\.\s*(.*)$/i)
  const choice = stripMarkdown(m?.[1] || wrong)
  const fact = stripMarkdown(m?.[2] || correctFact || '').trim()
  if (!choice) return stripMarkdown(explanation)
  if (fact) return `${choice} misses what this question tests. ${fact}`
  return `${choice} does not match the mechanism asked here.`
}

export function sanitizeAnswerText(text = '') {
  if (!text) return text
  let t = stripMarkdown(text)
  if (/does not answer .+ in this stem/i.test(t)) {
    t = rewriteStemTemplate(t)
  }
  return t
}

export function validateVoiceText(text, { field = 'text' } = {}) {
  const errors = []
  if (!text?.trim()) errors.push(`${field}: empty`)
  if (/\*\*/.test(text)) errors.push(`${field}: contains markdown bold`)
  if (/does not answer .+ in this stem/i.test(text)) errors.push(`${field}: template stem wording`)
  if (/^(what|why|how)\s+/i.test(stripMarkdown(text)) && field.includes('takeaway')) {
    errors.push(`${field}: heading-only takeaway`)
  }
  return errors
}
