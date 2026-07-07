# Implementation Tracker — 99+ North Star

**Single source of truth** for current work, queue, scores, and shipped history.  
**Updated:** 2026-07-07 · **Overall:** ~93/100 → target **99+** (all areas ≥95)

---

## Agent playbook (every session)

1. Read this file → `DO_NOT_TOUCH.md` → `IMPLEMENTATION_QUEUE.json`
2. `npm run audit:show-next-task` — pick **one** pending item (or backlog row below if queue empty)
3. Smallest safe diff · no theme tokens · no hash routing changes · curated-first (no live AI on load)
4. `npm run verify:ship`
5. `npm run audit:mark-done -- <id> "summary"` · append row under **Shipped** · refresh scores via `npm run audit:scan-and-refresh`

**Ship:** user says **c&d** → verify → commit → push → `npx wrangler pages deploy dist --project-name ccna-study-tool --branch master --commit-dirty=true`

---

## Coverage snapshot

| Metric | Value |
|--------|------:|
| Objectives | 53 · Tier A **53** · B 0 · C 0 |
| Question bank | 914 clean + skill |
| Labs | 82 (57 interpret · 25 config) |
| Trap / flashcard / cmd gaps | **0 / 0 / 0** |
| App.jsx | ~194 lines |

---

## Scorecard → 99+

| Area | Now | 99+ bar | Gap-closers (ranked) |
|------|----:|--------:|----------------------|
| Coverage breadth | 97 | 95 | ✓ Met |
| Coverage depth | 91 | 95 | Gold answer reviews; deeper CKU verify on thin stems |
| Learning flow | 92 | 95 | Factory reading tier de-dupe; SRS e2e full cycle |
| Labs / CLI | 88 | 95 | Convert top-traffic config labs to lab-lite |
| Mobile | 87 | 95 | Practice stack polish pass 2; broader offline chunks |
| Exam traps | 93 | 95 | Placement-trap gold reviews; debrief depth |
| Maintainability | 92 | 95 | `ObjectiveScreen` extract; mastery math dedupe |
| Tests / CI | 94+ | 95 | `verify:ship` green; placement blueprint validator in CI ✓ |

**Definition of 99+:** exam-ready on phone/iPad/Mac · curated free path · IOS-faithful labs · trap+lab per weak CKU · zero layout regressions · CI green.

---

## Queue (`IMPLEMENTATION_QUEUE.json`)

**Status:** empty — all 18 items `done`.  
**Refresh:** `npm run audit:scan-and-refresh` after content changes.

### Backlog (not yet queued — pick after scan)

| id (proposed) | priority | area | work |
|---------------|----------|------|------|
| `gold_reviews_wave15` | high | content | Expand gold answer reviews for placement + thin stems |
| `objective_screen_extract` | medium | maintainability | Split `ObjectiveScreen.jsx` (~189 lines) |
| `config_lab_lite_wave` | medium | labs | Lab-lite alternates for top 5 config labs |
| `srs_e2e_full` | medium | learning_flow | Daily Review due-count drop in Playwright |
| `reading_tier_dedupe` | low | cognitive_load | Distinct text per Study tier on factory readings |

---

## In flight / staging

| slice | status | notes |
|-------|--------|-------|
| Baseline routing 95+ | **shipping** | Study Next stale remap, weak-area dashboard, blueprint CI validator |

---

## Shipped (recent)

| date | id / theme | summary |
|------|------------|---------|
| 2026-07-07 | `baseline_routing_95` | Stale v1 baseline detection, Full remap CTA, Study Next remap, `validatePlacementBlueprints` in pipeline |
| 2026-07-04 | `baseline_v2` | Fundamentals + Services blueprints sample all subsections; 49 placement trap gold reviews |
| 2026-07-04 | `domain_pass_mc_fix` | Hydrate + validate MC shape; no blank choices |
| 2026-07-04 | passes 5–6 | Study Lens baseline focus; maintenance 3-trap mode; tested-out collapse |
| 2026-07-04 | `stem_replay_wave14` | Missed Q → lab CTAs for lab-lite batch |
| 2026-07-04 | `learning_flow_mock_polish` | Compact mobile answer review + mock debrief lab CTAs |
| 2026-07-04 | `config_lab_strategy` | INTERPRET/CONFIG badges + interpret alternates |
| 2026-07-04 | `offline_chunks_broaden` | PWA precaches 9 curated study chunks |
| 2026-06-30 | `extract_app_shell_modules` | App.jsx 5k→194 lines |
| 2026-06-30 | `pwa_offline_curated` | SW stale-while-revalidate for question chunks |
| 2026-06-17 | gap closure | Waves 2/11/13 + lab-lite batch → **53/53 Tier A** |

Full history: `COMPLETED_CHANGES.md`

---

## Product notes

- Users on **v1 Fundamentals/Services baselines** should run **Full remap** once (objectives 1.9–1.12, 4.9–4.10).
- Live: https://master.ccna-study-tool.pages.dev

---

## Do not touch

`.env*` · `src/ui/appTheme.js` tokens · hash routing in `App.jsx` · live AI on page load · deployment secrets.  
Details: `DO_NOT_TOUCH.md`

---

## Commands

| Command | Purpose |
|---------|---------|
| `npm run verify:ship` | Unit + pipeline + build + ship e2e |
| `npm run audit:show-next-task` | Next queue item |
| `npm run audit:scan-and-refresh` | Regenerate queue + score artifacts |
| `npm run audit:mark-done -- <id> "msg"` | Close queue item + log |

---

## Archived pointers

`AGENT_NEXT_STEPS.md`, `SCORE_95_TARGET.md`, `HIGH_IMPACT_CCNA_GAPS.md`, `PROJECT_LOG.md`, `ENHANCEMENT_PRIORITIES.md` → **redirect here**. Do not edit those for backlog; update **this file** + `IMPLEMENTATION_QUEUE.json`.
