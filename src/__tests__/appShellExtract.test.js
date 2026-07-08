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

  it('appShell.js stays under 900 lines after chrome CSS extract', () => {
    const lines = readFileSync(resolve(process.cwd(), 'src/ui/appShell.js'), 'utf8').split('\n').length
    expect(lines).toBeLessThanOrEqual(900)
    const chrome = readFileSync(resolve(process.cwd(), 'src/ui/appShellChromeCss.js'), 'utf8')
    expect(chrome).toContain('buildAppShellChromeCss')
    expect(chrome).toContain('app-bottom-nav')
  })

  it('studyQuizTabs modules stay under 900 lines', () => {
    for (const rel of [
      'src/tabs/ExplainTab.jsx',
      'src/tabs/QuizTab.jsx',
      'src/tabs/studyQuizShared.jsx',
      'src/tabs/studyQuizTabs.jsx',
    ]) {
      const lines = readFileSync(resolve(process.cwd(), rel), 'utf8').split('\n').length
      expect(lines, rel).toBeLessThanOrEqual(900)
    }
  })
})
