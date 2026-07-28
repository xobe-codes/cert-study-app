# Lesson ↔ Question Bank Alignment — 99 Spec

**Status:** IMPLEMENTED · 53/53 alignment and readability gate passing

**Sequencing gate:** Start only after `WRONG_ANSWER_DEBRIEF_99_SPEC.md` reaches its definition of done and produces the final implementation report.

**Previously shipped:** `audit:lesson-bank` · `validate:lesson-prose` · `lessonAlignmentWave12Patches` (historical 53/53 PASS; do not treat as current until re-audited)
**North star:** Every Practice question is teachable from the same objective’s Study lesson (CKU-grounded), and every lesson reads like a retention spine — not a draft dump.  
**Related:** `explanationFormat.js` · `unifiedLessonDoc.js` · `readingEnrichment.js` · `quizCoverage.js` · `WRONG_ANSWER_DEBRIEF_99_SPEC.md` · `CCNA_OBJECTIVE_COVERAGE_MATRIX.md`

---

## 1. Problem

Coverage Tier A says “has reading + traps + questions.” That is **inventory**, not **alignment**.

| What we measure today | What 99+ needs |
|-----------------------|----------------|
| Objective has ≥8 questions | Every **tested concept** appears in Study (hook → how → remember → don’t confuse) |
| Objective has reading flag | Reading is **substantial, scannable, retainable** — not factory/OneNote draft |
| CKU % with ≥1 question (`computeCkuCoverage`) | Reverse: every **question CKU** has lesson support + trap/flashcard where exam-relevant |
| Sub-objectives in comments/`sourceRefs` only | Auditable **blueprint sub-part** coverage (3.2.a / b / c …) without new route IDs |

Learners fail when Practice asks something Study never taught clearly — or when Study is dense walls of text they cannot hold.

---

## 2. Current state (reuse table)

| Layer | What exists | Gap |
|-------|-------------|-----|
| **Domains / objectives** | `ccnaDomains.js` — 6 domains, 53 objectives | No first-class sub-objective IDs |
| **Clean bank** | `data/clean-question-bank/domain-{N}/{D.N}.json` (~914) | Link is `ckuIds[]`, not lesson paragraphs |
| **Runtime questions** | clean adapter + enrichment waves (~1.6k) | Mixed quality; thin objectives lean on patches |
| **Curated lessons** | `ccnaCurated.js` + supplements + `applyContentEnrichment` | Flagship (e.g. 3.2) deep; many still thin/factory |
| **Unified Study UI** | `buildUnifiedLesson` → `CuratedUnifiedReading` | Weak tiers → weak hook/how/remember |
| **Prose rules** | `explanationFormat.js` (takeaway ≤28 words, ≤5 sentences/tier, no CLI in tiers) | Pilot-gated; not enforced for all 53 |
| **Draft detection** | `readingEnrichment.js` (`Know the core behavior:`, etc.) | Expands shells; doesn’t guarantee pedagogy |
| **Coverage audit** | `audit:coverage` → Tier A for all 53 | Counts artifacts; **does not** map Q→lesson |
| **CKU coverage** | `quizCoverage.js` (practice bias) | One-way (lesson CKU → has Q); reverse audit missing |
| **Voice / regen** | `voice:pipeline`, answer-review regen | Question debrief ≠ lesson prose beautify |
| **Weak OneNote set** | `OBJECTIVE_GAPS` in `onenoteTopicMap.mjs` | 1.10, 3.6, 4.10, 5.2–5.4, 5.7, 5.9–5.11, 6.6 |

**Join key (do not reinvent):** `question.ckuIds[]` ↔ `curated.ckus[]` / reading `ckuIds` / trap `ckuIds`.

**Baseline caution:** the historical report says 53/53 PASS while the generated
implementation queue still contains many `lesson-align-*` pending rows. Both may be
stale relative to repaired questions. The first follow-on action is to rerun the
audit and regenerate the lesson queue from one commit; do not merge the two old
snapshots manually.

---

## 3. Target bar (99+)

### 3.0 Lesson workflow contract

For every tested concept, the learner must be able to:

1. enter Study at an appropriate starting point;
2. understand the prerequisite idea before advanced detail;
3. see a worked example or exhibit matching the question's representation;
4. learn the deciding rule and common confusion before Practice tests it;
5. move from lesson to a relevant practice set;
6. return from wrong-answer feedback to the exact lesson anchor—not merely the top
   of the objective;
7. resume the interrupted practice/retest after remediation without losing state;
8. have lesson completion/progress recorded only for content actually viewed;
9. report lesson content that is wrong, unclear, outdated, or badly formatted;
10. receive updated lesson content without losing study progress or notes/state.

### 3.0A Exact sub-objective contract

Objective-level or loosely related CKU coverage is not enough. Every active
question must resolve to:

```text
question ID
-> official objective (for example 3.2)
-> exact blueprint sub-objective(s) (for example 3.2.a)
-> tested CKU/concept and deciding rule
-> stable lesson section anchor
-> worked example/exhibit and common-confusion contrast when applicable
```

Rules:

- create one authoritative sub-objective map from the current CCNA blueprint and
  existing project references; do not infer letters from file order or comments;
- add explicit `blueprintRefs`/equivalent metadata at the authoritative question
  source when a reliable mapping does not already exist;
- allow multiple sub-objectives only when the question genuinely integrates them;
- questions without a defensible mapping are `UNMAPPED` and cannot count toward a
  lesson PASS or enter high-stakes Domain Pass/Mock pools until reviewed;
- every official sub-objective has at least one lesson section, even when it has no
  current question; label intentional no-question coverage rather than hiding it;
- each assigned question's deciding rule must be findable in the mapped lesson
  section—not merely somewhere else in the objective;
- distractor families used by assigned questions appear as concise “don’t confuse”
  contrasts in that section;
- changing a question's sub-objective, CKU, key, or deciding rule invalidates the
  affected lesson alignment result.

### 3.0B Readability and information architecture contract

Every sub-objective section follows a predictable, scannable teaching spine:

1. **What you need to know** — one plain-language outcome.
2. **Core idea** — short explanation with cause/effect, not a definition dump.
3. **See it** — one representative diagram, command/output, table, or worked example
   when the concept is visual/procedural.
4. **How to decide** — the rule the assigned questions require.
5. **Don't confuse** — the specific neighboring concepts used as distractors.
6. **Verify / use it** — relevant IOS command, symptom check, or implementation cue.
7. **Quick check** — a short retrieval prompt before entering Practice.

Presentation rules:

- one idea per paragraph; short headings and lists instead of wall text;
- definitions, examples, commands, outputs, warnings, and memory cues use distinct
  existing components/styles consistently;
- preserve monospace indentation for CLI, routing tables, JSON/YAML/XML, and configs;
- use tables only for true comparisons; stack them accessibly on narrow screens;
- no duplicated explanation across adjacent tiers/sections;
- progressive disclosure may hide reference depth, never the deciding rule;
- terminology, interface names, values, and exhibits match assigned questions;
- lesson anchors and headings remain stable when prose is edited;
- mobile 320px, 200% zoom, keyboard, screen-reader, light/dark, and reduced-motion
  behavior meet the Question V2 UI/UX bar.

### 3.1 Alignment bar (per objective)

For each objective `D.N`:

1. **CKU reverse coverage ≥ 95%**  
   Every clean-bank question’s `ckuIds` (or derived `concept`→CKU) appears in that objective’s curated `ckus[]` **and** is referenced by at least one of: reading tiers / `keyPoints` / `commonMistakes` / `examTraps` / flashcard.

2. **Concept teach-before-test**  
   For each distinct tested concept (CKU or normalized `concept` string): Study has a **plain-English** sentence + **exam cue** (trap or “don’t confuse”) when the bank has ≥2 questions on it.

3. **Sub-objective ledger** (blueprint parts)  
   Maintain a per-objective map of blueprint letters (`a`/`b`/`c`…) → CKUs → question ids → lesson anchors. Missing letter with bank questions = **fail**.

4. **Thin-bank exception**  
   Objectives with &lt;8 clean questions must still meet reverse CKU coverage; depth may come from enrichment Qs, but Study must cover those CKUs too.

### 3.2 Retention prose bar (per objective reading)

Unified lesson sections must clear these floors (source = tiers + keyPoints + commonMistakes after `finalizeReading`):

| Section | Floor | Style |
|---------|-------|--------|
| **Hook / bigTakeaway** | 8–28 words | One memorable claim; no lists |
| **Plain English** | ≥40 words, ≤5 sentences | Conversational; no CLI backticks |
| **How it works** | ≥50 words or ≥3 concrete steps | Cause → effect; one example |
| **Exam / engineer** | ≥1 verify cue or trap | “On the exam…” or symptom→check |
| **Remember this** | ≥3 bullets, each ≤18 words | Scannable; no nested clauses |
| **Don’t confuse** | ≥2 items when bank has distractor families | Contrast pairs only |
| **Forbidden** | Draft templates, wall paragraphs &gt;6 sentences, tier clone of commonMistakes, CLI dumps in prose | Match `explanationFormat` |

**Beautify = structure + voice, not fluff:** shorter lines, contrast pairs, bold sparingly on exam anchors only (existing theme/CSS — no `appTheme.js` edits).

### 3.3 Domain rollup

| Domain | Pass when |
|--------|-----------|
| Each of 1–6 | All objectives in domain meet 3.1 + 3.2 **or** logged `EXCEPTION` with owner + due |
| App | ≥50/53 objectives full pass; remaining ≤3 are documented `OBJECTIVE_GAPS` with patch plan |

---

## 4. Deliverables

### A. Alignment audit (new)

**Script:** `scripts/auditLessonBankAlignment.mjs`  
**npm:** `audit:lesson-bank` (alias under `audit:help`)

**Inputs:** clean bank JSON + enrichment question ids (optional flag) + `getCurated`-equivalent fields (or compile-time curated export).

**Outputs:**
- `ai-improvement-logs/LESSON_BANK_ALIGNMENT_MATRIX.json` — per objective:
  - questionCount, ckuIdsInBank, ckuIdsInLesson, **missingCkus[]**, orphanQuestions[]
  - subObjectiveLedger (from `sourceRefs.chapter` / curated comments)
  - proseScores (word/sentence floors, draftPattern hits)
  - grade: `PASS` | `THIN_PROSE` | `MISSING_CKU` | `BOTH`
- `ai-improvement-logs/LESSON_BANK_ALIGNMENT_REPORT.md` — human rollup by domain

**Does not** rewrite content; inventory only.

### B. Gap queue

Feed FAIL rows into `IMPLEMENTATION_QUEUE.json` as `lesson-align-{objectiveId}` items (one objective per audit pass), priority by exam weight × miss count.

### C. Lesson fill pattern (implementation — later chats)

**Prefer patches, not giant `ccnaCurated.js` rewrites:**

| Gap type | Fix via |
|----------|---------|
| Missing CKU / thin how-it-works | `contentDepthWaveNPatches.js` or focused `explanationPilotPatches` / reading supplement |
| Missing trap / don’t-confuse for tested distractor | `factoryTrapPatches` / trap wave |
| Missing flashcard for high-frequency CKU | `factoryFlashcardPatches` |
| Draft OneNote prose | Hand rewrite in supplement **or** sanitize + authored tier override (guarded merge) |
| Sub-objective uncovered | Add CKU + reading bullet + ≥1 question tag (or shelve orphan Q) |

**Flagship reference:** objective `3.2` in `ccnaCurated.js`.

### D. Beautify pass (same objective batch)

For each objective in the queue item:

1. Rewrite thin tiers to pass 3.2 floors  
2. Rebuild unified spine mentally: hook → plain → how → exam → remember → don’t confuse  
3. Run `validate:reading-explanation` with **pilot expanded** to that objective (or new `validate:lesson-prose` using shared helpers from `explanationFormat.js`)  
4. Spot-check Study UI (mobile 390×844): scannable bullets, no wall of text  

---

## 5. Minimal scope

### In

- Alignment audit script + matrix/report  
- Extend prose validation beyond pilot IDs  
- Per-objective lesson patches (depth, traps, flashcards, takeaway) driven by matrix  
- Sub-objective ledger derived from existing `sourceRefs` / comments (no new app routes)  
- Queue + `audit:mark-done` workflow  

### Out

- New Study UI product / theme tokens / `App.jsx` routing  
- Live AI lesson generation on page load  
- Mass rewrite of all clean-bank stems  
- First-class `3.2.a` objective screens (ledger only)  
- Replacing answer-review regen (separate 99 spec)  
- Restoring Packet Tracer  

---

## 6. Phased plan

### P-1 — Post-question handoff and fresh baseline

1. Read `QUESTION_LOGIC_WRONG_ANSWER_IMPLEMENTATION_REPORT.md` and pin its commit.
2. Rebuild the runtime question inventory without changing content.
3. Rerun `audit:lesson-bank` and `validate:lesson-prose` from the same commit.
4. Compare the fresh matrix with the historical matrix/report and explain drift.
5. Replace/regenerate stale `lesson-align-*` queue rows from the fresh matrix.
6. Prioritize by P0/P1 question fixes, exam weight, learner flags/misses, and missing
   exact remediation anchors.
7. Build/verify the authoritative official sub-objective list before assigning
   question or lesson mappings; report `UNMAPPED`, `UNTAUGHT`, and `UNTESTED` rows
   separately.

**Done:** one reproducible matrix/report/queue agrees on the same question corpus;
the first domain/objective batch is named.

### P0 — Measure (1 session)

1. Ship `audit:lesson-bank` + matrix/report  
2. Domain summary table in report (counts of PASS / FAIL by grade)  
3. Identify top 10 objectives by `MISSING_CKU` × exam weight  

**Done:** matrix committed; report readable; next 3 queue ids known.

### P1 — Close reverse-CKU gaps (batch by domain)

Per audit pass: **one objective** — add missing CKU anchors in reading/traps/flashcards until reverse coverage ≥95%.

**Done:** `audit:lesson-bank` PASS for that objective on CKU; `verify:ship` green.

P1 completion additionally requires exact sub-objective coverage: objective-level
CKU overlap cannot mask an assigned question whose deciding rule is missing from its
mapped section.

### P2 — Beautify / retention prose

Same or follow-on pass: lift prose floors + draft-pattern zero; expand `validate:reading-explanation` (or sibling) to non-pilot.

**Done:** grade not `THIN_PROSE`; unified Study skims clean on phone.

Beautify by sub-objective section using the 3.0B teaching spine. Do not preserve a
confusing structure merely because it satisfies word-count floors; readability and
question alignment outrank raw prose length.

### P3 — Sub-objective ledger + harden gate

1. Complete ledger for all 53 (blueprint letters ↔ CKU ↔ Q)  
2. Optional CI soft-fail: `npm run audit:lesson-bank` in `verify:ship` or nightly  
3. Mark remaining `OBJECTIVE_GAPS` with explicit patch owners  

**Done:** ≥50/53 PASS; gaps documented.

### P4 — Study workflow and exact remediation

1. Give lesson sections stable semantic anchors tied to CKUs/concepts.
2. Make wrong-answer “Review this” actions open the exact relevant anchor.
3. Preserve a return token so Back/Resume returns to the same question or missed
   retest state without re-scoring or duplicating attempts.
4. Verify teach-first sequencing and prerequisite links for multi-step concepts.
5. Align lesson examples/exhibits with the normalized question display contract.
6. Verify progress tracking, resume, offline/cache refresh, mobile, keyboard,
   screen-reader, and 200% text-zoom behavior.
7. Feed lesson flags into a review queue using the same safe lifecycle principles
   as question health; do not automatically rewrite factual lesson content.

**Done:** the end-to-end Study → Practice → miss → exact lesson anchor → return →
retest loop passes for representative questions in all six domains.

### P5 — Lesson automation and recurrence prevention

After the manual/domain batches establish the pattern:

- question CKU/concept/key changes automatically mark affected lesson objectives
  for re-audit;
- lesson audit proposes missing anchors, examples, traps, or prose fixes with source
  paths and tests;
- deterministic formatting/link defects may be auto-patched in reviewable batches;
- factual teaching changes remain human-reviewed;
- one domain/small objective cap, validators, build, and no auto-push/deploy match
  the Question V2 automation safety rules.

---

## 7. Acceptance tests

| Check | How |
|-------|-----|
| Audit runs | `npm run audit:lesson-bank` exits 0 and writes matrix |
| Reverse CKU | For sample objective with known miss, matrix lists that CKU; after patch, miss gone |
| Sub-objective mapping | Every active question maps to official sub-objective(s) and one stable lesson anchor; `UNMAPPED` is zero or quarantined |
| Deciding-rule alignment | Assigned question key/rationale is explicitly taught in its mapped section |
| Distractor alignment | Assigned distractor families appear in that section's concise “Don't confuse” content |
| Prose floors | Unit tests on `explanationFormat` / new validators for takeaway words + sentence caps |
| Readability spine | Every sampled sub-objective renders outcome → core idea → example → deciding rule → contrast → verify → quick check without duplicated walls |
| No theme/route drift | Diff excludes `appTheme.js` and App hash machine |
| Ship | `npm run verify:ship` after each objective fill |
| Fresh baseline | Matrix, report, and queue reference the same post-Question-V2 commit and corpus counts |
| Exact remediation | Wrong-answer CTA opens the CKU/concept lesson anchor and return restores the same retest state |
| Teach before test | Each sampled deciding rule and distractor family appears in Study before its Practice item |
| Lesson progress | Remediation visit/resume neither loses progress nor falsely completes unread sections |
| Lesson UX | Six-domain mobile/keyboard/screen-reader/zoom sample passes without walls, clipping, or broken exhibits |
| Recurrence | A changed question CKU marks the owning lesson objective for re-audit |

---

## 8. Worked example (how an agent should think)

**Objective 3.2** bank tests longest-prefix, AD, metric.

1. Matrix groups Qs by `ckuIds` / `sourceRefs.chapter` → `3.2.a|b|c`  
2. Lesson must teach each letter before Practice hammers it  
3. Prose: short takeaway (“Longest match wins before AD”) + don’t-confuse (AD vs metric) + trap  
4. Beautify: 3 remember bullets, not a paragraph of routing theory  

Thin objective example: **5.9** (few clean Qs) — still require Study to cover every tagged CKU; do not “pass” on Tier A inventory alone.

---

## 9. Commands (when implementing)

```bash
npm run audit:lesson-bank          # new — matrix + report
npm run audit:coverage             # existing inventory
npm run validate:reading-explanation
npm run verify:ship
npm run audit:mark-done -- lesson-align-X.Y "CKU+prose pass"
```

---

## 10. Path to 99+

| This spec moves | Still blocks 99+ |
|-----------------|------------------|
| Content depth: Study teaches what Practice asks | ~679 Qs without rich regen debrief (separate) |
| Learning flow: Study→Practice coherence | Lab Exam Full/Domain modes |
| Exam traps tied to tested misconceptions | Sub-objective UI (optional; ledger is enough) |
| Maintainability: audit gate + patches | Patch-file sprawl — prefer fewer depth waves |

**Top next moves after Question V2 completion:**
1. Run P-1 and publish one fresh matrix/report/queue from the repaired corpus.
2. Fix the highest-impact domain/objective batch from that fresh queue.
3. Implement exact lesson-anchor remediation and return-to-retest for the repaired sample.

---

## 11. Required next phase — Full-App Scope Audit

After this lesson phase reaches its acceptance gates, continue with
`FULL_APP_SCOPE_AUDIT_99_SPEC.md`. The audit consumes the repaired question, tracking
foundation, lesson, and sub-objective contracts, then confirms the smallest path for
Domain Pass, labs, Metrics Stage B, and every remaining app workflow.

Tracking clarification: Metrics Stage A already begins during Question V2 and
supplies canonical IDs/events. This lesson phase adds stable lesson anchors and
remediation semantics to that contract; final lesson rollups remain Stage B.

The lesson implementation report must hand off:

- final objective/sub-objective/CKU/lesson-anchor map;
- final active/quarantined question IDs and lesson content versions;
- exact remediation and return-flow event points;
- lesson start/view/complete semantics;
- unresolved mapping exceptions that metrics must exclude or label.
- final canonical question-to-domain ownership and Domain Pass eligibility.

---

## 11. Resume prompt (paste into implement chat)

> Continue with **Lesson Logic & Study Workflow** per `ai-improvement-logs/LESSON_BANK_ALIGNMENT_99_SPEC.md` only after Question V2 is complete. Start with **P-1 only**: pin the Question V2 implementation commit/report, rerun the existing lesson audit/prose validation, and publish one fresh matrix/report/queue from the same repaired corpus. Reuse the CKU join. Do not rewrite lessons or trust the historical 53/53 snapshot until the new baseline is reconciled. No theme/App.jsx routing. Update `ACTIVE_HANDOFF.md`. Return HANDOFF when P-1 is complete.
