import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loadQuizBank, reconcileCuratedBank } from '../quiz/quizBankStorage.js'

describe('quiz bank health filtering', () => {
  beforeEach(() => {
    globalThis.window = { storage: { getItem: vi.fn() } }
  })

  it('removes retired questions from an existing saved bank on load', async () => {
    globalThis.window.storage.getItem.mockResolvedValue({
      '2.8': [
        { id: 'obj-2.8-source-q001', question: 'Retired management-access question' },
        { id: 'healthy-id', question: 'Current WLAN question' },
      ],
    })

    await expect(loadQuizBank()).resolves.toEqual({
      '2.8': [{ id: 'healthy-id', question: 'Current WLAN question' }],
    })
  })

  it('normalizes malformed saved objective entries to empty lists', async () => {
    globalThis.window.storage.getItem.mockResolvedValue({ '2.8': null })
    await expect(loadQuizBank()).resolves.toEqual({ '2.8': [] })
  })

  it('reconciles stale curated content while preserving learner history', () => {
    const bank = {
      '2.8': [
        { id: 'retired', question: 'Old management question', attempts: [{ correct: false }], ratings: [] },
        { id: 'current', question: 'Current WLAN question', attempts: [{ correct: true }], ratings: ['easy'], srs: { due: 42 } },
      ],
    }
    reconcileCuratedBank(bank, '2.8', [
      { id: 'current', question: 'Current WLAN question', choices: ['A', 'B'], correctIndex: 0 },
      { id: 'new', question: 'New WLAN question', choices: ['A', 'B'], correctIndex: 1 },
    ])
    expect(bank['2.8'].map(q => q.id)).toEqual(['current', 'new'])
    expect(bank['2.8'][0].attempts).toEqual([{ correct: true }])
    expect(bank['2.8'][0].srs).toEqual({ due: 42 })
  })
})
