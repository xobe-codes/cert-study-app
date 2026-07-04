import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('app shell extract', () => {
  it('App.jsx is under 200 lines after AppLoadedShell extract', () => {
    const lines = readFileSync(resolve(process.cwd(), 'src/App.jsx'), 'utf8').split('\n').length
    expect(lines).toBeLessThanOrEqual(200)
  })

  it('AppLoadedShell module exists', () => {
    const src = readFileSync(resolve(process.cwd(), 'src/features/shell/AppLoadedShell.jsx'), 'utf8')
    expect(src).toContain('AppChromeOverlays')
    expect(src.length).toBeGreaterThan(500)
  })
})
