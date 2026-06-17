# Audit Shortcuts

Run one step at a time — names describe what each command does.

## npm commands

| Command | When to use it |
|---------|----------------|
| `npm run audit:scan-content` | After content changes — scans 53 objectives → `coverage-data.json` |
| `npm run audit:refresh-logs` | After scan — regenerates all `ai-improvement-logs/` reports |
| `npm run audit:scan-and-refresh` | **Most common** — scan + refresh logs together |
| `npm run audit:check-home-ui` | After Home screen edits — checks mobile/UI patterns |
| `npm run audit:show-next-task` | Before coding — prints next queue item to implement |
| `npm run audit:test-and-build` | After any code change — runs tests + production build |
| `npm run audit:print-summary` | Quick status — tiers, gaps, queue counts in terminal |
| `npm run audit:full` | Full automated pass (scan → refresh → UI → test/build → summary) |
| `npm run audit:help` | List all commands |

## Typical workflows

**Content-only update**
```bash
npm run audit:scan-and-refresh
npm run audit:print-summary
```

**Ship a queue fix**
```bash
npm run audit:show-next-task    # pick task
# … implement …
npm run audit:test-and-build
```

**Home UI change**
```bash
npm run audit:check-home-ui
npm run audit:test-and-build
```

**Full agent audit (no implementation)**
```bash
npm run audit:full
```

## Combine phases manually

```bash
node scripts/runAudit.mjs --phase scan-content,check-home-ui,test-and-build
```

Legacy numbers still work: `--phase 1,2,5`

## Low-level scripts (optional)

| Command | Same as |
|---------|---------|
| `npm run audit:coverage` | `audit:scan-content` (direct script) |
| `npm run generate:improvement-logs` | `audit:refresh-logs` (direct script) |

## Notes

- `audit:refresh-logs` preserves `done` statuses in `IMPLEMENTATION_QUEUE.json`.
- `COMPLETED_CHANGES.md` is not overwritten if it already exists.
- `audit:show-next-task` only prints the task — implementation is agent/manual work.
