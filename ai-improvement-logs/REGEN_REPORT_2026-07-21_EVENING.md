# Regeneration Report — 2026-07-21 EVENING

## 🚨 Priority (Flagged): 0 fixed (0 pending)

Queried production D1 directly (`question_health_flags`, live): **7 flagged questions** found.

| Question ID | Objective | Reasons | Flag count |
|---|---|---|---|
| `obj-3.1-source-q002` | 3.1 | bad_display, typo, wrong_key | 6 |
| `obj-3.1-source-q004` | 3.1 | ambiguous, bad_display, wrong_key | 6 |
| `obj-3.1-source-q008` | 3.1 | bad_display, typo, wrong_key | 6 |
| `obj-3.1-source-q007` | 3.1 | bad_display, typo | 4 |
| `obj-2.8-source-q007` | 2.8 | wrong_key | 2 |
| `obj-3.1-source-q005` | 3.1 | bad_display | 2 |
| `obj-3.4-source-q041` | 3.4 | wrong_key | 2 |

Checked each against the local ledger (`flagged_questions_resolved.json`): all 7 are already
recorded with a `flagCountAtFix` matching (or exceeding) the current live D1 `flag_count`.
6 of the 7 (all but `obj-3.1-source-q005`, resolved earlier on 2026-07-15) were resolved
by a concurrent run only ~1 minute before this run started (`resolvedAt: 2026-07-22T00:28:42Z`
vs. this run's claim at `00:28:08Z`) — almost certainly the afternoon batch for today.
Spot-checked `regeneratedExplanations.json` and confirmed real `{"incorrect": [...]}` content
exists for all 6, not just a ledger stub. **No new complaints since those fixes — nothing
actionable this run.**

## ✅ Regular batch: 0 questions (cumulative: 914/914)

`claimQuestionBatch.mjs claim --run-id=evening-2026-07-20 --batch-size=33` returned
`claimedIds: []`. Per `EXPLANATION_REGEN_PROGRESS.md`, the entire regular pool was closed
out in the 2026-07-17 full-backlog pass (914/914 questions, 2,712/2,712 distractors,
validated). Nothing remains to claim. Step 3 (regular batch) skipped per spec.
`batch_claims.json` is `{}` — nothing was reserved by this run, so no release call needed.

## ⚠️ Failed: none

## 🔧 Manual review: none new this run

## ⏱️ Runtime

Runtime: ~2 minutes (D1 query + ledger/file cross-check only; no generation work needed).
Tokens: minimal — no explanation-authoring pass was run since nothing was actionable.
