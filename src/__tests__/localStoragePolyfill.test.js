import { beforeEach, describe, expect, it, vi } from 'vitest'
import { STORAGE_ERROR_EVENT, createLocalStoragePolyfill } from '../storage/localStoragePolyfill.js'

function makeWin(store) {
  return { localStorage: store, dispatchEvent: vi.fn() }
}

function quotaError() {
  const err = new Error('quota')
  err.name = 'QuotaExceededError'
  return err
}

describe('localStorage polyfill', () => {
  let warn
  beforeEach(() => { warn = vi.spyOn(console, 'warn').mockImplementation(() => {}) })

  it('round-trips JSON values', async () => {
    const map = new Map()
    const s = createLocalStoragePolyfill(makeWin({
      getItem: k => (map.has(k) ? map.get(k) : null),
      setItem: (k, v) => map.set(k, v),
      removeItem: k => map.delete(k),
    }))
    expect(await s.setItem('k', { a: 1 })).toBe(true)
    expect(await s.getItem('k')).toEqual({ a: 1 })
    expect(await s.removeItem('k')).toBe(true)
    expect(await s.getItem('k')).toBeNull()
  })

  it('returns raw text when the stored value is not JSON', async () => {
    const s = createLocalStoragePolyfill(makeWin({ getItem: () => 'plain', setItem: () => {}, removeItem: () => {} }))
    expect(await s.getItem('k')).toBe('plain')
  })

  it('does not throw when a write exceeds quota', async () => {
    const win = makeWin({ getItem: () => null, setItem: () => { throw quotaError() }, removeItem: () => {} })
    const s = createLocalStoragePolyfill(win)
    await expect(s.setItem('k', { big: 'x' })).resolves.toBe(false)
    expect(s.degraded).toBe(true)
    expect(warn).toHaveBeenCalled()
    expect(win.dispatchEvent).toHaveBeenCalled()
    expect(win.dispatchEvent.mock.calls[0][0].type).toBe(STORAGE_ERROR_EVENT)
    expect(win.dispatchEvent.mock.calls[0][0].detail.kind).toBe('quota-exceeded')
  })

  it('survives localStorage being unavailable entirely', async () => {
    const boom = () => { throw new Error('SecurityError') }
    const win = makeWin({ getItem: boom, setItem: boom, removeItem: boom })
    const s = createLocalStoragePolyfill(win)
    await expect(s.getItem('k')).resolves.toBeNull()
    await expect(s.setItem('k', 1)).resolves.toBe(false)
    await expect(s.removeItem('k')).resolves.toBe(false)
    expect(s.lastError).toBeInstanceOf(Error)
  })

  it('reports a successful write as true so callers can tell them apart', async () => {
    const s = createLocalStoragePolyfill(makeWin({ getItem: () => null, setItem: () => {}, removeItem: () => {} }))
    expect(await s.setItem('k', 1)).toBe(true)
    expect(s.degraded).toBe(false)
  })
})
