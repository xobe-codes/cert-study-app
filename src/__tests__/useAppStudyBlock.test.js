import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { hasNamedImport } from './importContracts.js'

describe('useAppStudyBlock extract', () => {
  it('App.jsx imports useAppStudyBlock', () => {
    const app = readFileSync(resolve('src/App.jsx'), 'utf8')
    expect(hasNamedImport(app, 'useAppStudyBlock', './features/study/useAppStudyBlock.js')).toBe(true)
  })
})
