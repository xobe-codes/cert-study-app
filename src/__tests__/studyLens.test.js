import { describe, it, expect, beforeEach } from 'vitest'
import { buildLibraryIndex, searchLibrary, getLibraryIndex } from '../library/libraryIndex.js'
import { detectIntent } from '../library/intentDetect.js'
import { buildInstantAnswer } from '../library/instantAnswer.js'
import { resolveTopicCluster } from '../library/topicClusters.js'

describe('study lens', () => {
  beforeEach(() => {
    // library index is module-cached; cluster logic is in search path only
  })

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

  it('resolves AAA protocols to the AAA topic cluster', () => {
    const cluster = resolveTopicCluster('AAA protocols')
    expect(cluster?.id).toBe('aaa')
    expect(cluster?.memberTermIds).toContain('term-tacacs-plus')
    expect(cluster?.memberTermIds).toContain('term-radius')
  })

  it('finds TACACS+ and RADIUS when asking about AAA protocols', () => {
    const { hits, cluster } = searchLibrary('AAA protocols')
    expect(cluster?.id).toBe('aaa')
    const titles = hits.map(h => h.title)
    expect(titles).toContain('AAA')
    expect(titles).toContain('TACACS+')
    expect(titles).toContain('RADIUS')
  })

  it('builds a family instant answer for AAA protocols', () => {
    const { hits, intent, cluster } = searchLibrary('AAA protocols')
    const answer = buildInstantAnswer('AAA protocols', hits, intent, cluster)
    expect(answer.mode).toBe('family')
    expect(answer.familyRows?.map(r => r.label)).toEqual(expect.arrayContaining(['AAA', 'TACACS+', 'RADIUS']))
    expect(answer.text).toMatch(/TACACS\+|RADIUS/i)
  })

  it('expands routing protocols to OSPF and EIGRP', () => {
    const { hits, cluster } = searchLibrary('routing protocols')
    expect(cluster?.id).toBe('routing-protocols')
    const titles = hits.map(h => h.title)
    expect(titles.some(t => /OSPF/i.test(t))).toBe(true)
    expect(titles.some(t => /EIGRP/i.test(t))).toBe(true)
  })
})
