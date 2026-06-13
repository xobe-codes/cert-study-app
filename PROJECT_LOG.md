# Project Log — CCNA Study App

A running log of work done, decisions made, and current state — written so anyone (or a future Claude Code session) can read this cold and pick up where things left off.

See also: [PROJECT_PROFILE.md](PROJECT_PROFILE.md) (structure/stack), [COMMANDS.md](COMMANDS.md) (commands), [RISKY_AREAS.md](RISKY_AREAS.md) (what needs approval).

---

## Status Summary (as of 2026-06-13)

- **Curated objectives**: **19 of 53** have full static, source-grounded content (reading + questions, no AI needed). **Domain 1 is now fully curated** (all 12 objectives).
- **Question-bank-only objectives**: 15 more objectives have `hasCuratedQuestions=true` via bulk import (no curated `reading`). Total objectives with zero-API questions: **~34/53** (19 curated + 15 Q-only; some overlap where curated also has imported Qs).
- **Hands-on labs**: 6 labs across 6 domains — VLAN/Trunking (2.1), OSPF (3.4), NAT (4.1), Static/Floating routing (3.3), SSH (4.8), DAI (5.6).
- **Question bank**: **566 imported and live** (554 in `IMPORTED_QUESTIONS` + hand-curated merges). Domain 5 bulk import complete. **12 shelved** in `SUPPLEMENTAL`.
- **UI**: Key Terms and Visual tabs use curated flashcards/diagrams when available (no API on first load for curated objectives).
- **Next planned work**: **MASTER LIST #12** — test/lint/typecheck tooling. Optional anytime: **#46** deploy to production.

---

## Timeline

### 1. Objective 1.5 content-integrity fix (commit `f4987d0`)
- Found that `ccnaCurated.js`'s objective `'1.5'` was mistakenly authored as "Compare TCP to UDP" — the app's actual blueprint title for 1.5 is **"Switching concepts (MAC table, frame forwarding)"**.
- Re-authored 1.5 with new CKUs/questions/flashcards/diagram/packet-flow for the correct topic.
- Preserved the old TCP/UDP content as an unregistered `SUPPLEMENTAL` export (`SUPP_TCPUDP`) — no data lost.
- **Lesson**: always verify `objectiveId` + title against the app's `DOMAINS` constant in `App.jsx` before authoring content for it.

### 2. Lab batch — first 3 labs (commit `00e4193`)
- Added VLAN/Trunking (2.1), single-area OSPF (3.4), NAT/PAT (4.1) lab bundles to `ccnaLabs.js`.
- **Bug hit & fixed**: initial `domainId` values used camelCase (`networkAccess`, `ipConnectivity`, `ipServices`) — `compileCcnaPackages.mjs`'s `DOMAIN_META` actually uses short keys (`access`, `connectivity`, `services`). Fixed via `sed`, recompiled, verified per-domain lab counts.

### 3. Lab batch — second 2 labs (commit `36e3bcf`)
- Added Static + Floating Static routing (3.3) and SSH access (4.8) labs — used the correct short `domainId` keys from the start (no errors this time).
- Labs hub grew from 1 → 6 labs across all 6 domains. `validateLabs()`, `npm run compile:ccna`, `npm run build` all passed; preview-verified.

### 4. Claude Code "Command Center" V1 setup
- Created global files (none existed before):
  - `~/.claude/CLAUDE.md` — baseline rules: cheap mode, phased work, approval gates (deps/lockfiles/auth/db/deploy/build/>5-8 files), never-touch list (`.env*`, secrets, `.mcp-auth`, `.claude.json`, `settings.local.json`), context-mode rule, pre-change safety checklist for config edits.
  - `~/.claude/skills/project-scan/SKILL.md` — read-only project analysis.
  - `~/.claude/skills/usage-plan/SKILL.md` — pre-implementation sizing/risk/phase planning.
  - `~/.claude/skills/phase1/SKILL.md` — discovery-only pass.
- Ran `/project-scan` on the CCNA App project (npm/Vite/React, Cloudflare Pages, no test/lint/typecheck configured yet).
- Created and committed project files (commit `bd31a3a`):
  - `PROJECT_PROFILE.md`, `COMMANDS.md`, `RISKY_AREAS.md`.

### 5. Question Bank Validation (Domains 2-6, from `~/Downloads/`)

Each domain batch was extracted, JSON-syntax-checked, and run through a `validate-domainN.py` deep-validation script checking schema version, objective ID match, question counts, unique IDs, required fields (`correctChoiceIds`, `sourceRefs`, `qualityFlags.rightsReviewRequired`), and running totals.

| Domain | Objectives | Questions | Running total | Status |
|---|---|---|---|---|
| 2 | 2.3-2.9 (7 files) | (validated in a prior session) | → 348 | PASSED |
| 3 | 3.1-3.5 (5 files) | 200 | 348 → 548 | PASSED |
| 4 | 4.1-4.9 (9 files) | 100 | 548 → 648 | PASSED |
| 5 | 5.1-5.10 (10 files) | 150 | 648 → 798 | PASSED |
| 6 | 6.1-6.7 (7 files) | 100 | 798 → 898 | PASSED — `continuation.hasMore: false` (final batch per manifest) |

All extracted to `~/Downloads/domainN-*-validation/` folders (not in the git repo).

### 6. Cross-Domain Review (consolidated `needsReview` analysis)

Compiled all `uncertainObjectiveMapping` (58 questions) and high-`formattingNeedsReview`-rate files into themes A-G. Decisions made:

| Theme | Objective(s) | Count | Decision |
|---|---|---|---|
| **A** | 3.4 multi-area OSPF cluster | 14 | **Exclude from 3.4's import pool** — out of scope for "single-area OSPFv2" per CCNA 200-301 v1.1. Hold as `SUPPLEMENTAL` for a possible future objective. 3.4 pool: 63 → 49. |
| **B** | 2.5 STP standards/BPDU Guard | 13 | Keep, import with `needsReview` tags — on-topic or closely related (Layer 2 security). |
| **C** | 2.9 WLAN/QoS general | 6 | Keep, import with `needsReview` — q005 (QoS trust boundary) flagged for future dedup check vs. 4.7. |
| **D** | 3.1 routing-protocol comparison | 2 | Keep, import with `needsReview` — low impact. |
| **E** | 4.2/4.5 device-mgmt commands | 4 | Keep, import with `needsReview` — general IOS admin commands. |
| **F** | 5.5/5.8/5.9/5.10 security cross-map | 7 | Keep, import with `needsReview` — scattered, low impact. |
| **G** | 6.2-6.6 SDN/automation cross-map | 12 | Keep as-is — reflects legitimate topic overlap in the blueprint (6.2/6.3/6.4 are closely related). |

**Net result**: 898 − 14 = **884 importable questions**, all with their existing `needsReview` flags intact for a later spot-check pass.

### 7. Strategic direction: reduce AI dependency

Discussed long-term goal: phase out AI for *generating exam content*, keep AI for *enhancing learning* (explaining answers, adaptive review, personalized quizzes built from static content).

**Agreed approach** (not yet implemented):
1. **Schema conversion**: one-time converter script (pattern like `compileCcnaPackages.mjs`) maps `ccna-question-bank-v1` → the app's existing `questions[]` shape.
2. **Hybrid fallback granularity**: change `App.jsx`'s "is this objective curated?" check (currently all-or-nothing) to be per-content-type — use static questions if present, fall back to AI only for missing reading/CKUs.

### 8. Objective ID Mapping Note (IMPORTANT — needed before import)

The question bank's objective numbering **does not always match** the app's `DOMAINS` numbering in `App.jsx` (same class of issue as the 1.5 bug). Crosswalk found so far:

- **Domains 2, 3, 4, 6**: question-bank IDs match app IDs 1:1 (e.g. QB 4.3 = app 4.3 "DHCP/DNS"). Domain 2's QB 2.9 and Domain 4's QB 4.10/Domain 3's 3.6/Domain 6 has no extra — only D2 has one extra file (2.9, WLAN operational params) with no direct app objective.
- **Domain 5**: numbering is **offset/shifted** — e.g. QB 5.6 (ACLs) = app 5.5; QB 5.9 (wireless security protocols) = app 5.8; QB 5.5 (VPN) = app 5.10. Full crosswalk:

| QB objective | QB topic | → App objective |
|---|---|---|
| 5.1 | Key security concepts | 5.1 |
| 5.2 | Security program elements | 5.2 |
| 5.3 | Local device access control | 5.3 |
| 5.4 | Password policies | 5.3 (supplemental/overlap) |
| 5.5 | VPN remote access/site-to-site | **5.10** |
| 5.6 | ACLs | **5.5** |
| 5.7 | Layer 2 security features | **5.6** |
| 5.8 | AAA concepts (QB title: "Differentiate AAA concepts") | **5.7** ("Compare authentication, authorization, accounting") — confirmed, see Timeline item 13 |
| 5.9 | Wireless security protocols | **5.8** |
| 5.10 | WLC GUI WPA2-PSK | **5.9** |

App objectives `5.4` (AAA TACACS+/RADIUS — partially covered by QB 5.8) and `5.11` (segmentation) have no clean question-bank coverage.

### 9. MASTER SEQUENCE item 1 — Domain 4 question-bank import (4.1 pilot)

**Goal**: prove the QB → `ccnaCurated.js` converter pipeline end-to-end on one objective before scaling to other domains.

**Scoping finding**: `CURATED` in `ccnaCurated.js` is all-or-nothing per objective — `hasCurated()`/`getCurated()` require a full entry (`ckus`, `reading`, `questions`, etc.). Of Domain 4's 9 objectives, only **4.1** has a curated entry; 4.2-4.9 don't exist in `ccnaCurated.js` at all and would need full curation (item 9 in the MASTER SEQUENCE), not just a question import. So this pilot is scoped to **4.1 only**.

**What was done**:
- Converted all 12 questions from `~/Downloads/domain4-ip-services-validation/objective-4.1-nat-inside-source-source-questions.json` and appended them to `OBJ_41.questions` in `ccnaCurated.js` (8 → 20 questions, IDs `4.1-q1`..`4.1-q12` vs the existing hand-authored `4.1-c-q1`..`q8`).
- **Mapping rules applied** (approved before implementation):
  - `questionType` → `type`: `output-interpretation`/`command-analysis` → `application`, `scenario` → `scenario`.
  - `difficulty`: `exam-ready` → `hard` (all other values pass through).
  - `ckuIds`: filtered to 4.1's actual curated CKUs (`CKU-NAT`, `CKU-PAT`, `CKU-NAT-TERMS`) — dropped unmapped/contaminated IDs (e.g. stray `CKU-SNMP-*`/`CKU-NTP` references in q005/006/008/012 that look like cross-extraction errors from another objective), defaulting to `['CKU-NAT']` if nothing matched.
  - `concept`: derived from the primary mapped CKU (`'nat'`, `'pat'`, `'nat terms'`) since the QB has no usable per-question concept field.
  - `choices`/`correctIndex`: flattened from `{id,text,isCorrect}[]` to a string array + index.
- Ran `npm run compile:ccna` (D4 still shows `curated:1` — package count unchanged, only question count grew) and `npm run build` — both passed.
- Preview-verified: 4.1's quiz reports "From your saved bank of 20 · no API used"; answered a question, confirmed correct/incorrect feedback, explanation text, and confidence-rating UI all render correctly for an imported question.

**Outcome**: pipeline proven. 12/884 importable questions now live. Remaining 4.2-4.9 question banks (88 questions) are on hold until those objectives get full curated entries (MASTER SEQUENCE item 9 territory) or a future item defines a "questions-only" curated shape (ties into item 3's hybrid fallback work).

### 10. MASTER SEQUENCE item 3 — Per-content-type hybrid fallback in `App.jsx`

**Goal**: replace the all-or-nothing `hasCurated()`/`getCurated()` gate with per-content-type checks, so an objective can have curated questions without needing a curated reading (and vice versa) — unblocking future "questions-only" imports for 4.2-4.9 etc. without requiring full curation first.

**What was done**:
- Added two new exported predicates to `ccnaCurated.js`: `hasCuratedReading(objectiveId)` (true if `CURATED[id].reading` exists) and `hasCuratedQuestions(objectiveId)` (true if `CURATED[id].questions.length > 0`). Kept `hasCurated`/`getCurated` for backward compatibility where still used. Made `getCuratedQuestions` defensive against entries lacking `.questions`.
- `App.jsx`: `ExplainTab`'s gate changed from `hasCurated(objective.id) ? getCurated(...) : null` to `hasCuratedReading(objective.id) ? getCurated(...) : null` — so `CuratedReading` only renders when a reading actually exists; otherwise falls through to AI explanation, independent of whether curated questions exist.
- `ContentCoverage` (Metrics dashboard) extended to show three states per objective: `CURATED` (has reading), `QUESTIONS` (questions-only, no reading), `AI` (neither) — plus a "Q-only" pill per domain when applicable. Existing curated/lab counts unchanged.

**Validation**:
- `npm run compile:ccna` (11 curated objectives unchanged, D4 `curated:1`) and `npm run build` (passed, 548.51 kB) — no regressions.
- Preview-verified: objective 4.2 (AI-only, no curated entry) still goes through pre-assessment → RECALL FIRST → full AI-generated explanation correctly (confirms `curated` evaluates to `null` post-change).
- Preview-verified: `ContentCoverage` dashboard still shows "11/53 objectives curated · 6 with labs" (no spurious Q-only pill, since no questions-only entries exist yet).
- Preview-verified: objective 4.1 (fully curated — has both reading + questions) still renders `📚 CURATED · NO AI` reading correctly after Reveal explanation.

**Outcome**: hybrid fallback is now per-content-type. Future imports of 4.2-4.9 question banks can land as "questions-only" curated entries (no `reading` field) and will correctly show `QUESTIONS` status + use AI only for the explanation — no longer blocked on full curation (item 9).

### 11. MASTER SEQUENCE item 4 — Onboarding + diagnostic placement test

**Goal**: give new users an entry point — a short, zero-API placement check on first visit that seeds initial mastery estimates and recommends a starting objective.

**What was done**:
- New `Onboarding` component (`src/App.jsx`) with three phases: `intro` (explain + Start/Skip), `active` (single-question quiz UI reused from `ReviewSession`'s pattern), `done` (overall score + recommended starting objective, sorted by weakest accuracy).
- `buildDiagnosticSet()`: pulls up to 2 curated questions from each of the 11 curated objectives (`hasCuratedQuestions`/`getCuratedQuestions`), shuffles, caps at 18 — **zero API calls**.
- New storage key `ccna_onboard_done_v1`. On first load, if no `onboardDone` flag and `progress` is empty, `view` starts at `'onboarding'`. Existing users with progress data are auto-marked done (no interruption).
- `finishOnboarding(results)`: for each sampled objective, appends a `quizScores` entry `{score, total, date}` and recomputes `masteryScore`/`status` via the same `computeMastery()` used everywhere else, then routes to Home. `skipOnboarding()` just sets the flag and goes Home.

**Validation**:
- `npm run build` passed (553.61 kB; one pre-existing unrelated duplicate-key esbuild warning at line ~3260, not introduced by this change).
- Preview-verified end-to-end with a cleared `ccna_progress_v1`/`ccna_onboard_done_v1`: intro → 18-question placement check across domains → results screen ("18%", 11 objectives seeded, recommended starting point "2.2 Configure and verify interswitch connectivity (trunking)") → Home shows "0 mastered · 11 in progress · 42 not started".
- Preview-verified reload after completion does not re-trigger onboarding (`onboardDone: true` persisted).
- Preview-verified the "Skip" path: lands on Home with progress still empty ("0 mastered · 0 in progress · 53 not started").

**Outcome**: new users now get a guided first-run experience with seeded mastery data and a concrete starting point, at zero added AI cost.

### 12. MASTER SEQUENCE item 5 — Exam Readiness Score hero metric on Home

**Goal**: a single 0-100% "Exam Readiness" number on Home combining mastery + retention health, with a per-domain breakdown.

**What was done**:
- `computeDomainStats(progress)`: per-domain average `computeMastery().score` across each domain's objectives (reuses existing logic, same shape as `buildLearnerSummary`'s `domainStats` but synchronous — no event log needed).
- `computeReadinessScore(progress, retention)`: domain-weighted mastery average (same formula already used by `repCertReadiness`'s "Overall Readiness"), adjusted by retention health — sections in the "STUDY"/weak retention state pull the score down slightly (`mastery*0.85 + retentionStrongFraction*0.15`). No penalty if nothing is in spaced review yet.
- `HomeScreen`: added a `useEffect` to load `loadRetentionHealth()` (re-runs when `progress` changes), and replaced the old "Course mastery" `ProgressBar` with a hero card: `ProgressRing` showing the readiness % + per-domain mini progress bars (using each domain's accent color and weight).
- Removed the now-unused `totals.overall` calculation.

**Validation**:
- `npm run build` passed (554.84 kB).
- Preview-verified empty state: "0% Exam Readiness" + all 6 domains at 0%.
- Preview-verified with seeded progress (2.1 mastered, 1.5 in-progress at 46%): readiness "3%", Network Fundamentals "4%", Network Access "13%" — matches the weighted formula (20%×4% + 20%×13% ≈ 3.4%).

**Outcome**: Home now leads with a single readiness number and a per-domain breakdown, reusing the existing mastery/retention pipelines with no new storage or AI calls.

### 13. MASTER SEQUENCE item 6 — Domain 5 ID crosswalk decision

**Goal**: resolve the one ambiguous mapping in the Domain 5 question-bank → app-objective crosswalk (item 8 in this log, Open Decision #1) before importing Domain 5.

**Finding**: inspected `~/Downloads/domain5-domain6-validation/objective-5.8-aaa-concepts-source-questions.json` — its `objective.objectiveTitle` is **"Differentiate AAA concepts"**, and its sample questions are conceptual ("Which technology gives selective access based on authentication?", "What is the end device called in 802.1X?", "What is the switch called in an 802.1X config?").

**Decision**: QB 5.8 → app **5.7** ("Compare authentication, authorization, accounting") — both are conceptual/comparative. App **5.4** ("Configure and verify AAA with TACACS+/RADIUS") is configuration-command-focused and stays AI-only/uncovered, consistent with the existing note in this log. The Domain 5 crosswalk table above is now fully confirmed with no remaining ambiguity.

**Outcome**: a future Domain 5 import can proceed using the confirmed crosswalk: QB 5.1→5.1, 5.2→5.2, 5.3→5.3, 5.5→5.10, 5.6→5.5, 5.7→5.6, 5.8→5.7, 5.9→5.8, 5.10→5.9. QB 5.4 (password policies) remains an orphan for item 8's disposition decision. (Domain 5 itself is not part of item 7's scope — "2, 3, 6" — and remains a future item.)

---

### 14. MASTER SEQUENCE item 7 — Import remaining clean domains (2, 3, 6)

**Goal**: bulk-import the validated question banks for Domains 2 (`2.3`-`2.8`), 3 (`3.1`-`3.5`), and 6 (`6.1`-`6.7`) using the converter pipeline proven in item 9 (4.1 pilot), at a scale (403 questions across 19 source files) too large for hand-curation.

**Approach**: wrote `scripts/convertQuestionBank.mjs`, a one-time bulk converter that reads the QB source JSON from `~/Downloads/{domain2-rest-2.3-to-2.9-validation,domain3-ip-connectivity-validation,domain5-domain6-validation}/`, applies the conversion-mapping rules below, and writes `src/data/ccnaQuestionImports.js` (`IMPORTED_QUESTIONS`, keyed by app objectiveId). `ccnaCurated.js`'s `hasCuratedQuestions`/`getCuratedQuestions` now merge `IMPORTED_QUESTIONS[id]` alongside any hand-curated `CURATED[id].questions` — a 2-line addition each, leaving the hand-curated content untouched.

**Mapping rules** (extends item 9's rules with the dominant new `multiple-choice-single` type):
- `questionType`: `scenario`→`scenario`, `output-interpretation`/`command-analysis`→`application`, `multiple-choice-single`→`definition` (cosmetic only — `App.jsx`'s `TYPE_LABEL` falls back to the raw string for unmapped types).
- `difficulty`: `exam-ready`→`hard`, `medium`/`easy` passthrough.
- `choices`/`correctChoiceIds` → flattened `choices[]` (text only) + `correctIndex`.
- `concept` derived from `ckuIds[0]` (`CKU-` prefix stripped, lowercased, hyphens→spaces); `ckuIds` passed through as-is.

**Decisions applied**:
- **3.4 exclusion set**: inspected the file directly — exactly **12** questions (not 14 as item 6 estimated) carry `qualityFlags.uncertainObjectiveMapping: true` and are about multi-area OSPF/ABRs (ids `obj-3.4-source-q007/008/009/011/038/039/040/043/044/045/059/062`). Used these 12 as the "multi-area OSPF cluster" exclusion (51 of 63 imported). The 12-vs-14 discrepancy from item 6 is noted but not further chased — 12 is the actual flagged set.
- **QB 2.9** (WLAN operational parameters, 13 questions): app's Network Access domain only has objectives 2.1-2.8 — no corresponding app objective exists. Skipped entirely; left for item 8's orphan disposition.
- **QB 6.6 + 6.7 → app 6.6**: app 6.6 ("Interpret JSON data and configuration management tools") covers two QB objectives — 6.6 ("Recognize capabilities of Puppet, Chef, Ansible", 18 Qs) and 6.7 ("Interpret JSON encoded data", 12 Qs). Both merged into app `6.6` (30 questions total).
- All other QB objectiveIds (`2.3`-`2.8`, `3.1`-`3.3`, `3.5`, `6.1`-`6.5`) map 1:1 to the same app objectiveId — confirmed by reading each file's `objective.objectiveId`/`objectiveTitle` against `App.jsx`'s `DOMAINS`.

**Per-objective question counts imported**: 2.3:15, 2.4:15, 2.5:46 (added to existing curated), 2.6:10, 2.7:7, 2.8:10, 3.1:27, 3.2:37 (added to existing curated), 3.3:43, 3.4:51 (added to existing curated), 3.5:30, 6.1:6, 6.2:9, 6.3:24, 6.4:11, 6.5:20, 6.6:30 (18+12 merged). **Total: 391 questions** (403 read - 12 excluded).

**Validation**:
- `npm run compile:ccna` — 11 curated objectives unchanged (imports are a separate registry, not part of `CURATED`).
- `npm run build` — passed, 749.94 kB (up from 554.84 kB, expected given +391 questions of static data).
- Preview: objective `2.3` (previously zero curated content) → Quiz tab → "Build question bank" → **"From your saved bank of 15 · no API used"**, confirming the merge point works for questions-only objectives.

**Outcome**: 25/53 objectives now have zero-API question pools (11 fully curated + 14 questions-only). 403/884 importable questions now live (12 from 4.1 pilot + 391 here). 481 remain: QB 2.9 (13, orphan), QB 5.4 (6, orphan), and Domain 5's other 9 objectives (not in item 7's scope).

---

### 15. MASTER SEQUENCE item 8 — Decide orphaned question sets

**Goal**: resolve disposition for three orphan/excluded question sets left after item 7: QB 2.9 (WLAN operational parameters), QB 5.4 (password policies), and the 3.4 multi-area OSPF cluster (12 questions).

**Discovery** (source files under `~/Downloads/`):
- **QB 2.9** (13 Qs): topics are SSID length/VLAN mapping, WLC GUI WLAN status, 802.11e/k, QoS profiles, WPA2/802.1X — operational WLAN parameters. App Network Access domain ends at objective `2.8` ("Configure WLAN components for client connectivity"); no `2.9` slot exists. Six questions carry `uncertainObjectiveMapping` (mostly WPAN/WLAN scope terms and QoS trust boundary — item 6 Theme C).
- **QB 5.4** (6 Qs): password complexity, `service password-encryption`, `enable secret` scrypt, time-based tokens, smart-card MFA — overlaps app `5.3` ("Configure and verify device access control"), not app `5.4` (AAA TACACS+/RADIUS config). Crosswalk table (item 8 in this log) already flagged `5.4 → 5.3 (supplemental/overlap)`.
- **3.4 multi-area OSPF** (12 Qs): ABRs, area 0, hierarchical design, `show ip ospf database` — out of CCNA 200-301 v1.1 single-area OSPFv2 scope (item 6 Theme A). Already excluded from `3.4`'s live import pool in item 7.

**Decisions**:
| Set | Count | Disposition | Rationale |
|---|---|---|---|
| QB 2.9 | 13 | **Merge → app `2.8`** | Closest live objective; operational WLAN params (SSID, security, QoS on WLC) align with 2.8's client-connectivity scope. Better served than shelved. |
| QB 5.4 | 6 | **Merge → app `5.3`** | Password-policy content is device-access-control, not AAA-server config. Makes `5.3` a new questions-only objective. |
| 3.4 multi-area OSPF | 12 | **`SUPPLEMENTAL` (`supp-ospf-multiarea`)** | Out of exam scope for 3.4; preserved on shelf (like `SUPP_TCPUDP`) for a possible future objective — not served in 3.4 quizzes. |

**Domain 5 bulk import** (9 remaining QB files, ~144 Qs): unchanged — still deferred to a dedicated future import slot (not part of item 8).

**What was done**:
- Extended `scripts/convertQuestionBank.mjs`: QB `2.9 → 2.8`, QB `5.4 → 5.3`; generates `src/data/ccnaQuestionSupplemental.js` for shelved sets.
- Regenerated `ccnaQuestionImports.js` (+19 questions: 2.8 now 23, new `5.3` pool of 6).
- Added `SUPP_OSPF_MULTIAREA` to `SUPPLEMENTAL` registry in `ccnaCurated.js` (imports shelved questions; not wired to quiz flow).

**Validation**:
- `npm run compile:ccna` — passed (11 curated objectives unchanged).
- `npm run build` — passed, 759.21 kB.
- `validateCurated()` — `{ ok: true, errors: [] }`.

**Outcome**: all three orphan sets resolved. Live import total **422** (+19). **26/53** objectives now have zero-API question pools (+1 for `5.3`). **12** multi-area OSPF questions preserved in `SUPPLEMENTAL`. Domain 5 bulk import remains the next import workstream.

---

### 16. Upgrades 1–5 — Deploy prep, D5 import, D1 curation, curated UI wiring

**Goal**: reduce AI dependency per analysis session — deploy latest build, import Domain 5, finish Domain 1 curation, wire curated flashcards/diagrams into Key Terms and Visual tabs.

**What was done**:
- **Domain 5 bulk import**: extended `convertQuestionBank.mjs` with QB `5.1`–`5.10` (crosswalk: `5.5→5.10`, `5.6→5.5`, `5.7→5.6`, `5.8→5.7`, `5.9→5.8`, `5.10→5.9`; `5.3`+`5.4` merged into app `5.3`). Regenerated `ccnaQuestionImports.js` — **554 questions** total (+144).
- **Domain 1 curation**: new `ccnaCuratedDomain1Rest.js` with 8 objectives (`1.1`, `1.2`, `1.3`, `1.4`, `1.7`, `1.10`, `1.11`, `1.12`) registered in `CURATED`. **Domain 1 now 12/12 curated** (19/53 app-wide).
- **Key Terms**: `KeyTermsCarousel` uses `getCurated().flashcards` first — shows `CURATED · NO AI` badge; AI only on explicit "Generate with AI".
- **Visual tab**: new `CuratedVisualAid` renders `diagram` + `packetFlow` from curated data — no API on load when diagram exists; optional "Generate AI visual instead".
- **Build**: `npm run compile:ccna` (D1 `curated:12`) + `npm run build` passed (923.64 kB).

**Deploy**: production deploy blocked in agent environment — run locally: `npm run build && npx wrangler pages deploy dist --project-name ccna-study-tool`

**Outcome**: ~34/53 objectives have static quiz pools; 19 have full curated reading. Key Terms + Visual tabs skip API for all curated objectives.

---

### 17. MASTER LIST consolidation — single prioritized backlog

**Goal**: replace fragmented MASTER SEQUENCE / ACTIVE ROADMAP / P0–P3 sections with one prioritized MASTER LIST (analysis-session upgrade list + completed work through Timeline 16).

**What was done**:
- Rewrote `ENHANCEMENT_PRIORITIES.md`: **MASTER LIST #1–46** is now the sole backlog (Type + Status + Suggested action columns). Added completed rows **10a** (Key Terms wiring) and **10b** (Visual wiring). Appended less-AI follow-ups **#42–#45** from analysis. Legacy MS crosswalk table kept for reference only.
- Updated `PROJECT_LOG.md` Status Summary + Next Steps to point at MASTER LIST **#12** (next) and **#46** (deploy).
- Updated `PROJECT_PROFILE.md` planning-doc roles + current counts.

**Outcome**: one table to plan from; no conflicting duplicate backlogs.

---

### 18. MASTER LIST #47, #48, #49 — Key Terms bug fix, static Explain panel, prev/next nav

**Goal**: Fix Key Terms not loading, add instant reference notes on Explain tab, add within-domain prev/next navigation.

**What was done**:
- **#47 Key Terms auto-load fix**: restored missing `useEffect` in `KeyTermsCarousel` (accidentally dropped in Timeline 16). Cards now load on every objective navigation. Curated objectives serve flashcards instantly from `getCurated().flashcards` (no API); non-curated check localStorage cache first then fall back to AI.
- **#48 Static Explain panel**: new `BookRefPanel` component renders `BOOK_REF[objective.id]` content (already in the bundle for all 53 objectives) as an `⚡ QUICK REFERENCE · NO AI` card — shown immediately on non-curated Explain tabs before "Reveal explanation". Zero API cost, instant.
- **#49 Prev/next navigation**: `ObjectiveScreen` now accepts `onSelectObjective` prop and computes domain siblings from `DOMAINS`. Prev/next buttons appear in the objective header — lets you move through a domain's objectives without going back to Home.
- **Build**: `npm run build` passed (925 kB).

**Outcome**: Key Terms now load correctly; non-curated objectives show reference content instantly on the Explain tab; navigation within a domain is one tap.

---

## Open Decisions / Unresolved Questions

1. ~~Domain 5 crosswalk above — confirm before importing Domain 5 questions (QB 5.8 → app 5.4 vs 5.7 is ambiguous).~~ **Resolved**, see Timeline item 13: QB 5.8 → app 5.7.
2. ~~Whether QB 2.9 (WLAN operational params, 13 questions) and QB 5.4 (password policies, 6 questions) become supplemental/unregistered content or get merged into their closest app objective.~~ **Resolved**, see Timeline item 15: QB 2.9 → app 2.8, QB 5.4 → app 5.3.
3. **4.2-4.9 (and similar uncurated objectives) question banks** — need either full curation (item 9) or a "questions-only" partial curated shape once item 3's per-content-type hybrid fallback lands.
4. ~~**Domain 5 bulk import**~~ — **Done**, see Timeline item 16 (144 Qs imported via crosswalk).
5. ~~3.4 multi-area OSPF cluster (12 questions) — shelved or dropped?~~ **Resolved**, see Timeline item 15: `SUPPLEMENTAL` (`supp-ospf-multiarea`), not served under 3.4.

## Next Steps (per ENHANCEMENT_PRIORITIES.md MASTER LIST)

**Next:** #12 — Add test/lint/typecheck tooling.

**Ready anytime:** #46 — Deploy (`npm run build && npx wrangler pages deploy dist --project-name ccna-study-tool`).

**Queued (less AI):** #11 Domain 4 `4.2`–`4.9` import · #42–#45 static-first UX fixes.

See `ENHANCEMENT_PRIORITIES.md` for the full prioritized table (items 1–46).

## Predicted Impact (full rollout)

| | Objectives | % of 53 |
|---|---|---|
| Real (static) questions | 41 | ~77% |
| Still AI-generated | 12 | ~23% |

Remaining AI-only objectives: Domain 1 (1.1-1.4, 1.7, 1.10-1.12 — 8 objectives, no source question bank exists), plus 3.6, 4.10, 5.4, 5.11.
