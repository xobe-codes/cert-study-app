# Project Log — CCNA Study App

## 2026-07-27 — Duplicate-folder merge audit

- Confirmed `/Users/zycooks/Documents/Apps/CCNA App` as the canonical Git project.
- Audited the partial `CCNA\ App` directory: 8 identical files, 26 superseded
  variants, and 4 orphan-only artifacts; no active source changes were warranted.
- Preserved the partial directory intact at
  `/Users/zycooks/Documents/Apps/Archives/CCNA App - orphaned files 2026-07-13`.
- Added `MERGE_AUDIT.md` to the archive with classification and recovery details.

## 2026-07-27 — Wrong-answer quality V2 scope

- Reframed `WRONG_ANSWER_DEBRIEF_99_SPEC.md` from the already-shipped P0–P2 UI
  work into an implementation-ready prompt + answer-key + feedback quality plan.
- Added blocking validation, real-ID regressions, six-domain sampling, all question
  types/surfaces, impact metrics, rollout reporting, and explicit completion gates.
- Recorded the current baseline: five records with regen wrong-index defects.
- Corrected the initial validator diagnosis on implementation start: the validator
  already exits `1`; a later command in the earlier diagnostic chain masked that
  status. Domain-scoped reporting remains a needed guardrail.
- Folded the historical `bad_display` work into the same implementation pass:
  reuse the shared question chrome, normalize prose versus structured exhibits,
  fix duplicated/source formatting defects, and verify multi-format mobile display.
- Closed final scope gaps for existing-user cache refresh without progress loss,
  validation of AI-fallback questions before persistence, saved missed-answer index
  safety, choice-format parity, and separately referenced diagram/image exhibits.
- Added a measurable UI/UX release bar: hierarchy and feedback timing, deferred-exam
  answer protection, focus/scroll behavior, keyboard/screen-reader semantics,
  mobile/zoom/contrast/reduced-motion coverage, state recovery, and long-content QA.
- Updated the V2 plan around the current question-health implementation: exactly-once
  flag delivery, aligned reasons, versioned triage/resolution, independent-evidence
  quarantine, mass-quarantine safety brakes, and source-aware automated fix packets
  that validate but never auto-publish factual or answer-key changes.
- Sequenced Lesson Logic & Study Workflow as the required next phase after Question
  V2: fresh alignment baseline from the repaired corpus, stale-queue reconciliation,
  lesson logic/content batches, exact wrong-answer-to-lesson anchors, return-to-retest
  state, lesson UX/progress checks, and safe lesson re-audit automation.
- Strengthened lesson completion to require official sub-objective mappings per
  question, exact deciding-rule/distractor teaching, stable lesson anchors, and a
  consistent readable section spine rather than objective-level CKU/word-count PASS.
- Added `METRICS_TRACKING_99_SPEC.md` as the third sequenced phase after lesson repair,
  covering versioned/idempotent metrics for every question type, learning surface,
  lab/checkpoint, remediation loop, offline resume, and content-health exclusion.
- Added `DOMAIN_PASS_99_SPEC.md` as the post-lesson, pre-metrics phase: canonical
  question-to-domain ownership, healthy blueprint/sub-objective pool manifests,
  fair/deferred/resumable assessments, separate Full/Focus status, exact lesson/lab
  remediation, compatible persistence, and six-domain UI/UX acceptance gates.
- Updated the shared question contract to block unknown/mismatched domain ownership
  and carry one canonical mapping through every surface, cache, flag, exposure,
  Domain Pass, lesson, and metric.
- Moved metrics foundations into the initial Question V2 pass: current-path inventory,
  canonical IDs/content versions, versioned question events, idempotent offline
  handling, compatibility normalization, reconciliation fixtures, and lab/checkpoint
  ID inventory. Final mastery rollups and dashboards remain post-workflow Stage B.
- Added `FULL_APP_SCOPE_AUDIT_99_SPEC.md` after the first two implementation plans.
  It performs a complete reuse-first product/content/workflow/data/UI/accessibility/
  lab/performance/offline/security/engineering audit, reconciles contradictory specs
  and queues, and produces a bounded no-rebuild roadmap before Domain Pass and
  Metrics Stage B priorities are finalized.

**Sync date:** 2026-07-15  
**Active tracking:** [`ai-improvement-logs/IMPLEMENTATION_TRACKER.md`](ai-improvement-logs/IMPLEMENTATION_TRACKER.md) (Cursor's live source of truth)  
**Cursor working dir:** `ai-improvement-logs/` — do not delete

---

# 2026-07-28 — Lab identity, remediation, tracking, and UI pass complete

- Audited all 82 labs against all 53 CCNA objectives and the 1,593-question
  learner-visible runtime bank, reusing the Question V2 canonical marker chain.
- Added structured lab start, checkpoint-attempt, remediation-open, and
  completion events carrying schema version, surface, domain, objective,
  question, CKU/trap, lab, and checkpoint identifiers.
- Fixed a completion mismatch where runtime-enriched tasks could remain visible
  and incomplete after the raw validator had already marked the lab complete.
- Made all 167 stem-replay mappings objective/domain aware and CKU ranked, with
  exhaustive current-bank regression coverage.
- Corrected four Objective 3.6 labs whose topical labels conflicted with their
  canonical Connectivity domain, and repaired the affected per-domain quick
  lab exam pools.
- Strengthened the shared lab validator for identity, ownership, and unique
  checkpoints so the same classes of drift fail automatically in future edits.
- Raised carousel task controls and Verify disclosure to the 44px interaction
  floor. Browser smoke checks passed without horizontal overflow.
- Validation: focused lab gate 509/509, full suite 1,759/1,759, content pipeline,
  production build, 12/12 lab browser tests across 320px, 768px, 1440px, and
  iPhone landscape, and `git diff --check` all passed.
- Existing Vite large-bundle and circular-chunk warnings are unchanged.
- Next planned workflow: lesson alignment/readability, then unified question and
  lab metric reporting using the canonical event markers delivered here.

---

# 2026-07-28 — Lesson alignment/readability and unified metrics complete

- Rebuilt the lesson matrix from the repaired 904-question clean bank: all 53
  objectives now pass reverse CKU alignment and strict readability validation.
- Fixed the only five measured prose gaps through one focused enrichment patch,
  preserving the canonical lesson bank and avoiding a mass rewrite.
- Added stable objective/section/CKU lesson anchors and exact wrong-answer lesson
  remediation carrying the canonical question-pass markers.
- Added a backward-compatible version-2 event envelope and deterministic
  reconciliation for question, lab, lesson, remediation, exclusion, and offline
  duplicate behavior.
- Extended canonical question attempts to Practice, Mock, Domain Pass, Missed
  Retest, Review, Focus, Topic Focus, placement/onboarding, and Trap Drill.
- Added reconciled question/lab activity to the existing Metrics Dashboard and
  repaired its previously missing QuestionHealthAdminSection import.
- Targeted lesson remediation, metrics, and responsive lab browser tests pass;
  production build and content-validation pipeline pass.
- Next and final planned workflow: full-app scope audit.

---

## Status Summary

| Metric | Value |
|--------|-------|
| Objectives covered | **53 / 53** (all Tier A) |
| Labs | **82** (all interpret-only) |
| Trap / flashcard / cmd gaps | **0 / 0 / 0** |
| Unit test files | **134** |
| e2e specs | **38** (6 mobile · a11y ✓) |
| App.jsx size | **~198 lines** |
| Overall scorecard | **99 / 100** |
| Queue pending | **0** (backlog empty) |

Scorecard breakdown from `ai-improvement-logs/APP_SCORECARD.md` (generated 2026-07-09):

| Area | Score |
|------|------:|
| Coverage breadth | 99 |
| Coverage depth | 99 |
| Learning flow | 99 |
| Engineer perspective | 99 |
| CLI verification | 99 |
| Exam traps | 100 |
| Lab coverage | 99 |
| Maintainability | 97 |
| Mobile / accessibility | 99 |
| Tests / CI | 99 |
| **Overall** | **99** |

---

## Timeline

### Items 1–8 — Claude Code sessions (up to commit a2cccf4)

Covered in git history prior to the 2026-07-07 consolidation. Highlights:

- Phases 1–5 of the study app scaffolded (placement flow, objective screen, practice quiz, mock exam, labs hub)
- SRS / Missed Review loop wired
- Subnetting drill and Settings import/export
- `ai-improvement-logs/` directory created with first audit artifact set

### Items 9–23 — Cursor implementation wave (commits since a2cccf4)

All work below shipped via Cursor and is documented in `ai-improvement-logs/COMPLETED_CHANGES.md`.

**2026-06-15**
- Factory exam-trap patches for 22 objectives; zero-trap count eliminated
- `EngineerViewSection` added; engineer-view enrichment for 2.1, 2.5, 3.1, 5.9, 6.x
- `ExplainTab` / `QuizTab` extracted to `src/tabs/`
- Home UI: FOR YOU card accent strips; session recap radius

**2026-06-17**
- Mock study: per-question instant feedback, question summary grid, jump-to-first-wrong
- Content depth: 40 new questions for 10 thin objectives (2.3/2.4/2.6/2.7/2.8/4.3/4.7/4.9/5.2/5.7)
- New labs: wireless arch 2.6, DHCP/DNS 4.3, SSH device access 5.3
- 53 cliEngine unit tests; mobile dvh terminal fix

**2026-06-22**
- `factoryFlashcardPatches.js`: 48 flashcards (2 each) for 24 Tier-C objectives; zero-flashcard count eliminated

**2026-06-29 (P0/P1 crash fixes — functionality audit)**
- Fixed 7 broken routes: `objectiveTabId`, `MAX_QUIZ_SESSION_SIZE`, `preloadCleanBank`, `masteryBreakdown`, `LabsHub`, `SubnetPracticeHome`, hash deep-link tab mapping
- Added `FUNCTIONALITY_AUDIT_REPORT.md`; 78/82 smoke checks passing post-fix

**2026-06-29 (CI guardrails)**
- Import regression tests (`appImportRegression.test.js`, `importContracts.js`)
- SRS smoke test (`srsReviewSmoke.test.js`) with `seedDueReviewBank` helper

**2026-06-30**
- Content depth: HSRP skill questions for 3.5; skill Qs for 5.9/6.1; `questionBankCount` shared
- App shell extraction: tutor/search/modals/sessions → `src/features/`; App.jsx 5071→3401 lines
- Labs: LAB-ROUTE-FORWARD-32, LAB-OSPF-VERIFY-34, LAB-HSRP-VERIFY-35; `cliEngine` show standby/protocols
- Tier-C engineer-view patches (10 objectives) via `factoryEngineerViewPatches.js`
- PWA: SW `ccna-curated-v3` stale-while-revalidate; 9 curated chunks precached at install
- Playwright CI job added

**2026-07-04**
- Stem-replay mappings wave 14 (lab-lite + TS diagnose labs)
- Mock polish: compact mobile answer review, mock debrief lab CTAs, confidence strip CSS
- 25 config labs tiered with INTERPRET/CONFIG badges and interpret alternates
- PWA broadened: 9 curated study chunks precached at install

**2026-07-07**
- Baseline routing: stale v1 remap CTAs, Study Next routing, weak-area dashboard hooks, `validatePlacementBlueprints` CI gate
- **Doc consolidation:** `IMPLEMENTATION_TRACKER.md` replaces AGENT_NEXT_STEPS / SCORE_95_TARGET / HIGH_IMPACT / PROJECT_LOG / ENHANCEMENT_PRIORITIES for active tracking
- `score_99_push`: 10-dimension audit rubric (mobile/a11y + tests/CI); extracted `ObjectiveBody.jsx`; split `cliEngine.js`→`cliProcess.js` and `appShell.js`→`appShellResponsiveCss.js`; a11y-smoke e2e in ship gate; overall 93→**99**
- Labs Hub ordered into 7 modules (Foundation→Capstone); `labModules.test.js` coverage lock

**2026-07-10**
- Question debrief 99+: stem-grounded wrong-answer rebuild; AnswerReview order (miss→family chip→correct); Trap/Wildcard remediation; CI validates runtime-applied reviews
- Topology SVG 99+: device silhouettes, iPhone type floors, landscape clamps, pinch/pan expand modal, `diagram-iphone-smoke` e2e
- Polish 99+: AnswerReview parity across Mock/Review/Focus/Placement; home Domain Pass + Fix Next hierarchy; diagram type/shortLabel wave; Study diagram earlier; reveal CSS
- Gold batches 31–33 (40 short/high-traffic debriefs each); trap waves 22–23 (+2 traps/obj → avg ≈14)
- Teach-first orchestration: coach soft gates, post-study retention, trap handoffs, lab verify cue, practice exposure
- Bank-wide visual packs; domain-6 visual packs for all 6 objectives
- Confidence ratings wired into SRS/practice mix; IOS mode context on CLI syntax questions
- Parametric pass: thin-objective families + pattern-clone expansion; Content Health Process
- Routing-table exhibit UI and `bad_display` question flag; Missed Review crash fix (CLI/ordering)
- Domain Pass session persistence across trap drill / Command Hub / Study / lab returns

**2026-07-14**
- **Phase 3: Advanced Validation Features** — Lab Testing & Validation Framework Part 2 (continued from Phase 1-2 CLI validation)
  - `src/features/labs/advancedMistakes.ts` (10 advanced mistake patterns):
    * RoutingLoop: conflicting routes causing traffic loops
    * MTUMismatch: mismatched MTU values on interfaces
    * HelloTimerMismatch: OSPF hello/dead timer mismatches preventing adjacency
    * ACLBlocksTraffic: ACL rules denying required traffic
    * NATConflict: overlapping NAT rules causing translation conflicts
    * SubnetConflict: duplicate/overlapping subnets on different interfaces
    * ConfigIncomplete: OSPF configured but missing network statements
    * UnexpectedShutdown: interface in shutdown state blocking traffic
    * CostMismatch: incorrect OSPF costs affecting route selection
    * DeadIntervalMismatch: dead interval mismatch in OSPF neighbors
    * Each pattern includes detection logic, problem description, root cause explanation, detection method, step-by-step fix, and common misconception
  - `src/features/labs/contextualFeedback.ts` (intelligent error messaging):
    * enhanceBasicMistakeMessage() & enhanceAdvancedMistakeMessage() — contextual feedback with "why" + "how" + misconception
    * formatFeedbackForDisplay() — user-friendly formatted output
    * aggregateMultipleErrors() — batch error handling with severity sorting
    * generateAdaptiveFeedback() — escalating guidance based on attempt number
    * trackFeedbackSession() & getLearningInsights() — feedback analytics
  - `src/features/labs/progressiveDifficulty.ts` (difficulty adaptation):
    * Easy labs: max 2 mistakes, full hints (level 3), partial credit allowed, retry enabled
    * Medium labs: max 1 mistake, limited hints (level 2), no partial credit, retry enabled
    * Hard labs: 0 mistakes (strict mode), minimal hints (level 1), no partial credit, no retry
    * evaluatePerformance() — adapt difficulty based on accuracy/attempts
    * calculateLabScore() — difficulty-multiplied scoring (easy 1x, medium 1.25x, hard 1.5x)
    * detectPlateauing() — detect when user is stuck or dominating
    * getBadgeEarned() — award master/warrior/sharpshooter/speedrunner badges
    * estimateTimeToComplete() — personalized time estimates based on success rate
  - `src/__tests__/advancedValidation.test.ts` (59 comprehensive tests):
    * 12 tests for advanced mistake detection patterns
    * 12 tests for contextual feedback system (formatting, adaptive generation, session tracking, insights)
    * 35 tests for progressive difficulty (settings, failure logic, performance evaluation, recommendations, scoring, progression, badges)
- Fixes: Type correction (AdvancedMismatch → AdvancedMistake), plateau detection threshold refinement
- All 165 lab-related tests passing (59 new + 106 existing); no regressions in lab framework

---

## 2026-07-10 — P5: Wave/Patch Architecture Audit (Claude Code)

Investigated the full data architecture to assess consolidation opportunities and identify thin objectives.

**Architecture confirmed:**
- `cleanQuestions/domain-{1-6}.js` — sole source for the quiz question pool, served by `cleanQuestionAdapter.js`
- `tierBTrapWave{4-23}Patches.js` (20 files) + `contentDepthWave{3-11}Patches.js` (9 files) — contribute `examTraps`, `flashcards`, and supplemental questions via `contentEnrichmentPatches.js → applyContentEnrichment()`. NOT quiz pool questions.
- `goldAnswerReviewsBatch{2-32}.js` (32 files) — static lookup overrides for answer review display only.

**No files deleted/merged** — all wave files are actively imported. Merging is cosmetic with real breakage risk; deferred.

**Pool depth audit findings:**
- CRITICAL thin: 5.9 (4 Qs), 4.9 (5 Qs)
- LOW: 6.1 (6 Qs), 2.7 (7 Qs), 5.2 (7 Qs)
- FLOOR (8 Qs): 1.1–1.4, 1.7, 1.9–1.12, 2.1, 2.2
- Pre-audit claim "3.5 has 1 question" is outdated — 3.5 now has 30 questions.

Full report: `ai-improvement-logs/WAVE_CONSOLIDATION_REPORT.md`

---

## Lab Testing Framework — Full Deployment Complete

**2026-07-15:** All 4 phases implemented and deployed to production:
- **Phase 1 (CLI Validation):** 82 tests ✅ — command normalization, output validation, state comparison, sequences, checkpoints, hints, mistake detection
- **Phase 2 (Device Simulator):** 57 tests ✅ — device state model, command simulator (20+ IOS commands), realistic output generation
- **Phase 3 (Advanced Validation):** 59 tests ✅ — 10 mistake patterns, contextual feedback, progressive difficulty (easy/medium/hard)
- **Phase 4 (Gamification):** 40+ tests ✅ — badges (6 types), leaderboard (with anomaly detection), progress dashboard, encouragement messages
- **Commit:** `50135c0` — 19 new files, 11,747 lines, 321+ tests (1,990/2,049 passing)
- **Deployment:** Live at https://ccna-study-tool.pages.dev

---

## Next Planned Work (Queued Implementation)

### 1. Missed Commands Review System
**Spec:** `src/answerReview/missedCommandsReviewSpec.md` (647 lines)
- **Problem:** Students miss 47–100 commands but reviewing requires scrolling 900+ command bank
- **Solution:** Dedicated dashboard showing ONLY missed commands, sorted by frequency/recency
- **Features:** Detail view + mistake context + related commands + mark learned + spaced rep scheduling
- **MVP:** Week 1 (list, sort, detail, mark learned, basic scheduling)
- **Phase 2:** Week 2 (filtering, recommendations, sessions)
- **Phase 3:** Week 3 (gamification, badges, analytics)
- **Status:** Ready to implement (2-3 weeks for full)

### 2. Commands in Domain Practice Tests
**Spec:** `src/answerReview/commandsInDomainPracticeSpec.md` (355 lines)
- **Problem:** Commands studied separately in Command Hub; no domain context on real exam
- **Solution:** Weave command questions into domain practice tests (not separate)
- **Features:** Mixed MC + command questions (configurable density 0–50%) + combined scoring + command-to-domain mapping
- **Scoring:** Questions 60% + Commands 40% = Domain Score
- **Phase 1:** Week 1 (plumbing — add question type, component, injection)
- **Phase 2:** Week 2 (content — map 100+ commands to domains, write 50+ scenarios)
- **Phase 3:** Week 3 (polish — settings, dashboard breakdown, spaced rep integration)
- **Dependencies:** Uses CommandSimulator + DeviceState from Phase 2 (✅ already built)
- **Status:** Ready to implement (2-3 weeks for full)

**Queue order:** Implement Missed Commands Review first, then Commands in Domain Practice.

---

## Source files for this sync (2026-07-15)

- `src/answerReview/missedCommandsReviewSpec.md` (647 lines) — new feature spec
- `src/answerReview/commandsInDomainPracticeSpec.md` (355 lines) — new feature spec
- `PROJECT_LOG.md` (this file) — updated with Phase 2–4 completion + queue

---

## Source files for this sync

- `ai-improvement-logs/APP_SCORECARD.md` (generated 2026-07-09)
- `ai-improvement-logs/COMPLETED_CHANGES.md`
- `ai-improvement-logs/FUNCTIONALITY_AUDIT_REPORT.md`
- `ai-improvement-logs/IMPLEMENTATION_TRACKER.md`
- `git log --oneline -20` (most recent 20 commits as of 2026-07-10)
# 2026-07-27 — Question V2 Domain 1 implementation baseline

- Adopted domain-by-domain delivery, beginning with Domain 1 (Network
  Fundamentals).
- Added domain-scoped regeneration and Question V2 audit tooling.
- Domain 1 result: 106/106 questions and 296/296 distractors covered; zero audit
  findings or regeneration schema errors.
- Fixed Practice answer tracking so multi-select no longer double-logs and
  ordering/CLI use the shared outcome path.
- New answer events now carry backward-compatible schema version, canonical
  domain, surface, response type, and canonical selected index/set fields.
- Validation: 17 targeted tests passed and `git diff --check` passed.
- Audit report: `ai-improvement-logs/QUESTION_LOGIC_WRONG_ANSWER_AUDIT.md`.
- Remaining before Domain 1 closure: Missed Retest tracking reconciliation and
  responsive/accessibility UI verification.

---
# 2026-07-28 — Question V2 Domain 1 complete

- Closed Domain 1 after full-bank structural validation plus live shared-renderer
  verification.
- Live testing caught legacy generic wrong-answer filler that the original audit
  missed; the renderer now prefers a specific gold explanation when legacy
  structured fields are generic.
- Missed Retest now records the same canonical answer event as Practice.
- Fixed question-feedback touch targets at 320px, 768px, and 1440px; all tested
  widths have no horizontal overflow, no sub-44px active-flow controls, a live
  result status, and non-color correctness cues.
- Validation: 70 targeted tests passed, Domain 1 audit and coverage passed,
  production build passed, and `git diff --check` passed.
- Implementation report:
  `ai-improvement-logs/QUESTION_LOGIC_WRONG_ANSWER_IMPLEMENTATION_REPORT.md`.
- Next domain: Domain 2 — Network Access.

---

# 2026-07-28 — Question V2 Domain 2 complete

- Validated 130/130 Network Access questions and 388/388 distractors with zero
  schema or Question V2 audit findings.
- Corrected the legacy source-map drift that placed ten Telnet/TACACS+/device
  management questions under current Objective 2.8 (WLAN client connectivity).
  The questions are preserved on the Domain 2 out-of-scope shelf and excluded
  from future regeneration.
- Fixed duplicate WLC exhibit compilation and added regression coverage.
- Moved the supplemental SNMP question from 2.8 to canonical Objective 4.4.
- Added saved-bank reconciliation: curated objectives now replace stale question
  content with the current canonical pool while preserving attempts, ratings,
  and SRS history. Retired IDs are also filtered at shared bank load time.
- Validation: all 1,727 tests passed, Domain 2 coverage and audit passed,
  production build passed, and `git diff --check` passed.
- Lesson follow-up: Objective 2.8's main lesson is aligned, but legacy
  management-access flashcards remain and are queued for the lesson-alignment
  pass rather than being mixed into the Question V2 content pass.
- Next domain: Domain 3 — IP Connectivity.

---

# 2026-07-28 — Question V2 Domain 3 complete

- Completed the cumulative IP Connectivity pass across all six objectives.
- Clean-bank result: 249/249 questions and 745/745 distractors covered with
  zero Question V2 findings. Runtime result: all 331 learner-visible questions
  (clean + skill + enrichment) audited with zero findings.
- Removed a routing-config comment that disclosed the answer before the learner
  responded.
- Recompiled Domain 3 with exhibit deduplication, eliminating repeated routing-
  table and OSPF exhibit blocks that existed only in the runtime module.
- Corrected Domain 3 manifests to include Objective 3.6 and the true 249-question
  total; aligned 3.5/3.6 clean-bank titles to the current app objectives.
- Fixed runtime multi-select shaping so a question cannot expose both
  `correctIndex` and `correctIndexes`.
- Improved generic fallback debriefs with stem/explanation evidence and made the
  audit distinguish a legacy short label followed by genuinely specific
  feedback.
- Added `auditQuestionV2 --runtime`; this runtime audit is now required for
  Domains 4–6 because clean-bank-only checks cannot see enrichment regressions.
- Live wrong-answer walkthrough passed with specific, non-color feedback.
  Responsive verification at 320px, 768px, and 1440px found and fixed remaining
  36–40px Study/Practice/banner controls; all active targets are now at least
  44px with no horizontal overflow.
- Validation: all 1,728 tests passed, production build passed, and
  `git diff --check` passed. Existing build warnings are unchanged.
- Next domain: Domain 4 — IP Services.

## Checks learned for every remaining domain

1. Audit the canonical clean bank and the merged learner-visible runtime pool.
2. Compare generated runtime stems with clean stems to catch compile-only exhibit
   duplication and answer leaks.
3. Verify every objective is represented in both domain and global manifests.
4. Validate multi-select keys after runtime reshaping, not just source JSON.
5. Walk through a real wrong answer and measure every active control at mobile,
   tablet, and desktop widths.
6. Run placement/downstream tests, the full suite, and the production build.

---

# 2026-07-28 — Question V2 Domain 4 complete

- Completed the cumulative IP Services pass across all ten objectives.
- Clean-bank result: 130/130 questions and 388/388 distractors covered with zero
  findings. Runtime result: all 267 learner-visible questions audited with zero
  findings.
- Corrected two factual answer-key failures rather than merely silencing schema
  errors:
  - The 179.43.44.0/28 NAT pool now uses `.2–.14` with `/28`; `.1` is assigned
    to the router and `.15` is broadcast.
  - TFTP boot configuration now uses `boot system tftp <image> <server-ip>` in
    valid IOS argument order.
- Repaired clean-bank reviews, regenerated distractor records, gold reviews,
  hand-curated content, and imported source records so future rebuilds cannot
  restore the old keys.
- Fixed the Question V2 choice normalizer so a meaningful CLI wildcard (`*`)
  is not stripped as though it were Markdown emphasis.
- Added Objective 4.10 to both manifests, corrected the Domain 4 total to 130,
  and aligned all clean-bank titles with current app objectives.
- Found 23 cross-objective CKU tags that caused NAT, NTP, DHCP/DNS, SNMP,
  syslog, QoS, SSH, and TFTP questions to credit the wrong tracking concepts.
  Runtime normalization now removes those tags, with Domain 4 integrity tests.
- Process lesson: lesson/question CKU coverage can falsely pass when both sides
  inherit the same bad tag. Domains 5–6 must include a semantic cross-objective
  CKU review in addition to the numerical alignment matrix.
- Live wrong-answer and responsive checks passed at 320px, 768px, and 1440px:
  specific feedback, non-color state, flag/lab/confidence actions, no overflow,
  and no active target below 44×44px.
- Validation: all 1,732 tests passed, production build passed, and
  `git diff --check` passed. Existing Vite warnings are unchanged.
- Next domain: Domain 5 — Security Fundamentals.

---

# 2026-07-28 — Question V2 Domains 5 and 6 complete

- Completed the combined Security Fundamentals and Automation & Programmability
  pass across all 17 objectives.
- Domain 5 clean-bank result: 189/189 questions and 565/565 distractors covered;
  runtime result: 330 learner-visible questions. Domain 6 clean-bank result:
  100/100 questions and 300/300 distractors covered; runtime result: 187
  learner-visible questions. All four clean/runtime audits finish with zero
  findings.
- Repaired two stale regenerated-review mappings whose distractor indexes
  included the correct answer: the SOHO WPA2 question and the malformed-JSON
  question now cover exactly their three wrong choices.
- Removed ambiguity from the smart-card MFA stem by explicitly stating the
  separate card and PIN/passphrase factors.
- Added readable multiline JSON exhibits for four automation questions while
  preserving their intentional syntax defects.
- Restored Objectives 5.4 and 5.11 to both manifests, corrected the Domain 5
  total to 189, and aligned Domain 5/6 clean titles to the current objectives.
- Removed seven clear distractor-only CKU assignments so RADIUS, port security,
  RESTCONF, Cisco DNA Center, and ESP no longer receive false mastery credit.
- Live testing found that a fallback could interpret “SSID broadcast” as
  Ethernet flooding. The shared generator now recognizes the WLAN context and
  explains SSID hiding as obscurity rather than authentication.
- Live Domain 5/6 wrong-answer walkthroughs passed. Responsive verification at
  320px, 768px, and 1440px found no horizontal overflow and no active target
  below 44×44px.
- Validation: all 1,736 tests passed, production build passed, Domain 5/6
  runtime audits passed, and `git diff --check` passed. Existing Vite warnings
  are unchanged.
- The domain-by-domain Question V2 pass is complete. Next planned workflow:
  lesson alignment/readability, followed by full question/lab metric tracking.

---
