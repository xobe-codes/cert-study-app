import { describe, it, expect } from 'vitest'
import { buildLibraryIndex, searchLibrary, getLibraryIndex } from '../library/libraryIndex.js'
import { detectIntent } from '../library/intentDetect.js'
import { buildInstantAnswer } from '../library/instantAnswer.js'

describe('study lens', () => {
  it('builds a federated library index with diverse chunk kinds', () => {
    const index = buildLibraryIndex()
    expect(index.chunks.length).toBeGreaterThan(400)
    expect(index.facets.term).toBeGreaterThan(40)
    expect(index.facets.command).toBeGreaterThan(50)
    expect(index.facets['reading-tier']).toBeGreaterThan(40)
  })

  it('finds OSPF across terms and reading', () => {
    const { hits, intent } = searchLibrary('OSPF')
    expect(intent).toBe('define')
    expect(hits.some(h => /ospf/i.test(h.title) || /ospf/i.test(h.body))).toBe(true)
  })

  it('finds show ip route as a command hit', () => {
    const { hits } = searchLibrary('show ip route')
    expect(hits.some(h => h.kind === 'command' && h.title.includes('show ip route'))).toBe(true)
  })

  it('detects compare intent', () => {
    expect(detectIntent('HSRP vs VRRP')).toBe('compare')
    expect(detectIntent('difference between OSPF and EIGRP')).toBe('compare')
  })

  it('builds instant answer from hits without API', () => {
    const { hits, intent } = searchLibrary('longest prefix match')
    const answer = buildInstantAnswer('longest prefix match', hits, intent)
    expect(answer.sufficient).toBe(true)
    expect(answer.text.length).toBeGreaterThan(20)
  })

  it('returns cached singleton index', () => {
    expect(getLibraryIndex()).toBe(getLibraryIndex())
  })
})
