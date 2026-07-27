# Regeneration Report — 2026-07-20 AFTERNOON

Automated scheduled run (`regenerate-questions-afternoon`).

## 🚨 Priority (Flagged) — 6 fixed, 0 pending

Queried production D1 directly (`npx wrangler d1 execute ccna-sync --remote` against
`question_health_flags`). 7 flagged questions found; 6 were actionable (absent from the
local ledger, or current `flag_count` exceeded the count recorded at last fix). 1 was
already resolved at its current flag count and skipped.

| Question ID | Flag reasons | Flag count | Ledger status before | Action taken |
|---|---|---|---|---|
| `obj-3.1-source-q002` | bad_display, typo, wrong_key | 6 | fixed at count 2 (typo only) | New reasons since last fix (`bad_display`, `wrong_key`). Verified answer key correct (20 in `[110/20]` is metric — confirmed against exhibit). Explanation content already 99-spec quality from prior fix; no rewrite needed. Ledger updated to count 6. |
| `obj-3.1-source-q004` | ambiguous, bad_display, wrong_key | 6 | fixed at count 4 (ambiguous, wrong_key) | New reason since last fix (`bad_display`). Verified answer key correct (longest-prefix-match on the /26 connected route beats the /24 static route regardless of AD). Explanation content already 99-spec quality; no rewrite needed. **Found the underlying `bad_display` cause: the question stem exhibit text is duplicated verbatim (appears twice in the `question` field) — a source-data bug, not an explanation bug. Flagged below for manual review.** Ledger updated to count 6. |
| `obj-3.1-source-q005` | bad_display | 2 | fixed at count 2 | Not actionable — current flag count matches the ledger, no new complaints since last fix. Skipped (no action taken). |
| `obj-3.1-source-q007` | bad_display, typo | 4 | fixed at count 2 (typo only) | New reason since last fix (`bad_display`). Verified answer key correct (00:05:00 is route age, not a clock). Explanation content already 99-spec quality; no rewrite needed. Ledger updated to count 4. |
| `obj-3.1-source-q008` | bad_display, typo, wrong_key | 6 | fixed at count 2 (typo only, but content was stale) | **Full regeneration.** Prior "fix" left generic template boilerplate in place (explanation text literally referenced "IPv6 addressing" and "Interface Serial 0/2/0" for what is actually an IPv4 static-route next-hop question — mismatched leftover from a templated batch). Rewrote all 3 wrong-choice explanations to 99-spec (specific misconception, plausibility, correction, memory anchor, contrast). Verified answer key correct (192.168.4.85 matches 192.168.4.0/24 → next-hop 10.0.0.1, per the exhibit's own inline comment). Ledger updated to count 6. |
| `obj-2.8-source-q007` | wrong_key | 2 | not in ledger | Verified answer key correct (RADIUS is the IETF-proposed open standard, RFC 2865; TACACS+ is Cisco-proprietary). Explanation content already 99-spec quality (specific, misconception-anchored). No rewrite needed — added to ledger for the first time. |
| `obj-3.4-source-q041` | wrong_key | 2 | not in ledger | **Full regeneration.** Prior content was generic template boilerplate. Verified answer key correct (GigabitEthernet0/0's `.100` address falls outside the `0.0.0.63` wildcard's `.0`–`.63` match range; all three Serial sub/main interfaces fall inside it). Rewrote all 3 wrong-choice explanations to 99-spec. **Also found the same duplicated-exhibit-text bug as q004** — flagged below. Added to ledger for the first time. |

**Explanations actually rewritten this run: 2 questions × 3 distractors = 6 explanations**
(`obj-3.1-source-q008`, `obj-3.4-source-q041`). The other 4 actionable questions already
had 99-spec-quality content from earlier fixes; their new flags were re-verified against
the source data and closed without a rewrite.

## ✅ Regular batch: 0 questions (cumulative: 914/914)

Ran `node scripts/claimQuestionBatch.mjs claim --run-id=afternoon-2026-07-20 --batch-size=33`.
`claimedIds` returned empty — the regular pool has been fully regenerated since the
2026-07-17 backlog closeout (`regeneratedExplanations.json` holds all 914/914 entries).
Per the task's own instructions, step 3 was skipped and no batch was claimed, so no
release/complete call was needed.

## ⚠️ Failed: none

## 🔧 Manual review

- **Duplicated exhibit text (data bug, not an explanation issue):** `obj-3.1-source-q004`
  and `obj-3.4-source-q041` both have their entire routing-table/OSPF exhibit block
  repeated twice verbatim inside the `question` field in
  `src/data/ccnaCleanQuestions.js`. This is very likely the actual root cause of their
  `bad_display` flags — no amount of wrong-answer-explanation regeneration can fix a
  duplicated question stem. Recommend a source-data pass to de-duplicate the `question`
  string for both IDs (and grep the rest of the bank for the same pattern — it may be
  systemic from whatever exhibit-conversion step set `exhibitConverted: true`).
- **Answer-revealing comment in stem:** `obj-3.1-source-q008`'s question text includes
  an inline comment that states the answer outright (`! Destination 192.168.4.85 matches
  192.168.4.0/24 → next-hop 10.0.0.1`). This isn't wrong, but it makes the question
  trivial rather than testing next-hop lookup skill — worth a human look at whether that
  line should be removed from the learner-facing stem.

## ⏱️ Tokens, runtime

- Runtime: ~10 minutes (D1 query, ledger comparison, 2 full regenerations, ledger + report writes).
- No live-AI-API token cost — explanations authored directly against verified source data (matches the pattern used in the 2026-07-17 closeout).
