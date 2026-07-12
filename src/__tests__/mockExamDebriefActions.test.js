import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import React from 'react'
import MockExamDebriefActions from '../features/mockExam/MockExamDebriefActions.jsx'

describe('MockExamDebriefActions', () => {
  it('renders weak domain and trap drill CTAs', () => {
    const html = renderToStaticMarkup(
      React.createElement(MockExamDebriefActions, {
        report: {
          byDomain: {
            security: { correct: 1, total: 5 },
            access: { correct: 4, total: 5 },
          },
          trapDebrief: [{ trap: 'Forgetting the implicit deny.', count: 2, objectiveIds: ['5.5'] }],
        },
        questions: [
          { id: '5.5-c-q1', objectiveId: '5.5', correctIndex: 0 },
          { id: '5.1-q3', objectiveId: '5.1', correctIndex: 1 },
        ],
        responses: { 0: 1, 1: 0 },
        domains: [
          { id: 'security', name: 'Security', objectives: [{ id: '5.5' }, { id: '5.1' }] },
          { id: 'access', name: 'Network Access', objectives: [{ id: '2.1' }] },
        ],
        onOpenTrapDrill: () => {},
        onOpenLab: () => {},
        onStudyDomain: () => {},
        onSelectObjective: () => {},
        onOpenDomainPass: () => {},
      }),
    )
    expect(html).toContain('Next steps')
    expect(html).toContain('Study Security')
    expect(html).toContain('Pass Focus')
    expect(html).toContain('Drill trap')
    expect(html).toContain('Weakest topic')
    expect(html).toContain('Study 5.5')
  })
})
