import { describe, it, expect, beforeEach } from 'vitest'
import {
  loadPremiumUnlocked,
  savePremiumUnlocked,
  logPremiumBlocked,
  PREMIUM_FEATURES,
} from '../premium/premiumFeatures.js'
import { STORAGE_KEYS } from '../storageKeys.js'

describe('premiumFeatures', () => {
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
      },
    }
  })

  it('defaults premium to locked', async () => {
    expect(await loadPremiumUnlocked()).toBe(false)
  })

  it('persists premium unlock', async () => {
    await savePremiumUnlocked(true)
    expect(await loadPremiumUnlocked()).toBe(true)
  })

  it('logs premium_feature_blocked events', async () => {
    await logPremiumBlocked(PREMIUM_FEATURES.tutor, 'home')
    const events = await window.storage.getItem(STORAGE_KEYS.events)
    expect(events.at(-1).type).toBe('premium_feature_blocked')
    expect(events.at(-1).feature).toBe('tutor')
    expect(events.at(-1).source).toBe('home')
  })
})
