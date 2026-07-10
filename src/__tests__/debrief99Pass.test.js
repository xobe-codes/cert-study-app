import { describe, it, expect } from 'vitest'
import { isTemplateWhyWrongHere, isFallbackExplanation } from '../answerReview/answerReviewQuality.js'
import { buildStemAnchoredIncorrect } from '../answerReview/stemAnchoredDistractor.js'
import { applyAnswerReviewToQuestion, resolveIncorrectItem } from '../answerReviewLogic.js'
import { familyRemediationActions } from '../features/practice/debriefRemediation.js'

const TEMPLATE = 'For "router layer", Layer 3 satisfies what this question tests — Layer 1 does not.'

describe('template whyWrongHere detection', () => {
  it('flags the classic SADE/clean-bank template', () => {
    expect(isTemplateWhyWrongHere(TEMPLATE)).toBe(true)
    expect(isFallbackExplanation(TEMPLATE)).toBe(true)
  })

  it('allows stem-grounded contrast copy', () => {
    const ok = 'For "router layer", **Layer 3** matches the required behavior — **Layer 1** answers a different mechanism or constraint than the stem asks.'
    expect(isTemplateWhyWrongHere(ok)).toBe(false)
  })
})

describe('SADE fallback (no template)', () => {
  it('never emits satisfies-what-this-question-tests', () => {
    const q = {
      id: 'sade-fallback-1',
      question: 'Which obscure widget handles the frobulator handshake?',
      explanation: 'The frobulator handshake uses Widget X.',
      concept: 'misc',
      choices: ['Widget X', 'Widget Y', 'Widget Z', 'Widget Q'],
      correctIndex: 0,
    }
    const item = buildStemAnchoredIncorrect({ q, choiceIndex: 1 })
    expect(item.whyWrongHere).toBeTruthy()
    expect(item.whyWrongHere).not.toMatch(/satisfies what this question tests/i)
    expect(item.whatItDoes).toBeTruthy()
    expect(item.misconceptionTested).toBeTruthy()
  })

  it('fires ACL/wildcard contrast branch', () => {
    const q = {
      id: 'sade-acl-1',
      question: 'Which ACL wildcard matches host 10.1.1.5 only?',
      explanation: 'Host wildcard is 0.0.0.0 for a single host.',
      concept: 'acl',
      choices: ['0.0.0.0', '255.255.255.255', '0.0.0.255', '255.0.0.0'],
      correctIndex: 0,
    }
    const item = buildStemAnchoredIncorrect({ q, choiceIndex: 1 })
    expect(item.whyWrongHere).toMatch(/mask|wildcard|ACL/i)
    expect(item.whyWrongHere).not.toMatch(/satisfies what this question tests/i)
  })

  it('rebuilds template stored fields via applyAnswerReviewToQuestion', () => {
    const q = {
      id: 'rebuild-template-1',
      question: 'At which OSI layer does a router primarily operate?',
      explanation: 'Routers forward based on Layer 3 IP addresses.',
      concept: 'osi',
      choices: ['Layer 3', 'Layer 1', 'Layer 2', 'Layer 7'],
      correctIndex: 0,
      answerReview: {
        correct: { choiceIndex: 0, explanation: 'Routers operate at Layer 3.' },
        incorrect: [
          {
            choiceIndex: 1,
            explanation: TEMPLATE,
            whatItDoes: 'Layer 1 is physical signaling.',
            whyWrongHere: TEMPLATE,
            misconceptionTested: 'Picking a familiar term without matching the exact behavior tested',
          },
        ],
        examTip: 'Match the layer to the device function in the stem.',
      },
    }
    const applied = applyAnswerReviewToQuestion(q)
    for (const item of applied.answerReview.incorrect) {
      expect(item.whyWrongHere).not.toMatch(/satisfies what this question tests/i)
    }
    const resolved = resolveIncorrectItem(applied, {
      choiceIndex: 1,
      explanation: TEMPLATE,
      whyWrongHere: TEMPLATE,
    })
    expect(resolved.whyWrongHere).not.toMatch(/satisfies what this question tests/i)
  })
})

describe('familyRemediationActions', () => {
  it('always offers trap drill when trap label present', () => {
    const actions = familyRemediationActions({
      trapLabel: 'Standard vs extended ACL placement or wildcard masks',
      objectiveId: '5.6',
      domainId: 'security',
    })
    expect(actions.some(a => a.kind === 'trapDrill')).toBe(true)
    expect(actions.some(a => a.kind === 'wildcard')).toBe(true)
  })

  it('skips wildcard when unrelated trap', () => {
    const actions = familyRemediationActions({
      trapLabel: 'Confusing STP port roles (root, designated, blocked)',
      domainId: 'lan',
    })
    expect(actions.some(a => a.kind === 'trapDrill')).toBe(true)
    expect(actions.some(a => a.kind === 'wildcard')).toBe(false)
  })
})
