# ACTIVE_HANDOFF

## Slice C — Practice Unseen Pool 99 (spec)

- Status: **SPEC DONE**
- Spec: `ai-improvement-logs/PRACTICE_UNSEEN_POOL_99_SPEC.md`
- Completed: Lean P0→P2 plan — extend exposure v1 in place, `correctRecent` tier, wire grade writes
- Not done: Implementation (start P0: `normalizeExposureEntry` + `bucketByExposure` split + `QuizTab` grade write)
- Spine locks: no new storage key; no parallel ledger; no App.jsx routing
- Next: P0 in `domainQuestionExposure.js` + `buildExposureAwarePool.js` + vitest tier cases

## Slice A — Wrong-Answer Debrief 99 (spec)

- Status: **SPEC DONE**
- Spec: `ai-improvement-logs/WRONG_ANSWER_DEBRIEF_99_SPEC.md`
- Completed: Lean P0→P2 plan (regen wire → content → optional MC chrome/footer)
- Not done: Implementation (start with P0: merge `regeneratedExplanations.json` in `generateAnswerReview`)
- Spine locks: no App.jsx routing; no Lab Exam coupling
- Next: Implement P0 in `answerReviewLogic.js` + vitest precedence cases

## Slice B — Lab Exam MVP (separate; may still be in flight)

- Status: PARTIAL
- Slice: Hands-On 99 P1 — Lab Exam MVP (pool + component + route + LabView examMode)
- Completed:
  - `src/features/labExam/quickLabExamPool.js` — 6-station pool, score/aggregate helpers
  - `src/features/labExam/LabExam.jsx` — idle → active → debrief, 25m timer, LabView embed
  - `src/features/labExam/LabExamRoute.jsx` — lazy route (MockExamRoute pattern)
  - `src/__tests__/labExamPool.test.js` — 9 tests green
  - `src/lab/LabView.jsx` — `examMode` prop: skip learn, hide expected commands, no teach hints
  - `e2e/lab-exam-smoke.spec.js` — smoke spec added
- Not done:
  - Parent wire `#/labexam` in App.jsx / AppLoadedShell (explicitly out of scope this slice)
  - `verify:ship` full run — **blocked on Playwright chromium install** (`npx playwright install chromium` needed for e2e)
  - c&d
- Files created/modified:
  - **Created:** `src/features/labExam/quickLabExamPool.js`, `LabExam.jsx`, `LabExamRoute.jsx`, `src/__tests__/labExamPool.test.js`, `e2e/lab-exam-smoke.spec.js`
  - **Modified:** `src/lab/LabView.jsx`
- Spine locks: no appTheme tokens; no App.jsx; reuse LabView/cliEngine
- Exact next 1–3 steps:
  1. Wire `LabExamRoute` in parent shell (`onExit`, `onSelectObjective`, `haptic` props)
  2. `npx playwright install chromium` then `npm run verify:ship`
  3. c&d when user says ship
- Commands to run:
  - `npm test -- src/__tests__/labExamPool.test.js` ✓
  - `npx playwright install chromium`
  - `npm run verify:ship`
- Commit status: not yet
- Resume prompt: Lab Exam MVP files are in `src/features/labExam/`. Wire `LabExamRoute` from parent (like MockExamRoute), pass `onExit`/`onSelectObjective`/`haptic`, install Playwright chromium, then run `verify:ship` and c&d.
