import { getCurated, hasCuratedReading, getCuratedQuestions } from '../data/ccnaCurated.js'
import { ALL_OBJECTIVES } from '../data/ccnaDomains.js'
import { BOOK_REF } from '../data/bookRefFull.js'
import { STORAGE_KEYS } from '../storageKeys.js'
import { askClaudeJSON, MODELS, QUIZ_SCHEMA, TERMS_SCHEMA, VISUAL_SCHEMA } from '../ai/claudeClient.js'
import { logEvent } from '../eventLog.js'
import {
  QUIZ_BANK_MIN,
  loadQuizBank, saveQuizBank, mergeIntoBank,
} from '../quiz/quizBankStorage.js'
import { EXPLAIN_CACHE_KEY, EXPLAIN_PROMPT_SYSTEM, EXPLAIN_SCHEMA } from '../tabs/studyConstants.js'

const TERMS_CACHE_KEY = 'ccna_terms_cache_v1'
const TERMS_PROMPT_SYSTEM = `You are a CCNA 200-301 study aid generator. Use the provided reference notes as your primary source; where the notes don't fully cover a detail a CCNA candidate needs, fill the gap with accurate CCNA 200-301 knowledge consistent with the notes. Produce 6-8 key-term flashcards for this objective — the most exam-relevant terms, acronyms, commands, or concepts to know cold.

Respond with ONLY valid JSON (no markdown fences, no commentary), in this exact shape:
{"cards":[{"term":"...","detail":"..."}]}

"term": a short label, max ~4 words (a word, acronym, command, or short phrase).
"detail": 1-2 short sentences with the key fact, definition, or syntax.`
const QUIZ_PROMPT_SYSTEM = `You are a CCNA 200-301 quiz generator. Use the provided reference notes as your primary source; where the notes don't cover a detail needed for a good question, you may draw on accurate broader CCNA 200-301 knowledge consistent with the notes. Write questions at genuine CCNA exam difficulty with 4 choices, short explanations, and tags for type, difficulty, skill, and concept.`
const VISUAL_CACHE_KEY = STORAGE_KEYS.visualCache
const VISUAL_PROMPT_SYSTEM = `You are a CCNA 200-301 visual-aid designer. Produce ONE minimalistic visual aid that teaches the core of this objective at a glance. Choose the single template type that best fits the concept. Use the provided reference notes as your primary source; you may add accurate CCNA 200-301 detail consistent with the notes.

Respond with ONLY valid JSON (no markdown fences, no commentary) using EXACTLY ONE of these shapes:
- A CLI/config or ordered procedure:
  {"type":"command_sequence","title":"...","steps":["...","..."]}
- Two things contrasted:
  {"type":"comparison","title":"...","left":{"label":"...","points":["..."]},"right":{"label":"...","points":["..."]}}
- A layered model or stack (order top to bottom):
  {"type":"layer_stack","title":"...","layers":[{"label":"...","note":"..."}]}
- A process or packet/decision flow (order first to last):
  {"type":"flow","title":"...","steps":["...","..."]}

Keep it tight: 3-6 steps/points/layers, each a short phrase. Pick the type that genuinely matches the concept (e.g. command_sequence for config tasks, comparison for A-vs-B topics, layer_stack for models, flow for processes like DORA or STP states).`

async function ensureExplanationCached(objective) {
  if (hasCuratedReading(objective.id)) return
  const cache = (await window.storage.getItem(EXPLAIN_CACHE_KEY)) || {}
  if (cache[objective.id]) return
  const refNotes = BOOK_REF[objective.id] || ''
  const data = await askClaudeJSON({
    system: EXPLAIN_PROMPT_SYSTEM,
    messages: [{ role: 'user', content: `Objective ${objective.id}: ${objective.title}\n\nReference notes:\n${refNotes}\n\nExplain this objective for a CCNA candidate.` }],
    max_tokens: 1100, schema: EXPLAIN_SCHEMA, toolName: 'emit_explanation', feature: 'explain',
  })
  cache[objective.id] = data
  await window.storage.setItem(EXPLAIN_CACHE_KEY, cache)
}

async function ensureTermsCached(objective) {
  if (getCurated(objective.id)?.flashcards?.length) return
  const cache = (await window.storage.getItem(TERMS_CACHE_KEY)) || {}
  if (cache[objective.id]) return
  const refNotes = BOOK_REF[objective.id] || ''
  const data = await askClaudeJSON({
    system: TERMS_PROMPT_SYSTEM,
    messages: [{ role: 'user', content: `Objective ${objective.id}: ${objective.title}\n\nReference notes:\n${refNotes}\n\nGenerate key-term flashcards for this objective.` }],
    max_tokens: 700, model: MODELS.fast, schema: TERMS_SCHEMA, toolName: 'emit_terms', feature: 'terms',
  })
  if ((data.cards || []).length === 0) throw new Error('Could not generate key terms.')
  cache[objective.id] = data.cards
  await window.storage.setItem(TERMS_CACHE_KEY, cache)
}

async function ensureVisualCached(objective) {
  if (getCurated(objective.id)?.diagram) return
  const cache = (await window.storage.getItem(VISUAL_CACHE_KEY)) || {}
  if (cache[objective.id]) return
  const refNotes = BOOK_REF[objective.id] || ''
  const data = await askClaudeJSON({
    system: VISUAL_PROMPT_SYSTEM,
    messages: [{ role: 'user', content: `Objective ${objective.id}: ${objective.title}\n\nReference notes:\n${refNotes}\n\nDesign one visual aid for this objective.` }],
    max_tokens: 700, model: MODELS.fast, schema: VISUAL_SCHEMA, toolName: 'emit_visual', feature: 'visual',
  })
  if (!data || !data.type) throw new Error('Could not generate a visual aid.')
  cache[objective.id] = data
  await window.storage.setItem(VISUAL_CACHE_KEY, cache)
}

async function ensureQuizBankFilled(objective) {
  let bank = await loadQuizBank()
  const curatedQs = getCuratedQuestions(objective.id)
  if (curatedQs.length && (bank[objective.id] || []).length < curatedQs.length) {
    bank = mergeIntoBank(bank, objective.id, curatedQs)
    await saveQuizBank(bank)
  }
  if ((bank[objective.id] || []).length >= QUIZ_BANK_MIN) return
  const refNotes = BOOK_REF[objective.id] || ''
  const data = await askClaudeJSON({
    system: QUIZ_PROMPT_SYSTEM,
    messages: [{ role: 'user', content: `Objective ${objective.id}: ${objective.title}\n\nReference notes:\n${refNotes}\n\nGenerate 8 multiple-choice questions for this objective.` }],
    max_tokens: 2200, model: MODELS.fast, schema: QUIZ_SCHEMA, toolName: 'emit_quiz', feature: 'quiz',
  })
  bank = mergeIntoBank(bank, objective.id, data.questions || [])
  await saveQuizBank(bank)
}

/** Generates whatever is missing so the topic is fully usable offline. */
export async function packageObjectiveOffline(objective) {
  await ensureExplanationCached(objective)
  await ensureTermsCached(objective)
  await ensureVisualCached(objective)
  await ensureQuizBankFilled(objective)
  logEvent('user_packaged_offline', { objectiveId: objective.id })
}

/** Returns objective ids whose four assets are all cached locally. */
export async function loadOfflineReadyIds() {
  const [ex, tm, vs, bank] = await Promise.all([
    window.storage.getItem(EXPLAIN_CACHE_KEY),
    window.storage.getItem(TERMS_CACHE_KEY),
    window.storage.getItem(VISUAL_CACHE_KEY),
    loadQuizBank(),
  ])
  const ids = ALL_OBJECTIVES.filter(o => {
    const isCurated = hasCuratedReading(o.id)
    const hasTerms = getCurated(o.id)?.flashcards?.length || (tm && tm[o.id])
    const hasVisual = getCurated(o.id)?.diagram || (vs && vs[o.id])
    const hasExplain = isCurated || (ex && ex[o.id])
    const hasBank = getCuratedQuestions(o.id).length >= QUIZ_BANK_MIN || (bank[o.id] || []).length >= QUIZ_BANK_MIN
    return hasExplain && hasTerms && hasVisual && hasBank
  }).map(o => o.id)
  return new Set(ids)
}
