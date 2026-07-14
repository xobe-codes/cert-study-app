# Evening Batch Report — 2026-07-14

🚨 **Priority (Flagged):** 0 questions fixed — 0 pending

- Queried production D1 directly: `npx wrangler d1 execute ccna-sync --remote --command "SELECT question_id, objective_id, GROUP_CONCAT(DISTINCT reason) as reasons, SUM(count) as flag_count FROM question_health_flags GROUP BY question_id ORDER BY flag_count DESC"`
- Result: **0 rows returned** — no flagged questions in the production table.
- Ledger (`ai-improvement-logs/flagged_questions_resolved.json`) unchanged — still `{}`.

⚠️ **Scheduling collision detected and corrected**

This run started from the staging file's then-current state (66/914, next question `1.8-c-q3`) and generated a 33-question batch (`1.8-c-q3` through `1.12-c-q1`). Partway through, it became clear that a same-day **afternoon** run (`REGEN_REPORT_2026-07-13_AFTERNOON.md`, appended to `EXPLANATION_REGEN_PROGRESS.md`) had run concurrently and independently generated explanations for the **identical** 33-question range, also starting from the 66/914 state (both runs read the staging file before either had written back). Because both runs write to the same JSON keys, only one generation survived in `regeneratedExplanations.json` — this evening run's merge landed second, so its text is what's currently in the file for those 33 questions. The afternoon report's bookkeeping (99/914) was already correct in substance, just attributing the content to the wrong run's wording.

To avoid double-counting or losing real progress, this run did **not** log a second "+33" entry for that same range. Instead, it treated 99/914 as the accurate starting point and generated a **genuinely new** batch immediately following it.

✅ **Regular batch (net new): 33 questions (cumulative: 99 → 132/914)**

- Objectives covered: 1.12 (q2–q8, 7 Qs, completing objective 1.12), 2.1 (q1–q8, 8 Qs, complete), 2.2 (q1–q8, 8 Qs, complete), obj-2.3-source (q001–q010, 10 Qs)
- Question IDs: `1.12-c-q2` through `1.12-c-q8`, `2.1-c-q1` through `2.1-c-q8`, `2.2-c-q1` through `2.2-c-q8`, `obj-2.3-source-q001` through `obj-2.3-source-q010`
- Wrong-choice explanations generated: 95 (3 per multiple-choice question, 1 per true/false question — 31 MC + 2 T/F)
- Staging file: `src/answerReview/regeneratedExplanations.json` — merged cleanly with **no key collisions** against the file's state at merge time (132 total entries after merge)
- Programmatic validation before merge: for each question, confirmed the generated `choiceIndex` set exactly matches the wrong-answer indices from `ccnaCleanQuestions.js`, and confirmed all 5 required 99-spec fields are present and non-empty on every entry. All 95 explanations passed.

⚠️ **Failed:** None

🔧 **Manual review:** Recommend a human `git diff` pass on the `1.8-c-q3`–`1.12-c-q1` range specifically, since two independently-generated versions of that content existed briefly and only one survived — worth confirming the surviving version reads well (it passed the same automated validation as everything else, but wasn't cross-checked against the other run's wording).

⏱️ **Runtime/Tokens:** this session | generated in-session against `explanationPattern99.md`, no separate billed API call

## Notes for next run

- **Schema inconsistency found (pre-existing, not touched):** the original 2026-07-13-evening batch (`1.1-c-q1` through `1.5-c-q1`, 33 entries) stores each question as `{ "incorrect": [...] }` — a wrapped object — while every batch since (morning, afternoon, and both this run's merges) stores each question as a bare array `[...]`. Left as-is since fixing it wasn't in scope for this run and it may affect how consuming code reads the file; flagging for a future pass to confirm which shape the app's loader actually expects and normalize if needed.
- Next question in file order: **`2.4-c-q1`** (or the next objective after `obj-2.3-source-q010` in file order — confirm via the question bank before starting).
- **Scheduling note:** morning/afternoon/evening runs appear to be firing close enough together that two runs can read the staging file's "next batch" state before either has written back, causing duplicate work on the same question range. Consider having each run re-read the staging file's current entry count immediately before merging (not just at the start) to detect this, or serialize the three daily runs further apart.
- No auto-commit performed, per task instructions. Review with `git diff --stat src/answerReview/regeneratedExplanations.json` before committing.
