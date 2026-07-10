# Teaching Orchestration (99+)

Condensed doctrine for coach / soft gates / post-study retention. UI stays; handoffs + copy carry teaching.

## Loop

> Study (model) → Practice (prove) → Trap Drill → Lab/Command (verify) → Domain Pass → Fix Next → Mock when ready

## Two paths

| Path | Who | Soft gate |
|------|-----|-----------|
| **First pass** | Unseen / no study or practice engagement | “Read Study first (2 min) → then Practice” (dismissible today) |
| **Post-study weak** | `in_progress` / `mastered` or prior engagement | Default Practice / Trap / Lab; optional “Refresh Study (2 min)” — never force reread |

## Failure modes → next step

| Mode | Signal | Next |
|------|--------|------|
| retention | SRS due | Daily Review → Practice |
| misconception | trap ≥2 | Trap drill → Lab |
| application | Domain Pass / mock weak | Practice → Pass retake |
| verification | weak + no lab | Lab → Command Hub |
| procedural | subnet/wildcard/ACL math | Subnetting drill |

## Study Next priority

1. SRS due  
2. Incomplete / stale baseline  
3. Domain Pass weak  
4. High trap count  
5. Almost-ready (lock-in Practice)

## Soft-gate rules

- Never hard-lock Practice.
- Dismiss memory: `STORAGE_KEYS.studyCoachDismissed` (per objective, date key).
- Helpers: `src/home/studyCoach.js` · banner: `StudyCoachBanner.jsx`.

## Out of scope (this pass)

Hard locks · theme tokens · App.jsx routing · live AI on free Study · platform multi-pack.
