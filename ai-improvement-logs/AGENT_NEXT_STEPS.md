# Agent Next Steps

1. Read `APP_AUDIT_SUMMARY.md` → `DO_NOT_TOUCH.md` → `IMPLEMENTATION_QUEUE.json`
2. Pick **one** pending queue item (`npm run audit:show-next-task`)
3. Smallest safe diff; no theme/route changes; no live AI on load
4. Run `npm run audit:test-and-build`
5. Update `COMPLETED_CHANGES.md` and mark queue item `done`

## Completed in this audit implementation
- Phase 2: `ai-improvement-logs/` created
- Phase 3: Reading checklist + weak-area trap unification
- Phase 4: Engineer View pilot on 2.1
- Phase 5: Enrichment patches (2.5, 3.1, 5.9, 6.x)
- Phase 6: `audit:coverage` scanner
- Phase 8: ExplainTab/QuizTab extracted to `src/tabs/`

## Next high-value queue items
- 3.1 routing-table lab-lite (`lab_31_route_lite`) — run `npm run audit:show-next-task`
- Bulk factory flashcard enrichment (24 objectives)
- 5.9 additional clean-bank questions
- PWA offline curated shell cache

## Audit shortcuts
See `AUDIT_SHORTCUTS.md` or run `npm run audit:help`.

## Completed this run
- `bulk_factory_traps`: 44 traps across 22 factory objectives via `factoryTrapPatches.js`
- Home UI uniformity: `homeAccentStrip` on FOR YOU cards, border-radius 14 on session recap

