# Implementation Tracker — 99+ North Star

**Single source of truth** for current work, queue, scores, and shipped history.
**Updated:** 2026-07-11 · **Overall:** ~99/100 → target **99+** (all areas ≥95)

---

## Agent playbook (every session)

1. Read this file → `DO_NOT_TOUCH.md` → `IMPLEMENTATION_QUEUE.json`
2. `npm run audit:show-next-task` — pick **one** pending item (or backlog below if queue empty)
3. Smallest safe diff · no theme tokens · no hash routing · curated-first
4. `npm run verify:ship`
5. `npm run audit:mark-done -- <id> "summary"` · append **Shipped** · `npm run audit:scan-and-refresh`

**Ship:** user says **c&d** → verify → commit → push → wrangler pages deploy

---

## Coverage snapshot

| Metric | Value |
|--------|------:|
| Objectives | 53 · Tier A **53** · B 0 · C 0 |
| Labs | 82 (82 interpret · 0 config) |
| Trap / flashcard / cmd gaps | **0 / 0 / 0** |
| App.jsx | ~149 lines |
| Command scenarios | ≥3 per domain (6 domains) |

---

## Scorecard → 99+

| Area | Now | 99+ bar | Signal / gap-closer |
|------|----:|--------:|---------------------|
| Coverage breadth | 99 | 97 | Tier-A ratio (53/53) |
| Coverage depth | 99 | 97 | avg 25 Q · 14 traps/obj |
| Learning flow | 99 | 97 | Specs 1–15 domain OS + unified lessons |
| Engineer perspective | 99 | 97 | engineer view 53/53 |
| CLI verification | 99 | 96 | ≥2 verify cmds 53/53 · scenario packs |
| Exam traps | 100 | 97 | avg 14 traps · floor 0 |
| Labs / CLI | 99 | 97 | lab/obj + 82 interpret (0 config) + TS |
| Maintainability | 97 | 96 | App ≤200 · ExplainTab extract · 0 >900L |
| Mobile / a11y | 99 | 96 | phone diagrams · mobile e2e · a11y ✓ |
| Tests / CI | 99 | 96 | Terms Hub e2e in ship:full |

---

## Queue (`IMPLEMENTATION_QUEUE.json`)

**Pending:** 0 · **Total:** 18

| id | priority | area | work |
|----|----------|------|------|
| _empty_ | — | — | Run `npm run audit:scan-and-refresh` or pick backlog row below |

---

## Backlog (when queue empty)

| id | area | work |
|----|------|------|
| _(empty)_ | — | Optional polish cleared 2026-07-11 (Terms Hub e2e + scenario density) |

## Recently shipped

- **Specs 8–15** — unified lessons, Terms Hub, Command scenarios, study health, phone diagrams (`ae5abf7`+)
- **Optional polish** — Terms Hub ship e2e; ≥3 scenarios/domain

## Parked — next phase (do not implement until asked)

See `PLATFORM_NEXT_PHASE.md` for the multi-pack curriculum plan (implement only when explicitly requested).

**Question debrief 99+** — shipped (see `QUESTION_DEBRIEF_99.md` + `COMPLETED_CHANGES`).

**Topology SVG 99+** — shipped (see `TOPOLOGY_SVG_99.md`; landscape e2e + mobile link floors).

**Polish 99+** — shipped (see `POLISH_99.md`; deferred empty).

Full shipped history: `COMPLETED_CHANGES.md`

---

## Do not touch

`.env*` · `src/ui/appTheme.js` · hash routing in `App.jsx` · live AI on load. See `DO_NOT_TOUCH.md`.
