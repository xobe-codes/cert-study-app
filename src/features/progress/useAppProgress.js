import { useCallback } from 'react'
import { saveProgress, saveMissed } from '../../storage/appPersistence.js'

/** Progress and missed-question handlers — extracted from App.jsx. */
export function useAppProgress({ setProgress, setMissed }) {
  const updateProgress = useCallback((objectiveId, patch) => {
    setProgress(prev => {
      const next = {
        ...prev,
        [objectiveId]: { status: 'unseen', quizScores: [], ...prev[objectiveId], ...patch },
      }
      saveProgress(next)
      return next
    })
  }, [setProgress])

  const handleMissed = useCallback((entry) => {
    setMissed(prev => {
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

  return { updateProgress, handleMissed, removeMissed }
}
