/** Which choice rows stay visible vs collapse after reveal. */
export function getRevealedChoiceLayout(choiceCount, correctIndex, selected) {
  const primary = new Set([correctIndex])
  if (selected != null && selected !== correctIndex) primary.add(selected)
  const primaryIndices = [...primary].sort((a, b) => a - b)
  const collapsedIndices = Array.from({ length: choiceCount }, (_, i) => i).filter(i => !primary.has(i))
  return { primaryIndices, collapsedIndices }
}
