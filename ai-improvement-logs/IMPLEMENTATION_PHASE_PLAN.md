# Implementation Phase Plan

## Tracks (exam-ready reorganized)

| Track | Goal | Status |
|-------|------|--------|
| **A** | Exam-ready core (free path, no AI) | **Done** |
| **B** | Final polish pass | **Done** |
| **C** | Deferred (RAG/tutor, premium AI) | Back burner |

### Track A — Exam-ready core (shipped)

| # | Slice | Shipped |
|---|--------|---------|
| 1 | **Content** — Gold batch 14 (450 total): MAC 1.5, private IP 1.7, IPv6 1.9, OSPF 3.4 | ✓ |
| 2 | **Labs** — Automation 6.1 labs verified in hub + `e2e/automation-lab-smoke.spec.js` | ✓ |
| 3 | **Learning flow** — Domain Pass 6/6 exam-date nudge + timed mock CTA | ✓ |
| 4 | **Mobile** — CLI terminal `scrollIntoView` on input focus + safe-area input row | ✓ |
| 5 | **Maintainability** — `useGlobalSearchHotkey` extracted from `App.jsx` | ✓ |

**Ship gate:** `npm run verify:ship` (unit + build + ship e2e including automation lab smoke)

### Track B — Final polish (shipped)

| # | Slice | Shipped |
|---|--------|---------|
| 1 | **Mobile** — iPad diagram expand e2e + `useCompactViewport(1024)` | ✓ |
| 2 | **PWA** — `e2e/offline-curated-smoke.spec.js` (airplane mode reload) | ✓ |
| 3 | **Learning flow** — `ExamReadyBanner` on home 6/6; exam date on boot; Domain Pass settings CTA | ✓ |
| 4 | **Score** — `SCORE_95_TARGET.md` post–Track A/B self-check | ✓ |

**Ship gate:** `verify:ship` includes offline + diagram iPad smokes

### Track C — Deferred

- Phase 10 RAG / AI Tutor (premium-only)
- Live AI on free-tier load (forbidden)

---

## Legacy phases (1–13)

| Phase | Goal | Status |
|-------|------|--------|
| 1–8 | Audit, enrichment, App.jsx extraction wave 1 | Done |
| 9 | PWA curated cache | Done |
| 10 | RAG/tutor | Deferred → Track C |
| 11 | Domain Pass | Done |
| 12 | Gold batch 12 + celebration | Done |
| 13 | Gold batch 13 (5.1, 5.5, 1.8, 3.1) | Done |
| 14 | Gold batch 14 (1.5, 1.7, 1.9, 3.4) | Done |
