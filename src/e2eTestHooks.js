import { stemReplayMapSize, getStemReplayLab, hasStemReplayLab } from './features/stemReplay/stemReplayLabs.js'
import { STORAGE_KEYS, TRAP_DRILL_PREFILL_EVENT } from './storageKeys.js'

/** Dev/e2e-only hooks — not used in production UX. */
export function installE2eTestHooks() {
  if (typeof window === 'undefined') return
  window.__ccnaTestHooks = {
    stemReplaySize: () => stemReplayMapSize(),
    stemReplayLab: (questionId) => getStemReplayLab(questionId)?.labId ?? null,
    hasStemReplayLab: (questionId) => hasStemReplayLab(questionId),
    startTrapDrill: async (ckuId) => {
      const prefill = ckuId ? { ckuId } : {}
      await window.storage.setItem(STORAGE_KEYS.trapDrillPrefill, prefill)
      window.dispatchEvent(new CustomEvent(TRAP_DRILL_PREFILL_EVENT))
    },
  }
}
