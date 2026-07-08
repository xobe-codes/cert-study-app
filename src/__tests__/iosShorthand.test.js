import { describe, it, expect } from 'vitest'
import {
  normalizeIosCli,
  resolveShowOutput,
  answersMatchShorthand,
  interfaceAnswerVariants,
} from '../lab/iosShorthand.js'

describe('iosShorthand', () => {
  describe('normalizeIosCli', () => {
    it('canonicalizes GigabitEthernet to gi', () => {
      expect(normalizeIosCli('interface GigabitEthernet0/1')).toBe('interface gi0/1')
      expect(normalizeIosCli('int gi0/1')).toBe('interface gi0/1')
      expect(normalizeIosCli('g0/1')).toBe('gi0/1')
    })

    it('canonicalizes FastEthernet shorthand', () => {
      expect(normalizeIosCli('interface FastEthernet0/5')).toBe('interface fa0/5')
      expect(normalizeIosCli('Fa0/5')).toBe('fa0/5')
    })

    it('keeps conf t and no shutdown phrases', () => {
      expect(normalizeIosCli('configure terminal')).toBe('conf t')
      expect(normalizeIosCli('no shut')).toBe('no shutdown')
    })
  })

  describe('resolveShowOutput', () => {
    const showOutput = {
      'show running-config interface gi0/1': 'interface Gi0/1 config',
      'show ip interface gi0/0': 'Gi0/0 status',
    }

    it('finds output when user types full interface name', () => {
      expect(
        resolveShowOutput('show running-config interface gigabitethernet0/1', showOutput),
      ).toBe('interface Gi0/1 config')
    })

    it('finds output with shorthand key', () => {
      expect(resolveShowOutput('show ip interface gi0/0', showOutput)).toBe('Gi0/0 status')
    })
  })

  describe('answersMatchShorthand', () => {
    it('accepts Gi0/1 for GigabitEthernet0/1', () => {
      expect(answersMatchShorthand('Gi0/1', 'GigabitEthernet0/1')).toBe(true)
      expect(answersMatchShorthand('gi0/1', 'GigabitEthernet0/1')).toBe(true)
      expect(answersMatchShorthand('GigabitEthernet0/1', 'GigabitEthernet0/1')).toBe(true)
    })

    it('rejects unrelated interface answers', () => {
      expect(answersMatchShorthand('Gi0/2', 'GigabitEthernet0/1')).toBe(false)
      expect(answersMatchShorthand('', 'GigabitEthernet0/1')).toBe(false)
    })

    it('honors extra accept list', () => {
      expect(answersMatchShorthand('g0/1', 'GigabitEthernet0/1', ['g0/1'])).toBe(true)
    })
  })

  describe('interfaceAnswerVariants', () => {
    it('generates gi and full-name variants', () => {
      const v = interfaceAnswerVariants('GigabitEthernet0/1')
      expect(v).toContain('GigabitEthernet0/1')
      expect(v.map(x => x.toLowerCase())).toContain('gi0/1')
    })
  })
})
