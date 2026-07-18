import { afterEach, describe, expect, it } from 'vitest'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import {
  exitCodeForReport,
  getCorrectIndexes,
  loadCleanQuestions,
  validateRegenCoverage,
} from '../../scripts/validateRegenCoverage.mjs'

const temporaryDirectories = []
const goodText = {
  misconceptionReason: 'Learners confuse this option with a nearby networking behavior.',
  whyItSeems: 'The option sounds plausible because both features use similar terminology.',
  whyWrongHere: 'The stem requires forwarding by destination IP, while this option only learns source MAC addresses.',
  memoryAnchor: 'IP route picks a network path; a MAC table picks a local switch port.',
  contrast: 'Routers compare destination networks, whereas switches compare destination MAC addresses.',
}

function question(overrides = {}) {
  return {
    id: 'q1',
    choices: ['one', 'two', 'three', 'four'],
    correctIndex: 2,
    ...overrides,
  }
}

function item(choiceIndex, overrides = {}) {
  return { choiceIndex, ...goodText, ...overrides }
}

afterEach(() => {
  for (const dir of temporaryDirectories.splice(0)) {
    rmSync(dir, { recursive: true, force: true })
  }
})

describe('regenerated explanation coverage schema', () => {
  it('accepts exactly one complete distractor entry per wrong choice', () => {
    const report = validateRegenCoverage(
      [question()],
      { q1: { incorrect: [item(0), item(1), item(3)] } },
    )

    expect(report).toMatchObject({
      totalQuestions: 1,
      coveredQuestions: 1,
      expectedDistractors: 3,
      coveredDistractors: 3,
      missingQuestionIds: [],
      schemaErrors: [],
    })
    expect(exitCodeForReport(report, true)).toBe(0)
  })

  it('reports missing coverage without failing unless full coverage is required', () => {
    const report = validateRegenCoverage([question()], {})

    expect(report.missingQuestionIds).toEqual(['q1'])
    expect(report.schemaErrors).toEqual([])
    expect(exitCodeForReport(report, false)).toBe(0)
    expect(exitCodeForReport(report, true)).toBe(1)
  })

  it('rejects invalid indices, short text, and banned template language', () => {
    const report = validateRegenCoverage(
      [question()],
      {
        q1: {
          incorrect: [
            item(0),
            item(0),
            item(2),
            item(8, {
              memoryAnchor: 'too short',
              whyWrongHere: 'This option does not satisfy what the question asks.',
            }),
          ],
        },
      },
    )

    expect(report.schemaErrors).toEqual(expect.arrayContaining([
      expect.stringContaining('duplicate choiceIndex 0'),
      expect.stringContaining('choiceIndex 2 is a correct answer'),
      expect.stringContaining('choiceIndex 8 is out of range'),
      expect.stringContaining('memoryAnchor must contain at least 15 characters'),
      expect.stringContaining('whyWrongHere uses template language'),
      expect.stringContaining('whyWrongHere uses banned mechanism language'),
      expect.stringContaining('wrong choice indices must be exactly [0, 1, 3]'),
    ]))
    expect(exitCodeForReport(report, false)).toBe(1)
  })

  it('supports valid multi-answer questions and rejects conflicting answer shapes', () => {
    const multiAnswer = question()
    delete multiAnswer.correctIndex
    multiAnswer.correctIndexes = [1, 3]
    expect(getCorrectIndexes(multiAnswer)).toEqual({ indexes: [1, 3], error: null })

    const report = validateRegenCoverage(
      [question({ correctIndexes: [1, 3] })],
      { q1: { incorrect: [item(0), item(2)] } },
    )
    expect(report.schemaErrors).toContain(
      'q1: unsupported answer shape: conflicting correctIndex and correctIndexes are unsupported',
    )
  })

  it('loads nested question files recursively while skipping manifests', () => {
    const root = mkdtempSync(join(tmpdir(), 'regen-coverage-'))
    temporaryDirectories.push(root)
    const nested = join(root, 'domain-1', 'nested')
    mkdirSync(nested, { recursive: true })
    writeFileSync(
      join(root, 'domain-1', 'manifest.json'),
      JSON.stringify({ questions: [{ id: 'manifest-question' }] }),
    )
    writeFileSync(
      join(nested, '1.1.json'),
      JSON.stringify({ questions: [question()] }),
    )

    const loaded = loadCleanQuestions(root)
    expect(loaded).toHaveLength(1)
    expect(loaded[0]).toMatchObject({ id: 'q1', sourceFile: join('domain-1', 'nested', '1.1.json') })
  })
})
