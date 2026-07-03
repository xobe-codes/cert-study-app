import { useState, useCallback } from 'react'
import {
  savePremiumUnlocked,
  logPremiumBlocked,
  PREMIUM_FEATURES,
} from '../../premium/premiumFeatures.js'
import { packageObjectiveOffline } from '../../offline/objectivePackaging.js'

export const PREMIUM_TOAST_MESSAGES = {
  [PREMIUM_FEATURES.tutor]: 'AI Tutor and Study Lens synthesis unlock with supporter access.',
  [PREMIUM_FEATURES.mock_interview]: 'Live AI exam-day interview practice unlocks with supporter access.',
  [PREMIUM_FEATURES.offline_pack]: 'Offline AI packaging is a premium feature.',
  [PREMIUM_FEATURES.ai_visual]: 'Custom AI visuals require supporter access.',
  [PREMIUM_FEATURES.ai_terms]: 'AI key-term flashcards require supporter access.',
  [PREMIUM_FEATURES.ai_explain]: 'AI-generated explanations require supporter access.',
  [PREMIUM_FEATURES.quiz_generate]: 'Generating new quiz questions is a premium feature.',
  [PREMIUM_FEATURES.donate_preview]: 'Donations are not enabled yet — thank you for your interest.',
}

/** Premium gating, toast, and offline objective packaging — extracted from App.jsx. */
export function useAppPremium({
  premiumUnlocked,
  setPremiumUnlocked,
  apiOnline,
  offlineReady,
  refreshOffline,
}) {
  const [premiumToast, setPremiumToast] = useState(null)
  const [packagingId, setPackagingId] = useState(null)

  const handlePremiumBlocked = useCallback((feature, source, extra) => {
    logPremiumBlocked(feature, source, extra)
    setPremiumToast(PREMIUM_TOAST_MESSAGES[feature] || 'This coach feature will unlock with supporter access.')
  }, [])

  const handleTogglePremium = useCallback(async (on) => {
    await savePremiumUnlocked(on)
    setPremiumUnlocked(!!on)
  }, [setPremiumUnlocked])

  const dismissPremiumToast = useCallback(() => setPremiumToast(null), [])

  const packageObjective = useCallback(async (objective) => {
    if (!premiumUnlocked) {
      handlePremiumBlocked(PREMIUM_FEATURES.offline_pack, 'objective', { objectiveId: objective?.id })
      return false
    }
    if (!apiOnline || !objective) return false
    if (offlineReady.has(objective.id)) return true
    setPackagingId(objective.id)
    try {
      await packageObjectiveOffline(objective)
      await refreshOffline()
      return true
    } catch {
      return false
    } finally {
      setPackagingId(null)
    }
  }, [apiOnline, offlineReady, refreshOffline, premiumUnlocked, handlePremiumBlocked])

  return {
    premiumToast,
    packagingId,
    handlePremiumBlocked,
    handleTogglePremium,
    dismissPremiumToast,
    packageObjective,
  }
}
