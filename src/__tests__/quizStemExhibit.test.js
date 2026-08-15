import { describe, it, expect } from 'vitest'
import { dedupeStemParagraphs, splitQuizStem, parseExhibitLines, looksLikeRouteExhibit, looksLikeCliChoice } from '../quiz/quizStemExhibit.js'

const TABLE = `Routing table excerpt:
C    192.168.1.0/26 is directly connected, Serial0/0
S    192.168.1.0/24 [1/0] via 172.16.1.100
O    192.168.1.128/25 [110/10] via 172.16.1.200
Codes: C=connected, S=static, O=OSPF`

describe('quizStemExhibit', () => {
  it('dedupes repeated routing table paragraphs', () => {
    const dup = `${TABLE}\n\n${TABLE}\n\nWhich will be the next hop for 192.168.1.5?`
    const fixed = dedupeStemParagraphs(dup)
    expect((fixed.match(/Routing table excerpt:/g) || []).length).toBe(1)
    expect(fixed).toContain('Which will be the next hop')
  })

  it('splits exhibit from question prose', () => {
    const { exhibit, question, label } = splitQuizStem(`${TABLE}\n\nWhich will be the next hop for a destination address of 192.168.1.5?`)
    expect(label).toBe('Routing table')
    expect(exhibit).toContain('192.168.1.0/26')
    expect(question).toMatch(/Which will be the next hop/)
    expect(exhibit).not.toContain('Which will')
  })

  it('parses route lines into code/prefix/detail', () => {
    const lines = parseExhibitLines(TABLE)
    const routes = lines.filter(l => l.type === 'route')
    expect(routes).toHaveLength(3)
    expect(routes[0]).toMatchObject({ code: 'C', prefix: '192.168.1.0/26' })
    expect(routes[1].code).toBe('S')
    expect(lines.some(l => l.type === 'legend')).toBe(true)
  })

  it('detects routing exhibits', () => {
    expect(looksLikeRouteExhibit(TABLE)).toBe(true)
    expect(looksLikeRouteExhibit('What is OSPF AD?')).toBe(false)
  })

  it('flags whole-choice answers that read as IOS CLI syntax', () => {
    // Real bank content has no space between the prompt char and the command.
    expect(looksLikeCliChoice('RouterA(config)#ip nat source static 192.168.1.3 179.43.44.1')).toBe(true)
    expect(looksLikeCliChoice('Switch(config-if)#switchport port-security violation shutdown')).toBe(true)
    expect(looksLikeCliChoice('show ip route')).toBe(true)
    expect(looksLikeCliChoice('ip route 0.0.0.0 0.0.0.0 192.168.1.1')).toBe(true)
    expect(looksLikeCliChoice('R1# show ip route')).toBe(true)
    expect(looksLikeCliChoice('Switch> enable')).toBe(true)
  })

  it('does not flag prose that merely starts with a command-shaped word', () => {
    expect(looksLikeCliChoice('No connectivity at all')).toBe(false)
    expect(looksLikeCliChoice('Enable OSPF')).toBe(false)
    expect(looksLikeCliChoice('Reload the router')).toBe(false)
    expect(looksLikeCliChoice('Hostname → random IP')).toBe(false)
    expect(looksLikeCliChoice('NTP server')).toBe(false)
    expect(looksLikeCliChoice('8.8.8.0/24')).toBe(false)
    expect(looksLikeCliChoice('')).toBe(false)
    expect(looksLikeCliChoice(null)).toBe(false)
  })
})
