import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { hasNamedImport } from './importContracts.js'

describe('useAppProgress extract', () => {
  it('App.jsx imports useAppProgress', () => {
    const app = readFileSync(resolve('src/App.jsx'), 'utf8')
    expect(hasNamedImport(app, 'useAppProgress', './features/progress/useAppProgress.js')).toBe(true)
  })
})
