# Completed Changes

**Audit implementation** — 2026-06-15

- Created `ai-improvement-logs/` with full audit artifact set
- Added `scripts/auditContentCoverage.mjs` + `scripts/generateImprovementLogs.mjs`
- Fixed `studySectionsViewed` / `readingTier` persistence in Study tab
- Unified `computeTrapWeakness` with `groupMissedByTrap`
- Added `EngineerViewSection` + enrichment patches (2.1, 2.5, 3.1, 5.9, 6.x)
- Extracted `ExplainTab` / `QuizTab` to `src/tabs/`
- **2026-06-17** `lab_31_route_lite`: Added LAB-ROUTE-TABLE-31 (teach-first interpret lab for 3.1): 4 tasks using show ip route / ospf / connected / 192.168.2.0; richer CLI_SHOW_OUTPUT with O/S*/C routes; processCliLine now displays show output even when command completes a task objective; 5 new 3.1 skill questions (AD/metric, default route, longest-prefix, L route, C vs L) in ccnaSkillQuestionsExtended.js
