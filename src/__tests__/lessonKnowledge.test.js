import { describe, it, expect } from 'vitest'
import { getLessonReference, hasLessonReference } from '../lesson/knowledgeReference.js'
import { buildConceptDetail } from '../lesson/conceptDetail.js'
import { parseRichTextSegments } from '../lesson/richTextParse.js'

describe('lesson knowledge reference', () => {
  it('surfaces curated glossary for 3.2', () => {
    const ref = getLessonReference('3.2')
    expect(ref).not.toBeNull()
    expect(ref.source).toBe('curated')
    expect(ref.glossary.length).toBeGreaterThan(0)
    expect(ref.commands.length).toBeGreaterThan(0)
    expect(ref.examTraps.length).toBeGreaterThan(0)
  })

  it('hasLessonReference true for curated objectives with glossary', () => {
    expect(hasLessonReference('3.2')).toBe(true)
  })
})

describe('concept detail', () => {
  it('joins CKU summary and quiz count for a flashcard', () => {
    const detail = buildConceptDetail('3.2', {
      term: 'Default AD: Connected / Static / EIGRP / OSPF / RIP?',
      detail: '0 / 1 / 90 / 110 / 120',
      ckuId: 'CKU-ADMINISTRATIVE-DISTANCE',
    })
    expect(detail.cku?.id).toBe('CKU-ADMINISTRATIVE-DISTANCE')
    expect(detail.quizCount).toBeGreaterThan(0)
    expect(detail.hasDepth).toBe(true)
  })
})

describe('richTextParse', () => {
  it('parses bold and code', () => {
    const segs = parseRichTextSegments('Use **longest prefix match** and `show ip route`')
    expect(segs).toEqual([
      { type: 'text', value: 'Use ' },
      { type: 'bold', value: 'longest prefix match' },
      { type: 'text', value: ' and ' },
      { type: 'code', value: 'show ip route' },
    ])
  })
})
