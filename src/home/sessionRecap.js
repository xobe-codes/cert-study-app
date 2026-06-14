/* ---- Per-session study recap (in-memory; resets on page reload) ---- */
// Tracks what the user did since they last visited Home. Refreshes each time
// they navigate back (HomeScreen remounts on each view switch).
let _sessionStudy = { correct: 0, incorrect: 0, objectives: new Set(), mastered: [] }
let _recapDismissed = false
export function bumpSessionStudy(type, value) {
  if (type === 'correct') _sessionStudy.correct += 1
  else if (type === 'incorrect') _sessionStudy.incorrect += 1
  else if (type === 'objective') { _sessionStudy.objectives.add(value); _recapDismissed = false }
  else if (type === 'mastered') { if (!_sessionStudy.mastered.includes(value)) _sessionStudy.mastered.push(value) }
}
export function getSessionStudy() {
  return { correct: _sessionStudy.correct, incorrect: _sessionStudy.incorrect, objectives: [..._sessionStudy.objectives], mastered: [..._sessionStudy.mastered] }
}
export function hasSessionStudy() {
  return _sessionStudy.correct > 0 || _sessionStudy.incorrect > 0 || _sessionStudy.objectives.size > 0
}
export function dismissSessionRecap() { _recapDismissed = true }
export function isRecapDismissed() { return _recapDismissed }
