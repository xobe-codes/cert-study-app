import { describe, it, expect } from 'vitest'
import { gradeCliAnswerList, answersMatchShorthand, cliStringsEquivalent } from '../lab/cliGrading.js'

describe('cliGrading', () => {
  it('grades shorthand against accepted answer list', () => {
    expect(gradeCliAnswerList('int gi0/1', ['interface gigabitethernet0/1'])).toBe(true)
    expect(gradeCliAnswerList('conf t', ['configure terminal'])).toBe(true)
    expect(gradeCliAnswerList('sh ip route', ['show ip route'])).toBe(true)
  })

  it('answersMatchShorthand mirrors gradeCliAnswerList', () => {
    expect(answersMatchShorthand('Gi0/1', 'GigabitEthernet0/1')).toBe(true)
    expect(answersMatchShorthand('Gi0/2', 'GigabitEthernet0/1')).toBe(false)
  })

  it('cliStringsEquivalent compares ordering steps', () => {
    expect(cliStringsEquivalent('interface gi0/1', 'interface GigabitEthernet0/1')).toBe(true)
    expect(cliStringsEquivalent('vlan 10', 'vlan 20')).toBe(false)
  })
})
