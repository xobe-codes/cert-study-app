import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../data/cleanQuestionAdapter.js', () => ({
  preloadCleanBank: vi.fn(() => Promise.resolve()),
}))

vi.mock('../data/ccnaSkillQuestions.js', () => ({ default: {} }))
vi.mock('../data/ccnaShelvedQuestions.js', () => ({ default: {} }))

describe('warmCuratedChunksForOffline', () => {
  beforeEach(async () => {
    vi.stubGlobal('navigator', { serviceWorker: {} })
    vi.stubGlobal('window', {})
    vi.stubGlobal('document', { querySelector: () => null })
    const mod = await import('../offline/warmCuratedChunks.js')
    mod.resetWarmCuratedChunksForTests()
    vi.clearAllMocks()
  })

  it('isOfflineCapable reflects serviceWorker support', async () => {
    const { isOfflineCapable } = await import('../offline/warmCuratedChunks.js')
    expect(isOfflineCapable()).toBe(true)
  })

  it('calls preloadCleanBank once per session', async () => {
    const { preloadCleanBank } = await import('../data/cleanQuestionAdapter.js')
    const { warmCuratedChunksForOffline } = await import('../offline/warmCuratedChunks.js')
    await warmCuratedChunksForOffline()
    await warmCuratedChunksForOffline()
    expect(preloadCleanBank).toHaveBeenCalledTimes(1)
  })
})
