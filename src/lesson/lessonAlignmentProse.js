/**
 * Retention-prose scoring for the Lesson ↔ Question Bank Alignment 99 spec (section 3.2).
 * Pure, side-effect-free. Reuses existing prose helpers — does not duplicate their rules.
 * Spec: ai-improvement-logs/LESSON_BANK_ALIGNMENT_99_SPEC.md
 */
import { countSentences, wordCount } from './explanationFormat.js'
import { isDraftKbTierText } from './readingEnrichment.js'

const REMEMBER_BULLET_WORD_MAX = 18
const REMEMBER_MIN_BULLETS = 3
const DONT_CONFUSE_MIN_MISTAKES = 2
const EXAM_CUE_MIN_MISTAKES = 2
const TAKEAWAY_MIN_WORDS = 8
const TAKEAWAY_MAX_WORDS = 28
const PLAIN_ENGLISH_MIN_WORDS = 40
const PLAIN_ENGLISH_MAX_SENTENCES = 5
const HOW_IT_WORKS_MIN_WORDS = 50
const HOW_IT_WORKS_MIN_SENTENCES = 3

/**
 * Score one objective's reading against the 3.2 retention-prose floors.
 * @param {object} params
 * @param {object} params.reading - curated reading block (tiers, bigTakeaway, keyPoints, commonMistakes).
 * @param {Array} [params.examTraps] - objective-level examTraps array (sibling of `reading` on the curated object).
 * @param {object|null} [params.engineerView] - objective-level engineerView block, if present.
 * @returns {{bigTakeawayWords:number, plainEnglishOk:boolean, howItWorksOk:boolean, examCueOk:boolean,
 *   rememberOk:boolean, dontConfuseOk:boolean, draftHits:string[], thinProse:boolean, details:object}}
 */
export function scoreLessonRetentionProse({ reading, examTraps, engineerView } = {}) {
  const safeReading = reading || {}
  const tiers = safeReading.tiers || {}
  const bigTakeaway = safeReading.bigTakeaway || ''
  const keyPoints = Array.isArray(safeReading.keyPoints) ? safeReading.keyPoints : []
  const commonMistakes = Array.isArray(safeReading.commonMistakes) ? safeReading.commonMistakes : []
  const examTrapList = Array.isArray(examTraps) ? examTraps : []

  const beginnerText = tiers.beginner || ''
  const intermediateText = tiers.intermediate || ''
  const examReadyText = tiers.examReady || ''

  // ---- bigTakeaway: 8–28 words when present; missing → thin ----
  const takeawayPresent = !!bigTakeaway.trim()
  const bigTakeawayWords = takeawayPresent ? wordCount(bigTakeaway) : 0
  const bigTakeawayOk = takeawayPresent
    && bigTakeawayWords >= TAKEAWAY_MIN_WORDS
    && bigTakeawayWords <= TAKEAWAY_MAX_WORDS

  // ---- plainEnglish: beginner tier ≥40 words AND ≤5 sentences ----
  const beginnerWords = wordCount(beginnerText)
  const beginnerSentences = countSentences(beginnerText)
  const plainEnglishOk = beginnerWords >= PLAIN_ENGLISH_MIN_WORDS
    && beginnerSentences > 0
    && beginnerSentences <= PLAIN_ENGLISH_MAX_SENTENCES

  // ---- howItWorks: intermediate OR examReady has ≥50 words OR ≥3 sentences ----
  const intermediateWords = wordCount(intermediateText)
  const intermediateSentences = countSentences(intermediateText)
  const examReadyWords = wordCount(examReadyText)
  const examReadySentences = countSentences(examReadyText)
  const intermediateClears = intermediateWords >= HOW_IT_WORKS_MIN_WORDS || intermediateSentences >= HOW_IT_WORKS_MIN_SENTENCES
  const examReadyClears = examReadyWords >= HOW_IT_WORKS_MIN_WORDS || examReadySentences >= HOW_IT_WORKS_MIN_SENTENCES
  const howItWorksOk = intermediateClears || examReadyClears

  // ---- examCue: examTraps≥1 OR commonMistakes≥2 OR engineerView present ----
  const examCueOk = examTrapList.length >= 1
    || commonMistakes.length >= EXAM_CUE_MIN_MISTAKES
    || !!engineerView

  // ---- remember: keyPoints≥3 (bullet length is a warning, not a P2 failure) ----
  const longKeyPoints = keyPoints
    .map((kp, index) => ({ index, text: kp, words: wordCount(kp) }))
    .filter(kp => kp.words > REMEMBER_BULLET_WORD_MAX)
  const rememberOk = keyPoints.length >= REMEMBER_MIN_BULLETS

  // ---- dontConfuse: commonMistakes≥2 OR examTraps≥1 (soft floor, distractor families unknown here) ----
  const dontConfuseOk = commonMistakes.length >= DONT_CONFUSE_MIN_MISTAKES || examTrapList.length >= 1

  // ---- draftHits: reuse isDraftKbTierText on each tier + takeaway ----
  const draftCandidates = [
    ['beginner', beginnerText],
    ['intermediate', intermediateText],
    ['examReady', examReadyText],
    ['bigTakeaway', bigTakeaway],
  ]
  const draftHits = draftCandidates
    .filter(([, text]) => text && isDraftKbTierText(text))
    .map(([key]) => key)

  const thinProse = !bigTakeawayOk
    || !plainEnglishOk
    || !howItWorksOk
    || !examCueOk
    || !rememberOk
    || !dontConfuseOk
    || draftHits.length > 0

  return {
    bigTakeawayWords,
    plainEnglishOk,
    howItWorksOk,
    examCueOk,
    rememberOk,
    dontConfuseOk,
    draftHits,
    thinProse,
    details: {
      bigTakeaway: { present: takeawayPresent, words: bigTakeawayWords, ok: bigTakeawayOk },
      plainEnglish: { words: beginnerWords, sentences: beginnerSentences, ok: plainEnglishOk },
      howItWorks: {
        intermediateWords, intermediateSentences, examReadyWords, examReadySentences, ok: howItWorksOk,
      },
      examCue: {
        examTraps: examTrapList.length, commonMistakes: commonMistakes.length, hasEngineerView: !!engineerView, ok: examCueOk,
      },
      remember: {
        count: keyPoints.length,
        ok: rememberOk,
        longKeyPoints: longKeyPoints.map(kp => ({ index: kp.index, words: kp.words })),
        warn: longKeyPoints.length
          ? `${longKeyPoints.length} key point(s) exceed ${REMEMBER_BULLET_WORD_MAX} words`
          : null,
      },
      dontConfuse: { commonMistakes: commonMistakes.length, examTraps: examTrapList.length, ok: dontConfuseOk },
      draftHits,
    },
  }
}
