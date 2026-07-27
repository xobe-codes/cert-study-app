# Explanation Regeneration Report — 2026-07-21 MORNING

## 🚨 Priority (Flagged): 0 pending

Queried production D1 (`question_health_flags`) directly. 7 flagged questions currently exist:

| Question ID | Reasons | Flag Count |
|---|---|---|
| `obj-3.1-source-q002` | bad_display, typo, wrong_key | 6 |
| `obj-3.1-source-q004` | ambiguous, bad_display, wrong_key | 6 |
| `obj-3.1-source-q008` | bad_display, typo, wrong_key | 6 |
| `obj-3.1-source-q007` | bad_display, typo | 4 |
| `obj-2.8-source-q007` | wrong_key | 2 |
| `obj-3.1-source-q005` | bad_display | 2 |
| `obj-3.4-source-q041` | wrong_key | 2 |

All 7 are already present in `flagged_questions_resolved.json` with `flagCountAtFix` matching the current live count — none actionable. Cross-referenced `ai-improvement-logs/REGEN_REPORT_2026-07-20_AFTERNOON.md` and `EXPLANATION_REGEN_PROGRESS.md`: the prior scheduled afternoon run already found this exact set of 7, fixed the 6 actionable ones (2 full rewrites, 4 re-verified/no rewrite needed), and correctly skipped `obj-3.1-source-q005` (no new complaints since its last fix). Also cross-checked `regeneratedExplanations.json` directly: substantive, non-placeholder explanation content exists for each (misconception/why-it-seems/why-wrong/memory-anchor fields all populated). No regeneration work needed or performed this run.

**Unrelated observation (not this run's doing, flagged for awareness):** the working tree also has a separate, large uncommitted "Weekend study QA — 6-domain audit" in progress (see `ai-improvement-logs/ACTIVE_HANDOFF.md`, marked **DONE**, status **uncommitted**) touching 30+ source-data and gold-review files across all domains. This is unrelated to the flagged-question fixes above (those were already resolved by the prior scheduled run) but means the repo currently has significant uncommitted work outside this regen pipeline. This run made zero writes to any file the QA session touched.

## ✅ Regular batch: 0 questions (cumulative: 914/914)

`node scripts/claimQuestionBatch.mjs claim --run-id=morning-2026-07-21 --batch-size=33` returned `claimedIds: []`. Confirmed why: `regeneratedExplanations.json` already contains all 914/914 entries (full backlog closeout completed 2026-07-17 per `EXPLANATION_REGEN_PROGRESS.md`). Regular-batch step correctly skipped per protocol (empty claim ⇒ nothing to release either).

## ⚠️ Failed: none

## 🔧 Manual review / caution for future runs

1. **Do not run `npm run compile:clean-questions`** — per `ACTIVE_HANDOFF.md`, it mass-excluded ~829 IDs when run during the in-progress QA session. Use `node scripts/compileCleanQuestionsModule.mjs` alone if a compile is ever needed, until `build:question-health` is investigated and fixed.
2. **Large uncommitted change set present** (30+ files: clean question bank domains 1–6, gold answer review batches, curated data, parametric families, domain packages). This run did not touch any of those files. Recommend the owning session commits/ships (`ACTIVE_HANDOFF.md` says "Say `c&d` to ship") before the next scheduled run, so future flagged-question/claim checks compare against a stable committed baseline instead of another session's live working state.

## ⏱️ Tokens, runtime

Lightweight verification-only run: 1 D1 query (1 retry after a transient 7403 auth error that resolved on retry), 1 batch-claim call, ledger/JSON diffing. No explanation generation performed — nothing was actionable.

---

## Re-verification pass (same scheduled slot fired a second time)

The `regenerate-questions-morning` scheduled task fired again for the same date. Re-ran all live checks fresh rather than assuming the first pass's findings still held:

- `node scripts/claimQuestionBatch.mjs claim --run-id=morning-2026-07-21 --batch-size=33` → `claimedIds: []` (pool unchanged, still complete). Nothing to release.
- D1 `question_health_flags` query → same 7 rows, identical `flag_count` values to the first pass. Cross-checked against `flagged_questions_resolved.json`: all 7 still have `flagCountAtFix` matching the live count exactly — no new complaints arrived between the two passes. Nothing actionable.
- Spot-verified `src/answerReview/regeneratedExplanations.json` entry count directly: **914/914**, unchanged.
- `ai-improvement-logs/batch_claims.json` is `{}` — no stray claims from either pass.

No writes made anywhere this pass. Flagging for whoever manages the scheduler: this task appears to have fired twice for 2026-07-21 (or once across a UTC date boundary) — worth checking the cron/schedule config if it recurs, since duplicate firings burn a wrangler D1 query and a claim-script call for no benefit when the pool is already fully closed out.
