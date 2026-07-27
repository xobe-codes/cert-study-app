# Question Logic / Wrong-Answer Feedback — Implementation Report

**Date:** 2026-07-27 · **Companion doc:** `QUESTION_LOGIC_WRONG_ANSWER_AUDIT.md`

## Context

This run was triggered by a scheduled routine whose stored prompt described a large, from-scratch "wrong-answer feedback upgrade." The audit (see companion doc) found that the feature this prompt describes — per-choice stem-grounded feedback, gold/regen/clean-bank/SADE precedence, multi-select selected-vs-omitted distinction, ordering mismatch detection — **was already implemented and shipped** in prior sessions (`WRONG_ANSWER_DEBRIEF_99_SPEC.md`: "Implemented (P0–P2)"; `IMPLEMENTATION_TRACKER.md`: "Question debrief 99+ — shipped"). Consistent with the routine's own stated priority order ("audit the real repository before making architectural decisions," "reuse aggressively," "do not create a second grading engine"), this run's scope was narrowed to the one genuine, verified gap: **must-ship item — "Add optional wrong-answer diagnosis."**

## Implemented scope

1. **`diagnoseWrongAnswer({ question, submittedAnswer, gradeResult })`** — new pure function at `src/answerReview/diagnoseWrongAnswer.js`.
   - Returns `null` for correct answers.
   - Reuses the existing answer-review precedence chain via `applyAnswerReviewToQuestion` (no new grading, no recomputation of correctness).
   - Type-aware: MC (`diagnoseMc`), multi-select (`diagnoseMulti` — separates `selectedWrongChoiceIndexes` from `omittedCorrectChoiceIndexes`), ordering (`diagnoseOrdering` — finds first invalid transition via the existing `cliStringsEquivalent` comparator), CLI (`diagnoseCli` — explicitly returns a `source: 'limited'` diagnosis rather than inventing a classification the canonical grader doesn't support).
   - Output shape: `{ schemaVersion, errorClass, misconceptionId, misconceptionLabel, trapFamily, ckuIds, source }` (+ type-specific extras). Adapted from the spec's example shape to what the repository's real metadata can actually support — no fabricated `severity`/`intervention` values were added since no code path produces reliable data for them.
   - Never throws; wrapped in try/catch, falls back to `null` on any unexpected shape.
2. **Unit tests** — `src/__tests__/diagnoseWrongAnswer.test.js` (12 tests): correct → null, rich-object `gradeResult` → null, MC diagnosis reuses answer-review chain, missing metadata doesn't crash, unknown question shape doesn't throw, multi-select mixed/incomplete/false-positive classification, ordering first-mismatch detection (both plain-array and `{order}`-wrapped submissions), CLI limited-diagnosis labeling, bare multi question doesn't throw.
3. **Wiring into missed-entry records** — attached as an optional `diagnosis` field via each session's existing `buildMissedEntry(...)` `extra` parameter, in all 7 primary session components: Practice (`QuizTab.jsx`), Topic Focus, Focus Mode, Daily Review, Domain Pass, Domain Placement, and Mock Exam (study-mode reveal only — the timed real-exam hidden-feedback path is untouched).

## Deferred scope (documented, not attempted)

- **CLI wrong-answer classification** (wrong mode/keyword/verb/argument order) — the canonical CLI grader is pass/fail only; building a reliable classifier would either require extending the canonical grader (forbidden — could change pass/fail behavior) or a heuristic layer with no existing metadata to ground it (risk of presenting fabricated certainty to learners). `diagnoseCli` intentionally returns a clearly-labeled "limited" diagnosis instead.
- **Shared post-grade orchestration** for `QuizTab.jsx`'s four submit handlers (identified as a real, pre-existing call-drift risk in the audit) — a "strongly preferred," not must-ship, item. Refactoring four handlers in the app's highest-traffic session this close to the deadline risked the top priority ("preserve all existing functionality") for a stretch-tier architectural cleanup. Recommended as the next phase's first task, done in isolation with its own regression pass.
- **Missed-entry writer dedup unification** (`handleMissed`/`saveMissed` vs. `appendMissedEntry`) — pre-existing drift, unrelated to this task's diff, flagged in the audit for future attention.
- **UI surfacing of the new diagnosis object** — the existing `AnswerReview.jsx` already renders equivalent information (trap-family chip, `whyWrongHere`, `misconceptionTested`) sourced from the same underlying data the diagnosis resolver reuses. Adding a second, redundant UI element for `diagnosis` was judged higher regression risk than value this close to the deadline; the diagnosis object ships as a data-layer building block (available on missed records for future recovery/analytics work) without a new UI surface.
- **Adaptive recovery behavior** — explicitly gated behind "only after the foundation passes regression testing" in the routine; not started.

## Files changed

- New: `src/answerReview/diagnoseWrongAnswer.js`, `src/__tests__/diagnoseWrongAnswer.test.js`
- Modified: `src/tabs/QuizTab.jsx`, `src/topic/TopicFocusSession.jsx`, `src/features/focus/FocusModeSession.jsx`, `src/features/review/ReviewSession.jsx`, `src/features/domainPass/DomainPassSession.jsx`, `src/features/domainPlacement/DomainPlacementSession.jsx`, `src/MockExam.jsx`

## Reused components/helpers (no duplication introduced)

`applyAnswerReviewToQuestion`, `generateAnswerReview`, `resolveIncorrectItem` (`src/answerReviewLogic.js`); `gradeQuestion`, `buildMissedEntry`, `isMcQuestion`/`isMultiQuestion`/`isOrderingQuestion`/`isCliQuestion`, `multiCorrectIndexes`, `normalizeSelectedIndexes` (`src/questionUtils.js`); `cliStringsEquivalent` (`src/lab/cliGrading.js`).

## New helpers added

`diagnoseWrongAnswer` and its 4 internal type-specific branches (all in one file, single narrow responsibility — diagnosis only, no grading/storage/UI). `missEntry` — a 3-line local helper in `QuizTab.jsx` that composes `buildMissedEntry` + `diagnoseWrongAnswer` to keep the file under its 900-line test guard.

## Storage impact

Additive only. `diagnosis` is a new optional field passed through `buildMissedEntry`'s existing `extra` merge point. No storage key added, no existing field renamed/removed, no schema version bump required. Old missed records (without `diagnosis`) continue to load unchanged — nothing reads `diagnosis` yet except the new field's own presence, so its absence is a valid, expected state.

## Migration impact

None. No migration script needed or written.

## Session coverage

Practice (QuizTab), Topic Focus, Focus Mode, Daily Review (SRS), Domain Pass, Domain Placement, Mock Exam (study-mode reveal). Not covered: Trap Drill session (uses a different, non-`buildMissedEntry` recording path not touched by this run — left as-is per "preserve existing functionality" and out of the audited call-site list).

## Question-type coverage

MC, multi-select, ordering: diagnosis reuses full existing metadata. CLI: intentionally limited (see Deferred scope). True/false: no distinct grading path exists in this repo (graded as MC) — covered under MC.

## Feature flag / rollback method

No new flag introduced. This is additive, backward-compatible data attached to missed records — the safe rollback boundary is `git revert` of the two commits on `master` (`54a9cc0`, `39a8f00`), or simply removing the `diagnosis: ...` lines, since nothing downstream depends on the field yet.

## Validation commands run

- `npm ci`
- `npm test` (vitest run)
- `npm run lint` (eslint src)
- `npm run build` (vite build)

## Test results

| | Baseline | Final |
|---|---|---|
| Test files | 185 passed | 186 passed |
| Tests | 1714 passed | 1726 passed (+12 new, 0 regressions) |
| Lint | 137 problems (27 errors, 110 warnings) | 137 problems (27 errors, 110 warnings) — identical, all pre-existing |
| Build | succeeds | succeeds |

No new failures anywhere. All pre-existing lint errors/warnings were verified (via `git stash`) to exist on `master` before this run's changes.

## Known limitations

- `diagnoseWrongAnswer` for CLI questions cannot explain *why* an answer was wrong beyond "the canonical grader rejected it" — this is a genuine gap in the underlying grader's capability, not something this run's diagnosis layer can safely paper over.
- The diagnosis object is not yet surfaced in any UI. It is available on missed-question records for a future recovery/analytics phase.
- Two pre-existing architectural risks (missed-entry writer duplication, QuizTab post-grade call drift) were identified but intentionally not touched — see audit doc §3.

## Recommended next phase

1. Unify `QuizTab.jsx`'s four post-grade handlers behind one shared fan-out, validated in isolation with a dedicated regression pass (addresses the "strongly preferred" shared-orchestration item). Still not attempted — highest remaining risk/value item.
2. ~~Resolve the missed-entry writer dedup inconsistency~~ — **done in a follow-up session, commit `44d207e`.** See addendum below.
3. If/when the canonical CLI grader gains structured failure reasons, extend `diagnoseCli` to consume them (still without becoming a second grading engine).
4. Consider a small, optional UI element (e.g. in `AnswerReview.jsx`) that surfaces `diagnosis.misconceptionLabel` only when it differs from what's already shown via the existing trap-family chip, to avoid duplicate copy.

## Addendum — follow-up session (commit `44d207e`)

**Operational note:** this routine's own prior commits (`54a9cc0`, `39a8f00`, `00a973a`) were found in a detached-HEAD state, not on `master`, and never pushed — despite this report's claims. They were recovered via a clean fast-forward merge and pushed before any new work started. If a future run inherits an unexpected `HEAD detached from refs/heads/master` state, do not assume prior "shipped" claims in these docs are actually on the branch — verify with `git log --oneline` on the checked-out branch itself.

**Fix shipped:** item 2 above turned out to be a live, user-visible defect rather than pure hygiene. `MissedReview.jsx` renders the raw `missed` array with no dedup, and `handleMissed` (used by Practice, Topic Focus, Focus Mode, Daily Review) appended unconditionally while `appendMissedEntry` (Domain Pass, Domain Placement, Mock Exam) skipped duplicates — so a question missed twice across two different sessions before being cleared surfaced as two rows in Missed Review, one of the app's most-used screens. This directly violates the routine's own completion criterion "wrong answers create exactly one missed record."

- New shared helper: `isDuplicateMissedEntry(missed, entry)` in `src/missed/missedDisplay.js` — pure, reused by both writers (`useAppProgress.handleMissed` and `domainPassStorage.appendMissedEntry`) instead of keeping two copies of the same rule.
- No new storage key, no schema version bump, no change to grading/scoring/SRS/exposure — purely a write-time guard on an already-existing check.
- Tests: 4 new cases in `src/__tests__/missedDisplay.test.js` (empty bank, same question+objective collision, same question different objective is not a collision, entries with no `questionId` never collide).
- Validation: `npm test` 186 files / 1730 tests passed (0 failures, +4 from this addendum); `npm run lint` 137 problems (27 errors, 110 warnings) — identical to baseline; `npm run build` succeeds.
- Rollback: `git revert 44d207e` — fully isolated, touches no other behavior.

## Manual QA checklist (not run this session — no browser available in this environment)

1. Practice: miss an MC question → open its entry in Missed Questions review → confirm no rendering change (diagnosis is currently data-only).
2. Practice: miss a multi-select question with 1 correct-but-unchecked and 1 wrong-but-checked option → verify existing UI still shows both separately (unchanged from before this run).
3. Legacy question (no `ckuIds`/`answerReview` metadata): miss it → confirm the app doesn't crash and the missed entry still loads on next launch.
4. CLI question: submit a wrong command → confirm existing pass/fail feedback is unchanged.
5. Topic Focus, Domain Pass, Mock Exam (study mode): repeat the miss flow → confirm scoring, progression, and existing feedback are all unchanged.
6. Mobile viewport: repeat step 1 — layout is untouched by this run, so no visual regression expected.
7. Refresh the page mid-session in any of the 7 sessions → confirm existing local-storage state still loads (this run added no new storage key).
