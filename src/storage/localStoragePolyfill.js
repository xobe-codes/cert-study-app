/**
 * localStorage-backed async key/value store used when the host page does not
 * supply window.storage natively.
 *
 * Every operation is guarded. localStorage throws in more situations than it is
 * usually given credit for — Safari private browsing, a full origin quota, and
 * blocked third-party storage all raise — and the previous unguarded version
 * turned those into unhandled promise rejections that lost learner progress
 * with nothing shown and nothing logged.
 */

export const STORAGE_ERROR_EVENT = 'ccna:storage-error'

function isQuotaError(err) {
  if (!err) return false
  return err.name === 'QuotaExceededError'
    || err.name === 'NS_ERROR_DOM_QUOTA_REACHED'
    || err.code === 22
    || err.code === 1014
}

function report(win, { op, key, error }) {
  const kind = isQuotaError(error) ? 'quota-exceeded' : 'unavailable'
  try {
    // eslint-disable-next-line no-console
    console.warn(`[storage] ${op} failed for "${key}" (${kind})`, error)
  } catch { /* console can be absent in exotic hosts */ }
  try {
    win.dispatchEvent(new CustomEvent(STORAGE_ERROR_EVENT, { detail: { op, key, kind, error } }))
  } catch { /* CustomEvent unavailable — the warning above still stands */ }
}

/**
 * @returns a storage object that never throws. Writes that fail report through
 * `console.warn` and a `ccna:storage-error` event, and resolve to false so
 * callers can tell a failed write from a successful one.
 */
export function createLocalStoragePolyfill(win = window) {
  const store = win.localStorage
  const state = { degraded: false, lastError: null }

  return {
    get degraded() { return state.degraded },
    get lastError() { return state.lastError },

    async getItem(key) {
      let raw
      try {
        raw = store.getItem(key)
      } catch (error) {
        state.degraded = true
        state.lastError = error
        report(win, { op: 'getItem', key, error })
        return null
      }
      if (raw === null || raw === undefined) return null
      try {
        return JSON.parse(raw)
      } catch {
        return raw
      }
    },

    async setItem(key, value) {
      try {
        store.setItem(key, JSON.stringify(value))
        return true
      } catch (error) {
        state.degraded = true
        state.lastError = error
        report(win, { op: 'setItem', key, error })
        return false
      }
    },

    async removeItem(key) {
      try {
        store.removeItem(key)
        return true
      } catch (error) {
        state.degraded = true
        state.lastError = error
        report(win, { op: 'removeItem', key, error })
        return false
      }
    },
  }
}
