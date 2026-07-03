import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  loadMockInterviewChat,
  saveMockInterviewChat,
  clearMockInterviewChat,
} from '../features/mockExam/mockInterviewChatStorage.js'
import { STORAGE_KEYS } from '../storageKeys.js'

describe('mockInterviewChatStorage', () => {
  beforeEach(() => {
    const store = new Map()
    vi.stubGlobal('window', {
      storage: {
        getItem: vi.fn(async key => store.get(key) ?? null),
        setItem: vi.fn(async (key, val) => { store.set(key, val) }),
      },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('persists and restores chat messages', async () => {
    const msgs = [
      { role: 'user', content: 'Explain OSPF DR election' },
      { role: 'assistant', content: 'On broadcast segments, highest priority wins.' },
    ]
    await saveMockInterviewChat(msgs)
    const loaded = await loadMockInterviewChat()
    expect(loaded).toHaveLength(2)
    expect(loaded[0].content).toContain('OSPF')
  })

  it('trims to max message cap', async () => {
    const many = Array.from({ length: 60 }, (_, i) => ({ role: 'user', content: `msg ${i}` }))
    const saved = await saveMockInterviewChat(many)
    expect(saved.length).toBeLessThanOrEqual(48)
  })

  it('clearMockInterviewChat empties storage', async () => {
    await saveMockInterviewChat([{ role: 'user', content: 'hi' }])
    await clearMockInterviewChat()
    expect(await loadMockInterviewChat()).toEqual([])
    expect(window.storage.setItem).toHaveBeenCalledWith(STORAGE_KEYS.mockInterviewChat, [])
  })
})
