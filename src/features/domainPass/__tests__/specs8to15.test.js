import { describe, it, expect } from 'vitest'
import { buildDomainStudyHealth, formatStudyHealthStrip } from '../domainStudyHealth.js'
import { STALE_DAYS_MS } from '../domainQuestionExposure.js'
import { buildUnifiedLesson } from '../../../lesson/unifiedLessonDoc.js'
import { createSectionTtsPlaylist } from '../../../lib/sectionTtsPlaylist.js'
import { pickPhoneInlineDiagram, isPhoneViewport, diagramCaption } from '../../../components/diagramPhoneVariant.js'
import { buildTermsCatalog, filterTermsCatalog } from '../../../terms/termsCatalog.js'
import { gradeTypeTerm, buildPickDefinitionItems } from '../../../terms/termsDrillQuiz.js'
import {
  pickScenarioSession,
  gradeScenario,
  scenarioCoverageByDomain,
  MIN_SCENARIOS_PER_DOMAIN,
} from '../../../commands/commandScenarioQuiz.js'

const NOW = Date.now()

describe('Spec 8 domainStudyHealth', () => {
  it('formats coverage and repeat strip', () => {
    const health = buildDomainStudyHealth({
      domainId: 'access',
      allQuestionIds: ['a', 'b', 'c', 'd'],
      exposureStore: {
        access: { a: NOW - 1000, b: NOW - STALE_DAYS_MS - 1000 },
      },
      now: NOW,
    })
    expect(health.seenCount).toBe(2)
    expect(health.coveragePct).toBe(50)
    expect(formatStudyHealthStrip(health)).toMatch(/Coverage 50%/)
  })
})

describe('Spec 9 unifiedLessonDoc', () => {
  it('merges tiers into spine fields', () => {
    const lesson = buildUnifiedLesson({
      reading: {
        tiers: {
          beginner: 'Plain. Second.',
          intermediate: 'How it works body.',
          examReady: 'Exam engineer body.',
        },
        keyPoints: ['A', 'B', 'C', 'D'],
        commonMistakes: ['X', 'Y'],
        bigTakeaway: 'Remember this hook.',
      },
      flashcards: [{ id: '1', front: 'Term', back: 'Def' }],
    }, { title: 'VLAN' })
    expect(lesson.hook).toBe('Remember this hook.')
    expect(lesson.plainEnglish).toContain('Plain')
    expect(lesson.howItWorks).toContain('How it works')
    expect(lesson.examEngineer).toContain('Exam engineer')
    expect(lesson.rememberThis).toHaveLength(3)
    expect(lesson.terms[0].term).toBe('Term')
  })
})

describe('Spec 10 sectionTtsPlaylist', () => {
  it('creates playlist API', () => {
    const p = createSectionTtsPlaylist([
      { id: 'a', text: 'Hello' },
      { id: 'b', text: 'World' },
    ], { autoAdvance: false })
    expect(p.sections).toHaveLength(2)
    expect(typeof p.playSection).toBe('function')
    expect(typeof p.toggle).toBe('function')
  })
})

describe('Spec 14 diagramPhoneVariant', () => {
  it('simplifies dense diagrams on phone', () => {
    expect(isPhoneViewport(390)).toBe(true)
    const dense = {
      title: 'Big net',
      nodes: Array.from({ length: 8 }, (_, i) => ({ id: `n${i}`, label: `Node ${i}`, x: i * 10, y: 10 })),
      links: [{ from: 'n0', to: 'n1', label: 'trunk' }],
    }
    const phone = pickPhoneInlineDiagram(dense)
    expect(phone.isPhoneSimplified).toBe(true)
    expect(phone.nodes.length).toBeLessThanOrEqual(5)
    const cap = diagramCaption(phone)
    expect(cap.lookingAt).toBeTruthy()
  })
})

describe('Spec 11 terms', () => {
  it('builds catalog and grades type-term', () => {
    const catalog = buildTermsCatalog()
    expect(catalog.length).toBeGreaterThan(10)
    const access = filterTermsCatalog(catalog, { domainId: 'access' })
    expect(access.every(c => c.domainId === 'access' || !c.domainId)).toBe(true)
    expect(gradeTypeTerm('OSPF', 'ospf')).toBe(true)
    const picks = buildPickDefinitionItems(catalog.slice(0, 20), 3)
    expect(picks.length).toBeGreaterThan(0)
  })
})

describe('Spec 12 command scenarios', () => {
  it('picks and grades scenarios', () => {
    const session = pickScenarioSession('access', 3)
    expect(session.length).toBeGreaterThan(0)
    expect(gradeScenario(session[0], session[0].correctIndex)).toBe(true)
  })

  it('keeps ≥3 scenarios in every exam domain', () => {
    const coverage = scenarioCoverageByDomain()
    for (const [domainId, count] of Object.entries(coverage)) {
      expect(count, domainId).toBeGreaterThanOrEqual(MIN_SCENARIOS_PER_DOMAIN)
      expect(pickScenarioSession(domainId, 5).length).toBeGreaterThanOrEqual(MIN_SCENARIOS_PER_DOMAIN)
    }
  })
})
