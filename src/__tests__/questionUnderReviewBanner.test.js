import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { isQhrDebugEnabled, QHR_DEBUG_FLAG } from '../components/QuestionUnderReviewBanner.jsx'

describe('QuestionUnderReviewBanner', () => {
  let store

  beforeEach(() => {
    store = {}
    globalThis.localStorage = {
      getItem: key => (key in store ? store[key] : null),
      setItem: (key, val) => { store[key] = String(val) },
      removeItem: key => { delete store[key] },
    }
  })

  afterEach(() => {
    delete globalThis.localStorage
  })

  it('is off by default', () => {
    expect(isQhrDebugEnabled()).toBe(false)
  })

  it('enables when debug flag is set', () => {
    localStorage.setItem(QHR_DEBUG_FLAG, '1')
    expect(isQhrDebugEnabled()).toBe(true)
  })
})
