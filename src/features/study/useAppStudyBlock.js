import { useCallback } from 'react'
import { bumpStreak } from '../../storage/appPersistence.js'

/** Study focus-block completion — streak bump for StudyBlockProvider. */
export function useAppStudyBlock({ setStreak }) {
  const handleFocusBlockCompleted = useCallback(async () => {
    const next = await bumpStreak()
    setStreak(next)
  }, [setStreak])

  return { handleFocusBlockCompleted }
}
