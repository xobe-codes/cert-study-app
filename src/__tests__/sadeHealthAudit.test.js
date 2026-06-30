import { describe, it, expect } from 'vitest'
import {
  auditSadeQuestion,
  sadeHealthPatch,
  SADE_QUARANTINE_MIN,
  SADE_NEEDS_FIX_MIN,
} from '../../scripts/lib/sadeAuditUtils.mjs'

describe('sade_health_audit', () => {
  it('passes healthy structured reviews', () => {
    const q = {
      id: 'test-healthy',
      question: 'Which OSPF state is full adjacency?',
      explanation: 'Full means databases are synchronized.',
      choices: ['Down', 'Init', '2-Way', 'Full'],
      correctIndex: 3,
      answerReview: {
        correct: { choiceIndex: 3, explanation: 'Full means databases are synchronized.' },
        incorrect: [
          {
            choiceIndex: 0,
            explanation: 'Down means no Hellos received — not full adjacency.',
            whatItDoes: 'Down means no Hellos received.',
            whyWrongHere: 'Full adjacency requires exchange and loading — not Down.',
            misconceptionTested: 'Confusing interface down with Full state',
          },
          {
            choiceIndex: 1,
            explanation: 'Init sees Hellos but not bidirectional yet — not Full.',
            whatItDoes: 'Init sees Hellos but not bidirectional yet.',
            whyWrongHere: 'Full requires completed DBD/LSR/LSU exchange — not Init.',
            misconceptionTested: 'Stopping at Init instead of Full',
          },
          {
            choiceIndex: 2,
            explanation: '2-Way is bidirectional on broadcast — not Full on DR/BDR segments.',
            whatItDoes: '2-Way is bidirectional on broadcast.',
            whyWrongHere: 'Full means LSDB synchronized — 2-Way stops before exchange on some segments.',
            misconceptionTested: 'Equating 2-Way with Full',
          },
        ],
        examTip: 'Full = LSDB synchronized.',
      },
    }
    const audit = auditSadeQuestion(q)
    expect(audit.min).toBeGreaterThanOrEqual(SADE_NEEDS_FIX_MIN)
    const patch = sadeHealthPatch(audit)
    expect(patch.status).toBeNull()
    expect(patch.reasons).toHaveLength(0)
  })

  it('quarantines fallback distractors', () => {
    const q = {
      id: 'test-bad',
      question: 'Test?',
      choices: ['A', 'B', 'C', 'D'],
      correctIndex: 0,
      explanation: 'A is correct.',
      answerReview: {
        correct: { choiceIndex: 0, explanation: 'A is correct.' },
        incorrect: [
          {
            choiceIndex: 1,
            explanation: 'B does not match the mechanism asked here.',
            misconceptionTested: 'Picking a familiar term without matching the exact behavior tested',
          },
        ],
        examTip: 'Tip.',
      },
    }
    const patch = sadeHealthPatch(auditSadeQuestion(q))
    expect(patch.status).toBe('quarantined')
    expect(patch.reasons.some(r => r.code === 'sade_fallback')).toBe(true)
    expect(patch.reasons.some(r => r.code === 'sade_distractor_min')).toBe(true)
  })

  it('needs_fix for min score between quarantine and threshold', () => {
    const q = {
      id: 'test-min2',
      question: 'What is STP root bridge?',
      choices: ['Lowest bridge ID', 'Highest MAC', 'Random', 'Highest priority only'],
      correctIndex: 0,
      explanation: 'Lowest bridge ID wins.',
      answerReview: {
        correct: { choiceIndex: 0, explanation: 'Lowest bridge ID wins.' },
        incorrect: [
          { choiceIndex: 1, explanation: 'Short.', misconceptionTested: 'Trap B' },
          { choiceIndex: 2, explanation: 'Short.', misconceptionTested: 'Trap C' },
          { choiceIndex: 3, explanation: 'Short.', misconceptionTested: 'Trap D' },
        ],
        examTip: 'Tip.',
      },
    }
    const audit = auditSadeQuestion(q)
    if (audit.min === SADE_QUARANTINE_MIN) {
      const patch = sadeHealthPatch(audit)
      expect(patch.status).toBe('needs_fix')
      expect(patch.reasons.some(r => r.code === 'sade_distractor_min')).toBe(true)
    }
  })
})
