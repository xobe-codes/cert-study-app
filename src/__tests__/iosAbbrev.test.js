import { describe, it, expect } from 'vitest'
import {
  resolveIosAbbreviation,
  getTabCompletion,
  resolveIosAbbreviationForGrading,
} from '../lab/iosAbbrev.js'
import {
  processCliLine,
  commandMatchesAbbrev,
  gradeCliAnswerList,
} from '../lab/cliEngine.js'

describe('iosAbbrev', () => {
  it('expands unique-prefix show command', () => {
    expect(resolveIosAbbreviation('sh ip int br', 'priv').resolved).toBe('show ip interface brief')
  })

  it('expands int to interface for navigation', () => {
    expect(resolveIosAbbreviation('int gi0/1', 'config').resolved).toBe('interface gi0/1')
  })

  it('expands switchport mode access from minimal unique prefixes', () => {
    const r = resolveIosAbbreviation('sw mo acc', 'config-if')
    expect(r.error).toBeUndefined()
    expect(r.resolved).toBe('switchport mode access')
  })

  it('expands no shut to no shutdown on interface', () => {
    expect(resolveIosAbbreviation('no shut', 'config-if').resolved).toBe('no shutdown')
  })

  it('flags ambiguous prefix when multiple commands share a prefix', () => {
    const r = resolveIosAbbreviation('e', 'user')
    expect(r.error).toBe('ambiguous')
  })

  it('expands unique show prefix', () => {
    expect(resolveIosAbbreviation('s', 'priv').resolved).toBe('show')
  })

  it('grades abbreviated CLI drill answers', () => {
    expect(gradeCliAnswerList('sw mo acc', ['switchport mode access'])).toBe(true)
    expect(gradeCliAnswerList('sh ip int br', ['show ip interface brief'])).toBe(true)
    expect(gradeCliAnswerList('sh ip route', ['show ip route'])).toBe(true)
  })

  it('tab completes partial show to common prefix', () => {
    const next = getTabCompletion('s', 'priv')
    expect(next).toMatch(/^show/)
  })

  it('resolveIosAbbreviationForGrading finds priv show commands', () => {
    const r = resolveIosAbbreviationForGrading('sh run')
    expect(r.resolved).toMatch(/^show running-config/)
  })
})

describe('processCliLine abbreviation', () => {
  const host = 'Router'
  const objectives = [{ answer: ['switchport mode access'], label: 'access mode' }]

  it('accepts abbreviated config-if command', () => {
    let mode = 'config-if'
    const result = processCliLine({
      raw: 'sw mo acc',
      mode,
      host,
      objectives,
      completed: [false],
    })
    expect(result.counters.syntaxErrors).toBe(0)
    expect(result.newlyCompleted).toContain(0)
  })

  it('returns ambiguous error for conflicting prefix', () => {
    const result = processCliLine({
      raw: 'e',
      mode: 'user',
      host,
      objectives: [],
      completed: [],
    })
    expect(result.lines.some(l => l.text.includes('Ambiguous command'))).toBe(true)
    expect(result.counters.syntaxErrors).toBe(1)
  })

  it('commandMatchesAbbrev links shorthand to expected', () => {
    expect(commandMatchesAbbrev('sw mo tr', 'switchport mode trunk', 'config-if')).toBe(true)
  })
})
