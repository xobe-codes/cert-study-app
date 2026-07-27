# Question Logic / Wrong-Answer Feedback — Repository Audit

**Date:** 2026-07-27 · **Run:** scheduled overnight routine · **Branch:** `master` (direct-to-master per run config)

## 0. Headline finding

The wrong-answer debrief feature this routine's prompt describes as a from-scratch build is **already substantially implemented and shipped**. `ai-improvement-logs/WRONG_ANSWER_DEBRIEF_99_SPEC.md` is marked `Status: Implemented (P0–P2)`, and `IMPLEMENTATION_TRACKER.md` lists "Question debrief 99+ — shipped." The routine's own top priority ("audit before implementing," "reuse existing," "do not build a second engine") therefore points to **auditing the real gap against the must-ship checklist and closing only that gap**, not a rebuild. This document records what is CONFIRMED IN CODE vs. genuinely missing.

## 1. Confirmed-shipped systems (do not duplicate)

| System | Real location | Status |
|---|---|---|
| Canonical grading dispatcher | `gradeQuestion(q, answer)` — `src/questionUtils.js:84-102` | CONFIRMED. Single function, branches by type (CLI/ordering/multi/MC). All 7 session components call this one function. |
| CLI grader (IOS-faithful, abbreviation-aware) | `gradeCliAnswerList` — `src/lab/cliGrading.js:6-17` | CONFIRMED. Boolean pass/fail; no wrong-mode/keyword classification. |
| Answer-review generator + precedence | `generateAnswerReview(q)` — `src/answerReviewLogic.js:269-356` | CONFIRMED. Precedence is gold → **regen** → clean-bank → SADE (`resolveWrongChoiceForReview`, line 124). The P0 regen-wiring described as "not imported anywhere" in the spec's own stale table **has since been wired** (`regenIncorrectFor` import at `answerReviewLogic.js:18`, used at line 138). |
| Per-choice resolution / polish | `resolveIncorrectItem`, `applyAnswerReviewToQuestion` — `src/answerReviewLogic.js:359-417` | CONFIRMED. Sanitizes text, attaches `whyWrongHere`/`whatItDoes`/`misconceptionTested`/`genericDebrief` per choice. |
| Feedback UI | `AnswerReview.jsx`, `McChoices.jsx`, `MultiChoices.jsx` | CONFIRMED. Multi-select already separates `extraWrong` (selected-wrong) from `missedCorrect` (omitted-correct) — `AnswerReview.jsx:270-330`. Ordering mismatches computed via `orderingMismatches` (`AnswerReview.jsx:22-32`). |
| Missed-entry shape builder | `buildMissedEntry(objectiveId, q, extra)` — `src/questionUtils.js:120-148` | CONFIRMED single shared builder across all 7 sessions. Merges `extra` last — safe extension point. |
| Ordering question type | `isOrderingQuestion` — `src/questionUtils.js:23-25` | CONFIRMED first-class type, graded and reviewed. |
| Multi-select type | `isMultiQuestion` — `src/questionUtils.js:48-56` | CONFIRMED. |
| True/false | N/A | NOT FOUND as a distinct grading path — `'true-false'` is a display label only (`TYPE_LABEL`, `questionUtils.js:9`); graded as ordinary MC. Documented here, not changed (not a defect — no distinct behavior contract exists to preserve or break). |
| Trap streak (session UI counter) | `src/features/practice/trapStreak.js` | CONFIRMED — in-memory, per-session UI CTA counter (`shouldShowWildcardBridge`), **not** a diagnostic record. Distinct from the new `diagnoseWrongAnswer` resolver. |

## 2. Confirmed gaps (must-ship item this run addresses)

- **No structured wrong-answer diagnosis resolver existed.** grep for `misconceptionId`, `errorClass`, `trapFamily`-as-schema-field returned no hits outside `trapStreak.js` (a different, session-local concept). This is the one clear must-ship gap (spec item 4/5: "Add optional wrong-answer diagnosis").
- **CLI grading is pass/fail only** — no wrong-mode/wrong-keyword/wrong-verb classification exists anywhere in the quiz-grading path (`src/lab/cliProcess.js` has a `cliRequiredMode` concept, but it belongs to the interactive lab terminal, not `gradeCliAnswerList`). Building that classifier would mean either extending the canonical grader (risk: could change pass/fail behavior — explicitly forbidden) or inferring it heuristically post-grade (low confidence, risk of false certainty). **Deferred** — documented in the implementation report as a stretch item, not attempted this run.

## 3. Regression risks found

1. **Missed-entry writer duplication — FIXED in a follow-up session (commit `44d207e`).** Two divergent code paths persisted to the same `STORAGE_KEYS.missed` key: `handleMissed`/`saveMissed` (`src/features/progress/useAppProgress.js` — previously no dedup) vs. `appendMissedEntry` (`src/features/domainPass/domainPassStorage.js` — dedupes by `questionId + objectiveId`). Because `MissedReview.jsx` renders the raw `missed` bank with no dedup of its own, a question missed in two different sessions (e.g. Practice, then Topic Focus) before being cleared produced **two visible rows for the same question** — a real violation of the "wrong answers create exactly one missed record" completion criterion, not just a hygiene nit. Fixed by extracting the existing `appendMissedEntry` rule into a shared pure helper, `isDuplicateMissedEntry()` (`src/missed/missedDisplay.js`), reused by both writers. No storage key, schema, grading, or scoring change. Verified: 186 files / 1730 tests passing (4 new), lint and build unchanged from baseline.
2. **Post-grade call drift inside `QuizTab.jsx`.** Four submit handlers (`selectAnswer`, `markUnknown`, `submitMulti`, `submitOrder`, `submitCli`) each hand-roll a different subset of post-grade calls (`recordQuestionHealthSignal`, `recordAnswerOutcome`, `recordEngagement`, `recordMissClearAttempt`, `recordTrapMiss` are not called consistently across all four). No shared fan-out function exists. This matches the routine's "Strongly preferred" (not must-ship) item — "shared post-grade orchestration." **Still not refactored**: touching all four handlers in the highest-traffic session risks the "preserve all existing functionality" priority for a stretch-tier item, and no evidence of a live bug (unlike item 1) was found to force the issue. Recommended next-phase work (see implementation report).

## 4. Smallest-safe change boundary chosen

- New file: `src/answerReview/diagnoseWrongAnswer.js` — pure function, reuses `applyAnswerReviewToQuestion` (existing precedence chain) and `questionUtils` type helpers. No new grading, no storage writes, no UI, no live AI.
- Extension: `buildMissedEntry`'s existing `extra` parameter carries an optional `diagnosis` field at each session's existing `onMissed`/`appendMissedEntry` call site. No existing field renamed or removed; old missed records still load (field is simply absent).

## 5. Files expected to change (and why)

| File | Change |
|---|---|
| `src/answerReview/diagnoseWrongAnswer.js` | New — pure diagnosis resolver |
| `src/__tests__/diagnoseWrongAnswer.test.js` | New — unit tests |
| `src/tabs/QuizTab.jsx` | Wire diagnosis into Practice missed entries (+ `missEntry` helper to stay under the file's 900-line test guard) |
| `src/topic/TopicFocusSession.jsx` | Wire diagnosis into Topic Focus missed entries |
| `src/features/focus/FocusModeSession.jsx` | Wire diagnosis into Focus Mode missed entries |
| `src/features/review/ReviewSession.jsx` | Wire diagnosis into Daily Review missed entries |
| `src/features/domainPass/DomainPassSession.jsx` | Wire diagnosis into Domain Pass missed entries |
| `src/features/domainPlacement/DomainPlacementSession.jsx` | Wire diagnosis into Domain Placement missed entries |
| `src/MockExam.jsx` | Wire diagnosis into Mock Exam **study-mode** missed entries only (timed-exam hidden-feedback timing unchanged) |

## 6. Baseline validation results (before any edit)

- `npm ci` — clean install, 808 packages.
- `npm test` (vitest) — **185 files / 1714 tests passed**, 0 failures.
- Lint baseline (captured via `git stash` re-run after implementation) — **137 problems (27 errors, 110 warnings)**, all pre-existing and unrelated to this task's files (ref-during-render errors in `QuizTab.jsx` DeferredExamTips/trap-drill blocks predate this run's edits; unused-var warnings scattered across unrelated files).
- `npm run build` — succeeds (pre-existing chunk-size warnings only).

## 7. Final validation results (after implementation)

- `npm test` — **186 files / 1726 tests passed**, 0 failures (12 new tests added, 0 regressions).
- Lint — **137 problems (27 errors, 110 warnings)** — byte-identical count to baseline; no new lint issues introduced.
- `npm run build` — succeeds.
- File-size guard (`src/__tests__/appShellExtract.test.js`) — `QuizTab.jsx` kept at 899 lines (under the 900-line ceiling) via a small `missEntry` helper instead of inlining diagnosis at each call site.

## 8. Follow-up session (commit `44d207e`) — critical finding

This routine re-fired after the run above completed. Two things were found and handled before further feature work:

1. **The prior run's 3 commits (`54a9cc0`, `39a8f00`, `00a973a`) were never landed.** They were made in a detached-HEAD state — `master` itself never advanced past `ce86c56`, and nothing was pushed to `origin`, despite the implementation report claiming completion. Recovered via `git merge --ff-only` (clean fast-forward, no divergence) and pushed to `origin/master`. Anyone continuing this work should verify `git status`/`git log` actually reflects a branch, not detached HEAD, before trusting "committed" claims in these docs.
2. **Regression risk §3.1 above (missed-entry writer duplication) was fixed**, since further investigation showed it was a live, user-visible defect (duplicate rows in Missed Review), not just a hygiene concern — see §3 for detail and the implementation report for full scope.
