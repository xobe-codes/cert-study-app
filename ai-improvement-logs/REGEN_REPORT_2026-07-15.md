# Batch Report — 2026-07-15 (this run)

⚠️ **Heads-up: at least three other runs executed this same scheduled task concurrently today** (see `REGEN_REPORT_2026-07-15_AFTERNOON.md` and `REGEN_REPORT_2026-07-15_EVENING.md`, plus at least one earlier unlabeled run whose flagged-question work this run observed already in the staging file before drafting anything). This report describes what *this run* actually contributed and verified, plus the final observed state of the staging file after all concurrent writes — which does not equal the sum of any single report's claimed numbers, because later runs edited/removed some earlier runs' entries (see below).

🚨 **Priority (Flagged): 0 fixed by this run**

- Queried production D1 directly (`question_health_flags`) — 5 flagged questions in objective 3.1 (`q002` typo, `q004` ambiguous+wrong_key, `q005` bad_display, `q007` typo, `q008` typo).
- Before this run finished drafting its own explanations for these 5, the staging file already contained 99-spec-quality entries for all 5 (written by an earlier concurrent run). This run did not duplicate that work.
- **Final observed state as of this report: only 4 of the 5 are present** (`q002`, `q004`, `q005`, `q007`). `obj-3.1-source-q008` is **not** in the staging file — a later concurrent run (see `REGEN_REPORT_2026-07-15_AFTERNOON.md`'s progress-log note) appears to have deliberately removed/withheld it, judging that the question's exhibit doesn't contain enough information to faithfully justify the labeled correct answer ("Interface Serial 0/0/1" isn't derivable from the shown next-hop IP `10.0.0.1` alone). This run agrees with that judgment call — see the identical concern independently raised below.
- **Content bugs in these questions, confirmed independently by this run and consistent with what other concurrent runs also found** (not auto-fixed — out of scope, requires changing question stems/choices/answer keys, not just explanations):
  - `obj-3.1-source-q004`: question stem contains the entire "Routing table excerpt" exhibit duplicated twice verbatim.
  - `obj-3.1-source-q002`: stem asks "What does the **4** in the underlined number represent?" but the exhibit only contains `[110/20]` — no "4" appears anywhere.
  - `obj-3.1-source-q005`: all choices use route code `S` (static) for a directly-connected-interface scenario, which should be `C` (connected) in real IOS output.
  - `obj-3.1-source-q008`: the exhibit doesn't contain enough information to derive the labeled correct answer ("Interface Serial 0/0/1") from the shown next-hop IP alone — likely lost topology data from an exhibit-to-text conversion. **Recommend either restoring the missing exhibit/topology data or writing a deliberately-hedged explanation; leaving it unwritten (current state) is defensible but means this question still has no 99-spec coverage.**

✅ **Regular batch: 33 questions generated and merged by this run (verified still intact in the current file)**

- This run hit **two scheduling collisions** with concurrent runs and recovered from both by re-checking the live staging file immediately before each merge, per the established mitigation from `REGEN_REPORT_2026-07-14_EVENING.md`:
  1. First drafted `obj-2.5-source-q006`–`q038` (33 Qs, 99 explanations, fully validated). Before merging, found the live file had grown from 165→170 (flagged work, unrelated) →203 in the meantime — a concurrent run (`REGEN_REPORT_2026-07-15_EVENING.md`) had already completed and merged this exact range. **Discarded this drafted batch entirely rather than overwrite already-merged content.**
  2. Re-derived the correct next un-covered range from the live file's actual key list (203 entries, last key `obj-2.5-source-q038`) and generated a genuinely new batch: `obj-2.5-source-q039`–`q046` (8 Qs, completes objective 2.5's source pool), `obj-2.6-source-q001`–`q010` (10 Qs, complete), `obj-2.7-source-q001`–`q007` (7 Qs, complete), `obj-2.8-source-q001`–`q008` (8 Qs, partial — pool continues beyond q008).
  3. Re-checked the live file immediately before this second merge (still 203, no collision) and merged: 203 → 236.
- **Verified as of this report that all 33 of these questions and their 99 wrong-choice explanations are still present and correctly shaped** (`{ "incorrect": [...] }`, all 5 required fields, ≥20 chars) in the current staging file, despite subsequent concurrent writes from other runs.
- Content covered: BPDU Guard configuration/verification/troubleshooting (completing objective 2.5), wireless architecture fundamentals (autonomous vs. lightweight APs, IBSS/BSS/ESS, monitor mode, mesh vs. point-to-multipoint bridging vs. repeaters, Local vs. FlexConnect mode — objective 2.6), WLC connectivity (EtherChannel/LAG, trunk vs. access ports, LAG load balancing and port limits — objective 2.7), and management access (Telnet, TACACS+/RADIUS, SSH/asymmetric encryption, debug output destination — objective 2.8, partial).

⚠️ **Data bug found and handled specially — needs human fix:**

- **`obj-2.5-source-q043`** ("Which command would you use to remove BPDU Guard from an interface?"): choice index 1 and the marked-correct choice index 3 are **literally identical text** (`Switch(config-if)#spanning-tree bpduguard disable`). There's no genuine misconception to teach for "wrong" choice 1 since it's actually correct IOS syntax under a different index. This run wrote an entry documenting the bug instead of fabricating a false rationale. **Recommend a human fix**: replace the duplicate choice with a real distractor, or correct the choice/answer-key set.

📊 **Final measured state of `src/answerReview/regeneratedExplanations.json` as of this report (not just this run's contribution):**

- **235 total entries** — 231 in the regular question pool, 4 of the 5 originally-flagged objective-3.1 questions (missing `q008`, see above).
- Shape check: 0 entries with schema issues (all correctly `{ "incorrect": [...] }`, matching what `explanationIntegration.js` actually consumes — a prior concurrent run found and fixed an earlier bare-array regression affecting 132 entries; verified here that the fix held and no new regressions were introduced).
- **Next un-covered question in file order: `obj-2.8-source-q009`** (confirm exact pool size/next-objective boundary before the next run starts, since pool sizes vary per objective).

🔧 **Manual review recommended (consolidated across this run and concurrent runs today):**
1. `obj-3.1-source-q004` — duplicated exhibit text in the stem.
2. `obj-3.1-source-q002` / `obj-3.1-source-q007` — both reference a "the 4" / "the underlined number" value that doesn't survive plain-text rendering.
3. `obj-3.1-source-q005` — choices use route code `S` where `C` (connected) is correct.
4. `obj-3.1-source-q008` — exhibit lacks enough data to justify the labeled correct answer; currently has no explanation coverage at all pending a content fix.
5. `obj-2.5-source-q043` — duplicate choice text (index 1 and index 3 identical).
6. `git diff --stat src/answerReview/regeneratedExplanations.json` — recommend a full spot-check pass given how many concurrent runs touched this file today, before committing.

⏱️ **Runtime/Tokens:** this session | generated in-session against `explanationPattern99.md`, no separate billed API call.

## Notes for next run

- **A new coordination tool now exists and should be used going forward**: `scripts/claimQuestionBatch.mjs` + `ai-improvement-logs/BATCH_CLAIM_99.md`, built by a concurrent run today specifically to prevent the exact collisions this run and others hit. It provides `claim`/`complete`/`release`/`status` subcommands with TTL-based stale-claim recovery. **Use `claim` before generating anything, and `complete` immediately after a successful merge** — this replaces the manual "re-check live file before merging" mitigation with something more robust (though that manual mitigation still worked correctly twice in this run as a fallback).
- Given today's unusually high concurrency (at least 4 runs on the same day), consider whether the schedule genuinely needs to fire this often, or whether spacing runs further apart would reduce wasted drafting effort (this run alone discarded one fully-validated 33-question batch due to collision).
- No auto-commit performed, per task instructions.
