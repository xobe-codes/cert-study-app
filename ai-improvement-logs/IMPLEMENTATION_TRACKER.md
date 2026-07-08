# Implementation Tracker — 99+ North Star

**Single source of truth** for current work, queue, scores, and shipped history.
**Updated:** 2026-07-08 · **Overall:** ~99/100 → target **99+** (all areas ≥95)

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
| Labs | 82 (57 interpret · 25 config) |
| Trap / flashcard / cmd gaps | **0 / 0 / 0** |
| App.jsx | ~199 lines |

---

## Scorecard → 99+

| Area | Now | 99+ bar | Signal / gap-closer |
|------|----:|--------:|---------------------|
| Coverage breadth | 99 | 97 | Tier-A ratio (53/53) |
| Coverage depth | 99 | 97 | avg 25 Q · 10 traps/obj |
| Learning flow | 99 | 97 | SRS + stem-replay loops; question volume |
| Engineer perspective | 99 | 97 | engineer view 53/53 |
| CLI verification | 99 | 96 | ≥2 verify cmds 53/53 |
| Exam traps | 99 | 97 | avg 10 traps · floor 0 |
| Labs / CLI | 99 | 97 | lab/obj + 57 interpret + 10 TS |
| Maintainability | 94 | 96 | App 199L · ObjScreen 170L · 2 files >900L |
| Mobile / a11y | 99 | 96 | 6 mobile e2e · a11y ✓ |
| Tests / CI | 99 | 96 | 108 unit files · 21 e2e |

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
| `split_study_quiz_tabs` | maintainability | Split `studyQuizTabs.jsx` (1896L) + appShell core (1056L) under 900 |
| `gold_reviews_wave15` | content | Expand gold answer reviews for high-miss stems |
| `config_lab_lite_wave` | labs | Lab-lite alternates for remaining config labs |
| `trap_depth_wave15` | exam_traps | Raise avg traps/objective beyond 10 |

Full shipped history: `COMPLETED_CHANGES.md`

---

## Do not touch

`.env*` · `src/ui/appTheme.js` · hash routing in `App.jsx` · live AI on load. See `DO_NOT_TOUCH.md`.

