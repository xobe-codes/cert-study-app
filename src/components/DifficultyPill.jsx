import React from 'react'
import { styles } from '../ui/appTheme.js'
import { difficultyAccent } from '../curatedDisplay.js'

export default function DifficultyPill({ difficulty, fontSize = 9, style = {} }) {
  if (!difficulty) return null
  return (
    <span style={{ ...styles.pill(difficultyAccent(difficulty)), fontSize, marginLeft: 6, flexShrink: 0, ...style }}>
      {difficulty.toUpperCase()}
    </span>
  )
}
