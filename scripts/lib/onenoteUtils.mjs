import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
export const ROOT = join(__dirname, '..', '..')
export const ONENOTE_RAW = join(ROOT, 'data', 'onenote', 'raw')
export const ONENOTE_NORMALIZED = join(ROOT, 'data', 'onenote', 'normalized')
export const ONENOTE_COMPILED = join(ROOT, 'data', 'onenote', 'compiled')

const TIMESTAMP_RE = /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),/i
const OCR_WORD_RE = /\b[a-zA-Z]\s[a-zA-Z]\s[a-zA-Z]\s[a-zA-Z]/
const OCR_FRAGMENT_RE = /^[A-Za-z](\s[A-Za-z]){4,}$/

export function resolveOneNoteDir() {
  const env = process.env.ONENOTE_EXPORT_DIR
  if (env && existsSync(env)) return env
  const documents = join(homedir(), 'Documents', 'markdown')
  if (existsSync(documents)) return documents
  const home = join(homedir(), 'onenote-export', 'markdown')
  if (existsSync(home)) return home
  if (existsSync(ONENOTE_RAW) && readdirSync(ONENOTE_RAW).some(f => f.endsWith('.md'))) return ONENOTE_RAW
  const fixtures = join(ROOT, 'data', 'onenote', 'fixtures')
  if (existsSync(fixtures)) return fixtures
  return ONENOTE_RAW
}

/** Prefer synced raw/ copy; fall back to external export dir. */
export function resolveImportDir() {
  if (existsSync(ONENOTE_RAW) && readdirSync(ONENOTE_RAW).some(f => f.endsWith('.md'))) return ONENOTE_RAW
  return resolveOneNoteDir()
}

export function loadJson(path, fallback = null) {
  if (!existsSync(path)) return fallback
  return JSON.parse(readFileSync(path, 'utf8'))
}

export function normalizeObjectiveId(raw, crosswalk = {}) {
  if (!raw) return null
  const id = String(raw).trim()
  return crosswalk[id] || id
}

export function extractExamTopics(text, crosswalk = {}) {
  const found = new Set()
  const patterns = [
    /Exam Topic\s+([0-9]+\.[0-9]+)/gi,
    /exam (?:topic|objective)\s+([0-9]+\.[0-9]+)/gi,
    /\*\*([0-9]+\.[0-9]+)\*\*/g,
  ]
  for (const re of patterns) {
    for (const m of text.matchAll(re)) {
      const id = normalizeObjectiveId(m[1], crosswalk)
      if (/^[1-6]\.[0-9]+$/.test(id)) found.add(id)
    }
  }
  return [...found]
}

export function slugify(name) {
  return name.replace(/\.md$/i, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function cleanLine(line) {
  return line
    .replace(/\u00a0/g, ' ')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function isOcrSuspect(line) {
  const t = cleanLine(line)
  if (!t || t.length < 8) return false
  if (TIMESTAMP_RE.test(t)) return false
  if (OCR_WORD_RE.test(t)) return true
  if (OCR_FRAGMENT_RE.test(t)) return true
  const words = t.split(/\s+/)
  const broken = words.filter(w => w.length === 1 && /[a-zA-Z]/.test(w)).length
  if (words.length >= 4 && broken / words.length > 0.45) return true
  return false
}

export function stripMarkdownNoise(text) {
  return text
    .split('\n')
    .filter(line => !TIMESTAMP_RE.test(line.trim()))
    .map(line => line.replace(/\*\*/g, '').replace(/^#+\s*/, '').trim())
    .join('\n')
}

/** Parse OneNote lesson markdown into structured sections. */
export function parseOneNoteMarkdown(raw, filename) {
  const lines = raw.split('\n')
  const warnings = []
  const sections = []
  let current = { heading: 'intro', lines: [] }
  const learningOutcomes = []
  const keyRules = []
  const bullets = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (isOcrSuspect(line)) {
      warnings.push({ line: i + 1, text: cleanLine(line), type: 'ocr_suspect' })
      continue
    }
    const h2 = line.match(/^##\s+(.+)/)
    if (h2) {
      if (current.lines.length) sections.push({ ...current, text: current.lines.join('\n').trim() })
      current = { heading: cleanLine(h2[1]), lines: [] }
      continue
    }
    const h1 = line.match(/^#\s+(.+)/)
    if (h1 && !filename.includes('Table of Contents')) {
      if (current.lines.length) sections.push({ ...current, text: current.lines.join('\n').trim() })
      current = { heading: 'title', lines: [cleanLine(h1[1])] }
      continue
    }
    const bullet = line.match(/^\s*[-*]\s+(.+)/)
    if (bullet) {
      const b = cleanLine(bullet[1])
      bullets.push(b)
      if (/lesson purpose|should understand/i.test(current.heading)) learningOutcomes.push(b)
    }
    if (/Key Rule|Exam-Critical|Core Distinction|Must Memorize/i.test(line)) {
      keyRules.push(cleanLine(line.replace(/\*\*/g, '')))
    }
    current.lines.push(line)
  }
  if (current.lines.length) sections.push({ ...current, text: current.lines.join('\n').trim() })

  const purpose = sections.find(s => /lesson purpose/i.test(s.heading))
  const bodySections = sections.filter(s => s !== purpose && s.heading !== 'title')

  const operatorParts = bodySections
    .filter(s => /what .+ is|why .+ exists|operation|fundamentals/i.test(s.heading))
    .map(s => stripMarkdownNoise(s.text))
    .filter(Boolean)

  const operatorSummary = operatorParts
    .join(' ')
    .split(/(?<=[.!?])\s+/)
    .filter(s => s.length > 20 && !isOcrSuspect(s))
    .slice(0, 3)
    .join(' ')
    .slice(0, 480)

  const keyPoints = bullets
    .filter(b => b.length > 12 && !isOcrSuspect(b))
    .slice(0, 8)

  const examTraps = keyRules
    .filter(t => t.length > 10)
    .slice(0, 6)
    .map(t => ({ trap: t, correction: t }))

  const title = sections.find(s => s.heading === 'title')?.text?.split('\n')[0]
    || filename.replace(/\.md$/, '')

  return {
    filename,
    slug: slugify(filename),
    title: cleanLine(title || ''),
    sections,
    learningOutcomes,
    operatorSummary,
    keyPoints,
    examTraps,
    warnings,
  }
}

export function compressToTier(text, maxSentences = 2) {
  if (!text) return ''
  return text
    .split(/(?<=[.!?])\s+/)
    .filter(s => s.trim().length > 8)
    .slice(0, maxSentences)
    .join(' ')
    .trim()
}

export function truncateWords(text = '', max = 28) {
  const words = String(text).replace(/\*\*/g, '').trim().split(/\s+/).filter(Boolean)
  if (words.length <= max) return words.join(' ')
  return words.slice(0, max).join(' ').replace(/[,;]$/, '') + '.'
}

export function buildReadingTiers(parsed, examBoundary = '') {
  const op = parsed.operatorSummary || ''
  const points = parsed.keyPoints || []
  const beginner = compressToTier(op, 2) || compressToTier(points[0] || '', 1)
  const intermediate = [compressToTier(op, 3), ...points.slice(0, 2)].filter(Boolean).join(' ').slice(0, 520)
  const examReady = examBoundary
    || [compressToTier(op, 1), points.find(p => /exam|must|know|remember/i.test(p))].filter(Boolean).join(' ').slice(0, 280)
  const bigTakeaway = truncateWords(compressToTier(op, 1) || compressToTier(points[0] || '', 1), 28)
  return { tiers: { beginner, intermediate, examReady }, bigTakeaway }
}
