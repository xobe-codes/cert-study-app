import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import React from 'react'
import CoreStudyRoutes from '../features/shell/CoreStudyRoutes.jsx'

describe('CoreStudyRoutes', () => {
  const baseProps = {
    view: 'labs',
    onFinishOnboarding: () => {},
    onSkipOnboarding: () => {},
    progress: {},
    streak: { count: 0 },
    missed: [],
    apiOnline: true,
    offlineReady: new Set(),
    selectObjective: () => {},
    openMockExam: () => {},
    navigateTo: () => {},
    handlePremiumBlocked: () => {},
    premiumUnlocked: false,
    domainPassPassedCount: 0,
    domainPassRecords: {},
    settingsExamDate: null,
    dueCount: 0,
    openDomain: null,
    setOpenDomain: () => {},
    openExamTraps: () => {},
    openTrapDrill: () => {},
    openDomainPass: () => {},
    openDomainPlacement: () => {},
    theme: 'dark',
    toggleTheme: () => {},
    setShowSettings: () => {},
    selectedObjective: null,
    packagingId: null,
    packageObjective: () => {},
    goBack: () => {},
    objectiveBackLabel: 'Back',
    updateProgress: () => {},
    handleMissed: () => {},
    openLab: () => {},
    setView: () => {},
    computeMastery: () => 0,
    logEvent: () => {},
    celebrate: () => {},
    haptic: () => {},
    settingsExamMode: false,
    mockDomainPrefill: null,
    setMockDomainPrefill: () => {},
  }

  it('returns null for non-core views', () => {
    const html = renderToStaticMarkup(React.createElement(CoreStudyRoutes, baseProps))
    expect(html).toBe('')
  })

  it('renders objective loading spinner when objective selected is pending', () => {
    const html = renderToStaticMarkup(
      React.createElement(CoreStudyRoutes, { ...baseProps, view: 'objective' }),
    )
    expect(html).toMatch(/Loading topic/i)
  })
})
