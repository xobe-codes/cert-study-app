import React, { createContext, useContext, useMemo } from 'react'

const MasteryProgressContext = createContext({
  updateProgress: () => {},
  recordEngagement: () => null,
})

export function MasteryProgressProvider({ updateProgress, recordEngagement, children }) {
  const value = useMemo(
    () => ({ updateProgress, recordEngagement }),
    [updateProgress, recordEngagement],
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
