# UX Roadmap — unified phase tracker

**Baseline:** ~81/100 overall (simplicity 76 · informativeness 88 · iOS 74 · animation 77)  
**Target:** ~100/100  
**Status key:** `[ ]` pending · `[~]` in progress · `[x]` done

---

## Phase 0 — Ship & verify mobile shell
- [x] Commit/deploy bottom-nav fix (`visualViewport`, fixed dock, `100svh`)
- [x] iPhone Safari QA checklist
- [x] `visualViewportInset` behavior test

## Phase 1 — Redundancy: labels & offline
- [x] Badge = difficulty only (drop `lesson · quiz · flashcards · offline`)
- [x] Curated: no “Save offline” CTA
- [x] AI-only: offline in overflow menu
- [x] Home domain list: drop per-topic ⤓ for curated
- [x] Settings: honest “AI cache downloaded” copy

## Phase 2 — Redundancy: one Study tab
- [x] Merge Explain + Visual + flashcards into Study scroll
- [x] Sections: Reading → Diagram → Packet flow → Key terms (end)
- [x] Remove Visual tab for curated objectives
- [x] “Start practice →” CTA at bottom of Study

## Phase 3 — Redundancy: one Practice tab
- [x] Rename Quiz → Practice; tabs: Study | Practice
- [x] Pre-assess = first Practice session (unseen only)
- [x] Key terms not shown above pre-assess
- [x] Study block complete → “Continue to practice”
- [x] 3-step mastery on Practice tab

## Phase 4 — Calm Objective header
- [x] Sticky: back + title + tabs only
- [x] Overflow menu: siblings, offline (AI), lab, study block
- [x] One-line why intro; drop duplicate domain
- [x] Mastery checklist on Practice only
- [x] Wire or delete dead `.app-chrome-toolbar` CSS

## Phase 5 — Calm Home screen
- [x] Study Next = sole hero
- [x] Merge recap + traps + readiness → “Your progress”
- [x] Daily trap inline under Study Next
- [x] One study modes card
- [x] Single stats/progress link

## Phase 6 — iOS native layer
- [x] PWA manifest + icons + minimal SW
- [x] Dynamic `theme-color`
- [x] Touch targets ≥44pt
- [x] Touch-first ordering questions
- [x] Tutor/CLI keyboard avoidance
- [x] Search safe-area + `inputMode="search"`
- [x] Settings Add to Home Screen hint

## Phase 7 — Trust & onboarding
- [x] Home “Built-in study packs” card
- [x] Placement → spotlight tour linkage
- [x] Settings sticky section nav
- [x] Empty states with CTAs
- [x] Objective one-sentence intro

## Phase 8 — Purposeful motion
- [x] Study ↔ Practice tab crossfade
- [x] Bottom nav active indicator
- [x] Home domain accordion transition
- [x] MC expand + study block progress transitions
- [x] Respect `data-reduce-motion`

## Phase 9 — Nav always reachable
- [x] Compact bottom nav on Objective
- [x] Dock padding rules for Objective layout

## Phase 10 — Polish to ~100
- [x] Nav/section SVG icons
- [x] Home → Objective route transition
- [x] Flashcard flip animation
- [x] Sheet swipe-to-dismiss
- [x] Unified confetti
- [x] a11y pass notes

---

## Score targets

| After | Overall |
|-------|--------:|
| 0 | ~82 |
| 1–3 | ~88 |
| 4–5 | ~92 |
| 6 | ~95 |
| 7 | ~97 |
| 8 | ~98 |
| 9 | ~99 |
| 10 | ~100 |

## Priority if truncated

0 → 1–3 → 4–5 → 6 → 7 → 8 → 10 → 9
