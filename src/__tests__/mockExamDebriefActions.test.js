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
        questions: [{ id: '5.5-c-q1', correctIndex: 0 }],
        responses: { 0: 1 },
        domains: [
          { id: 'security', name: 'Security' },
          { id: 'access', name: 'Network Access' },
        ],
        onOpenTrapDrill: () => {},
        onOpenLab: () => {},
        onStudyDomain: () => {},
      }),
    )
    expect(html).toContain('Next steps')
    expect(html).toContain('Study Security')
    expect(html).toContain('Trap drill')
  })
})
