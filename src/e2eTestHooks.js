import { stemReplayMapSize, getStemReplayLab, hasStemReplayLab } from './features/stemReplay/stemReplayLabs.js'

/** Dev/e2e-only hooks — not used in production UX. */
export function installE2eTestHooks() {
  if (typeof window === 'undefined') return
  window.__ccnaTestHooks = {
    stemReplaySize: () => stemReplayMapSize(),
    stemReplayLab: (questionId) => getStemReplayLab(questionId)?.labId ?? null,
    hasStemReplayLab: (questionId) => hasStemReplayLab(questionId),
  }
}
