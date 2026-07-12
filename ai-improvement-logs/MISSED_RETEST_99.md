# Missed Retest 99+ (unified spec)

One session runner, two framings — same pattern Mock Exam already uses for Exam sim / Bank burn / Study-by-domain.

## Loop

> Missed bank (100+, flat) → **Clear queue** (default, fast, no grade) → 30 left → **Prove it** unlocks → scored retest → pass → bank shrinks toward zero

## Mode toggle (lives on `MissedReview.jsx` header)

| Mode | Default when | Cap | Intro screen | End screen | Timer |
|------|--------------|-----|---------------|------------|-------|
| **Clear queue** | Always available | 10–15 (`MISSED_RETEST_CLEAR_CAP`, sibling to `REVIEW_SESSION_CAP`) | None — jumps straight to Q1, like `ReviewSession.jsx` | "Cleared 8 of 12 — 42 left, come back anytime." **Zero % shown.** | Never |
| **Prove it** | Unlocked once bank ≤ 30 (`MISSED_RETEST_PROVE_UNLOCK_MAX`) — earned milestone, not just a toggle | All deduped misses (or explicit batches if huge) | "N questions from things you've missed. Pass at 80%+." | pct + pass/fail badge using `DOMAIN_PASS_PASS_PCT` (80) | Optional toggle, off by default |

Both modes share one rule: **correct answer → removed from `missed` immediately.** Wrong → stays, no duplicate. This single rule is what makes "Clear queue" feel like progress and "Prove it" feel like proof — same mechanism, different framing.

## Data

| Concern | Answer |
|---|---|
| Dedup | By `questionId` (fallback `id`), before capping — a question missed 3x shows once, keeping the most recent occurrence |
| Ordering | Oldest-missed first (`addedAt` ascending), shuffled within same recency tier (`randomizeQuestionOrder`) |
| Trap filter | Respect `MissedReview`'s existing trap-pattern pills — "Retest" launches scoped to the active filter if one is set |
| Removal | `removeMissedByQuestionIds` — **already built** in `src/features/progress/useAppProgress.js`, already exposed via `useMasteryProgress()`, already proven in `QuizTab.jsx`. No new removal primitive needed. |
| Retake (Prove it only) | Only the still-wrong subset carries forward — reuse `mergeCarryoverSkipped` pattern from `buildDomainPassPool.js`, don't reinvent |
| Engagement | New `ENGAGEMENT_KINDS.MISSED_RETEST` (distinct from generic `REVIEW`, so Metrics can show "misses cleared" separately from Daily Review activity) |
| Storage | No new key — reuses `STORAGE_KEYS.missed`. Wrong-answer retries refresh the entry's stored `selectedIndex`, so "your last attempt" always reflects the most recent miss, not a stale one |

## Files

| File | Change |
|------|--------|
| `src/features/missed/missedRetestPool.js` | **New.** Pure functions: dedup, order, cap, trap-scope. Unit-testable in isolation (mirrors `bankBurnPool.js` shape) |
| `src/features/missed/MissedRetestSession.jsx` | **New.** Session runner, `mode: 'clear' \| 'prove'` prop. Reuses `McChoices`/`MultiChoices`/`OrderingQuestion`/`CliAnswerInput`/`AnswerReview`/`McChoiceShuffleProvider` — same stack `ReviewSession.jsx` already uses, not `MissedReview`'s static reveal cards |
| `src/features/missed/MissedReview.jsx` | Add "Clear queue" / "Prove it" buttons to header; "Prove it" disabled + tooltip until bank ≤ 30 |
| `src/features/practice/PracticeRoutes.jsx` | Nest session state the same way `StudyModeRoutes` nests `DomainPassSession` inside `DomainPassHub` |
| `src/features/progress/masteryEngagement.js` | Add one `ENGAGEMENT_KINDS.MISSED_RETEST` entry + label |

## Interface contract (`missedRetestPool.js`)

```js
export const MISSED_RETEST_CLEAR_CAP = 15
export const MISSED_RETEST_PROVE_UNLOCK_MAX = 30

/** Dedupe by questionId (fallback id), keeping the most recent occurrence. */
export function dedupeMissedByQuestionId(missed) {}

/**
 * Build an ordered, capped pool for a retest session.
 * - dedupes first
 * - optionally scopes to a single trap (trapFilter) via groupMissedByTrap
 * - orders oldest-missed-first (addedAt ascending), shuffled within same recency tier
 * - caps to `count` (null/undefined = no cap — used by 'prove' mode's "all")
 */
export function buildMissedRetestPool({ missed, mode, trapFilter, count, shuffle }) {}
```

`missed` entries always carry `addedAt` (via `buildMissedEntry` / `ReviewSession.jsx`'s manual onMissed calls) and `questionId` (with `id` fallback elsewhere in the codebase) — confirmed in `src/questionUtils.js`.

## 99+ acceptance bar

- [ ] Dedup verified: 3 misses of the same question → 1 in-session appearance
- [ ] "Clear queue" never shows more than the cap at once, regardless of bank size
- [ ] Zero pass/fail language anywhere in "Clear queue" mode (grep-able, not just eyeballed)
- [ ] "Prove it" locked until bank ≤ 30, unlock is visible/explained, not silent
- [ ] Correct answer → entry removed from `missed` bank (unit test: bank count decreases by exactly the correct-answer count, not more/less)
- [ ] Wrong answer → entry's `selectedIndex` refreshes to the latest attempt, no duplicate row
- [ ] `verify:ship` e2e: launch each mode from `MissedReview` → answer a few → confirm count decreases → confirm empty-state at zero
- [ ] Fully offline, curated-first, no live AI call in this flow

## Out of scope (this pass)

Theme tokens · hash routing in `App.jsx` · SRS due-schedule changes (`ReviewSession.jsx`/`srsReview.js` untouched — separate system) · Metrics dashboard chart for "misses cleared" (v1.1, not required for 99+ here)
