import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parseOneNoteMarkdown, isOcrSuspect } from '../../scripts/lib/onenoteUtils.mjs'
import { TOPIC_MAP } from '../../scripts/lib/onenoteTopicMap.mjs'
import { KB_COMPILED_PATCHES, KB_COMPILED_OBJECTIVE_IDS } from '../data/kbCompiledPatches.js'
import { getCurated } from '../data/ccnaCurated.js'
import { EXPLANATION_PILOT_IDS } from '../lesson/explanationFormat.js'

const ROOT = join(import.meta.dirname, '..', '..')
const FIXTURE = join(ROOT, 'data', 'onenote', 'fixtures', '48 - Day 44 - Network Address Translation (NAT) pt 1.md')

describe('onenote pipeline', () => {
  it('topic-map covers fixture filenames', () => {
    expect(TOPIC_MAP['48 - Day 44 - Network Address Translation (NAT) pt 1.md']).toBeTruthy()
    expect(TOPIC_MAP['30 - Day 26 - OSPF pt 1.md']).toBeTruthy()
    expect(TOPIC_MAP['16 - Day 16 - VLANs pt 1.md']).toBeTruthy()
  })

  it('parses fixture markdown into operator summary', () => {
    if (!existsSync(FIXTURE)) return
    const raw = readFileSync(FIXTURE, 'utf8')
    const parsed = parseOneNoteMarkdown(raw, '48 - Day 44 - Network Address Translation (NAT) pt 1.md')
    expect(parsed.operatorSummary.length).toBeGreaterThan(20)
    expect(parsed.keyPoints.length).toBeGreaterThan(0)
  })

  it('flags spaced-letter OCR junk', () => {
    expect(isOcrSuspect('Fi ll N t k S it C t l')).toBe(true)
    expect(isOcrSuspect('OSPF uses link-state flooding.')).toBe(false)
  })

  it('kb compiled patches module exports', () => {
    expect(KB_COMPILED_PATCHES).toBeDefined()
    expect(KB_COMPILED_OBJECTIVE_IDS).toBeDefined()
  })

  it('getCurated merges KB patches when present', () => {
    if (!KB_COMPILED_OBJECTIVE_IDS.has('4.1')) return
    const curated = getCurated('4.1')
    expect(curated?.reading?.bigTakeaway).toBeTruthy()
    expect(EXPLANATION_PILOT_IDS.has('4.1')).toBe(true)
  })
})
