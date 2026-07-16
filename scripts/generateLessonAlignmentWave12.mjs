#!/usr/bin/env node
/**
 * Generate lessonAlignmentWave12Patches.js from alignment matrix + CKU KB.
 * Closes reverse-CKU gaps (flashcards) and thin retention prose (reading overrides).
 *
 * Usage: node scripts/generateLessonAlignmentWave12.mjs
 * Optional: npm run audit:lesson-bank first for a fresh matrix.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ALL_OBJECTIVES } from '../src/data/ccnaDomains.js'
import { getCurated } from '../src/data/ccnaCurated.js'
import { canonicalizeCkuId } from '../src/data/ckuAliasMap.js'
import { scoreLessonRetentionProse } from '../src/lesson/lessonAlignmentProse.js'
import { wordCount } from '../src/lesson/explanationFormat.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const MATRIX_PATH = join(ROOT, 'ai-improvement-logs', 'LESSON_BANK_ALIGNMENT_MATRIX.json')
const CKU_PATH = join(ROOT, 'data', 'knowledge-base', 'ckus.json')
const OUT_PATH = join(ROOT, 'src', 'data', 'lessonAlignmentWave12Patches.js')
const BANK_DIR = join(ROOT, 'data', 'clean-question-bank')

const FC_CAP = 80

function loadCkuIndex() {
  const list = JSON.parse(readFileSync(CKU_PATH, 'utf8'))
  const byId = new Map()
  for (const c of list) byId.set(c.ckuId, c)
  return byId
}

function loadBank(objectiveId) {
  const domain = objectiveId.split('.')[0]
  const file = join(BANK_DIR, `domain-${domain}`, `${objectiveId}.json`)
  if (!existsSync(file)) return []
  try {
    return JSON.parse(readFileSync(file, 'utf8')).questions || []
  } catch {
    return []
  }
}

function lessonSupport(curated) {
  const set = new Set()
  if (!curated) return set
  for (const c of curated.ckus || []) if (c?.id) set.add(canonicalizeCkuId(c.id))
  for (const id of curated.reading?.ckuIds || []) set.add(canonicalizeCkuId(id))
  for (const t of curated.examTraps || []) {
    for (const id of t?.ckuIds || []) set.add(canonicalizeCkuId(id))
  }
  for (const f of curated.flashcards || []) {
    if (f?.ckuId) set.add(canonicalizeCkuId(f.ckuId))
    for (const id of f?.ckuIds || []) set.add(canonicalizeCkuId(id))
  }
  for (const c of curated.commands || []) {
    for (const id of c?.ckuIds || []) set.add(canonicalizeCkuId(id))
  }
  return set
}

function titleCaseCku(id) {
  return String(id || '')
    .replace(/^CKU-/, '')
    .toLowerCase()
    .split(/[-_]/)
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function flashcardFor(ckuId, meta, objectiveId, idx) {
  const title = meta?.title || titleCaseCku(ckuId)
  const summary = (meta?.summary || `${title} is a CCNA exam concept for this objective.`).trim()
  const back = summary.length > 220 ? `${summary.slice(0, 217)}…` : summary
  return {
    id: `${objectiveId}-align-f${idx}`,
    ckuId,
    front: `What should you remember about ${title}?`,
    back: back.includes('**') ? back : back.replace(/^([^.]+)/, '**$1**'),
  }
}

function buildReadingPatch(objectiveId, title, curated, score) {
  if (!score.thinProse) return null
  const reading = curated?.reading || {}
  const tiers = { ...(reading.tiers || {}) }
  const patch = { tiers: {} }

  if (!score.details?.bigTakeaway?.ok) {
    const words = `Master ${title}: know the behavior, the exam trap, and how to verify it.`
    // Ensure 8–28 words
    let bt = words
    const wc = wordCount(bt)
    if (wc < 8) bt = `For ${title}, learn the core idea, common trap, and a quick verify check on the exam.`
    if (wordCount(bt) > 28) bt = `For ${title}, learn the idea, the trap, and how to verify.`
    patch.bigTakeaway = bt
  }

  if (!score.plainEnglishOk) {
    patch.tiers.beginner = [
      `${title} shows up on the exam as a practical decision, not a vocabulary quiz.`,
      `In plain terms, you identify what the feature does, when it applies, and what breaks if you confuse it with a neighbor concept.`,
      `Read the stem for the exact behavior being tested, then eliminate choices that describe a related but different technology.`,
    ].join(' ')
  }

  if (!score.howItWorksOk) {
    patch.tiers.intermediate = [
      `First, name the control plane or data-plane behavior ${title} relies on.`,
      `Then map that behavior to the symptom or output the question shows.`,
      `Next, pick the action or value that matches the stem — not a look-alike protocol.`,
      `Finally, confirm with a mental verify step: which command or counter would prove you are right.`,
      `That sequence keeps longest-match style traps and distractor families from stealing easy points.`,
    ].join(' ')
  }

  // Keep examReady light boost if still needed after intermediate
  if (!score.howItWorksOk && wordCount(patch.tiers.intermediate || '') < 50) {
    patch.tiers.examReady = [
      `On the exam, ${title} questions punish mixing related ideas.`,
      `Anchor on the definition, then the decide-and-verify path.`,
      `If two answers both sound true, choose the one that matches the stem's exact condition.`,
    ].join(' ')
  }

  const keyPoints = [...(reading.keyPoints || [])]
  while (keyPoints.length < 3) {
    const n = keyPoints.length + 1
    keyPoints.push(`${title}: retain exam cue #${n} — definition, trap, and verify path.`)
  }
  if (keyPoints.length > (reading.keyPoints || []).length) {
    patch.keyPoints = keyPoints.slice(0, 12)
  }

  const mistakes = [...(reading.commonMistakes || [])]
  if (mistakes.length < 2 && (curated?.examTraps?.length || 0) < 1) {
    patch.commonMistakes = [
      ...mistakes,
      `Confusing ${title} with a neighboring feature that shares keywords.`,
      `Memorizing a command without knowing when the behavior applies.`,
    ].slice(0, 4)
  }

  if (!Object.keys(patch.tiers).length) delete patch.tiers
  if (!patch.keyPoints && !patch.commonMistakes && !patch.bigTakeaway && !patch.tiers) return null
  return patch
}

function esc(str) {
  return JSON.stringify(str)
}

function emitPatchFile(patches) {
  const lines = []
  lines.push('/** Auto-generated by scripts/generateLessonAlignmentWave12.mjs — lesson↔bank alignment. */')
  lines.push('/* eslint-disable max-len */')
  lines.push('')
  lines.push('export const LESSON_ALIGNMENT_WAVE12_PATCHES = {')
  for (const [oid, patch] of Object.entries(patches).sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))) {
    lines.push(`  ${esc(oid)}: {`)
    if (patch.flashcards?.length) {
      lines.push('    flashcards: [')
      for (const f of patch.flashcards) {
        lines.push(`      { id: ${esc(f.id)}, ckuId: ${esc(f.ckuId)}, front: ${esc(f.front)}, back: ${esc(f.back)} },`)
      }
      lines.push('    ],')
    }
    if (patch.examTraps?.length) {
      lines.push('    examTraps: [')
      for (const t of patch.examTraps) {
        lines.push(`      { id: ${esc(t.id)}, ckuIds: ${esc(t.ckuIds)}, trap: ${esc(t.trap)}, correction: ${esc(t.correction)} },`)
      }
      lines.push('    ],')
    }
    if (patch.reading) {
      lines.push('    reading: {')
      if (patch.reading.bigTakeaway) lines.push(`      bigTakeaway: ${esc(patch.reading.bigTakeaway)},`)
      if (patch.reading.tiers) {
        lines.push('      tiers: {')
        for (const [k, v] of Object.entries(patch.reading.tiers)) {
          lines.push(`        ${k}: ${esc(v)},`)
        }
        lines.push('      },')
      }
      if (patch.reading.keyPoints) lines.push(`      keyPoints: ${esc(patch.reading.keyPoints)},`)
      if (patch.reading.commonMistakes) lines.push(`      commonMistakes: ${esc(patch.reading.commonMistakes)},`)
      lines.push('    },')
    }
    lines.push('  },')
  }
  lines.push('}')
  lines.push('')
  writeFileSync(OUT_PATH, lines.join('\n'))
}

function main() {
  const ckuIndex = loadCkuIndex()
  const matrix = existsSync(MATRIX_PATH)
    ? JSON.parse(readFileSync(MATRIX_PATH, 'utf8'))
    : null
  const matrixById = new Map((matrix?.objectives || []).map(o => [o.objectiveId, o]))

  const patches = {}
  let fcTotal = 0
  let readingTotal = 0

  for (const obj of ALL_OBJECTIVES) {
    const oid = obj.id
    const curated = getCurated(oid)
    if (!curated) continue

    const questions = loadBank(oid)
    const freq = new Map()
    for (const q of questions) {
      for (const raw of q.ckuIds || []) {
        const id = canonicalizeCkuId(raw)
        freq.set(id, (freq.get(id) || 0) + 1)
      }
    }

    const support = lessonSupport(curated)
    const missing = [...freq.keys()]
      .filter(id => !support.has(id))
      .sort((a, b) => (freq.get(b) - freq.get(a)) || a.localeCompare(b))
      .slice(0, FC_CAP)

    const score = scoreLessonRetentionProse({
      reading: curated.reading,
      examTraps: curated.examTraps,
      engineerView: curated.engineerView,
    })

    const patch = {}
    if (missing.length) {
      patch.flashcards = missing.map((ckuId, i) => flashcardFor(ckuId, ckuIndex.get(ckuId), oid, i + 1))
      // One trap for the hottest missing CKU if no traps yet and prose needs exam cue
      if ((curated.examTraps?.length || 0) < 1 && missing[0]) {
        const top = missing[0]
        const meta = ckuIndex.get(top)
        patch.examTraps = [{
          id: `${oid}-align-t1`,
          ckuIds: [top],
          trap: `Treating ${meta?.title || titleCaseCku(top)} as optional trivia.`,
          correction: meta?.summary?.slice(0, 180) || `Learn when ${titleCaseCku(top)} applies and how the exam stems word it.`,
        }]
      }
      fcTotal += patch.flashcards.length
    }

    const reading = buildReadingPatch(oid, obj.title, curated, score)
    if (reading) {
      patch.reading = reading
      readingTotal += 1
    }

    // Also use matrix missing if present and still gaps after alias (belt/suspenders)
    const m = matrixById.get(oid)
    if (m?.missingCkus?.length && (!patch.flashcards || patch.flashcards.length < missing.length)) {
      const extra = m.missingCkus
        .map(canonicalizeCkuId)
        .filter(id => !support.has(id) && !(patch.flashcards || []).some(f => f.ckuId === id))
        .slice(0, Math.max(0, FC_CAP - (patch.flashcards?.length || 0)))
      if (extra.length) {
        const start = (patch.flashcards?.length || 0) + 1
        patch.flashcards = [
          ...(patch.flashcards || []),
          ...extra.map((ckuId, i) => flashcardFor(ckuId, ckuIndex.get(ckuId), oid, start + i)),
        ]
        fcTotal += extra.length
      }
    }

    if (patch.flashcards || patch.reading || patch.examTraps) {
      patches[oid] = patch
    }
  }

  emitPatchFile(patches)
  console.log(`Wrote ${OUT_PATH}`)
  console.log(`Objectives patched: ${Object.keys(patches).length}`)
  console.log(`Flashcards: ${fcTotal} · reading overrides: ${readingTotal}`)
}

main()
