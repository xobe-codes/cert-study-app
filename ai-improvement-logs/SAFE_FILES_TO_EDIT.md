# Safe Files to Edit

## Content (highest impact)
- `src/data/ccnaCurated.js` — hand-curated rich packs
- `src/data/contentEnrichmentPatches.js` — additive merges
- `src/data/curatedReadingSupplement*.js`, `src/data/kbCompiledPatches.js`
- `data/clean-question-bank/` — canonical quiz bank
- `src/data/ccnaSkillQuestionsExtended.js`

## Learning flow
- `src/lesson/masteryCriteria.js`
- `src/weaknessUtils.js`, `src/missed/missedTrapGroups.js`
- `src/tabs/ExplainTab.jsx` (Study tab)
- `src/components/MasteryChecklist.jsx`, `src/components/EngineerViewSection.jsx`

## Scripts (build-time only)
- `scripts/auditContentCoverage.mjs`
- `scripts/generateImprovementLogs.mjs`
- `scripts/validate*.mjs`

## Avoid without explicit approval
- `src/ui/appTheme.js`
- Routing / `ObjectiveScreen.jsx` tab structure
- `.env*`

