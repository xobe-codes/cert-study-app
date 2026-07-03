import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { hasNamedImport } from './importContracts.js'
import { getCurated } from '../data/ccnaCurated.js'

describe('useAppPremium extract', () => {
  it('App.jsx imports useAppPremium', () => {
    const app = readFileSync(resolve('src/App.jsx'), 'utf8')
    expect(hasNamedImport(app, 'useAppPremium', './features/premium/useAppPremium.js')).toBe(true)
  })
})

describe('routing engineerView enrichment', () => {
  for (const id of ['3.3', '3.5', '3.6']) {
    it(`objective ${id} has curated engineerView verify commands`, () => {
      const ev = getCurated(id)?.engineerView
      expect(ev?.verifyCommands?.length).toBeGreaterThanOrEqual(3)
      expect(ev?.trapCallout?.trap).toBeTruthy()
    })
  }
})
