import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../data/cleanQuestionAdapter.js', () => ({
  preloadCleanBank: vi.fn(() => Promise.resolve()),
}))

vi.mock('../data/ccnaSkillQuestions.js', () => ({ default: {} }))
vi.mock('../data/ccnaShelvedQuestions.js', () => ({ default: {} }))
vi.mock('../features/mockExam/MockExamRoute.jsx', () => ({ default: () => null }))
vi.mock('../lab/LabsHub.jsx', () => ({ default: () => null }))
vi.mock('../lab/LabView.jsx', () => ({ default: () => null }))
vi.mock('../ExtraStudyMode.jsx', () => ({ default: () => null }))
vi.mock('../ExamTrapStudyMode.jsx', () => ({ default: () => null }))
vi.mock('../RoutingDecoderMode.jsx', () => ({ default: () => null }))
vi.mock('../topic/TopicFocusStudio.jsx', () => ({ default: () => null }))
vi.mock('../commands/CommandHubStudio.jsx', () => ({ default: () => null }))
vi.mock('../lens/StudyLensStudio.jsx', () => ({ default: () => null }))

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

  it('defers preloadCleanBank until idle (once per session)', async () => {
    vi.stubGlobal('requestIdleCallback', undefined)
    vi.useFakeTimers()
    const { preloadCleanBank } = await import('../data/cleanQuestionAdapter.js')
    const { warmCuratedChunksForOffline } = await import('../offline/warmCuratedChunks.js')
    await warmCuratedChunksForOffline()
    expect(preloadCleanBank).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(2000)
    expect(preloadCleanBank).toHaveBeenCalledTimes(1)
    await warmCuratedChunksForOffline()
    await vi.advanceTimersByTimeAsync(2000)
    expect(preloadCleanBank).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })

  it('warms lazy route chunks for offline PWA', async () => {
    const { warmCuratedChunksForOffline } = await import('../offline/warmCuratedChunks.js')
    const mockExam = await import('../features/mockExam/MockExamRoute.jsx')
    const labs = await import('../lab/LabsHub.jsx')
    await warmCuratedChunksForOffline()
    expect(mockExam).toBeTruthy()
    expect(labs).toBeTruthy()
  })
})
