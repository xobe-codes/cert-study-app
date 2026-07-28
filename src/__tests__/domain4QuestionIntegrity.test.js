import { beforeAll, describe, expect, it } from 'vitest'
import { getCuratedQuestions } from '../data/ccnaCurated.js'
import { preloadCleanBankForObjective } from '../data/cleanQuestionAdapter.js'

describe('Domain 4 question integrity', () => {
  beforeAll(async () => {
    await preloadCleanBankForObjective('4.1')
    await preloadCleanBankForObjective('4.9')
  })

  it('uses only valid host addresses in the corrected /28 NAT pool', () => {
    const question = getCuratedQuestions('4.1').find(q => q.id === 'obj-4.1-source-q008')
    expect(question.choices[question.correctIndex]).toContain('179.43.44.2 179.43.44.14')
    expect(question.choices[question.correctIndex]).toContain('255.255.255.240')
  })

  it('uses IOS boot system TFTP argument order', () => {
    const question = getCuratedQuestions('4.9').find(q => q.id === 'obj-4.9-source-q003')
    expect(question.choices[question.correctIndex]).toBe(
      'Router(config)#boot system tftp c2900-universalk9-mz.SPA.151-4.M4.bin 192.168.1.2',
    )
  })

  it('removes cross-objective tracking tags from runtime questions', () => {
    const nat = getCuratedQuestions('4.1').find(q => q.id === 'obj-4.1-source-q006')
    const tftp = getCuratedQuestions('4.9').find(q => q.id === 'obj-4.9-source-q003')
    expect(nat.ckuIds).not.toEqual(expect.arrayContaining(['CKU-SNMP-INFORM', 'CKU-SNMP-VIEW']))
    expect(tftp.ckuIds).not.toContain('CKU-CRYPTO-KEY-GENERATE-RSA')
  })
})
