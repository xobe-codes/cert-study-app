import { useCallback } from 'react'
import { saveProgress, saveMissed } from '../../storage/appPersistence.js'
import { buildEngagementProgressPatch } from './masteryEngagement.js'
import { isDuplicateMissedEntry } from '../../missed/missedDisplay.js'

/** Progress and missed-question handlers — extracted from App.jsx. */
export function useAppProgress({ setProgress, setMissed }) {
  const updateProgress = useCallback((objectiveId, patch) => {
    setProgress(prev => {
      const next = {
        ...prev,
        [objectiveId]: { status: 'unseen', quizScores: [], engagementScores: [], ...prev[objectiveId], ...patch },
      }
      saveProgress(next)
      return next
    })
  }, [setProgress])

  const recordEngagement = useCallback((objectiveId, activity) => {
    if (!objectiveId || !activity?.kind) return null
    let result = null
    setProgress(prev => {
      const entry = prev[objectiveId] || { status: 'unseen', quizScores: [], engagementScores: [] }
      const patch = buildEngagementProgressPatch(entry, activity)
      result = { masteryScore: patch.masteryScore, mastered: patch.status === 'mastered', justMastered: patch.justMastered }
      const next = {
        ...prev,
        [objectiveId]: { ...entry, ...patch },
      }
      saveProgress(next)
      return next
    })
    return result
  }, [setProgress])

  const handleMissed = useCallback((entry) => {
    setMissed(prev => {
      if (isDuplicateMissedEntry(prev, entry)) return prev
      const next = [...prev, entry]
      saveMissed(next)
      return next
    })
  }, [setMissed])

  const removeMissed = useCallback((idx) => {
    setMissed(prev => {
      const next = prev.filter((_, i) => i !== idx)
      saveMissed(next)
      return next
    })
  }, [setMissed])

  const removeMissedByQuestionIds = useCallback((questionIds) => {
    const drop = new Set((questionIds || []).filter(Boolean))
    if (!drop.size) return
    setMissed(prev => {
      const next = prev.filter(m => !drop.has(m?.id ?? m?.questionId))
      saveMissed(next)
      return next
    })
  }, [setMissed])

  return { updateProgress, recordEngagement, handleMissed, removeMissed, removeMissedByQuestionIds }
}
