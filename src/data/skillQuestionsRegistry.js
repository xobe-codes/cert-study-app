/**
 * Lazy-init registry for ccnaSkillQuestions.
 *
 * Multiple modules (ccnaCurated.js, questionBankCount.js, commandSyntaxQuiz.js)
 * previously statically imported ccnaSkillQuestions.js (a 1.2 MB chunk),
 * causing it to be eagerly downloaded on every page load even though it is
 * only needed when a user navigates to a quiz or objective detail view.
 *
 * Pattern: consumers import the lazy getters from this file (no heavy static
 * dep).  Bootstrap code calls `setSkillQuestionsModule` once the real module
 * has been dynamically loaded, after which every subsequent call goes to the
 * real implementation.  Before registration the fallbacks return [] / [],
 * which is correct — no skill questions are available yet.
 */

let _getSkillQuestions = (_objectiveId) => []
let _allSkillQuestions = () => []

/** Called by bootstrap once ccnaSkillQuestions.js has been dynamically loaded. */
export function setSkillQuestionsModule(mod) {
  _getSkillQuestions = mod.getSkillQuestions
  _allSkillQuestions = mod.allSkillQuestions
}

/** Drop-in sync replacement for getSkillQuestions(objectiveId). */
export function getSkillQuestionsLazy(objectiveId) {
  return _getSkillQuestions(objectiveId)
}

/** Drop-in sync replacement for allSkillQuestions(). */
export function allSkillQuestionsLazy() {
  return _allSkillQuestions()
}
