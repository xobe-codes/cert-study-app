import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { CLEAN_QUESTIONS } from '../src/data/ccnaCleanQuestions.js'
import { canonicalizeCkuId } from '../src/data/ckuAliasMap.js'
import { LESSON_ALIGNMENT_WAVE12_PATCHES } from '../src/data/lessonAlignmentWave12Patches.js'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUTPUT = path.join(ROOT, 'src/data/lessonAlignmentWave12Patches.js')
const GENERIC = /is a CCNA exam concept for this objective/i

function oneLine(value) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function clip(value, max) {
  const text = oneLine(value)
  if (text.length <= max) return text
  const sentenceEnd = text.lastIndexOf('.', max - 1)
  const end = sentenceEnd >= Math.floor(max * 0.55) ? sentenceEnd + 1 : max - 1
  return `${text.slice(0, end).trim()}${end === max - 1 ? '…' : ''}`
}

function buildEvidenceIndex() {
  const index = new Map()
  for (const questions of Object.values(CLEAN_QUESTIONS)) {
    for (const question of questions) {
      for (const ckuId of question.ckuIds || []) {
        const canonical = canonicalizeCkuId(ckuId)
        const existing = index.get(canonical)
        if (!existing || oneLine(question.explanation).length > oneLine(existing.explanation).length) {
          index.set(canonical, question)
        }
      }
    }
  }
  return index
}

function groundedBack(question) {
  const answer = question.choices?.[question.correctIndex]
  const explanation = question.answerReview?.correct?.explanation || question.explanation
  return [
    `**Exam cue:** ${clip(question.question, 150)}`,
    `**Key response:** ${clip(answer, 110)}.`,
    `**Why:** ${clip(explanation, 230)}`,
  ].join(' ')
}

const write = process.argv.includes('--write')
const evidence = buildEvidenceIndex()
const next = structuredClone(LESSON_ALIGNMENT_WAVE12_PATCHES)
let genericCount = 0
let polishedCount = 0
const errors = []

for (const [objectiveId, patch] of Object.entries(next)) {
  for (const card of patch.flashcards || []) {
    if (!GENERIC.test(card.back)) continue
    genericCount += 1
    const question = evidence.get(canonicalizeCkuId(card.ckuId))
    if (!question) {
      errors.push(`${objectiveId}/${card.id}: no question evidence for ${card.ckuId}`)
      continue
    }
    const back = groundedBack(question)
    if (back.length < 90 || GENERIC.test(back)) {
      errors.push(`${objectiveId}/${card.id}: generated back failed quality floor`)
      continue
    }
    card.back = back
    polishedCount += 1
  }
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}

if (write) {
  const source = `export const LESSON_ALIGNMENT_WAVE12_PATCHES = ${JSON.stringify(next, null, 2)}\n`
  fs.writeFileSync(OUTPUT, source)
  console.log(`Polished ${polishedCount}/${genericCount} generic Wave12 flashcards.`)
} else {
  const remaining = Object.values(next)
    .flatMap(patch => patch.flashcards || [])
    .filter(card => GENERIC.test(card.back))
  if (remaining.length) {
    console.error(`${remaining.length} generic Wave12 flashcards remain. Run with --write.`)
    process.exit(1)
  }
  console.log('Wave12 flashcard quality check passed.')
}
