#!/usr/bin/env node
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DOMAINS } from '../src/data/ccnaDomains.js'
import { preloadCleanBankForObjective } from '../src/data/cleanQuestionAdapter.js'
import { getCuratedQuestions } from '../src/data/ccnaCurated.js'
import {
  isFallbackExplanation,
  isGenericStructuredFeedback,
} from '../src/answerReview/answerReviewQuality.js'
import { getCorrectIndexes, loadCleanQuestions } from './validateRegenCoverage.mjs'

const SCRIPT_PATH = fileURLToPath(import.meta.url)
const ROOT = join(dirname(SCRIPT_PATH), '..')
const CLEAN_ROOT = join(ROOT, 'data', 'clean-question-bank')

function normalizedChoice(value) {
  return String(value ?? '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/[`_]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

function repeatedParagraphs(text) {
  const paragraphs = String(text || '')
    .replace(/\r\n/g, '\n')
    .split(/\n\n+/)
    .map(value => value.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
  const seen = new Set()
  return paragraphs.filter(paragraph => {
    if (seen.has(paragraph)) return true
    seen.add(paragraph)
    return false
  })
}

function issue(question, objectiveId, tag, severity, message) {
  return {
    questionId: question?.id || null,
    objectiveId,
    tag,
    severity,
    message,
    sourceFile: question?.sourceFile || null,
  }
}

export function auditQuestion(question, { objectiveId, domain }) {
  const issues = []
  const stem = typeof question?.question === 'string' ? question.question : ''
  const choices = Array.isArray(question?.choices) ? question.choices : []
  const correct = getCorrectIndexes(question || {})

  if (!question?.id || typeof question.id !== 'string') {
    issues.push(issue(question, objectiveId, 'missing_id', 'P0', 'Question is missing a stable string ID.'))
  }
  if (!stem.trim()) {
    issues.push(issue(question, objectiveId, 'bad_stem', 'P0', 'Question stem is empty or not a string.'))
  }
  if (question?.objectiveId && question.objectiveId !== objectiveId) {
    issues.push(issue(question, objectiveId, 'ownership_mismatch', 'P0', `Stored objectiveId ${question.objectiveId} disagrees with source objective ${objectiveId}.`))
  }
  if (question?.domainId && question.domainId !== domain.id) {
    issues.push(issue(question, objectiveId, 'ownership_mismatch', 'P0', `Stored domainId ${question.domainId} disagrees with canonical domain ${domain.id}.`))
  }
  if (correct.error) {
    issues.push(issue(question, objectiveId, 'wrong_key', 'P0', correct.error))
  }

  const normalized = choices.map(normalizedChoice)
  const duplicateChoices = normalized
    .map((value, index) => ({ value, index }))
    .filter(({ value, index }) => value && normalized.indexOf(value) !== index)
    .map(({ index }) => index)
  if (duplicateChoices.length) {
    issues.push(issue(question, objectiveId, 'duplicate_choices', 'P0', `Duplicate normalized choice text at indexes ${duplicateChoices.join(', ')}.`))
  }

  const repeated = repeatedParagraphs(stem)
  if (repeated.length) {
    issues.push(issue(question, objectiveId, 'bad_display', 'P1', `Stem repeats ${repeated.length} paragraph block(s) exactly.`))
  }
  if (/\\[nr]/.test(stem)) {
    issues.push(issue(question, objectiveId, 'bad_display', 'P1', 'Stem contains learner-visible escaped newline/control text.'))
  }
  const fences = (stem.match(/```/g) || []).length
  if (fences % 2 !== 0) {
    issues.push(issue(question, objectiveId, 'bad_display', 'P1', 'Stem contains an unmatched Markdown code fence.'))
  }
  if (/^\s*[!#]\s*(?:answer|correct|destination\b.*\bmatches)/im.test(stem)) {
    issues.push(issue(question, objectiveId, 'answer_leak', 'P1', 'Stem contains a comment that appears to reveal the answer.'))
  }
  if (stem.length > 2500) {
    issues.push(issue(question, objectiveId, 'cognitive_load', 'P2', `Stem is ${stem.length} characters long.`))
  }

  const review = question?.answerReview
  if (!review || typeof review !== 'object') {
    issues.push(issue(question, objectiveId, 'missing_answer_review', 'P1', 'Question has no structured answer review.'))
  } else if (!correct.error) {
    const correctSet = new Set(correct.indexes)
    if (review.correct?.choiceIndex != null && !correctSet.has(review.correct.choiceIndex)) {
      issues.push(issue(question, objectiveId, 'wrong_choice_index', 'P0', `Answer-review correct index ${review.correct.choiceIndex} disagrees with the question key.`))
    }
    for (const item of review.incorrect || []) {
      if (correctSet.has(item?.choiceIndex)) {
        issues.push(issue(question, objectiveId, 'wrong_choice_index', 'P0', `Answer-review incorrect entry points to correct index ${item.choiceIndex}.`))
      }
      const genericStructured = isGenericStructuredFeedback(item?.whyWrongHere)
        || isGenericStructuredFeedback(item?.whatItDoes)
      const specificFallback = Boolean(
        item?.explanation
        && !isFallbackExplanation(item.explanation)
        && !isGenericStructuredFeedback(item.explanation),
      )
      if (genericStructured && !specificFallback) {
        issues.push(issue(question, objectiveId, 'generic_feedback', 'P1', `Choice ${item?.choiceIndex} has legacy structured filler without a specific explanation fallback.`))
      }
    }
  }

  return issues
}

export function auditDomainQuestions(questions, { domainNumber }) {
  const domain = DOMAINS[domainNumber - 1]
  if (!domain) throw new Error(`unknown domain ${domainNumber}`)
  const objectiveIds = new Set(domain.objectives.map(objective => objective.id))
  const issues = []
  const seenIds = new Map()
  const byObjective = {}

  for (const question of questions) {
    const objectiveId = basename(question.sourceFile || '', '.json')
    byObjective[objectiveId] = (byObjective[objectiveId] || 0) + 1
    if (!objectiveIds.has(objectiveId)) {
      issues.push(issue(question, objectiveId, 'ownership_mismatch', 'P0', `Source objective ${objectiveId} is not owned by domain ${domainNumber}.`))
    }
    if (question.id) {
      if (seenIds.has(question.id)) {
        issues.push(issue(question, objectiveId, 'duplicate_id', 'P0', `Question ID also appears in ${seenIds.get(question.id)}.`))
      } else {
        seenIds.set(question.id, question.sourceFile)
      }
    }
    issues.push(...auditQuestion(question, { objectiveId, domain }))
  }

  const bySeverity = { P0: 0, P1: 0, P2: 0, P3: 0 }
  const byTag = {}
  for (const finding of issues) {
    bySeverity[finding.severity] = (bySeverity[finding.severity] || 0) + 1
    byTag[finding.tag] = (byTag[finding.tag] || 0) + 1
  }
  return {
    generatedAt: new Date().toISOString(),
    domain: { number: domainNumber, id: domain.id, name: domain.name },
    questionCount: questions.length,
    objectiveCount: Object.keys(byObjective).length,
    byObjective,
    findingCount: issues.length,
    bySeverity,
    byTag,
    findings: issues,
  }
}

/** Audit the real learner-visible pool after clean-bank and enrichment merges. */
export async function loadRuntimeDomainQuestions(domainNumber) {
  const domain = DOMAINS[domainNumber - 1]
  if (!domain) throw new Error(`unknown domain ${domainNumber}`)
  const questions = []
  for (const objective of domain.objectives) {
    await preloadCleanBankForObjective(objective.id)
    questions.push(...getCuratedQuestions(objective.id).map(question => ({
      ...question,
      sourceFile: `${objective.id}.json`,
    })))
  }
  return questions
}

function parseArgs(argv) {
  let domainNumber = null
  let json = false
  let runtime = false
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index]
    if (arg === '--domain' && argv[index + 1]) domainNumber = Number.parseInt(argv[++index], 10)
    else if (arg === '--json') json = true
    else if (arg === '--runtime') runtime = true
    else throw new Error(`unknown or incomplete argument: ${arg}`)
  }
  if (!Number.isInteger(domainNumber) || domainNumber < 1 || domainNumber > 6) {
    throw new Error('--domain must be an integer from 1 to 6')
  }
  return { domainNumber, json, runtime }
}

export async function main(argv = process.argv.slice(2)) {
  try {
    const { domainNumber, json, runtime } = parseArgs(argv)
    const bankDir = join(CLEAN_ROOT, `domain-${domainNumber}`)
    const questions = runtime
      ? await loadRuntimeDomainQuestions(domainNumber)
      : loadCleanQuestions(bankDir)
    const report = auditDomainQuestions(questions, { domainNumber })
    if (json) console.log(JSON.stringify(report, null, 2))
    else {
      console.log(`Domain ${domainNumber}: ${report.domain.name}`)
      console.log(`Questions: ${report.questionCount} across ${report.objectiveCount} objectives`)
      console.log(`Findings: ${report.findingCount} (${Object.entries(report.bySeverity).map(([key, value]) => `${key}=${value}`).join(', ')})`)
      for (const finding of report.findings.slice(0, 30)) {
        console.log(`  - [${finding.severity}] ${finding.questionId} ${finding.tag}: ${finding.message}`)
      }
      if (report.findings.length > 30) console.log(`  ... and ${report.findings.length - 30} more`)
    }
    return report.bySeverity.P0 > 0 || report.bySeverity.P1 > 0 ? 1 : 0
  } catch (error) {
    console.error(error.message)
    return 1
  }
}

if (resolve(process.argv[1] || '') === resolve(SCRIPT_PATH)) {
  process.exitCode = await main()
}
