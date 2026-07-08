import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  APP_IMPORTS,
  APP_LOADED_SHELL_IMPORTS,
  APP_SRS_IMPORTS,
  STUDY_QUIZ_TAB_IMPORTS,
  hasNamedImport,
  hasLazyImport,
  usesSymbol,
} from './importContracts.js'

const ROOT = resolve(import.meta.dirname, '..')
const appSource = readFileSync(resolve(ROOT, 'App.jsx'), 'utf8')
const loadedShellSource = readFileSync(resolve(ROOT, 'features/shell/AppLoadedShell.jsx'), 'utf8')

describe('App.jsx import regression', () => {
  for (const { symbol, from } of APP_IMPORTS) {
    it(`imports ${symbol} from ${from}`, () => {
      expect(hasNamedImport(appSource, symbol, from)).toBe(true)
    })
  }

  for (const { symbol, from } of APP_LOADED_SHELL_IMPORTS) {
    it(`AppLoadedShell imports ${symbol} from ${from}`, () => {
      expect(hasNamedImport(loadedShellSource, symbol, from)).toBe(true)
    })
  }

  for (const { symbol, from, file } of APP_SRS_IMPORTS) {
    it(`imports ${symbol} from ${from}`, () => {
      const source = file ? readFileSync(resolve(ROOT, file), 'utf8') : appSource
      expect(hasNamedImport(source, symbol, from)).toBe(true)
    })
  }

  it('does not reference LabsHub without import in study routes', () => {
    const studySource = readFileSync(resolve(ROOT, 'features/study/StudyModeRoutes.jsx'), 'utf8')
    if (usesSymbol(studySource, 'LabsHub')) {
      expect(hasLazyImport(studySource, 'LabsHub', '../../lab/LabsHub.jsx')).toBe(true)
    }
  })

  it('does not reference SubnetPracticeHome without import in study routes', () => {
    const studySource = readFileSync(resolve(ROOT, 'features/study/StudyModeRoutes.jsx'), 'utf8')
    if (usesSymbol(studySource, 'SubnetPracticeHome')) {
      expect(hasNamedImport(studySource, 'SubnetPracticeHome', '../../tabs/studyQuizTabs.jsx')).toBe(true)
    }
  })

  it('does not reference HomeScreen without import in core routes', () => {
    const coreSource = readFileSync(resolve(ROOT, 'features/shell/CoreStudyRoutes.jsx'), 'utf8')
    if (usesSymbol(coreSource, 'HomeScreen')) {
      expect(hasNamedImport(coreSource, 'HomeScreen', '../../HomeScreen.jsx')).toBe(true)
    }
  })
})

describe('studyQuizTabs.jsx import regression', () => {
  for (const { symbol, from, file } of STUDY_QUIZ_TAB_IMPORTS) {
    it(`imports ${symbol} from ${from}`, () => {
      const source = readFileSync(resolve(ROOT, file), 'utf8')
      expect(hasNamedImport(source, symbol, from)).toBe(true)
    })
  }

  it('exports symbols consumed by App.jsx', async () => {
    const mod = await import('../tabs/studyQuizTabs.jsx')
    expect(typeof mod.objectiveTabId).toBe('function')
    expect(typeof mod.objectivePanelId).toBe('function')
    expect(typeof mod.SubnetPracticeHome).toBe('function')
    expect(typeof mod.ExplainTab).toBe('function')
    expect(typeof mod.QuizTab).toBe('function')
  }, 15000)
})
