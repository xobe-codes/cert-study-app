import { describe, it, expect } from 'vitest'
import { buildMissedEntry } from '../questionUtils.js'
import {
  findMissedBankIndex,
  missedReviewOptionRows,
  missedUserAttemptLabel,
  isDuplicateMissedEntry,
} from '../missed/missedDisplay.js'

describe('missedDisplay', () => {
  const mc = {
    id: 'mc-1',
    type: 'definition',
    question: 'What is OSPF AD?',
    choices: ['90', '110', '120', '1'],
    correctIndex: 1,
    explanation: 'OSPF AD is 110.',
  }

  const cli = {
    id: 'cli-1',
    type: 'cli',
    question: 'Enter privileged EXEC',
    answers: ['enable'],
    explanation: 'Use enable.',
  }

  const ordering = {
    id: 'ord-1',
    type: 'ordering',
    question: 'Order STP states',
    orderItems: ['blocking', 'listening', 'learning', 'forwarding'],
    explanation: 'STP port states in order.',
  }

  it('builds MC rows without throwing', () => {
    const entry = buildMissedEntry('1.1', mc, { selectedIndex: 0 })
    const rows = missedReviewOptionRows(entry)
    expect(rows).toHaveLength(4)
    expect(rows.filter(r => r.isAnswer)).toHaveLength(1)
    expect(rows[1].text).toBe('110')
    expect(missedUserAttemptLabel(entry)).toMatch(/90/)
  })

  it('does not crash on CLI misses with no choices', () => {
    const entry = buildMissedEntry('2.1', cli, { cliAnswer: 'enab' })
    expect(entry.choices).toBeUndefined()
    const rows = missedReviewOptionRows(entry)
    expect(rows).toEqual([{ text: 'enable', isAnswer: true }])
    expect(missedUserAttemptLabel(entry)).toMatch(/enab/)
  })

  it('does not crash on ordering misses with no choices', () => {
    const entry = buildMissedEntry('2.4', ordering, {
      orderAnswer: ['listening', 'blocking', 'learning', 'forwarding'],
    })
    expect(entry.choices).toBeUndefined()
    const rows = missedReviewOptionRows(entry)
    expect(rows).toHaveLength(1)
    expect(rows[0].isAnswer).toBe(true)
    expect(rows[0].text).toContain('blocking')
    expect(missedUserAttemptLabel(entry)).toMatch(/listening/)
  })

  it('finds bank index after trap enrichment copy', () => {
    const entry = buildMissedEntry('1.1', mc)
    const bank = [entry]
    const copy = { ...entry, answerReview: { examTip: 'tip' } }
    expect(findMissedBankIndex(bank, copy)).toBe(0)
  })

  describe('isDuplicateMissedEntry', () => {
    it('is false against an empty or missing bank', () => {
      const entry = buildMissedEntry('1.1', mc, { selectedIndex: 0 })
      expect(isDuplicateMissedEntry([], entry)).toBe(false)
      expect(isDuplicateMissedEntry(undefined, entry)).toBe(false)
    })

    it('is true when the same question+objective is already in the bank', () => {
      const first = buildMissedEntry('1.1', mc, { selectedIndex: 0 })
      const second = buildMissedEntry('1.1', mc, { selectedIndex: 2 })
      expect(isDuplicateMissedEntry([first], second)).toBe(true)
    })

    it('is false for the same question under a different objective', () => {
      const first = buildMissedEntry('1.1', mc, { selectedIndex: 0 })
      const second = buildMissedEntry('2.3', mc, { selectedIndex: 0 })
      expect(isDuplicateMissedEntry([first], second)).toBe(false)
    })

    it('never collides entries with no questionId', () => {
      const noId = { ...buildMissedEntry('1.1', mc, { selectedIndex: 0 }), questionId: undefined }
      expect(isDuplicateMissedEntry([noId], { ...noId })).toBe(false)
    })
  })
})
