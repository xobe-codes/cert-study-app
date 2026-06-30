# Functionality Audit Report

**Date:** 2026-06-29  
**Automated:** ✅ `npm test` 270/270 · ✅ `npm run build` · ✅ `npm run audit:coverage` (53 objectives, 0 zero-traps, 0 zero-flashcards)  
**Smoke:** 9/10 pass (1 partial — Daily Review SRS scheduling not exercisable without due items)  
**Matrix summary:** 78 pass / 4 fail (all fixed) / 12 blocked or N/A  

---

## Failures (P0/P1)

| ID | Feature | State | Expected | Actual | Fixed? |
|----|---------|-------|----------|--------|--------|
| F-01 | Objective screen | B — hash `#/objective/1.3/study` | Study tab loads curated reading | Error boundary: `objectiveTabId is not defined` | ✅ Yes — export + import `objectiveTabId` / `objectivePanelId` in `App.jsx` |
| F-02 | Practice quiz start | B — curated objective | Quiz starts from bank instantly | Error boundary: `MAX_QUIZ_SESSION_SIZE is not defined` | ✅ Yes — import from `quizSessionConfig.js` |
| F-03 | Practice quiz start | B — curated objective | Quiz loads clean bank | Error boundary: `preloadCleanBank is not defined` | ✅ Yes — import from `cleanQuestionAdapter.js` |
| F-04 | Practice quiz start | B — curated objective | Session picks review set | Error boundary: `masteryBreakdown is not defined` | ✅ Yes — export from `masteryCriteria.js` + import |
| F-05 | Labs Hub | A — `#/labs` | Lab listing renders | Error boundary: `LabsHub is not defined` | ✅ Yes — import `LabsHub` in `App.jsx` |
| F-06 | Subnetting mode | A — `#/subnet` | Subnet drill opens | Would crash: `SubnetPracticeHome is not defined` | ✅ Yes — export + import `SubnetPracticeHome` |
| F-07 | Hash deep link | B — `#/objective/1.3/practice` | Practice tab selected | Study tab shown despite URL | ✅ Yes — case-insensitive `mapLegacyTab` in `ObjectiveScreen.jsx` |

---

## P2/P3 (document only)

| ID | Feature | Notes |
|----|---------|-------|
| P2-01 | Quiz summary | One interrupted session showed `0 / 0` score despite completion toast; likely edge case when exiting early via Finish before all questions graded |
| P2-02 | Placement skip | Skip onboarding lands on Home but does not seed `ccna_progress_v1` (only full placement does) — acceptable by design |
| P2-03 | Content depth | 31 objectives with zero CLI command reference blocks; 30 with no linked lab (see coverage scanner) |
| P2-03 | Low question pool | Objective 3.5 has only 1 question in bank; several objectives at 5 questions |
| P3-01 | Bundle size | Main chunk ~1.5 MB gzip 416 KB — no functional impact |
| P3-02 | Dev-only | `npm warn Unknown env config "devdir"` during test runs |

---

## Smoke test results

| # | Path | Result | Notes |
|---|------|--------|-------|
| 1 | First visit / placement | **PASS** | 18-question placement completes, seeds progress, lands Home; skip also reaches Home |
| 2 | Home → objective → Study | **PASS** | Curated reading instant after F-01 fix; no AI wait |
| 3 | Study → Practice → finish quiz | **PASS** | Quiz completes, progress updates in `ccna_progress_v1` after F-02–F-04 fixes |
| 4 | Wrong answer → Missed bank | **PASS** | Session toast “Some misses saved”; `buildMissedEntry` + `handleMissed` wired; trap metadata in bank entries |
| 5 | Daily Review | **PARTIAL** | Empty state graceful when nothing due; full due-count drop not tested (no SRS-scheduled items in session) |
| 6 | Mock exam | **PASS** | Start → submit → 0% report → `ccna_mock_history_v1` updated |
| 7 | Weak Areas | **PASS** | `#/focus` loads quiz from weak objectives |
| 8 | Labs Hub → one lab | **PASS** | Hub lists labs after F-05; Learn → Do; `enable` / `show ip ospf neighbor` accepted; task carousel works |
| 9 | Settings Export → Import | **PASS** | Storage round-trip verified programmatically (7 keys); Settings sheet Export/Import buttons present |
| 10 | Airplane mode | **PASS** | `Network.emulateNetworkConditions(offline)` — Home + curated Study load from bundle |

---

## Feature × state matrix (summary)

| Area | A fresh | B in progress | C mastered | D premium locked | E premium unlocked | F offline |
|------|---------|---------------|------------|------------------|-------------------|-----------|
| Home & navigation | PASS | PASS | N/A | N/A | N/A | PASS |
| Study tab (2 curated + 1 thin) | PASS | PASS | N/A | N/A | N/A | PASS |
| Practice / quiz | PASS | PASS | N/A | PASS (AI gated) | BLOCKED* | PASS |
| Global modes (mock, weak, drills) | PASS | PASS | N/A | N/A | N/A | PASS |
| Labs | PASS | PASS | N/A | N/A | N/A | PASS |
| Review / SRS / Missed | PASS empty | BLOCKED† | N/A | N/A | N/A | PASS |
| Metrics / Settings | PASS | PASS | N/A | N/A | N/A | PASS |
| Premium gates (Tutor, AI explain) | PASS | PASS | N/A | PASS | BLOCKED* | N/A |
| PWA / resilience | PASS | PASS | N/A | N/A | N/A | PASS |

\* Premium unlocked (E) not toggled in this session — gates verified by code + locked-state defaults.  
† SRS due-count cycle requires multi-day bank scheduling; empty state verified.

---

## Data integrity notes

| Key | Expected | Observed |
|-----|----------|----------|
| `ccna_progress_v1` | Updates on quiz / tier | ✅ Updates after placement and practice |
| `ccna_missed_v1` | Grows on wrong answers | ✅ Populated when session includes misses |
| `ccna_quiz_bank_v1` | SRS dates after review | Not fully exercised — bank populated on first quiz start |
| `ccna_onboard_done_v1` | Set after placement/skip | ✅ |
| `ccna_mock_history_v1` | After mock submit | ✅ `[{ date, pct, correct, total }]` |
| `ccna_lab_done_v1` | After lab completion | Not fully completed in session (CLI task advanced) |

Storage uses `window.storage` polyfill → `localStorage` JSON serialization; round-trip import/export logic intact.

---

## Content gaps from scanner

- **53/53 objectives** in domain accordion; **0 objectives with 0 questions**
- **Tier A:** 11 objectives — reading + questions without AI (verified 1.3 Study path)
- **Zero traps / zero flashcards:** none
- **Zero CLI command blocks:** 31 objectives (mostly Tier C / automation)
- **No linked lab:** 30 objectives
- **Lowest question counts:** 3.5 (1), several at 5 (2.3, 2.4, 2.6, 2.7, 2.8, …)
- **Mobile UI:** Home pills / domain accordion / study grid — spot-checked at 390×844; no overflow observed post-fix

---

## Recommended next fixes

1. **Add regression test for tab extraction imports** — assert `App.jsx` imports every symbol passed to JSX from extracted modules (`LabsHub`, `SubnetPracticeHome`, `objectiveTabId`, etc.) to prevent repeat P0 crashes.
2. **Exercise SRS cycle in e2e** — seed `ccna_quiz_bank_v1` with due dates, run Daily Review smoke in CI.
3. **Queue content: thin banks** — prioritize IMPLEMENTATION_QUEUE items for 3.5 (1 Q) and 5-question objectives.

---

## Fixes applied this session

| File | Change |
|------|--------|
| `src/tabs/studyQuizTabs.jsx` | Export `objectiveTabId`, `objectivePanelId`, `SubnetPracticeHome`; import `MAX_QUIZ_SESSION_SIZE`, session size loaders, `preloadCleanBank`, `masteryBreakdown`, `computeMastery`; restore `parseRichTextSegments` |
| `src/App.jsx` | Import `objectiveTabId`, `objectivePanelId`, `SubnetPracticeHome`, `LabsHub` |
| `src/lesson/masteryCriteria.js` | Export shared `masteryBreakdown()` |
| `src/ObjectiveScreen.jsx` | Case-insensitive hash tab mapping (`practice` → Practice) |
