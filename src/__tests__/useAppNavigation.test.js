import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { hasNamedImport } from './importContracts.js'

describe('useAppNavigation extract', () => {
  it('App.jsx imports navigation hook and lifecycle', () => {
    const app = readFileSync(resolve('src/App.jsx'), 'utf8')
    expect(hasNamedImport(app, 'useAppNavigation', './features/navigation/useAppNavigation.js')).toBe(true)
    expect(hasNamedImport(app, 'AppNavigationLifecycle', './features/navigation/useAppNavigation.js')).toBe(true)
  })
})
