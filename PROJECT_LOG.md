# Project Log — CCNA Study App

A running log of work done, decisions made, and current state — written so anyone (or a future Claude Code session) can read this cold and pick up where things left off.

See also: [PROJECT_PROFILE_V1.md](PROJECT_PROFILE_V1.md) (structure/stack), [COMMANDS_V1.md](COMMANDS_V1.md) (commands), [RISKY_AREAS_V1.md](RISKY_AREAS_V1.md) (what needs approval).

---

## Status Summary (as of 2026-06-13)

- **Curated objectives**: 11 of 53 have static, source-grounded content + questions (no AI needed): `1.5`, `1.6`, `1.8`, `1.9`, `2.1`, `2.2`, `2.5`, `3.2`, `3.4`, `4.1`, `5.5`.
- **Hands-on labs**: 6 labs across 6 domains — VLAN/Trunking (2.1), OSPF (3.4), NAT (4.1), Static/Floating routing (3.3), SSH (4.8), DAI (5.6).
- **Question bank**: 898 questions extracted/validated from Domains 2-6 (see "Question Bank Validation" below). **Decision made to exclude 14** (3.4 multi-area OSPF cluster) → **884 importable**. **12 imported so far** (4.1, see Timeline item 9) → 872 remaining.
- **Command Center setup**: Global rules + 3 skills (`/project-scan`, `/usage-plan`, `/phase1`) installed at `~/.claude/`. Project files created and committed (now named `PROJECT_PROFILE_V1.md`, `COMMANDS_V1.md`, `RISKY_AREAS_V1.md` — renamed with a `_V1` suffix after initial creation).
- **Next planned work**: MASTER SEQUENCE item 2 (resolve `_V1` file naming) or item 3 (per-content-type hybrid fallback in `App.jsx`) — see `ENHANCEMENT_PRIORITIES.md`.
- **Predicted outcome of full rollout**: ~77% of objectives (41/53) get static questions; ~23% (12/53) remain AI-only (mostly Domain 1, which has no question-bank source yet).

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
- Created and committed project files (commit `bd31a3a`), later renamed with a `_V1` suffix (commit `2b187b4`):
  - `PROJECT_PROFILE_V1.md`, `COMMANDS_V1.md`, `RISKY_AREAS_V1.md`.

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
| 5.8 | AAA concepts | **5.7** (or 5.4 — ambiguous) |
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

---

## Open Decisions / Unresolved Questions

1. Domain 5 crosswalk above — confirm before importing Domain 5 questions (QB 5.8 → app 5.4 vs 5.7 is ambiguous).
2. Whether QB 2.9 (WLAN operational params, 13 questions) and QB 5.4 (password policies, 6 questions) become supplemental/unregistered content or get merged into their closest app objective.
3. **4.2-4.9 (and similar uncurated objectives) question banks** — need either full curation (item 9) or a "questions-only" partial curated shape once item 3's per-content-type hybrid fallback lands.

## Next Steps (in order, per ENHANCEMENT_PRIORITIES.md MASTER SEQUENCE)

1. ~~Import question bank — Domain 4 (4.1 pilot)~~ — **done**, see Timeline item 9.
2. Resolve `_V1` file naming (housekeeping, low risk).
3. Per-content-type hybrid fallback in `App.jsx` — would unblock 4.2-4.9 etc.
4-5. Diagnostic placement test / Exam Readiness Score — not blocked, optional checkpoint breaks.

## Predicted Impact (full rollout)

| | Objectives | % of 53 |
|---|---|---|
| Real (static) questions | 41 | ~77% |
| Still AI-generated | 12 | ~23% |

Remaining AI-only objectives: Domain 1 (1.1-1.4, 1.7, 1.10-1.12 — 8 objectives, no source question bank exists), plus 3.6, 4.10, 5.4, 5.11.
