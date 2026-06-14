import { getCurated, getCuratedQuestions } from '../data/ccnaCurated.js'
import { getLessonReference } from './knowledgeReference.js'

function matchesCku(entry, ckuId) {
  if (!ckuId) return false
  if (entry.ckuId === ckuId) return true
  return Array.isArray(entry.ckuIds) && entry.ckuIds.includes(ckuId)
}

/** Depth panel for a flipped flashcard — joins CKU, glossary, traps, quiz count. */
export function buildConceptDetail(objectiveId, card) {
  const curated = getCurated(objectiveId)
  const ref = getLessonReference(objectiveId)
  const ckuId = card?.ckuId || null
  const term = card?.term || ''

  const cku = ckuId && curated?.ckus
    ? curated.ckus.find(c => c.id === ckuId) || null
    : null

  const glossaryEntry = ref?.glossary?.find(g => (
    matchesCku(g, ckuId) || (term && g.term?.toLowerCase() === term.toLowerCase())
  )) || null

  const traps = (ref?.examTraps || []).filter(t => matchesCku(t, ckuId))
  const mnemonics = (ref?.mnemonics || []).filter(m => matchesCku(m, ckuId))
  const commands = (ref?.commands || []).filter(c => matchesCku(c, ckuId))

  const quizQuestions = ckuId
    ? getCuratedQuestions(objectiveId).filter(q => q.ckuIds?.includes(ckuId))
    : getCuratedQuestions(objectiveId).filter(q => (
      q.concept && term && q.concept.toLowerCase().includes(term.toLowerCase().slice(0, 8))
    ))

  return {
    ckuId,
    cku,
    glossaryEntry,
    traps,
    mnemonics,
    commands,
    quizCount: quizQuestions.length,
    hasDepth: !!(cku || glossaryEntry || traps.length || mnemonics.length || commands.length),
  }
}
