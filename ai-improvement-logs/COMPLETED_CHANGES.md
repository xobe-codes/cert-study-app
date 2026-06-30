# Completed Changes

**Audit implementation** — 2026-06-15

- Created `ai-improvement-logs/` with full audit artifact set
- Added `scripts/auditContentCoverage.mjs` + `scripts/generateImprovementLogs.mjs`
- Fixed `studySectionsViewed` / `readingTier` persistence in Study tab
- Unified `computeTrapWeakness` with `groupMissedByTrap`
- Added `EngineerViewSection` + enrichment patches (2.1, 2.5, 3.1, 5.9, 6.x)
- Extracted `ExplainTab` / `QuizTab` to `src/tabs/`

## 2026-06-15 (audit refresh)
- Added `factoryTrapPatches.js` — 2 exam traps × 22 factory objectives (zero-trap → 0)
- Wired factory traps through `applyContentEnrichment` merge pipeline
- Home UI: FOR YOU cards use `homeAccentStrip`; session recap inner box radius 14
- Regenerated coverage logs (`zeroTraps: []`, tier counts unchanged)
- **2026-06-15** `lab_31_route_lite`: Added LAB-31-ROUTE-INTERPRET teach-first verify lab for objective 3.1

## 2026-06-17 (95+ pass)
- Mock study: instant per-question feedback, question summary grid, jump-to-first-wrong on done screen
- **2026-06-17** `lab_31_route_lite`: Added LAB-ROUTE-TABLE-31 in extended labs; richer CLI show ip route output; 5 new 3.1 skill questions
- Content depth: 40 new questions for 10 thin objectives (2.3/2.4/2.6/2.7/2.8/4.3/4.7/4.9/5.2/5.7)
- Labs: wireless arch 2.6, DHCP/DNS 4.3, SSH device access 5.3
- Tests: 53 cliEngine unit tests; mobile dvh terminal fix
- **2026-06-22** `bulk_factory_flashcards`: Added factoryFlashcardPatches.js — 48 flashcards (2 each) for 24 Tier C objectives; wired merge in contentEnrichmentPatches applyContentEnrichment

## 2026-06-29 (functionality audit — P0/P1 fixes)
- Fixed missing imports after Study/Practice tab extraction: `objectiveTabId`, `objectivePanelId`, `MAX_QUIZ_SESSION_SIZE`, `preloadCleanBank`, `masteryBreakdown`, `parseRichTextSegments` in `studyQuizTabs.jsx` / `App.jsx`
- Fixed missing `LabsHub` and `SubnetPracticeHome` imports in `App.jsx` (Labs Hub + Subnetting routes crashed)
- Exported `masteryBreakdown` from `masteryCriteria.js` for shared quiz session logic
- Fixed hash deep link `#/objective/:id/practice` — case-insensitive tab mapping in `ObjectiveScreen.jsx`
- Added `ai-improvement-logs/FUNCTIONALITY_AUDIT_REPORT.md`

## 2026-06-29 (audit follow-ups — CI guardrails + SRS smoke)
- Added import regression tests (`appImportRegression.test.js`, `importContracts.js`) — runs in CI via `npm test`
- Extracted SRS review queue to `src/quiz/srsReview.js` with `seedDueReviewBank` test helper
- Added `srsReviewSmoke.test.js` — seeds due items, verifies count/load/reschedule cycle
- Added `content_depth_35_hsrp` queue item (critical) for objective 3.5 thin bank (1 Q)

## 2026-06-29 (content_depth_35_hsrp)
- Added 2 HSRP troubleshooting skill questions for 3.5 in `ccnaSkillQuestionsExtended.js` (33 total bank items: 30 clean + 3 skill)
- Fixed `auditContentCoverage.mjs` to count compiled clean bank + skill (was 1 without preload)
- Added `contentDepth35.test.js`, `reviewDailySmoke.test.js`; optional `e2e/review-daily.spec.js` + `npm run test:e2e` (Playwright)
- **2026-06-30** `content_depth_35_hsrp`: Added 2 HSRP troubleshooting skill questions; fixed audit scanner to count clean bank; review smoke tests
- **2026-06-30** `content_depth_wave2`: Skill questions for 5.9/6.1; shared questionBankCount; Playwright CI job
- **2026-06-30** `extract_app_shell_modules`: Extract tutor/search/modals/sessions to src/features/; App.jsx 5071→3401 lines (−1670)
- **2026-06-30** `labs_connectivity_wave`: Added LAB-ROUTE-FORWARD-32, LAB-OSPF-VERIFY-34, LAB-HSRP-VERIFY-35 + cliEngine show standby/protocols
- **2026-06-30** `engineer_view_tier_c`: 10 Tier C engineerView patches via factoryEngineerViewPatches.js
- **2026-06-30** `pwa_offline_curated`: SW ccna-curated-v3 stale-while-revalidate for question chunks
