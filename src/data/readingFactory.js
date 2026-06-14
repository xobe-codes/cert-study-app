const BLUEPRINT = 'Cisco CCNA 200-301 v1.1 Exam Topics'
export const SRC = (chapter) => [{ sourceName: BLUEPRINT, chapter, confidence: 1 }]

export function readingShell({ objectiveId, domainId, title, ckus, reading, examTraps = [], commands = [], glossary = [] }) {
  const diagram = {
    id: `DIAG-${objectiveId}-overview`,
    title: `${title} overview`,
    type: 'concept',
    nodes: [
      { id: 'n1', label: title, type: 'process', x: 30, y: 50 },
      { id: 'n2', label: 'CCNA exam', type: 'process', x: 70, y: 50 },
    ],
    links: [{ id: 'l1', source: 'n1', target: 'n2', label: 'objective' }],
    annotations: [reading.definition.slice(0, 120)],
    sourceRefs: reading.sourceRefs,
  }
  const packetFlow = {
    id: `PF-${objectiveId}`,
    title: `${title} flow`,
    ckuIds: reading.ckuIds,
    steps: [{ id: 's1', order: 1, title: 'Review', action: reading.keyPoints[0] || reading.definition, successState: 'learned' }],
    sourceRefs: reading.sourceRefs,
  }
  return {
    objectiveId, domainId, title, ckus, reading,
    questions: [], flashcards: [], commands, glossary, mnemonics: [],
    examTraps, misconceptions: [], diagram, packetFlow,
  }
}

export function readingFromRef({ objectiveId, domainId, title, chapter, ckuId, ckuTitle, ref, examTrap }) {
  const summary = ref.slice(0, 180)
  const ckus = [{ id: ckuId, title: ckuTitle, summary, aliases: [], tags: [chapter], sourceRefs: SRC(chapter) }]
  const reading = {
    id: `READ-${objectiveId}`,
    ckuIds: [ckuId],
    estimatedReadMinutes: 5,
    tiers: {
      beginner: ref.slice(0, 220),
      intermediate: ref,
      examReady: ref,
    },
    definition: summary,
    keyPoints: ref.split('. ').filter(Boolean).slice(0, 5).map(s => s.trim()),
    realWorld: `Apply ${title.toLowerCase()} concepts during troubleshooting and exam scenarios.`,
    commonMistakes: [`Confusing terms within ${objectiveId} — review blueprint subtopics carefully.`],
    related: [],
    advanced: ref,
    sourceRefs: SRC(chapter),
  }
  const examTraps = examTrap ? [examTrap] : []
  return readingShell({ objectiveId, domainId, title, ckus, reading, examTraps })
}
