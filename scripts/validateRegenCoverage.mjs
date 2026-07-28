#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  isBannedMechanismLanguage,
  isTemplateWhyWrongHere,
} from '../src/answerReview/answerReviewQuality.js'

const SCRIPT_PATH = fileURLToPath(import.meta.url)
const ROOT = join(dirname(SCRIPT_PATH), '..')
const DEFAULT_BANK_DIR = join(ROOT, 'data', 'clean-question-bank')
const DEFAULT_SHELVED_DIR = join(ROOT, 'data', 'shelved-questions')
const DEFAULT_STAGING_PATH = join(ROOT, 'src', 'answerReview', 'regeneratedExplanations.json')
const TEXT_FIELDS = [
  'misconceptionReason',
  'whyItSeems',
  'whyWrongHere',
  'memoryAnchor',
  'contrast',
]
const FIRST_ERROR_LIMIT = 30

export function walkQuestionFiles(dir) {
  if (!existsSync(dir)) throw new Error(`clean bank directory not found: ${dir}`)
  const files = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) files.push(...walkQuestionFiles(path))
    else if (
      entry.isFile()
      && entry.name.endsWith('.json')
      && entry.name.toLowerCase() !== 'manifest.json'
    ) {
      files.push(path)
    }
  }
  return files.sort()
}

export function loadCleanQuestions(bankDir) {
  const questions = []
  for (const path of walkQuestionFiles(bankDir)) {
    const parsed = JSON.parse(readFileSync(path, 'utf8'))
    if (!Array.isArray(parsed.questions)) {
      throw new Error(`${relative(bankDir, path)}: expected a questions array`)
    }
    for (const question of parsed.questions) {
      questions.push({ ...question, sourceFile: relative(bankDir, path) })
    }
  }
  return questions
}

export function loadShelvedQuestionIds(shelvedDir) {
  if (!existsSync(shelvedDir)) return new Set()
  const ids = new Set()
  for (const path of walkQuestionFiles(shelvedDir)) {
    const parsed = JSON.parse(readFileSync(path, 'utf8'))
    const questions = Array.isArray(parsed) ? parsed : parsed.questions
    if (!Array.isArray(questions)) continue
    for (const question of questions) {
      if (typeof question?.id === 'string') ids.add(question.id)
    }
  }
  return ids
}

export function getCorrectIndexes(question) {
  const choiceCount = Array.isArray(question.choices) ? question.choices.length : 0
  if (!choiceCount) {
    return { indexes: [], error: 'choices must be a non-empty array' }
  }

  const hasPlural = Object.hasOwn(question, 'correctIndexes')
  const hasSingle = Object.hasOwn(question, 'correctIndex')
  let indexes

  if (hasPlural) {
    if (!Array.isArray(question.correctIndexes) || question.correctIndexes.length === 0) {
      return { indexes: [], error: 'correctIndexes must be a non-empty array' }
    }
    indexes = question.correctIndexes
    if (
      hasSingle
      && (indexes.length !== 1 || indexes[0] !== question.correctIndex)
    ) {
      return { indexes: [], error: 'conflicting correctIndex and correctIndexes are unsupported' }
    }
  } else if (hasSingle) {
    indexes = [question.correctIndex]
  } else {
    return { indexes: [], error: 'missing correctIndex/correctIndexes' }
  }

  if (indexes.some(index => !Number.isInteger(index))) {
    return { indexes: [], error: 'correct answer indexes must be integers' }
  }
  if (new Set(indexes).size !== indexes.length) {
    return { indexes: [], error: 'correctIndexes contains duplicates' }
  }
  if (indexes.some(index => index < 0 || index >= choiceCount)) {
    return { indexes: [], error: `correct answer index out of range for ${choiceCount} choices` }
  }
  return { indexes: [...indexes].sort((a, b) => a - b), error: null }
}

function validateEntry(question, entry, errors) {
  const qid = question.id
  const choiceCount = Array.isArray(question.choices) ? question.choices.length : 0
  const correct = getCorrectIndexes(question)
  if (correct.error) {
    errors.push(`${qid}: unsupported answer shape: ${correct.error}`)
    return { expected: [], covered: [] }
  }

  const correctSet = new Set(correct.indexes)
  const expected = Array.from(
    { length: choiceCount },
    (_, index) => index,
  ).filter(index => !correctSet.has(index))

  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
    errors.push(`${qid}: staging entry must be an object`)
    return { expected, covered: [] }
  }
  if (!Array.isArray(entry.incorrect)) {
    errors.push(`${qid}: incorrect must be an array`)
    return { expected, covered: [] }
  }

  const seen = new Set()
  const covered = new Set()
  for (const [position, item] of entry.incorrect.entries()) {
    const context = `${qid}: incorrect[${position}]`
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      errors.push(`${context} must be an object`)
      continue
    }

    const index = item.choiceIndex
    if (!Number.isInteger(index)) {
      errors.push(`${context}.choiceIndex must be an integer`)
    } else {
      if (index < 0 || index >= choiceCount) {
        errors.push(`${context}.choiceIndex ${index} is out of range`)
      } else if (correctSet.has(index)) {
        errors.push(`${context}.choiceIndex ${index} is a correct answer`)
      } else {
        covered.add(index)
      }
      if (seen.has(index)) errors.push(`${qid}: duplicate choiceIndex ${index}`)
      seen.add(index)
    }

    for (const field of TEXT_FIELDS) {
      const text = item[field]
      if (typeof text !== 'string' || text.trim().length < 15) {
        errors.push(`${context}.${field} must contain at least 15 characters`)
        continue
      }
      if (field === 'whyWrongHere' && isTemplateWhyWrongHere(text)) {
        errors.push(`${context}.${field} uses template language`)
      }
      if (isBannedMechanismLanguage(text)) {
        errors.push(`${context}.${field} uses banned mechanism language`)
      }
    }
  }

  const actual = [...seen].filter(Number.isInteger).sort((a, b) => a - b)
  if (
    actual.length !== expected.length
    || actual.some((index, position) => index !== expected[position])
  ) {
    errors.push(
      `${qid}: wrong choice indices must be exactly [${expected.join(', ')}]; got [${actual.join(', ')}]`,
    )
  }
  return { expected, covered: [...covered] }
}

export function validateRegenCoverage(
  questions,
  staging,
  { ignoreUnknownStagingIds = false, ignoredStagingIds = new Set() } = {},
) {
  const schemaErrors = []
  const missingQuestionIds = []
  const questionById = new Map()

  for (const question of questions) {
    if (!question?.id || typeof question.id !== 'string') {
      schemaErrors.push(`${question?.sourceFile || 'clean bank'}: question missing string id`)
      continue
    }
    if (questionById.has(question.id)) {
      schemaErrors.push(`${question.id}: duplicate clean-bank question id`)
      continue
    }
    questionById.set(question.id, question)
  }

  const stagingIsObject = staging && typeof staging === 'object' && !Array.isArray(staging)
  if (!stagingIsObject) schemaErrors.push('staging root must be an object keyed by question id')
  const entries = stagingIsObject ? staging : {}

  if (!ignoreUnknownStagingIds) {
    for (const qid of Object.keys(entries)) {
      if (!questionById.has(qid) && !ignoredStagingIds.has(qid)) {
        schemaErrors.push(`${qid}: staging id is not in the clean bank`)
      }
    }
  }

  let coveredQuestions = 0
  let expectedDistractors = 0
  let coveredDistractors = 0
  for (const [qid, question] of questionById) {
    const correct = getCorrectIndexes(question)
    if (!correct.error && Array.isArray(question.choices)) {
      expectedDistractors += question.choices.length - correct.indexes.length
    }
    if (!Object.hasOwn(entries, qid)) {
      missingQuestionIds.push(qid)
      if (correct.error) {
        schemaErrors.push(`${qid}: unsupported answer shape: ${correct.error}`)
      }
      continue
    }
    coveredQuestions++
    const result = validateEntry(question, entries[qid], schemaErrors)
    coveredDistractors += result.covered.length
  }

  return {
    totalQuestions: questionById.size,
    coveredQuestions,
    missingQuestionIds,
    expectedDistractors,
    coveredDistractors,
    schemaErrors,
  }
}

export function exitCodeForReport(report, requireFull = false) {
  return report.schemaErrors.length > 0
    || (requireFull && report.missingQuestionIds.length > 0)
    ? 1
    : 0
}

export function formatReport(report, { requireFull = false } = {}) {
  const questionPercent = report.totalQuestions
    ? ((report.coveredQuestions / report.totalQuestions) * 100).toFixed(1)
    : '0.0'
  const distractorPercent = report.expectedDistractors
    ? ((report.coveredDistractors / report.expectedDistractors) * 100).toFixed(1)
    : '0.0'
  const lines = [
    `Question coverage: ${report.coveredQuestions}/${report.totalQuestions} (${questionPercent}%)`,
    `Distractor coverage: ${report.coveredDistractors}/${report.expectedDistractors} (${distractorPercent}%)`,
    `Missing question entries: ${report.missingQuestionIds.length}`,
    `Schema errors: ${report.schemaErrors.length}`,
  ]
  const firstErrors = [
    ...report.schemaErrors,
    ...(requireFull
      ? report.missingQuestionIds.map(qid => `${qid}: missing staging entry`)
      : []),
  ].slice(0, FIRST_ERROR_LIMIT)
  if (firstErrors.length) {
    lines.push('First errors:')
    lines.push(...firstErrors.map(error => `  - ${error}`))
  }
  return lines.join('\n')
}

function parseArgs(argv) {
  const options = {
    requireFull: false,
    bankDir: DEFAULT_BANK_DIR,
    stagingPath: DEFAULT_STAGING_PATH,
    domain: null,
  }
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index]
    if (arg === '--require-full') options.requireFull = true
    else if (arg === '--domain' && argv[index + 1]) {
      const domain = Number.parseInt(argv[++index], 10)
      if (!Number.isInteger(domain) || domain < 1 || domain > 6) {
        throw new Error('--domain must be an integer from 1 to 6')
      }
      options.domain = domain
    }
    else if (arg === '--bank-dir' && argv[index + 1]) options.bankDir = resolve(argv[++index])
    else if (arg === '--staging' && argv[index + 1]) options.stagingPath = resolve(argv[++index])
    else throw new Error(`unknown or incomplete argument: ${arg}`)
  }
  return options
}

export function main(argv = process.argv.slice(2)) {
  let options
  try {
    options = parseArgs(argv)
    const scopedBankDir = options.domain == null
      ? options.bankDir
      : join(options.bankDir, `domain-${options.domain}`)
    const questions = loadCleanQuestions(scopedBankDir)
    const staging = JSON.parse(readFileSync(options.stagingPath, 'utf8'))
    const shelvedIds = loadShelvedQuestionIds(DEFAULT_SHELVED_DIR)
    const report = validateRegenCoverage(questions, staging, {
      ignoreUnknownStagingIds: options.domain != null,
      ignoredStagingIds: shelvedIds,
    })
    if (options.domain != null) console.log(`Domain scope: ${options.domain}`)
    console.log(formatReport(report, options))
    return exitCodeForReport(report, options.requireFull)
  } catch (error) {
    console.error(`Schema errors: 1\nFirst errors:\n  - ${error.message}`)
    return 1
  }
}

if (resolve(process.argv[1] || '') === resolve(SCRIPT_PATH)) {
  process.exitCode = main()
}
