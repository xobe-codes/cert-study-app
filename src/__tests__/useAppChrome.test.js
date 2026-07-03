import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { hasNamedImport } from './importContracts.js'

describe('useAppChrome extract', () => {
  it('App.jsx imports useAppChrome', () => {
    const app = readFileSync(resolve('src/App.jsx'), 'utf8')
    expect(hasNamedImport(app, 'useAppChrome', './features/shell/useAppChrome.js')).toBe(true)
  })
})
