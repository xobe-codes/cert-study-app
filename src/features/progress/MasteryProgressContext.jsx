import React, { createContext, useContext, useMemo } from 'react'

const MasteryProgressContext = createContext({
  updateProgress: () => {},
  recordEngagement: () => null,
  removeMissedByQuestionIds: () => {},
})

export function MasteryProgressProvider({ updateProgress, recordEngagement, removeMissedByQuestionIds, children }) {
  const value = useMemo(
    () => ({ updateProgress, recordEngagement, removeMissedByQuestionIds }),
    [updateProgress, recordEngagement, removeMissedByQuestionIds],
  )
  return (
    <MasteryProgressContext.Provider value={value}>
      {children}
    </MasteryProgressContext.Provider>
  )
}

export function useMasteryProgress() {
  return useContext(MasteryProgressContext)
}
