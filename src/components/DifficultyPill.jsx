import React from 'react'
import { styles } from '../ui/appTheme.js'
import { difficultyAccent } from '../curatedDisplay.js'

function pillFontSize(size) {
  if (typeof size === 'string') return size
  if (size <= 8) return 'var(--ccna-type-micro)'
  if (size <= 10) return 'var(--ccna-type-xs)'
  return 'var(--ccna-type-sm)'
}

export default function DifficultyPill({ difficulty, fontSize = 9, style = {} }) {
  if (!difficulty) return null
  return (
    <span style={{ ...styles.pill(difficultyAccent(difficulty)), fontSize: pillFontSize(fontSize), marginLeft: 6, flexShrink: 0, ...style }}>
      {difficulty.toUpperCase()}
    </span>
  )
}
