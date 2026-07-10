# Wave/Patch Architecture — Consolidation Report
**Date:** 2026-07-10  
**Phase:** P5 — Architecture audit and pool-depth analysis

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

## Pool Depth Analysis — Clean Bank (as of 2026-07-10)

Questions per objective sorted ascending:

| Objective | Count | Flag |
|---|---|---|
| 5.9 | 4 | CRITICAL |
| 4.9 | 5 | CRITICAL |
| 6.1 | 6 | LOW |
| 2.7 | 7 | LOW |
| 5.2 | 7 | LOW |
| 1.1, 1.2, 1.3, 1.4, 1.7, 1.9, 1.10, 1.11, 1.12, 2.1, 2.2 | 8 each | FLOOR |
| 4.8, 6.2 | 9 each | NEAR-FLOOR |
| 1.8, 2.6, 3.6, 4.10, 5.4, 5.11 | 10 each | LOW |

**High-depth objectives (healthy):** 3.4 (72), 2.5 (54), 3.3 (51), 3.2 (49), 3.1 (37), 5.5 (38), 4.1 (32), 3.5 (30), 6.6 (30)

> Note: The pre-P5 audit claimed "Objective 3.5 has only 1 question." That was pre-clean-bank data. As of today 3.5 has 30 questions — well above the floor.

---

## Consolidation Decision

### What was NOT changed (and why)

1. **No wave files deleted** — Every `tierBTrapWave*.js` and `contentDepthWave*.js` file has an active import in `contentEnrichmentPatches.js`. Deleting any of them without first removing the import and re-running tests would break the build.

2. **No wave files merged** — Merging 20 trap wave files into 1 would save ~19 import lines in `contentEnrichmentPatches.js` but carries risk of accidentally dropping data during the merge. The benefit is cosmetic only — the bundler inlines them anyway. If a future session wants to do this, the safe process is: concatenate exports into a single `allTierBTrapPatches.js`, update the one import + merge block in `contentEnrichmentPatches.js`, run tests, delete originals.

3. **No supplemental questions moved to clean bank** — The `contentDepthWave*.js` questions use a different shape (they may lack the full `answerReview` structure required by the clean bank). Moving them would require shape validation and a compile step via `compileCleanQuestionsModule.mjs`.

### What should happen next (P5 continuation)

**Priority 1 — Fill 5.9 (4 questions, CRITICAL)**
Topic: `5.9` covers wireless security (WPA2/WPA3, 802.1X, EAP). Add at least 6 more clean-bank questions to reach a 10-question floor. Use `compileCleanQuestionsModule.mjs` to re-compile `domain-5.js`.

**Priority 2 — Fill 4.9 (5 questions, CRITICAL)**
Topic: `4.9` covers QoS concepts (DSCP, CoS, queuing). Add at least 5 more questions.

**Priority 3 — Fill 6.1 (6 questions, LOW)**
Topic: `6.1` covers automation/intent-based networking concepts.

**Priority 4 — Fill 2.7, 5.2 (7 questions each)**

**Priority 5 (optional) — Merge wave files**
If file-count hygiene matters: consolidate the 20 `tierBTrapWave*.js` files into `tierBTrapAllPatches.js` after writing a test that asserts objective-trap counts before and after.

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
