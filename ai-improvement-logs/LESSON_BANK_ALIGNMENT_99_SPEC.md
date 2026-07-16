# Lesson ↔ Question Bank Alignment — 99 Spec

**Status:** Implemented (P0–P2 landed) · **Intent:** audit + curated lesson depth + retention prose — not a new study product  
**Shipped:** `audit:lesson-bank` · `validate:lesson-prose` · `lessonAlignmentWave12Patches` (53/53 PASS)  
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

---

## 3. Target bar (99+)

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

### P0 — Measure (1 session)

1. Ship `audit:lesson-bank` + matrix/report  
2. Domain summary table in report (counts of PASS / FAIL by grade)  
3. Identify top 10 objectives by `MISSING_CKU` × exam weight  

**Done:** matrix committed; report readable; next 3 queue ids known.

### P1 — Close reverse-CKU gaps (batch by domain)

Per audit pass: **one objective** — add missing CKU anchors in reading/traps/flashcards until reverse coverage ≥95%.

**Done:** `audit:lesson-bank` PASS for that objective on CKU; `verify:ship` green.

### P2 — Beautify / retention prose

Same or follow-on pass: lift prose floors + draft-pattern zero; expand `validate:reading-explanation` (or sibling) to non-pilot.

**Done:** grade not `THIN_PROSE`; unified Study skims clean on phone.

### P3 — Sub-objective ledger + harden gate

1. Complete ledger for all 53 (blueprint letters ↔ CKU ↔ Q)  
2. Optional CI soft-fail: `npm run audit:lesson-bank` in `verify:ship` or nightly  
3. Mark remaining `OBJECTIVE_GAPS` with explicit patch owners  

**Done:** ≥50/53 PASS; gaps documented.

---

## 7. Acceptance tests

| Check | How |
|-------|-----|
| Audit runs | `npm run audit:lesson-bank` exits 0 and writes matrix |
| Reverse CKU | For sample objective with known miss, matrix lists that CKU; after patch, miss gone |
| Prose floors | Unit tests on `explanationFormat` / new validators for takeaway words + sentence caps |
| No theme/route drift | Diff excludes `appTheme.js` and App hash machine |
| Ship | `npm run verify:ship` after each objective fill |

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

**Top next moves after spec approval:**
1. Implement P0 `audit:lesson-bank`  
2. Fill highest-weight FAIL objective (likely Domain 1 or 3 from matrix)  
3. Expand prose validator off pilot-only  

---

## 11. Resume prompt (paste into implement chat)

> Implement **Lesson ↔ Question Bank Alignment 99** per `ai-improvement-logs/LESSON_BANK_ALIGNMENT_99_SPEC.md`. Start **P0 only**: `scripts/auditLessonBankAlignment.mjs` + `npm run audit:lesson-bank` writing `LESSON_BANK_ALIGNMENT_MATRIX.json` + `LESSON_BANK_ALIGNMENT_REPORT.md`. Reuse CKU join (`ckuIds`). Do not rewrite all lessons yet. No theme/App.jsx routing. Update `ACTIVE_HANDOFF.md`. Return HANDOFF when P0 done.
