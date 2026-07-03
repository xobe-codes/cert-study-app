import { describe, it, expect, beforeEach } from 'vitest'
import { STORAGE_KEYS } from '../storageKeys.js'
import { parseAppHash } from '../routing/appHashRouting.js'
import { bumpStreak, saveStreak } from '../storage/appPersistence.js'

describe('appHashRouting', () => {
  beforeEach(() => {
    globalThis.window = {
      location: { hash: '#/mock', pathname: '/', search: '' },
      history: { replaceState: () => {} },
    }
  })

  it('parses mock hash route', () => {
    window.location.hash = '#/mock'
    expect(parseAppHash()).toEqual({ view: 'mock' })
  })

  it('parses objective hash with tab', () => {
    window.location.hash = '#/objective/1.1/quiz'
    const route = parseAppHash()
    expect(route?.view).toBe('objective')
    expect(route?.objective?.id).toBe('1.1')
    expect(route?.objective?.__initialTab).toBe('quiz')
  })
})

describe('appPersistence bumpStreak', () => {
  beforeEach(() => {
    const store = new Map()
    globalThis.window = {
      storage: {
        async getItem(key) {
          return store.has(key) ? store.get(key) : null
        },
        async setItem(key, value) {
          store.set(key, value)
        },
        async removeItem(key) {
          store.delete(key)
        },
      },
    }
  })

  it('increments streak on new study day', async () => {
    await saveStreak({ count: 2, lastStudyDate: '2000-01-01' })
    const next = await bumpStreak()
    expect(next.count).toBe(1)
    expect(next.lastStudyDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    const stored = await window.storage.getItem(STORAGE_KEYS.streak)
    expect(stored.count).toBe(1)
  })
})
