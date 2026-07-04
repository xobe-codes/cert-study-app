# Agent Next Steps

1. Read `APP_AUDIT_SUMMARY.md` → `DO_NOT_TOUCH.md` → `IMPLEMENTATION_QUEUE.json`
2. Pick **one** pending queue item (`npm run audit:show-next-task`)
3. Smallest safe diff; no theme/route changes; no live AI on load
4. Run `npm run verify:ship`
5. Mark queue item `done` via `npm run audit:mark-done -- <id> "summary"`

## Coverage snapshot (2026-07-04)
- **53 objectives** · Tier A: **53** · B: 0 · C: 0
- **Zero traps: 0** · **Zero flashcards: 0** · **Zero cmds: 0**
- **82 labs** (57 interpret-only · 25 config)
- **Overall score: ~91/100** (see `APP_SCORECARD.md`)

## Queue status — polish phase
Run `npm run audit:show-next-task` for the highest-priority **pending** item.

| Priority | Typical next ids | area |
|----------|------------------|------|
| **Next** | `stem_replay_wave14` | Missed Q → lab CTAs for new lab-lite |
| medium | `depth_trap_wave14` | +1 trap for 0 objs at floor |
| medium | `learning_flow_mock_polish` | Mobile Practice + mock debrief |
| low | `config_lab_strategy` | 25 config labs tiering |

## Recently completed
- Gap closure: waves 2/11/13 + lab-lite (EC, AAA, DHCP, OSPF, NAT, TS) — **53/53 Tier A**
- `extract_app_shell_modules`, `pwa_offline_curated`, trap waves 12–13, reading commands waves 1–2

See `AUDIT_SHORTCUTS.md` or run `npm run audit:help`.

