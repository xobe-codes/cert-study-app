import {
  explanationBodyFromReading,
  explanationBodyFromAi,
  resolveBigTakeaway,
  resolveAiTakeaway,
} from '../lesson/explanationFormat.js'

function joinSpeechParts(parts) {
  return parts.filter(p => String(p || '').trim()).join(' ')
}

/** Join bullet strings for section-level TTS. */
export function bulletsToSpeech(items, max = 6) {
  return (items || []).slice(0, max).filter(Boolean).join('. ')
}

/** Plain-text script for curated lesson reading at the active tier. */
export function buildCuratedReadingSpeech(reading, tier = 'intermediate') {
  if (!reading) return ''
  const body = explanationBodyFromReading(reading, tier)
  const takeaway = resolveBigTakeaway(reading)
  const keyPoints = (reading.keyPoints || []).slice(0, 3)
  const parts = [body]
  if (takeaway && stripCompare(takeaway) !== stripCompare(body)) {
    parts.push(`Key takeaway. ${takeaway}`)
  }
  if (keyPoints.length) parts.push(`Key points. ${keyPoints.join('. ')}`)
  return joinSpeechParts(parts)
}

/** Plain-text script for premium AI-generated lesson explanations. */
export function buildAiReadingSpeech(data) {
  if (!data) return ''
  const body = explanationBodyFromAi(data)
  const takeaway = resolveAiTakeaway(data)
  const keyPoints = (data.keyPoints || []).slice(0, 3)
  const parts = [body]
  if (takeaway && stripCompare(takeaway) !== stripCompare(body)) {
    parts.push(`Key takeaway. ${takeaway}`)
  }
  if (keyPoints.length) parts.push(`Key points. ${keyPoints.join('. ')}`)
  return joinSpeechParts(parts)
}

function stripCompare(text) {
  return String(text || '').replace(/\*\*/g, '').trim().toLowerCase()
}
