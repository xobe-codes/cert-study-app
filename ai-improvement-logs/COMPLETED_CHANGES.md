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
