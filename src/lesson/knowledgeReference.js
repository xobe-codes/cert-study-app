import { getCurated } from '../data/ccnaCurated.js'
import { getKnowledgeForObjective, hasKnowledgeBase } from '../data/knowledgeStudy.js'

/** Unified glossary / commands / traps for the lesson Reference tab. */
export function getLessonReference(objectiveId) {
  const curated = getCurated(objectiveId)
  if (curated) {
    const glossary = curated.glossary || []
    const commands = curated.commands || []
    const examTraps = curated.examTraps || []
    const mnemonics = curated.mnemonics || []
    const misconceptions = curated.misconceptions || []
    const hasContent = glossary.length || commands.length || examTraps.length
      || mnemonics.length || misconceptions.length
    if (!hasContent) return null
    return {
      source: 'curated',
      objectiveId,
      summary: curated.reading?.definition || null,
      ckus: curated.ckus || [],
      glossary,
      commands,
      examTraps,
      mnemonics,
      misconceptions,
    }
  }

  if (!hasKnowledgeBase(objectiveId)) return null
  const kb = getKnowledgeForObjective(objectiveId)
  const hasContent = kb.glossary.length || kb.commands.length || kb.examTraps.length
  if (!hasContent) return null
  return {
    source: 'kb',
    objectiveId,
    summary: kb.objective?.summary || null,
    ckus: kb.ckus || [],
    glossary: kb.glossary,
    commands: kb.commands,
    examTraps: kb.examTraps,
    mnemonics: [],
    misconceptions: kb.misconceptions || [],
  }
}

export function hasLessonReference(objectiveId) {
  return !!getLessonReference(objectiveId)
}
