# Implementation Tracker — 99+ North Star

**Single source of truth** for current work, queue, scores, and shipped history.
**Updated:** 2026-07-08 · **Overall:** **99+** (maintainability + traps closed this pass)

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
| Labs | 82 (lab-lite + interpret; 0 advanced typing tier) |
| Traps / obj | **avg 11** (wave 20) |
| App.jsx | ≤200 · `studyQuizTabs` / `appShell` ≤900 |

---

## Scorecard → 99+

| Area | Now | 99+ bar | Signal / gap-closer |
|------|----:|--------:|---------------------|
| Coverage breadth | 99 | 97 | Tier-A ratio (53/53) |
| Coverage depth | 99 | 97 | avg 25 Q · ≥11 traps/obj |
| Learning flow | 99 | 97 | SRS + stem-replay + reading TTS |
| Engineer perspective | 99 | 97 | engineer view 53/53 |
| CLI verification | 99 | 96 | ≥2 verify cmds 53/53 |
| Exam traps | 99 | 97 | avg **11** traps |
| Labs / CLI | 99 | 97 | domain filter + interpret alternates |
| Maintainability | 99 | 96 | App ≤200 · shell/tabs ≤900 |
| Mobile / a11y | 99 | 96 | device + a11y e2e |
| Tests / CI | 99 | 96 | unit + verify:ship e2e |

---

## Queue (`IMPLEMENTATION_QUEUE.json`)

**Pending:** 0 · **Total:** 18

| id | priority | area | work |
|----|----------|------|------|
| _empty_ | — | — | Run `npm run audit:scan-and-refresh` for new findings |

---

## Backlog (cleared this pass)

| id | area | status |
|----|------|--------|
| `split_study_quiz_tabs` | maintainability | **done** |
| `app_shell_chrome_extract` | maintainability | **done** |
| `gold_reviews_wave15` | content | **done** |
| `config_lab_lite_wave` | labs | **done** |
| `trap_depth_wave15` | exam_traps | **done** (wave20 → avg 11) |

Full shipped history: `COMPLETED_CHANGES.md`

---

## Do not touch

`.env*` · `src/ui/appTheme.js` · hash routing in `App.jsx` · live AI on load. See `DO_NOT_TOUCH.md`.
