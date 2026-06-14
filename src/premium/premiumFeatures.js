import { STORAGE_KEYS } from '../storageKeys.js'

/** Premium coach / generation features — hidden until donation unlock. */
export const PREMIUM_FEATURES = {
  tutor: 'tutor',
  offline_pack: 'offline_pack',
  ai_visual: 'ai_visual',
  quiz_generate: 'quiz_generate',
  donate_preview: 'donate_preview',
}

export const PREMIUM_COMING_SOON_LABEL = 'Premium — coming soon'

export async function loadPremiumUnlocked() {
  try {
    return !!(await window.storage.getItem(STORAGE_KEYS.premiumUnlocked))
  } catch {
    return false
  }
}

export async function savePremiumUnlocked(on = true) {
  await window.storage.setItem(STORAGE_KEYS.premiumUnlocked, on || null)
  return !!on
}

export async function logPremiumBlocked(feature, source = 'unknown', extra = {}) {
  try {
    const events = (await window.storage.getItem(STORAGE_KEYS.events)) || []
    events.push({
      type: 'premium_feature_blocked',
      at: Date.now(),
      feature,
      source,
      ...extra,
    })
    const cap = 600
    const trimmed = events.length > cap ? events.slice(-cap) : events
    await window.storage.setItem(STORAGE_KEYS.events, trimmed)
  } catch {
    // logging must never break the study flow
  }
}
