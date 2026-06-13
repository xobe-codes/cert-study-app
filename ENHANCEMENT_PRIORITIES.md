# CCNA App — Enhancement Priorities

Context: CCNA 200-301 study app at `/Users/zycooks/Documents/Apps/CCNA App` (React/Vite, Cloudflare Pages, https://ccna-study-tool.pages.dev). Deployed features include SM-2 SRS, mastery gate, retention health, curated content (`ccnaCurated.js` + `ccnaQuestionImports.js`), Lab Engine v2, AI tutor, hybrid per-content-type fallback, onboarding diagnostic, Exam Readiness Score, and curated Key Terms / Visual wiring for static objectives.

**Canonical backlog:** the **MASTER LIST** table below (single source of truth). Supersedes all prior MASTER SEQUENCE, ACTIVE ROADMAP, and P0–P3 sections. Work item numbers are stable — strike through when done; append new rows only; do not renumber.

Cross-tool workflow: read `PROJECT_LOG.md` first each session; update Timeline + Status Summary when an item completes; see `PROJECT_PROFILE.md`, `COMMANDS.md`, `RISKY_AREAS.md`.

---

## MASTER LIST (prioritized — single source of truth)

Start at **#12** unless you need production updated first (**#41**).

| # | Work item | Type | Status | Suggested action |
|---|---|---|---|---|
| 1 | Import question bank — Domain 4 pilot (`4.1`) | Less AI | **Done** | — (Timeline 9; `4.2`–`4.9` deferred to #11) |
| 2 | Resolve `_V1` doc naming | Housekeeping | **Done** | — (Timeline 4) |
| 3 | Per-content-type hybrid fallback (`App.jsx`) | Less AI | **Done** | — (Timeline 10) |
| 4 | Onboarding + diagnostic placement test | UX | **Done** | — (Timeline 11) |
| 5 | Exam Readiness Score (Home hero metric) | UX | **Done** | — (Timeline 12) |
| 6 | Domain 5 ID crosswalk decision | Less AI | **Done** | — (Timeline 13) |
| 7 | Import question banks — domains 2, 3, 6 | Less AI | **Done** | — (Timeline 14) |
| 8 | Decide orphaned sets (QB 2.9, 5.4, 3.4 OSPF) | Less AI | **Done** | — (Timeline 15) |
| 9 | Curate Domain 1 (remaining 8 objectives) | Less AI | **Done** | — (Timeline 16; D1 now 12/12 curated) |
| 10 | Import Domain 5 question bank (~144 Qs) | Less AI | **Done** | — (Timeline 16; 554 Qs in `IMPORTED_QUESTIONS`) |
| 10a | Wire curated flashcards → Key Terms tab | Less AI | **Done** | — (Timeline 16) |
| 10b | Wire curated diagrams → Visual tab | Less AI | **Done** | — (Timeline 16) |
| 11 | Import Domain 4 `4.2`–`4.9` (~88 Qs, questions-only) | Less AI | Queued | Extend `convertQuestionBank.mjs`; hybrid fallback supports Q-only |
| **12** | **Add test / lint / typecheck tooling** | Infra | **Next** | Vitest + ESLint before AI batch (#15–22) |
| 13 | IPv6 subnetting calculator (`1.8`) | Less AI | Queued | Reuse existing subnetting calculator pattern |
| 14 | ACL wildcard-mask calculator (`5.5` / `5.6`) | Less AI | Queued | Pair with #13 |
| 15 | Socratic tutor mode toggle | Better AI | Queued | Prompt + UI toggle on tutor chat |
| 16 | Session recap on return to Home | Better AI | Queued | Wire `ccna_events_v1` + `buildLearnerSummary`; Haiku |
| 17 | Domain weight overlay on progress bars | UX | Queued | Weight bars by exam % (e.g. D4 = 25%) |
| 18 | Progressive hint system in quizzes | Better AI | Queued | Pre-answer hint; reuse `explainMistake()` cache |
| 19 | "Explain it differently" style switcher | Better AI | Queued | Extend `AdjustExplanation` |
| 20 | Personalized mnemonics for missed concepts | Better AI | Queued | Tie to retention-health weak bucket |
| 21 | Confidence-calibration coaching | Better AI | Queued | Surface overconfidence quadrant |
| 22 | Overconfidence → Daily Review weighting | Better AI | Queued | Auto-prioritize overconfident items |
| 23 | Diagram / visual sprint (12–15 topics) | Less AI + UX | Queued | Expand static SVG beyond curated set |
| 24 | Expand hands-on labs (47/53 have none) | Less AI | Queued | Next targets: `1.6`, `5.5`, `2.2` |
| 25 | Subnetting drill mode (binary feedback) | Less AI | Queued | After #13; CLI-drill validator pattern |
| 26 | CLI lab AI feedback on failed validation | Better AI | Queued | Haiku explains why a lab command failed |
| 27 | Global search / Cmd+K navigation | UX | Queued | Defer until nav pain increases |
| 28 | Exam date countdown + adaptive daily plan | UX | Queued | Tie readiness + SRS + weak domains |
| 29 | Focus Mode (weak-area-only review) | UX | Queued | Filter Daily Review to weak bucket |
| 30 | Lapse → same-session re-queue | UX | Queued | Immediate re-test on 2nd miss |
| 31 | "Exam trap of the day" widget (Home) | UX | Queued | Surface `commonMistakes` / exam-trap data |
| 32 | Background pre-caching for uncurated objectives | Less AI | Queued | Lower urgency as static pool grows |
| 33 | Mock exam from static pool (hybrid) | Less AI | Queued | Assemble mock from banks; AI fills gaps only |
| 34 | Mock exam history trend chart | UX | Queued | Score-over-time per domain |
| 35 | Troubleshooting question weighting near exam | UX | Queued | Skew quiz mix as exam approaches |
| 36 | Adaptive question pacing within session | UX | Queued | Live difficulty from streak |
| 37 | Auto cross-device sync / setup nudge | UX | Queued | `sync.js` needs D1 provisioning |
| 38 | Voice / TTS mode for tutor | Better AI | Queued | Browser `speechSynthesis` |
| 39 | AI "exam day" mock interview | Better AI | Queued | Late-stage exam prep |
| 40 | API cost / reliability hardening | Infra | Queued | Turnstile/Access on proxy; usage dashboard |
| 41 | Finish "MVP 12" curated objectives | Less AI | In progress | 7/12 done; remaining gaps fold into curation/import work |
| 42 | Static reading stubs for Q-only objectives | Less AI | Queued | Reduce Explain-tab API for `2.3`, `6.2`, etc. |
| 43 | Pre-assessment from static question bank | Less AI | Queued | Sample 6 Qs from `getCuratedQuestions()` before AI |
| 44 | Fix offline packaging to skip curated assets | Less AI | Queued | `packageObjectiveOffline()` should not re-call AI |
| 45 | Show CURATED / Q-ONLY / AI badge on objective header | UX | Queued | Surface coverage before user burns an API call |
| 46 | Deploy to production | Infra | **Ready** | `npm run build && npx wrangler pages deploy dist --project-name ccna-study-tool` |
| 47 | Fix Key Terms auto-load bug + cache-first for all objectives | Bug fix | **Next (urgent)** | Missing `useEffect` from Timeline 16 means cards never auto-load; also ensure curated flashcards serve instantly, AI only caches once for non-curated |
| 48 | Static key info block on Explain tab (all objectives) | Less AI | Queued | Show BOOK_REF notes or CKU summaries instantly before/instead of waiting for AI explanation on non-curated objectives |
| 49 | Objective navigation — prev/next + domain quick-jump | UX | Queued | Prev/next buttons within a domain; one-tap return to domain list; complements #27 (Cmd+K global search) |

### Legacy MASTER SEQUENCE crosswalk (do not use for planning — reference only)

| Old MS # | Maps to MASTER LIST # |
|---|---|
| 1–8 | 1–8 |
| 9 | 9 |
| 10 | 12 |
| 11 | 13–14 |
| 12 (umbrella) | 15–16, 18–22 |
| 13 | 23 |
| 14 | 24 |
| 15–30 | 27–40 (see table) |
| 31 (deploy) | 46 |

---

## Working agreement

- Discovery → plan → implement → validate per item; smallest viable change first.
- Reuse existing patterns: generate-once-cache, `COLORS`/theme tokens, `CURATED` / `IMPORTED_QUESTIONS` / `SUPPLEMENTAL_QUESTIONS`, `ProgressBar` / `ProgressRing`.
- Validate: `npm run compile:ccna && npm run build`; preview at least one affected objective.
- When an item completes: append `PROJECT_LOG.md` Timeline entry, update Status Summary, strike through row here, commit with MASTER LIST # in message + `Co-Authored-By:` trailer.
- Do not auto-continue to the next item unless the user asks.

---

## Archived (superseded 2026-06-13)

The following sections were merged into the MASTER LIST above and removed to avoid duplicate/conflicting backlogs: **MASTER SEQUENCE (items 1–31)**, **ACTIVE ROADMAP**, **P0–P3**. Historical detail remains in `PROJECT_LOG.md` Timeline items 1–16.
