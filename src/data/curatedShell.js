/** Shared scaffold for curated objective records (reading-only supplements). */
const BLUEPRINT = 'Cisco CCNA 200-301 v1.1 Exam Topics'
export const SRC = (chapter) => [{ sourceName: BLUEPRINT, chapter, confidence: 1 }]

export function shell({ objectiveId, domainId, title, ckus, reading, examTraps = [], commands = [], glossary = [] }) {
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
