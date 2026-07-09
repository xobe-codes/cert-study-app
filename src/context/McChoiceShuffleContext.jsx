import React, { createContext, useContext } from 'react'
import { useMcChoiceShuffle } from '../hooks/useMcChoiceShuffle.js'

const McChoiceShuffleContext = createContext(null)

/** Share one permutation per question between McChoices and AnswerReview. */
export function McChoiceShuffleProvider({ q, enabled = true, children }) {
  const shuffle = useMcChoiceShuffle(q, { enabled })
  return (
    <McChoiceShuffleContext.Provider value={shuffle}>
      {children}
    </McChoiceShuffleContext.Provider>
  )
}

export function useMcChoiceShuffleContext() {
  return useContext(McChoiceShuffleContext)
}
