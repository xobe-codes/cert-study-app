import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import React from 'react'
import StudyModeRoutes from '../features/study/StudyModeRoutes.jsx'

describe('StudyModeRoutes', () => {
  const baseProps = {
    view: 'home',
    selectedLab: null,
    labReturn: 'labs',
    topicFocusConfig: null,
    setTopicFocusConfig: () => {},
    examTrapPrefill: null,
    clearExamTrapPrefill: () => {},
    trapDrillPrefill: null,
    clearTrapDrillPrefill: () => {},
    activeDomainPassId: null,
    setActiveDomainPassId: () => {},
    settingsExamMode: false,
    missed: [],
    onBack: () => {},
    onNavigate: () => {},
    onExitLab: () => {},
    onOpenLab: () => {},
    onOpenMockExam: () => {},
    onOpenTrapDrill: () => {},
    onSelectObjective: () => {},
    onRefreshDomainPassCount: () => {},
    onMissed: () => {},
    onDone: () => {},
    onOpenSettings: () => {},
    celebrate: () => {},
    haptic: () => {},
    premiumUnlocked: false,
    onPremiumBlocked: () => {},
  }

  it('returns null for non-study views', () => {
    const html = renderToStaticMarkup(React.createElement(StudyModeRoutes, baseProps))
    expect(html).toBe('')
  })

  it('renders subnet practice for subnet view', () => {
    const html = renderToStaticMarkup(
      React.createElement(StudyModeRoutes, { ...baseProps, view: 'subnet' }),
    )
    expect(html).toMatch(/subnet|Subnet/i)
  })
})
