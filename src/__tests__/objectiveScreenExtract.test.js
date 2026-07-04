import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('objective screen extract', () => {
  it('ObjectiveScreen.jsx is under 210 lines', () => {
    const src = readFileSync(resolve(process.cwd(), 'src/ObjectiveScreen.jsx'), 'utf8')
    const lineCount = src.split('\n').length
    expect(lineCount).toBeLessThanOrEqual(204)
  })

  it('extracted modules exist under features/objective', () => {
    const files = [
      'src/features/objective/objectiveTabUtils.js',
      'src/features/objective/useObjectiveQuizProgress.js',
      'src/features/objective/ObjectiveHeader.jsx',
      'src/features/objective/ObjectiveToolPanels.jsx',
      'src/features/objective/ObjectiveTabPanels.jsx',
    ]
    for (const f of files) {
      expect(readFileSync(resolve(process.cwd(), f), 'utf8').length).toBeGreaterThan(50)
    }
  })
})
