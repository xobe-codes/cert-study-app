import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  APP_IMPORTS,
  APP_SRS_IMPORTS,
  STUDY_QUIZ_TAB_IMPORTS,
  hasNamedImport,
  usesSymbol,
} from './importContracts.js'

const ROOT = resolve(import.meta.dirname, '..')
const appSource = readFileSync(resolve(ROOT, 'App.jsx'), 'utf8')
const tabsSource = readFileSync(resolve(ROOT, 'tabs/studyQuizTabs.jsx'), 'utf8')

describe('App.jsx import regression', () => {
  for (const { symbol, from } of APP_IMPORTS) {
    it(`imports ${symbol} from ${from}`, () => {
      expect(hasNamedImport(appSource, symbol, from)).toBe(true)
    })
  }

  for (const { symbol, from } of APP_SRS_IMPORTS) {
    it(`imports ${symbol} from ${from}`, () => {
      expect(hasNamedImport(appSource, symbol, from)).toBe(true)
    })
  }

  it('does not reference LabsHub without import', () => {
    if (usesSymbol(appSource, 'LabsHub')) {
      expect(hasNamedImport(appSource, 'LabsHub', './lab/LabsHub.jsx')).toBe(true)
    }
  })

  it('does not reference SubnetPracticeHome without import', () => {
    if (usesSymbol(appSource, 'SubnetPracticeHome')) {
      expect(hasNamedImport(appSource, 'SubnetPracticeHome', './tabs/studyQuizTabs.jsx')).toBe(true)
    }
  })
})

describe('studyQuizTabs.jsx import regression', () => {
  for (const { symbol, from } of STUDY_QUIZ_TAB_IMPORTS) {
    it(`imports ${symbol} from ${from}`, () => {
      expect(hasNamedImport(tabsSource, symbol, from)).toBe(true)
    })
  }

  it('exports symbols consumed by App.jsx', async () => {
    const mod = await import('../tabs/studyQuizTabs.jsx')
    expect(typeof mod.objectiveTabId).toBe('function')
    expect(typeof mod.objectivePanelId).toBe('function')
    expect(typeof mod.SubnetPracticeHome).toBe('function')
    expect(typeof mod.ExplainTab).toBe('function')
    expect(typeof mod.QuizTab).toBe('function')
  })
})
