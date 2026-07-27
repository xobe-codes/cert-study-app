# Explanation Regeneration Report — 2026-07-15 EVENING

## 🚨 Priority (Flagged): 5 questions fixed

Queried production D1 (`question_health_flags`) directly — 5 actionable flagged questions found, all in objective 3.1, none previously in the local ledger. All 5 fixed this run (uncapped, per priority-queue policy).

| Question ID | Reasons | Flag Count | Root Cause Found |
|---|---|---|---|
| `obj-3.1-source-q002` | typo | 2 | Question stem says "the 4 in the underlined number" but no "4" appears anywhere in the exhibit — likely a parametrized-question template that wasn't updated when the exhibit's numbers changed. Wrote explanations generically around "the number after the slash" instead of hard-coding "4" to avoid perpetuating the confusion. |
| `obj-3.1-source-q004` | ambiguous, wrong_key | 4 (highest) | The exhibit text is duplicated (repeated twice) — display bug. More importantly, the question tests longest-prefix-match vs. administrative distance, and advanced learners could reasonably argue a directly-connected route has no true "next hop" (a semantic ambiguity), which likely drives the "wrong_key" reports. Explanations were rewritten to directly address both the prefix-match-vs-AD confusion and the practical exam convention. |
| `obj-3.1-source-q005` | bad_display | 2 | All 4 choices use route code "S" (static) for a scenario describing an IP directly configured on an interface — that should be "C" (connected). This is a real content defect in the choice text, out of scope for an explanation-only regen. Flagged below for manual review. |
| `obj-3.1-source-q007` | typo | 2 | Same broken-template issue as q002 — "the underlined number" has no visible underline in plain-text rendering, so users can't tell which value is being asked about. |
| `obj-3.1-source-q008` | typo | 2 | The exhibit only shows next-hop IP `10.0.0.1` for the destination; the correct answer ("Interface Serial 0/0/1") isn't derivable from any text actually shown — the original topology diagram that mapped IP→interface was likely lost during an exhibit-to-text conversion. Explanations were written to be maximally faithful using recursive-lookup reasoning, but the underlying data gap is flagged below. |

All 5 recorded in `ai-improvement-logs/flagged_questions_resolved.json` with `resolvedAt`, `reasons`, and `flagCountAtFix` so they won't be redone unless re-flagged with a higher count.

## 🐛 Critical fix: staging-file schema regression (found + repaired)

While validating the merge target, discovered that `explanationIntegration.js` (the code that actually surfaces these explanations in the app) requires each entry to be shaped `{ "incorrect": [...] }`, but reads `regeneratedExplanations.json` — a **git-blame check confirmed this requirement was live since the file's first commit and never changed.** Only the very first batch (2026-07-13 evening, 33 entries) was saved in that shape. **Every subsequent run since (132 questions across 4 runs) saved entries as bare arrays instead**, which `regen.incorrect` silently reads as `undefined` — meaning **132 already-"regenerated" questions have never actually been visible in the app**, despite the progress log reporting them as complete.

Fixed by normalizing all 132 bare-array entries to `{ incorrect: [...] }` in place (backed up to scratchpad first; content unchanged, just re-wrapped). All 203 entries in the staging file now validate against the schema the app actually consumes. **Recommend spot-checking the app UI to confirm previously-invisible explanations now render**, and adding a lightweight schema check to future runs so this can't silently regress again.

## ✅ Regular batch: 33 questions (cumulative: 203/914)

Continued from `obj-2.5-source-q006` (verified against the live staging file before starting — no scheduling collision with any other run today, since this was the first run of 2026-07-15). Covered the remainder of objective 2.5 (STP/RSTP): root/designated/alternate/backup port roles, bridge ID structure, PVST+/Rapid PVST+/CST naming, port-state transitions (802.1D and RSTP), convergence timers, and PortFast/BPDU Guard.

- Range: `obj-2.5-source-q006` through `obj-2.5-source-q038` (33 questions, 99 wrong-choice explanations).
- All entries programmatically validated: correct `{incorrect: [...]}` shape, exactly 3 explanations per question, all 5 required 99-spec fields present (`choiceIndex`, `misconceptionReason`, `whyItSeems`, `whyWrongHere`, `memoryAnchor`, `contrast`), no field under 20 characters.
- Merged into `src/answerReview/regeneratedExplanations.json` with zero key collisions against pre-existing (non-flagged) content.
- **Next question in file order: `obj-2.5-source-q039`.**

## ⚠️ Failed: none

## 🔧 Manual review (content-team follow-up, not fixable via explanation regen alone)

1. **`obj-3.1-source-q005`** — choices use route code "S" (static) for a directly-connected-interface scenario; should be "C" (connected). Recommend a content pass to correct the choice text.
2. **`obj-3.1-source-q008`** — exhibit text doesn't contain enough information to independently derive the labeled correct answer ("Interface Serial 0/0/1"); likely lost topology-diagram data from an earlier exhibit-to-text conversion. Recommend restoring the original exhibit or the interface/IP mapping.
3. **`obj-3.1-source-q002` / `obj-3.1-source-q007`** — both reference "the 4" / "the underlined number" respectively, referring to a highlighted value that doesn't survive into plain-text rendering. Recommend either restoring visual emphasis in the UI or rewording the stems to name the value directly (e.g., "the number after the slash in [110/20]").
4. **`obj-3.1-source-q004`** — exhibit text is duplicated (the same routing table excerpt appears twice in the question string). Cosmetic but should be deduplicated.
5. **Staging-file schema regression** (see above) — now repaired for existing entries, but the root cause (no schema validation on write) should be addressed so future runs can't silently regress again.

## ⏱️ Tokens, runtime

Interactive session (not a fixed-cost batch run) — extended due to the schema-regression investigation and fix. Approximate scope: 5 flagged questions (15 explanations) + 33 regular questions (99 explanations) = 114 new/rewritten wrong-choice explanations, plus a one-time normalization pass across 132 pre-existing entries.
