# Wave/Patch Architecture — Consolidation Report
**Date:** 2026-07-10  
**Phase:** P5 — Architecture audit and pool-depth analysis (**CLOSED** — runtime depth ≥10 for all objectives)

---

## Architecture Overview

### Three parallel data layers

| Layer | Files | Shape | Consumed by |
|---|---|---|---|
| **Clean bank** | `src/data/cleanQuestions/domain-{1-6}.js` | Full question objects (id, question, choices, correctIndex, explanation, answerReview) | `cleanQuestionAdapter.js` — lazy-loaded per domain on first use |
| **Enrichment patches** | `tierBTrapWave{4-23}Patches.js`, `contentDepthWave{3-11}Patches.js`, and others | Per-objective dicts with `examTraps`, `flashcards`, `questions`, `engineerView` keys | `contentEnrichmentPatches.js → applyContentEnrichment(base, objectiveId)` |
| **Gold answer reviews** | `src/answerReview/goldAnswerReviewsBatch{2-32}.js` | `questionId → {correct, incorrect[]}` override lookup | `goldAnswerReviews.js → goldAnswerReviewFor(questionId)` in `answerReviewLogic.js` |

---

## Investigation Findings

### A. Trap wave patches — status: PASS (correctly wired, no orphans)

All 20 `tierBTrapWave*.js` files are imported in `contentEnrichmentPatches.js` and their data is merged by `applyContentEnrichment()`. They contribute `examTraps` (trap callouts for review UI) and `flashcards` — **not quiz questions**. There is no overlap with the clean bank question pool.

None of these files are orphaned. File-count consolidation (merging waves into fewer files) is a cosmetic operation with no functional benefit and non-trivial risk of breaking the import chain in `contentEnrichmentPatches.js`. **Recommend: leave as-is.**

### B. Content depth waves — status: PASS (correctly wired)

`contentDepthWave{3-11}Patches.js` (9 files) are all imported in `contentEnrichmentPatches.js`. They contribute `questions` (supplemental scenario questions served outside the clean bank quiz flow), `flashcards`, and `engineerView` enrichments.

These supplemental questions are NOT part of the clean bank (not served by `cleanQuestionAdapter.js`). They appear in drill/lab/enrichment views, not the main quiz pool.

### C. Gold answer review batches — status: READ-ONLY LOOKUPS, no action needed

32 `goldAnswerReviewsBatch*.js` files are aggregated by `goldAnswerReviews.js` into `GOLD_ANSWER_REVIEWS` dict. The `goldAnswerReviewFor(questionId)` function overrides generator-produced answer explanations for high-traffic questions. These are static lookup data — they modify display only, not question pool depth.

---

## Pool Depth Analysis — Runtime totals (clean + skill + enrichment)

**Recounted:** 2026-07-10 (via `countObjectiveQuestions` after skill-registry load)

| Objective | Count | Flag |
|---|---|---|
| 1.2, 1.9, 1.10, 1.12 | 16 each | Healthy (≥10) |
| 1.1, 4.9 | 17 each | Healthy |
| 5.9 | 20 | Healthy |
| 6.1, 5.2, 2.7 | 21–22 | Healthy |

**Below 10-question floor:** **none**

Earlier P5 snapshot (clean-bank-only) listed 5.9/4.9 as CRITICAL — incomplete. Runtime pool depth is above floor for all 53 objectives.

**High-depth objectives (healthy):** 3.4 (72), 2.5 (54), 3.3 (51), 3.2 (49), 3.1 (37), 5.5 (38), 4.1 (32), 3.5 (30), 6.6 (30)

---

## Consolidation Decision

### What was NOT changed (and why)

1. **No wave files deleted** — Every `tierBTrapWave*.js` and `contentDepthWave*.js` file has an active import in `contentEnrichmentPatches.js`. Deleting any of them without first removing the import and re-running tests would break the build.

2. **No wave files merged** — Merging 20 trap wave files into 1 would save ~19 import lines in `contentEnrichmentPatches.js` but carries risk of accidentally dropping data during the merge. The benefit is cosmetic only — the bundler inlines them anyway. If a future session wants to do this, the safe process is: concatenate exports into a single `allTierBTrapPatches.js`, update the one import + merge block in `contentEnrichmentPatches.js`, run tests, delete originals.

3. **No supplemental questions moved to clean bank** — The `contentDepthWave*.js` questions use a different shape (they may lack the full `answerReview` structure required by the clean bank). Moving them would require shape validation and a compile step via `compileCleanQuestionsModule.mjs`.

### P5 continuation — CLOSED

Priorities 1–4 (fill 5.9 / 4.9 / 6.1 / 2.7 / 5.2) are **already satisfied** by current runtime counts (all ≥16). No new depth wave required.

**Priority 5 (optional)** — Merge wave files remains cosmetic-only; leave as-is unless explicitly requested.

---

## File Map (for future reference)

```
src/data/
  cleanQuestions/          ← quiz question pool (6 files, ~46K lines)
  cleanQuestionAdapter.js  ← lazy loader for clean bank
  ccnaCleanBankMeta.js     ← Set of 53 objective IDs in bank
  contentEnrichmentPatches.js  ← aggregator for all wave files
  tierBTrapWave{4-23}Patches.js   ← exam traps + flashcards (20 files)
  contentDepthWave{3-11}Patches.js ← supplemental questions (9 files)
  factoryDepthWave{3-4}Questions.js, factoryParametricWave1Questions.js
  factoryTrapPatches.js, factoryFlashcardPatches.js
  factoryEngineerViewPatches*.js (4 files)
  wlanEnrichmentWave5.js
src/answerReview/
  goldAnswerReviews.js     ← aggregator for gold review batches
  goldAnswerReviewsBatch{2-32}.js  ← per-question answer review overrides (32 files)
```
