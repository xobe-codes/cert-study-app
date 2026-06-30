import { STORAGE_KEYS } from '../storageKeys.js'

export async function loadCliStats() {
  return (await window.storage.getItem(STORAGE_KEYS.cliStats)) || {}
}

export async function recordCliLabResult(objectiveId, patch) {
  const all = await loadCliStats()
  const prev = all[objectiveId] || { runs: 0, bestScore: 0, lastScore: 0, commandsEntered: 0, syntaxErrors: 0, wrongModeErrors: 0, hintsUsed: 0, completedObjectives: 0, totalObjectives: 0 }
  const merged = {
    ...prev,
    runs: prev.runs + (patch.completed ? 1 : 0),
    bestScore: Math.max(prev.bestScore, patch.score ?? 0),
    lastScore: patch.score ?? prev.lastScore,
    commandsEntered: prev.commandsEntered + (patch.commandsEntered || 0),
    syntaxErrors: prev.syntaxErrors + (patch.syntaxErrors || 0),
    wrongModeErrors: prev.wrongModeErrors + (patch.wrongModeErrors || 0),
    hintsUsed: prev.hintsUsed + (patch.hintsUsed || 0),
    completedObjectives: Math.max(prev.completedObjectives, patch.completedObjectives || 0),
    totalObjectives: patch.totalObjectives || prev.totalObjectives,
    updatedAt: Date.now(),
  }
  all[objectiveId] = merged
  await window.storage.setItem(STORAGE_KEYS.cliStats, all)
}
