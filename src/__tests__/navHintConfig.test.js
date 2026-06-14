import { describe, it, expect } from 'vitest'
import {
  NAV_HINT_KEYS,
  resolveNavHint,
  parseNavHintMessage,
} from '../ui/navHintConfig.js'

describe('navHintConfig', () => {
  it('resolves known hint keys with icon and accent', () => {
    const hint = resolveNavHint(NAV_HINT_KEYS.QUIZ_PASS, { nextId: '2.1' })
    expect(hint.key).toBe(NAV_HINT_KEYS.QUIZ_PASS)
    expect(hint.icon).toBe('check')
    expect(hint.accent).toBe('mint')
    expect(hint.message).toContain('2.1')
  })

  it('falls back when next objective is missing', () => {
    const hint = resolveNavHint(NAV_HINT_KEYS.QUIZ_PASS)
    expect(hint.message).toContain('Review again')
  })

  it('returns null for unknown keys', () => {
    expect(resolveNavHint('unknown')).toBeNull()
  })

  it('parses bold segments from hint messages', () => {
    const parts = parseNavHintMessage('Open **Home** or try **Quiz** again.')
    expect(parts).toEqual([
      { bold: false, text: 'Open ' },
      { bold: true, text: 'Home' },
      { bold: false, text: ' or try ' },
      { bold: true, text: 'Quiz' },
      { bold: false, text: ' again.' },
    ])
  })
})
