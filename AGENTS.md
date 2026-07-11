# CCNA Study App — Agent entry point

**North star:** 99+ overall quality. **Current:** ~93/100. See `ai-improvement-logs/IMPLEMENTATION_TRACKER.md`.

## Session start (read in order)

1. `ai-improvement-logs/ACTIVE_HANDOFF.md` (if Status ≠ DONE — continue; don’t restart)
2. `ai-improvement-logs/IMPLEMENTATION_TRACKER.md`
3. `ai-improvement-logs/DO_NOT_TOUCH.md`
4. `ai-improvement-logs/IMPLEMENTATION_QUEUE.json`
5. `npm run audit:show-next-task`

## Audit pass (one queue item)

```bash
npm run audit:scan-and-refresh   # optional after content changes
npm run audit:show-next-task
# … implement ONE item …
npm run verify:ship
npm run audit:mark-done -- <queue-id> "what shipped"
```

`verify:ship` = unit tests + production build + ship e2e (`ship-smoke`, domain-pass, mock-exam).

Or say: **audit pass** / **implement next** — Cursor rules trigger the same playbook.

## Ship

User must say **c&d**, **commit & deploy**, or **ship it**. Then: **`npm run verify:ship`** → commit → push → `wrangler pages deploy`.

## Every implementation must end with

- **Changes table** (file | change)
- **Path to 99+** (what moved, what blocks, top 1–3 next moves)

## Safe to edit

`ai-improvement-logs/SAFE_FILES_TO_EDIT.md` — content patches, `src/lab/`, `src/tabs/`, `scripts/`.

## Do not touch

Theme tokens (`src/ui/appTheme.js`), hash routing in `App.jsx`, `.env*`, live AI on page load (curated-first).

## Commands

| Command | Purpose |
|---------|---------|
| `npm run verify:ship` | Unit + build + ship e2e smoke (run before every c&d) |
| `npm run audit:help` | All audit shortcuts |
| `npm run audit:full` | Scan → refresh → UI check → test/build → summary |
| `npm run audit:mark-done` | Mark queue item done + append COMPLETED_CHANGES |

## CI

Push/PR to `master`: GitHub Actions runs `npm test` && `npm run build` (see `.github/workflows/`).
