# Lesson ↔ Question Bank Alignment Report

Generated: 2026-07-28T09:17:33.748Z
Spec: `ai-improvement-logs/LESSON_BANK_ALIGNMENT_99_SPEC.md` (P0 — measure only, no content rewritten)

## App rollup

| Grade | Count | % |
|---|---|---|
| PASS | 53 | 100% |
| THIN_PROSE | 0 | 0% |
| MISSING_CKU | 0 | 0% |
| BOTH | 0 | 0% |

**53/53** objectives fully pass (3.3 domain bar target: ≥50/53).

## Domain rollup

| Domain | Weight | PASS | THIN_PROSE | MISSING_CKU | BOTH | Objectives |
|---|---|---|---|---|---|---|
| Network Fundamentals | 20% | 12 | 0 | 0 | 0 | 12 |
| Network Access | 20% | 8 | 0 | 0 | 0 | 8 |
| IP Connectivity | 25% | 6 | 0 | 0 | 0 | 6 |
| IP Services | 10% | 10 | 0 | 0 | 0 | 10 |
| Security Fundamentals | 15% | 11 | 0 | 0 | 0 | 11 |
| Automation & Programmability | 10% | 6 | 0 | 0 | 0 | 6 |

## Top 10 objectives by MISSING_CKU × exam weight

_None — no objective has a reverse-CKU gap._

## THIN_PROSE / BOTH detail (prose floor misses)

_None._

## All FAIL objectives (grade != PASS)

_None — 53/53 PASS._

## Methodology

- **CKU reverse coverage** = supported bank CKUs / unique bank CKUs (pass ≥95%); objectives with no bank CKUs default to 100%.
- **Lesson support set** = `curated.ckus[].id` ∪ `reading.ckuIds` ∪ `examTraps[].ckuIds` ∪ `flashcards[].ckuId(s)` ∪ `commands[].ckuIds`.
- **Prose floors** (post-`getCurated`/`finalizeReading`): bigTakeaway 8–28 words · plain English (beginner tier) ≥40 words/≤5 sentences · how-it-works (intermediate or examReady) ≥50 words or ≥3 step-like sentences · exam cue = ≥1 trap or ≥2 commonMistakes or engineerView · remember-this = ≥3 keyPoints · draft hits via `isDraftKbTierText`.
- **Sub-objective ledger**: `curated.ckus[].sourceRefs[].chapter` matching `/^(\d+\.\d+)\.([a-z])$/i`; `missingLetters` = letters with CKUs tagged but zero bank questions covering them. Empty today — no curated CKU currently tags a blueprint sub-letter; ledger activates automatically once P3 sourceRefs are added.
- This is **P0 (measure only)** — no content was rewritten. See queue items `lesson-align-{id}` for P1/P2 follow-up.
