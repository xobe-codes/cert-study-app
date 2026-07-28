import { describe, expect, it } from 'vitest'
import { auditDomainQuestions, auditQuestion } from '../../scripts/auditQuestionV2.mjs'

const domain = { id: 'fundamentals' }

function question(overrides = {}) {
  return {
    id: '1.1-q1',
    question: 'Which device forwards packets using destination IP addresses?',
    choices: ['Router', 'Switch', 'Hub', 'Repeater'],
    correctIndex: 0,
    answerReview: {
      correct: { choiceIndex: 0, explanation: 'A router forwards by destination IP.' },
      incorrect: [
        { choiceIndex: 1, explanation: 'A switch forwards frames by MAC address within a VLAN.' },
        { choiceIndex: 2, explanation: 'A hub repeats bits and does not inspect destination IP.' },
        { choiceIndex: 3, explanation: 'A repeater regenerates signals and does not route packets.' },
      ],
    },
    sourceFile: '1.1.json',
    ...overrides,
  }
}

describe('Question V2 domain audit', () => {
  it('accepts a structurally aligned question', () => {
    expect(auditQuestion(question(), { objectiveId: '1.1', domain })).toEqual([])
  })

  it('finds duplicate choices, ownership drift, answer leaks, and wrong review indexes', () => {
    const findings = auditQuestion(question({
      objectiveId: '2.1',
      domainId: 'access',
      question: 'Exhibit:\n\n! Answer: Router\n\nExhibit:\n\nWhich device?',
      choices: ['Router', '`Router`', 'Hub'],
      correctIndex: 0,
      answerReview: {
        correct: { choiceIndex: 1 },
        incorrect: [{ choiceIndex: 0 }, { choiceIndex: 2 }],
      },
    }), { objectiveId: '1.1', domain })

    expect(findings.map(finding => finding.tag)).toEqual(expect.arrayContaining([
      'ownership_mismatch',
      'duplicate_choices',
      'bad_display',
      'answer_leak',
      'wrong_choice_index',
    ]))
  })

  it('reports duplicate IDs and sources outside the canonical domain', () => {
    const report = auditDomainQuestions([
      question(),
      question({ sourceFile: '9.9.json' }),
    ], { domainNumber: 1 })

    expect(report.byTag.duplicate_id).toBe(1)
    expect(report.byTag.ownership_mismatch).toBe(1)
    expect(report.bySeverity.P0).toBeGreaterThanOrEqual(2)
  })

  it('blocks legacy structured filler when no specific explanation can replace it', () => {
    const findings = auditQuestion(question({
      answerReview: {
        correct: { choiceIndex: 0, explanation: 'A router forwards by destination IP.' },
        incorrect: [{
          choiceIndex: 1,
          whyWrongHere: 'For "device role", Router matches the required behavior — Switch answers a different mechanism or constraint than the stem asks.',
          whatItDoes: 'Switch points to a related idea, but not the specific behavior or value required for device role.',
          explanation: 'Switch points to a related idea, but not the specific behavior or value required for device role.',
        }],
      },
    }), { objectiveId: '1.1', domain })

    expect(findings.map(finding => finding.tag)).toContain('generic_feedback')
  })

  it('accepts a choice-specific explanation appended to a legacy short label', () => {
    const findings = auditQuestion(question({
      answerReview: {
        correct: { choiceIndex: 0, explanation: 'A router forwards by destination IP.' },
        incorrect: [{
          choiceIndex: 1,
          whatItDoes: 'Switch points to a related idea, but not the specific behavior or value required for device role.',
          whyWrongHere: 'A switch reads destination MAC addresses inside a VLAN; it does not route between IP networks.',
          explanation: 'Switch points to a related idea, but not the specific behavior or value required for device role. A switch reads destination MAC addresses inside a VLAN; it does not route between IP networks.',
        }],
      },
    }), { objectiveId: '1.1', domain })

    expect(findings.map(finding => finding.tag)).not.toContain('generic_feedback')
  })

  it('keeps command wildcards distinct from Markdown emphasis', () => {
    const findings = auditQuestion(question({
      choices: ['clear ip nat translation', 'clear ip nat translation *', 'show ip nat translations'],
      correctIndex: 1,
    }), { objectiveId: '1.1', domain })

    expect(findings.map(finding => finding.tag)).not.toContain('duplicate_choices')
  })
})
