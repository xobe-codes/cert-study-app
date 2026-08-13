import { describe, expect, it } from 'vitest'
import { diagnoseCliMiss } from '../lab/cliMissDiagnosis.js'
import { processCliLine } from '../lab/cliProcess.js'

const tasks = [
  { answer: ['no shutdown'], label: 'Bring the interface up' },
  { answer: ['ip address 10.0.0.1 255.255.255.0'], label: 'Address the interface' },
]

describe('diagnoseCliMiss', () => {
  it('explains a negated command', () => {
    const d = diagnoseCliMiss('no ip address 10.0.0.1 255.255.255.0', tasks, [false, false])
    expect(d?.kind).toBe('negation')
    expect(d.message).toMatch(/removes the configuration/)
  })

  it('explains a missing "no" form', () => {
    expect(diagnoseCliMiss('shutdown', tasks, [false, false])?.kind).toBe('missing-negation')
  })

  it('flags extra keywords rather than accepting them', () => {
    const d = diagnoseCliMiss('ip address 10.0.0.1 255.255.255.0 secondary', tasks, [false, false])
    expect(d?.kind).toBe('extra-keywords')
  })

  it('flags an incomplete command', () => {
    expect(diagnoseCliMiss('ip address 10.0.0.1', tasks, [false, false])?.kind).toBe('incomplete')
  })

  it('flags a wrong argument', () => {
    expect(diagnoseCliMiss('ip address 10.0.0.9 255.255.255.0', tasks, [false, false])?.kind).toBe('wrong-argument')
  })

  it('stays silent when nothing specific applies', () => {
    expect(diagnoseCliMiss('show version', tasks, [false, false])).toBeNull()
    expect(diagnoseCliMiss('', tasks, [false, false])).toBeNull()
    expect(diagnoseCliMiss('no shutdown', [], [])).toBeNull()
  })

  it('ignores tasks the learner already completed', () => {
    expect(diagnoseCliMiss('shutdown', tasks, [true, false])).toBeNull()
  })
})

describe('processCliLine surfaces the diagnosis', () => {
  it('tells the learner they negated the command', () => {
    const res = processCliLine({
      raw: 'no ip address 10.0.0.1 255.255.255.0',
      mode: 'config-if',
      host: 'R1',
      objectives: tasks,
      completed: [false, false],
    })
    expect(res.newlyCompleted).toEqual([])
    expect(res.lines.some(l => /removes the configuration/.test(l.text))).toBe(true)
  })
})
