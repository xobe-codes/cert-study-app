# Wrong-Answer Debrief — 99 Spec (screenshot parity)

**Status:** Implemented (P0–P2) · **Intent:** content + small wiring/polish — not a rebuild
**Related:** `QUESTION_DEBRIEF_99.md` (runtime contract) · `explanationPattern99.md` (regen fields) · `EXPLANATION_REGEN_PROGRESS.md`

---

## 1. North star

After submit in Practice (and sibling quiz surfaces), the learner sees a **Cisco/Boson-style MC debrief**: why the **correct** answer is right, and why **each wrong choice** is wrong — stem-grounded, choice-specific, in the same session chrome they already use. Reuse `AnswerReview` / `answerReviewLogic` / gold / clean-bank / regen staging; close screenshot gaps with minimal UI polish, not a new debrief product.

---

## 2. Current state (reuse table)

| Layer | What exists | Notes |
|-------|-------------|-------|
| **Runtime UI** | `AnswerReview.jsx` | MC: your-wrong → correct → `OTHER OPTIONS (n)` collapsed; `WrongChoiceReview` renders `whyWrongHere` / `whatItDoes` / trap chip |
| **Logic** | `answerReviewLogic.js` | `generateAnswerReview` → gold → SADE/stem-anchored fallbacks; `resolveIncorrectItem`, `applyAnswerReviewToQuestion` |
| **Gold** | `src/answerReview/goldAnswerReviews*.js` | Curated overrides per question id |
| **Clean bank** | `ccnaCleanQuestions.js` | `answerReview.correct` + `incorrect[]` with `whatItDoes` / `whyWrongHere` / `misconceptionTested` (many still template-thin) |
| **Regen staging** | `regeneratedExplanations.json` (~235/914) | 99-spec fields: `misconceptionReason`, `whyItSeems`, `whyWrongHere`, `memoryAnchor`, `contrast` |
| **Regen helper** | `explanationIntegration.js` | `applyRegenExplanations` / `getChoiceExplanation` — **not imported anywhere**; maps to dead `explanations` field, not `answerReview` |
| **Choice chrome** | `McChoices.jsx`, `MultiChoices.jsx` | Multi: ✓ on all correct, ✗ on picked wrong; MC: ✗ only on learner pick, **no ✓ on correct**, other wrongs hidden in accordion |
| **Wiring** | Practice, Domain Pass, Mock review, Trap Drill, etc. | All call `applyAnswerReviewToQuestion` before `AnswerReview` |
| **Quality gates** | `answerReviewQuality.js` | `isTemplateWhyWrongHere`, `tierQuestion`, `scoreAnswerReview` |
| **Content pipeline** | `scripts/claimQuestionBatch.mjs`, `BATCH_CLAIM_99.md` | Batch claim for regen; `scripts/lib/generateAnswerReview.mjs` for bank builds |

---

## 3. Target UX vs screenshot (Practice first)

- **Post-submit choice list:** Correct choice highlighted mint + **✓**; every wrong distractor rose/muted + **✗** (learner pick gets stronger border — already true).
- **Debrief blocks (all wrongs visible):** For each distractor: letter + choice text header → *Why it is wrong here* → *What this choice implies* → optional trap-family chip. Correct block: letter + keyed explanation. Order on miss: **your wrong → correct → other wrongs** (keep today’s pedagogy).
- **No buried distractors:** Screenshot shows all four rationales; default should be **expanded** (or flat list, no nested collapse inside `OTHER OPTIONS`).
- **Footer context:** Sub-objective label + **BOOK_REF** quick-ref link/panel (same data as `ExplainTab` / `QuizTab` — `BOOK_REF[objective.id]` from `bookRefFull.js`).
- **Thin-content signal:** Keep soft “Generic debrief” amber only when `isTemplateWhyWrongHere` still fires after merge — goal is regen/gold makes this rare.

**Practice-first surfaces:** `QuizTab` (lesson Practice), then parity pass on `DomainPassSession`, `MockExam` review, `ReviewSession`, `TrapDrillSession`. No new routes.

---

## 4. Minimal scope

### In

- One merge point: regen JSON → `generateAnswerReview` precedence chain
- Field mapping regen → `answerReview.incorrect[]` shape
- Continue regen batches (claim protocol) + gold for high-traffic ids
- Small MC chrome + `AnswerReview` expand defaults + optional debrief footer
- Tests on merge precedence + MC mark parity

### Out

- New debrief engine, live AI on reveal, Domain Pass session redesign
- Mass inline edit of `ccnaCleanQuestions.js` (rebuild via scripts/regen/gold)
- Lab Exam, CLI debrief changes, theme tokens, `App.jsx` routing
- Premium-only debrief tier

---

## 5. Phased plan (P0 → P2)

### P0 — Wire regen into `generateAnswerReview` (highest impact / lowest effort)

**Goal:** ~235 staged questions immediately upgrade runtime debrief without bank rewrite.

**Single merge point:** `src/answerReviewLogic.js` → `generateAnswerReview(q)` — insert **after** `goldAnswerReviewFor(q.id)` miss, **before** SADE/generic fallback.

**Precedence (per wrong choice):**

1. Gold `incorrect[]` (if explicit + passes `answerReviewQuality`)
2. **Regen** `regeneratedExplanations.json[q.id].incorrect[]` (if present + passes quality)
3. Clean-bank `q.answerReview.incorrect[]` (if present + passes quality)
4. `buildWrongChoiceItem` / SADE (today’s fallback)

**Field mapping (regen → runtime):**

| Regen field | Runtime field |
|-------------|---------------|
| `whyWrongHere` | `whyWrongHere` |
| `misconceptionReason` | `misconceptionTested` |
| `whyItSeems` + `contrast` (joined) | `whatItDoes` |
| `whyWrongHere` (or `memoryAnchor` suffix) | `explanation` (short paragraph for legacy consumers) |

**Implementation sketch:**

- Move import + lookup into `answerReviewLogic.js` (or thin `resolveRegenIncorrect(qId, choiceIndex)` in `explanationIntegration.js` called from logic — **one call site**).
- Reuse `isTemplateWhyWrongHere` / `isFallbackExplanation` on mapped fields; fall through if regen entry is thin.
- Add vitest: regen wins over template clean-bank; gold still wins over regen; unmapped id unchanged.

**Do not** wire `applyRegenExplanations` at render time in every session — merge at generation keeps Mock/Domain Pass/Practice consistent.

---

### P1 — Content coverage path (parallel, no UI required)

**Goal:** Drive generic-debrief rate down across 914 clean-bank questions.

| Source | Pattern | When to use |
|--------|---------|-------------|
| **Regen batches** | `scripts/claimQuestionBatch.mjs` + `BATCH_CLAIM_99.md` | Default expansion; log in `EXPLANATION_REGEN_PROGRESS.md` |
| **Gold batches** | `goldAnswerReviewsBatch*.js` → `goldAnswerReviews.js` index | High-traffic / flagged / exam-tip pairs |
| **Clean-bank rebuild** | `scripts/buildCleanBank.mjs` / `generateAnswerReview.mjs` | Only when promoting shelved → clean; not hand-editing JSON |
| **Flagged priority** | D1 `question_health_flags` + `flagged_questions_resolved.json` | Regen queue before regular batch |

**Quality bar:** `explanationPattern99.md` — all five regen fields; map through P0; `tierQuestion` ≥ B for ship.

**Coverage metric:** `getRegenStats()` + count of questions where `resolveIncorrectItem` returns non-template `whyWrongHere` for all distractors.

---

### P2 — Optional UI polish (screenshot chrome)

Do after P0 ships value; small diffs only.

1. **`McChoices.jsx`** — Reveal marks parity with `MultiChoices.jsx`:
   - `revealed && idx === correctIndex` → prefix `✓ `
   - `revealed && idx !== correctIndex` → prefix `✗ ` (not only when `idx === selected`)
   - Consider `accordionOnReveal={false}` default in Practice post-debrief, or show all choices without “Show N other options” collapse

2. **`AnswerReview.jsx`** — MC `OTHER OPTIONS`:
   - `defaultOpen={true}` on outer block, **or** remove wrapper and render `otherWrong` as sibling `ReviewBlock`s (flat, like multi extra-wrong)
   - Keep `showFamily={false}` on non-your-wrong distractors (noise control)

3. **Debrief footer** — extract `BookRefPanel` pattern from `ExplainTab.jsx`:
   - New tiny `DebriefObjectiveFooter.jsx` (or inline in `AnswerReview`): objective id/title + collapsible `BOOK_REF` excerpt
   - Props: `objectiveId` (already passed); link “Open Explain” optional via existing navigation helpers
   - Wire first in `QuizTab`; pass-through via `answerReviewSessionProps.js` for other sessions

---

## 6. Acceptance checklist

- [ ] P0: Question with regen entry but template clean-bank shows regen `whyWrongHere` / `whatItDoes` in Practice after submit
- [ ] P0: Gold still overrides regen for same `choiceIndex`
- [ ] P0: Question without regen/gold behaves as today (SADE fallback)
- [ ] P0: `npm test` includes merge-precedence cases; `npm run verify:ship` green
- [ ] P1: Regen cumulative tracked; batch claim prevents duplicate ranges
- [ ] P2 (if done): MC reveal shows ✓ on correct + ✗ on all wrongs
- [ ] P2 (if done): All distractor rationales visible without extra tap on miss
- [ ] P2 (if done): Debrief footer shows objective + BOOK_REF when `objectiveId` present
- [ ] No new 100+ line blocks in `App.jsx`; no theme token edits

---

## 7. Explicit non-goals

- New explanation engine or LLM-on-reveal for free tier
- Domain Pass hub / results redesign
- Lab Exam debrief (separate slice — do not couple)
- Rewriting all 914 `answerReview` blobs by hand in `ccnaCleanQuestions.js`
- Mock exam adaptive retake or new review-phase UX
- Changing shuffle/canonical-index contract (`McChoiceShuffleContext`)

---

## 8. File map (likely touch paths)

| Phase | Files |
|-------|-------|
| **P0** | `src/answerReviewLogic.js`, `src/features/explanationIntegration.js`, `src/__tests__/answerReviewLogic.test.js` |
| **P1** | `src/answerReview/regeneratedExplanations.json`, `scripts/claimQuestionBatch.mjs`, `src/answerReview/goldAnswerReviews*.js`, `ai-improvement-logs/EXPLANATION_REGEN_PROGRESS.md` |
| **P2** | `src/components/McChoices.jsx`, `src/components/AnswerReview.jsx`, `src/tabs/ExplainTab.jsx` (extract pattern), `src/components/DebriefObjectiveFooter.jsx` (new, small), `src/tabs/QuizTab.jsx`, `src/components/answerReviewSessionProps.js` |
| **Read-only** | `src/answerReview/answerReviewQuality.js`, `src/data/bookRefFull.js`, `QUESTION_DEBRIEF_99.md` |

---

## Path to 99+

| Dimension | This spec moves |
|-----------|-----------------|
| Exam traps & review | Full distractor teaching at scale once regen wired |
| Content depth | Regen pipeline → runtime without bank fork |
| Learning flow | Screenshot parity in existing Practice reveal |

**Still blocking 99+ after P0:** ~679 questions without regen; MC chrome + collapsed OTHER OPTIONS; no BOOK_REF footer.

**Top next moves:** (1) P0 merge in `answerReviewLogic.js`, (2) regen batch with `claimQuestionBatch.mjs`, (3) P2 `McChoices` ✓/✗ if screenshot feel still short.
