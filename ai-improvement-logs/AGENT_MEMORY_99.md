# Agent memory 99

North star for **session memory** (handoffs, notes, resume prompts) so new chats start sharp without reloading planning essays.

**Current ~70 → 99:** file-first handoffs, one schema, bounded size, spine locks, archive on DONE.

## Why this exists

Chat transcripts are bad memory: they bloat context, go stale, and vanish when you split chats. A small, always-current file beats “scroll up and find the last plan.”

## 99 bar

| Dimension | 99+ | Fail |
|-----------|-----|------|
| Source of truth | One live file: `ACTIVE_HANDOFF.md` | HANDOFF only in chat paste |
| Schema | Single HANDOFF shape (below) | Two competing templates |
| Size | ≤ ~40 lines; paths + bullets only | Pasted essays / full specs |
| Freshness | Updated on interrupt / partial / DONE | Stale “IN PROGRESS” for days |
| Resume | 2–4 sentence paste-ready prompt always present | “Continue the work” with no files |
| Conflicts | Spine locks listed when parallel risk | Two agents editing `App.jsx` blind |
| Commit | Explicit commit status; no surprise c&d | Agent commits unprompted |
| Read order | Handoff → `DO_NOT_TOUCH` → task files | Re-read `IMPLEMENTATION_TRACKER` every turn |

## Canonical files

| File | Role |
|------|------|
| `ai-improvement-logs/ACTIVE_HANDOFF.md` | **Live** slice memory — agents read first, write on stop |
| `ai-improvement-logs/AGENT_MEMORY_99.md` | This doctrine (rarely edit) |
| `.cursor/rules/context-handoff-99.mdc` | Always-on session habits |
| Pasted chat HANDOFF | Mirror of ACTIVE; if user pastes one, sync into ACTIVE |

Do **not** invent parallel `HANDOFF_*.md` per chat unless archiving a DONE slice under `ai-improvement-logs/handoffs/` (optional).

## HANDOFF schema (only one)

```markdown
# ACTIVE_HANDOFF

- Status: NOT STARTED | IN PROGRESS | PARTIAL | DONE
- Slice: (short name, e.g. “Mock bank-burn pool”)
- Completed: (bullets)
- Not done: (exact remaining tasks)
- Files created/modified: (paths)
- Spine locks / don’t-touch: (paths or “none”)
- Exact next 1–3 steps:
- Commands to run: (e.g. `npm test -- bankBurnPool`)
- Commit status: clean | uncommitted | committed-not-pushed | …
- Resume prompt: (2–4 sentences)
```

## Agent loop (99)

1. If `ACTIVE_HANDOFF.md` exists and Status ≠ DONE → read it; continue; don’t restart.
2. Before coding: ≤10 lines — goal · likely files · done definition · conflict risks.
3. On interrupt / usage limit / partial: **write ACTIVE first**, then print short HANDOFF (or “see ACTIVE_HANDOFF.md”).
4. On DONE: set Status DONE, leave a one-line “what shipped,” clear Not done, or archive and reset template.
5. Never commit/deploy unless user says `c&d` / `ship it` / `commit`.

## Chat split (unchanged)

Plan vs Implement A vs Implement B — see rule. Unsafe parallel spine: `HomeDomainAccordion`, exposure ledger, Mock intro, Domain Pass hub, `App.jsx`.

## Gap → 99 (ranked)

1. **Use ACTIVE_HANDOFF every stop** — highest leverage; kills restart-from-scratch.
2. **Keep ACTIVE ≤40 lines** — force pointers; put long specs in named docs (`*_99.md`).
3. **Optional archive** — `handoffs/YYYY-MM-DD-slice.md` when DONE so history doesn’t pollute ACTIVE.
4. **Wire audit pass** — `audit-session` playbook: refresh ACTIVE when marking queue items done.
5. **AGENTS.md session start** — add ACTIVE_HANDOFF to the read-order list (one line).

## Out of scope

- Changing theme / hash routing / `.env*`
- Replacing `IMPLEMENTATION_QUEUE.json` (queue stays the work backlog; ACTIVE is the *current slice*)
