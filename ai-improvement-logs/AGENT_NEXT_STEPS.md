# Agent Next Steps

1. Read `APP_AUDIT_SUMMARY.md` → `DO_NOT_TOUCH.md` → `IMPLEMENTATION_QUEUE.json`
2. Pick **one** pending queue item (`npm run audit:show-next-task`)
3. Smallest safe diff; no theme/route changes; no live AI on load
4. Run `npm run audit:test-and-build`
5. Mark queue item `done` via `npm run audit:mark-done -- <id> "summary"`

## Coverage snapshot (2026-06-22)
- **53 objectives** · Tier A: 11 · B: 11 · C: 31
- **Zero traps: 0** · **Zero flashcards: 0**
- **31 objectives** still below 8 questions (wave 2 queued)
- **270 tests** pass · build clean

## Queue status (16 items — 11 done, 5 pending)

| Priority | id | area |
|----------|-----|------|
| **Next** | `content_depth_wave2` | 31 objs → ≥8 MC questions each |
| high | `extract_app_shell_modules` | App.jsx tutor/search/modals → `src/features/` |
| high | `labs_connectivity_wave` | 3.2 VLSM, 3.4 OSPF, 3.5 HSRP labs |
| medium | `engineer_view_tier_c` | Bulk engineerView for Tier C verify |
| medium | `pwa_offline_curated` | Offline curated Study/Practice cache |

Run `npm run audit:show-next-task` for acceptance criteria and file hints.

## Recently completed
- `bulk_factory_flashcards` — 48 flashcards (2×24 Tier C objectives) via `factoryFlashcardPatches.js`
- `lab_31_route_lite`, mock study instant feedback, cliEngine tests, 3 new labs, content depth wave 1
- `bulk_factory_traps` — 44 traps across 22 factory objectives

## Known follow-ups (not queued)
- `validate:pipeline` — `1.1/1.1-c-q3` missing incorrect answerReview for choiceIndex 0
- Close superseded draft PRs #1–#4 (work merged to master)

## Audit shortcuts
See `AUDIT_SHORTCUTS.md` or run `npm run audit:help`.
