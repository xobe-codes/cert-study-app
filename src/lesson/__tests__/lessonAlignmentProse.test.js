import { describe, it, expect } from 'vitest'
import { scoreLessonRetentionProse } from '../lessonAlignmentProse.js'
import { getCurated } from '../../data/ccnaCurated.js'

const FLAGSHIP_READING = {
  tiers: {
    beginner: 'When a packet arrives, the router finds routes that match the destination IP. If several match, it uses the most specific (longest) prefix. Only when two routes to the same prefix compete does the router compare trust (administrative distance) and then metric.',
    intermediate: 'Forwarding uses longest prefix match first — the most specific matching route wins, period, no matter what administrative distance or metric say about it. Administrative distance and metric only decide which routes get installed in the table when two different sources disagree about the exact same prefix; they never override a route that is already more specific. Think of longest prefix match as choosing the path, while AD and metric only choose what gets a seat in the table.',
    examReady: 'On the exam, separate forwarding from installation: longest prefix match picks the path a packet actually takes, while AD and metric only decide what gets installed into the table in the first place. A default route is only used when nothing more specific matches, so never treat it as a normal competing entry.',
  },
  bigTakeaway: 'Longest prefix match picks the forwarding route; AD and metric only decide what gets installed in the table.',
  keyPoints: [
    'Order: longest prefix match → administrative distance → metric.',
    'Longest prefix match picks the MOST specific matching route and is never overridden by AD/metric.',
    'Administrative distance compares the SAME prefix from DIFFERENT sources — lower is more trusted.',
  ],
  commonMistakes: [
    'Thinking a lower AD can beat a more-specific (longer-prefix) route — it cannot; longest prefix match wins first.',
    'Comparing an OSPF metric to an EIGRP metric — metrics are only comparable within one protocol.',
  ],
}

const FLAGSHIP_EXAM_TRAPS = [
  { id: 't1', trap: 'Assuming the lowest AD route always wins.' },
  { id: 't2', trap: 'Comparing metrics across routing protocols.' },
]

const THIN_READING = {
  tiers: {
    beginner: 'Know the core behavior: this covers the exam topic briefly.',
    intermediate: 'Short intermediate note.',
    examReady: 'Exam Topic 3.9 — brief note.',
  },
  bigTakeaway: '',
  keyPoints: ['One point only.'],
  commonMistakes: [],
}

describe('scoreLessonRetentionProse', () => {
  it('passes every floor for flagship-like prose (3.2 shape)', () => {
    const result = scoreLessonRetentionProse({
      reading: FLAGSHIP_READING,
      examTraps: FLAGSHIP_EXAM_TRAPS,
      engineerView: null,
    })

    expect(result.bigTakeawayWords).toBeGreaterThanOrEqual(8)
    expect(result.bigTakeawayWords).toBeLessThanOrEqual(28)
    expect(result.plainEnglishOk).toBe(true)
    expect(result.howItWorksOk).toBe(true)
    expect(result.examCueOk).toBe(true)
    expect(result.rememberOk).toBe(true)
    expect(result.dontConfuseOk).toBe(true)
    expect(result.draftHits).toEqual([])
    expect(result.thinProse).toBe(false)
  })

  it('flags thin draft-shell prose as thinProse with draft hits', () => {
    const result = scoreLessonRetentionProse({
      reading: THIN_READING,
      examTraps: [],
      engineerView: null,
    })

    expect(result.thinProse).toBe(true)
    expect(result.draftHits).toContain('beginner')
    expect(result.draftHits).toContain('examReady')
    expect(result.plainEnglishOk).toBe(false)
    expect(result.rememberOk).toBe(false)
    expect(result.examCueOk).toBe(false)
    expect(result.dontConfuseOk).toBe(false)
  })

  it('fails bigTakeaway floor when missing entirely', () => {
    const result = scoreLessonRetentionProse({
      reading: { ...FLAGSHIP_READING, bigTakeaway: '' },
      examTraps: FLAGSHIP_EXAM_TRAPS,
    })

    expect(result.bigTakeawayWords).toBe(0)
    expect(result.details.bigTakeaway.present).toBe(false)
    expect(result.details.bigTakeaway.ok).toBe(false)
    expect(result.thinProse).toBe(true)
  })

  it('fails bigTakeaway floor when out of the 8-28 word range', () => {
    const tooShort = scoreLessonRetentionProse({
      reading: { ...FLAGSHIP_READING, bigTakeaway: 'Longest match wins.' },
      examTraps: FLAGSHIP_EXAM_TRAPS,
    })
    expect(tooShort.details.bigTakeaway.ok).toBe(false)
    expect(tooShort.thinProse).toBe(true)

    const tooLong = scoreLessonRetentionProse({
      reading: {
        ...FLAGSHIP_READING,
        bigTakeaway: 'Longest prefix match is always the very first and most important thing a router checks before it even considers administrative distance or the routing protocol metric value at all.',
      },
      examTraps: FLAGSHIP_EXAM_TRAPS,
    })
    expect(tooLong.details.bigTakeaway.ok).toBe(false)
    expect(tooLong.thinProse).toBe(true)
  })

  it('passes plainEnglish only when beginner tier clears 40 words and stays within 5 sentences', () => {
    const shortBeginner = scoreLessonRetentionProse({
      reading: { ...FLAGSHIP_READING, tiers: { ...FLAGSHIP_READING.tiers, beginner: 'Too short.' } },
      examTraps: FLAGSHIP_EXAM_TRAPS,
    })
    expect(shortBeginner.plainEnglishOk).toBe(false)

    const tooManySentences = scoreLessonRetentionProse({
      reading: {
        ...FLAGSHIP_READING,
        tiers: {
          ...FLAGSHIP_READING.tiers,
          beginner: 'One sentence here. Two sentence here. Three sentence here. Four sentence here. Five sentence here. Six sentence here breaks the cap for beginner readers who need short scannable prose.',
        },
      },
      examTraps: FLAGSHIP_EXAM_TRAPS,
    })
    expect(tooManySentences.plainEnglishOk).toBe(false)
  })

  it('passes howItWorks via examReady tier even when intermediate is thin', () => {
    const result = scoreLessonRetentionProse({
      reading: {
        ...FLAGSHIP_READING,
        tiers: {
          ...FLAGSHIP_READING.tiers,
          intermediate: 'Short.',
        },
      },
      examTraps: FLAGSHIP_EXAM_TRAPS,
    })
    expect(result.details.howItWorks.intermediateWords).toBeLessThan(50)
    expect(result.howItWorksOk).toBe(true)
  })

  it('passes examCue when engineerView is present even with zero traps/mistakes', () => {
    const result = scoreLessonRetentionProse({
      reading: { ...FLAGSHIP_READING, commonMistakes: [] },
      examTraps: [],
      engineerView: { title: 'Engineer view', verifyCommands: [{ command: 'show ip route' }] },
    })
    expect(result.examCueOk).toBe(true)
  })

  it('warns (does not fail) when keyPoints exceed 18 words but still counts remember as ok', () => {
    const longBullet = 'This is a deliberately long key point bullet that goes well beyond the eighteen word soft guideline for scannable remember-this bullets in the retention spine.'
    const result = scoreLessonRetentionProse({
      reading: { ...FLAGSHIP_READING, keyPoints: [longBullet, ...FLAGSHIP_READING.keyPoints] },
      examTraps: FLAGSHIP_EXAM_TRAPS,
    })
    expect(result.rememberOk).toBe(true)
    expect(result.details.remember.longKeyPoints.length).toBeGreaterThan(0)
    expect(result.details.remember.warn).toBeTruthy()
  })

  it('fails remember floor when fewer than 3 keyPoints', () => {
    const result = scoreLessonRetentionProse({
      reading: { ...FLAGSHIP_READING, keyPoints: ['Only one.', 'Only two.'] },
      examTraps: FLAGSHIP_EXAM_TRAPS,
    })
    expect(result.rememberOk).toBe(false)
    expect(result.thinProse).toBe(true)
  })

  it('handles missing reading gracefully (thin by default)', () => {
    const result = scoreLessonRetentionProse({})
    expect(result.thinProse).toBe(true)
    expect(result.bigTakeawayWords).toBe(0)
    expect(result.plainEnglishOk).toBe(false)
    expect(result.rememberOk).toBe(false)
  })

  it('scores the real 3.2 curated objective (flagship reference) — clean on most floors, no draft hits', () => {
    const curated = getCurated('3.2')
    expect(curated?.reading).toBeTruthy()
    const result = scoreLessonRetentionProse({
      reading: curated.reading,
      examTraps: curated.examTraps,
      engineerView: curated.engineerView,
    })
    // 3.2 is the flagship pattern reference, but the new howItWorks floor (>=50
    // words or >=3 sentences per tier) surfaces a real P2 beautify gap: its
    // intermediate/examReady tiers are concise (2 sentences each) rather than
    // long-form. Every other floor and draft-pattern check is clean.
    expect(result.bigTakeawayWords).toBeGreaterThanOrEqual(8)
    expect(result.plainEnglishOk).toBe(true)
    expect(result.examCueOk).toBe(true)
    expect(result.rememberOk).toBe(true)
    expect(result.dontConfuseOk).toBe(true)
    expect(result.draftHits).toEqual([])
  })
})
