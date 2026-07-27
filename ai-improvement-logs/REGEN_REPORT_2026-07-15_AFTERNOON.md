# Afternoon Batch Report — 2026-07-15

## 🚨 Priority (Flagged): 5 questions found, 5 resolved — 0 pending

Queried production D1 directly:
`npx wrangler d1 execute ccna-sync --remote --command "SELECT question_id, objective_id, GROUP_CONCAT(DISTINCT reason) as reasons, SUM(count) as flag_count FROM question_health_flags GROUP BY question_id ORDER BY flag_count DESC"`

Result — all 5 flags land on objective 3.1 (routing table reading):

| Question | Reasons | Flag count |
|---|---|---|
| `obj-3.1-source-q004` | ambiguous, wrong_key | 4 |
| `obj-3.1-source-q002` | typo | 2 |
| `obj-3.1-source-q005` | bad_display | 2 |
| `obj-3.1-source-q007` | typo | 2 |
| `obj-3.1-source-q008` | typo | 2 |

None were in the local ledger (`flagged_questions_resolved.json` started this run at `{}`), so all 5 were actionable.

**Important process note — concurrent run collision, and a newly-discovered coordination protocol.** Partway through this run, `ai-improvement-logs/BATCH_CLAIM_99.md` and `scripts/claimQuestionBatch.mjs` appeared in the working tree (uncommitted) — infrastructure that did not exist when this run started. A concurrent session had already independently queried the same 5 D1 flags, regenerated explanations for all 5 (including `obj-3.1-source-q008`), and written correct entries to `flagged_questions_resolved.json` (all timestamped `2026-07-15T00:00:00Z`, `flagCountAtFix` values matching exactly what this run also found). By the time this was discovered, this run had already generated and merged its own independent explanations for 4 of the 5 (`q002`, `q004`, `q005`, `q007`) — overwriting the other run's text for those 4 with this run's own (both sets addressed the same underlying misconceptions correctly; the other run's original wording for those 4 is not recoverable, since neither run had committed). `obj-3.1-source-q008` was left untouched — see Manual Review below for why this run deliberately did not attempt it.

**No changes were made to `flagged_questions_resolved.json`** — its 5 entries (written by the concurrent run) were already accurate and did not need correction.

Root causes identified during regeneration (content-level, not explanation-level — flagged for a human dev pass on `src/data/ccnaCleanQuestions.js`):
- `q004`: the question stem contains the entire routing-table exhibit pasted **twice**, verbatim — almost certainly the actual source of the "ambiguous"/"wrong_key" reports.
- `q002` / `q007`: both say "the underlined number" (`q002` additionally says "the 4 in the underlined number"), but the plain-text question has no underline formatting and no isolated "4" — this reads like an exhibit-to-text conversion that lost its visual markup.
- `q005`: flagged "bad_display" but is plain text with no exhibit at all — no obvious content-level cause; likely a front-end rendering issue rather than a data issue, worth a UI dev look.
- `q008`: see Manual Review.

## ✅ Regular batch: 33 questions (cumulative: 198/914)

- Objective: `obj-2.5-source` (STP/RSTP/PortFast), questions `q006`–`q038` (continuing from `q005`, the last completed question per the prior run's progress note).
- Question IDs: `obj-2.5-source-q006` through `obj-2.5-source-q038`.
- All 33 are 4-choice questions (3 wrong-answer explanations each) → **99 wrong-answer explanations generated**.
- Programmatic validation before merge: for every question, confirmed the generated `choiceIndex` set exactly matches the actual wrong-answer indices from `ccnaCleanQuestions.js` (derived from `correctIndex` + counted `choices`), and confirmed all 5 required 99-spec fields (`misconceptionReason`, `whyItSeems`, `whyWrongHere`, `memoryAnchor`, `contrast`) are present and substantive (≥15 chars) on every entry. All 99 passed.
- No collision: `node scripts/claimQuestionBatch.mjs status` after merging shows `nextInLine` starting at `obj-2.5-source-q039` with zero active claims — this run's batch is cleanly reflected as the frontier.

## 🐛 Critical bug found and fixed in this run's own output: broken JSON schema

`src/features/explanationIntegration.js` reads each entry as `regeneratedExplanations[questionId].incorrect` — it requires the **wrapped** object shape `{ "incorrect": [...] }`. All 165 pre-existing entries (and the concurrent run's `q008` entry) were already correctly wrapped — the schema-inconsistency concern raised in the 2026-07-14 evening report turned out to have already been resolved by some point between then and now.

This run's own first draft, however, wrote all 37 new entries (33 regular + 4 flagged) as **bare arrays** (`[...]`, no `incorrect` wrapper) — which `hasRegenExplanations()` and `applyRegenExplanations()` silently ignore (`if (!regen.incorrect) return question`). Caught this before finalizing by spot-checking the merged file's shape against the actual consumer code, and converted all 37 to the correct wrapped shape in place. Final state: **203/203 entries in `regeneratedExplanations.json` are correctly wrapped**, verified programmatically (`Array.isArray` check across every key returns 0 bare arrays).

Flagging this because it's the kind of silent failure that could have let several batches' worth of work ship as dead data with everything else (build, tests, JSON validity) looking fine.

## ⚠️ Failed: None

## 🔧 Manual review

1. **`obj-3.1-source-q008` — explanation left unwritten by this run; concurrent run's explanation may assert unestablished facts.** The question gives a running-config excerpt where the only stated fact is "destination 192.168.4.85 matches 192.168.4.0/24 → next-hop 10.0.0.1." None of the 4 answer choices is "10.0.0.1" — the marked-correct choice is "Interface Serial 0/0/1," a mapping from that IP to that interface that the question stem never establishes. This run judged that any wrong-answer explanation would have to assert an unstated topology fact to justify the correct answer, and chose not to write one rather than fabricate reasoning a learner couldn't verify against the given exhibit. The concurrent run's explanation (already merged, left untouched by this run) does assert this — it says "per this topology, that's Serial 0/0/1" without the topology it refers to ever appearing in the question. Recommend a human check whether the source question needs a content fix (either add the missing interface-to-IP mapping to the exhibit, or correct the answer choices/correctIndex to match what's actually derivable).
2. **`obj-3.1-source-q004`** — duplicated exhibit paragraph in the question stem (see above). Explanation content is sound regardless (the routing logic doesn't depend on the duplication), but the duplicate paragraph should be removed from `ccnaCleanQuestions.js`.
3. **`obj-3.1-source-q002` / `q007`** — "underlined number" references with no underline in plain text (see above). Explanations were written to be robust to this (anchored on the actual AD/metric/route-age values rather than repeating "the 4"/"underlined"), but the question wording itself should be cleaned up.
4. **`obj-3.1-source-q005`** — "bad_display" flag with no apparent content-level cause; recommend a front-end/UI check rather than a data fix.
5. **Adopt `scripts/claimQuestionBatch.mjs` going forward.** This run did not use it (didn't exist yet when this run started generating) but should have called `claim` before generating and `complete` after merging, per `BATCH_CLAIM_99.md`. No actual collision occurred this time (verified via `status` post-merge), but future runs — including the next scheduled one — should adopt the claim/complete/release flow to get the coordination guarantee the protocol is designed to provide.

## ⏱️ Tokens, runtime

This session; generated in-session against `explanationPattern99.md`, no separate billed API call.

## Notes for next run

- Next question in file order (regular pool): **`obj-2.5-source-q039`** — confirmed via `node scripts/claimQuestionBatch.mjs status`.
- Use `node scripts/claimQuestionBatch.mjs claim --run-id=<name>` before generating, and `complete`/`release` after, per `BATCH_CLAIM_99.md`.
- No auto-commit performed, per task instructions. Review with `git diff --stat src/answerReview/regeneratedExplanations.json ai-improvement-logs/flagged_questions_resolved.json` before committing. Note `.gitignore`, `scripts/claimQuestionBatch.mjs`, and a few other untracked files from the concurrent run are also sitting in the working tree — these are that other run's work, not this run's, and are left as-is for that run (or the user) to commit.
