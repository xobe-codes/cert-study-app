import { useState, useCallback } from 'react'

export function useObjectiveStudyBlockSwitch({ isActive, blockState, continueOnObjective, stop, onSelectObjective }) {
  const [switchPrompt, setSwitchPrompt] = useState(null)

  const handleSelectSibling = useCallback((target) => {
    if (!target) return
    if (isActive && blockState.objectiveId && blockState.objectiveId !== target.id) {
      setSwitchPrompt(target)
      return
    }
    onSelectObjective?.(target)
  }, [isActive, blockState.objectiveId, onSelectObjective])

  const confirmSwitch = useCallback((choice) => {
    if (!switchPrompt) return
    if (choice === 'continue') {
      continueOnObjective(switchPrompt.id)
      onSelectObjective?.(switchPrompt)
    } else if (choice === 'switch') {
      stop()
      onSelectObjective?.(switchPrompt)
    }
    setSwitchPrompt(null)
  }, [switchPrompt, continueOnObjective, stop, onSelectObjective])

  return { switchPrompt, setSwitchPrompt, handleSelectSibling, confirmSwitch }
}
