import { beforeAll, describe, expect, it } from 'vitest'
import { getCuratedQuestions } from '../data/ccnaCurated.js'
import { preloadCleanBankForObjective } from '../data/cleanQuestionAdapter.js'
import { buildStemAnchoredIncorrect } from '../answerReview/stemAnchoredDistractor.js'

describe('Domains 5 and 6 question integrity', () => {
  beforeAll(async () => {
    await Promise.all(['5.3', '5.8', '6.2', '6.6'].map(preloadCleanBankForObjective))
  })

  it('states both factors in the smart-card MFA question', () => {
    const question = getCuratedQuestions('5.3').find(q => q.id === 'obj-5.4-source-q005')
    expect(question.question).toMatch(/smart card.*(?:passphrase|PIN)/i)
    expect(question.choices[question.correctIndex]).toBe('Multifactor authentication')
    expect(question.ckuIds).not.toContain('CKU-RADIUS')
  })

  it('keeps WPA2 as the strong SOHO admission control', () => {
    const question = getCuratedQuestions('5.8').find(q => q.id === 'obj-5.9-source-q001')
    expect(question.choices[question.correctIndex]).toBe('Enable WPA2')
    expect(question.answerReview.incorrect.map(item => item.choiceIndex)).toEqual([1, 2, 3])
    expect(question.ckuIds).not.toContain('CKU-PORT-SECURITY')

    const hiddenSsid = buildStemAnchoredIncorrect({ q: question, choiceIndex: 3 })
    expect(hiddenSsid.whatItDoes).toMatch(/hides the network name/i)
    expect(hiddenSsid.whyWrongHere).toMatch(/WLAN security/i)
    expect(hiddenSsid.explanation).not.toMatch(/routing|flooding the frame/i)
  })

  it('formats JSON exhibits as readable multiline blocks', () => {
    const question = getCuratedQuestions('6.6').find(q => q.id === 'obj-6.7-source-q010')
    expect(question.question).toContain('JSON exhibit:\n{\n')
    expect(question.question).toContain('\n  "routes": [\n')
    expect(question.answerReview.incorrect.map(item => item.choiceIndex)).toEqual([1, 2, 3])
  })

  it('removes distractor-only CKUs from runtime tracking', () => {
    const prime = getCuratedQuestions('6.2').find(q => q.id === 'obj-6.2-source-q009')
    const ansible = getCuratedQuestions('6.6').find(q => q.id === 'obj-6.6-source-q002')
    expect(prime.ckuIds).not.toContain('CKU-RESTCONF')
    expect(ansible.ckuIds).not.toContain('CKU-CISCO-DNA-CENTER')
  })
})
