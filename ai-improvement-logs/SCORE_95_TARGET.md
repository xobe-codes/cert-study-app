# Path to 95+ — living checklist

North star: **95+ overall**. Baseline after lab/responsive/premium sprint: **~79**. **Post–Track A/B (Jun 2026): ~84.**

## Score targets (must all be ≥90 for 95+ overall)

| Area | Was (~79) | Now (~84) | 95+ target | Highest-leverage work |
|------|--------:|----------:|-------------:|------------------------|
| Coverage breadth | 92 | 92 | 95 | Remaining factory shells → rich diagrams |
| Coverage depth | 72 | 76 | 95 | Gold reviews 450+; CKU traps + verify per domain |
| Learning flow | 82 | 88 | 95 | Domain Pass 6/6 → mock scheduling; exam countdown |
| Labs / CLI | 76 | 80 | 95 | Automation lab smoke; +routing labs from queue |
| Mobile / responsive | 78 | 84 | 95 | iPad diagram expand; CLI scrollIntoView; offline e2e |
| Exam traps | 83 | 85 | 95 | Trap drills linked from quiz misses |
| Maintainability | 64 | 68 | 90 | `useGlobalSearchHotkey`; more App.jsx extraction |
| Tests / CI | 85 | 90 | 95 | `verify:ship` 6 e2e specs; 536+ unit tests |

## Automatic agent behavior

Cursor rule `.cursor/rules/score-95-plus.mdc` (`alwaysApply: true`) requires every **implementation** to end with **Path to 95+** suggestions.

## Quick wins (do first)

1. Responsive lab CLI — flex terminal, no fixed `height`
2. `lab_31_route_lite` + 2 routing labs from `IMPLEMENTATION_QUEUE.json`
3. Extract `App.jsx` tutor/search/modals into `src/routes/` or `src/features/`
4. iPad diagram: touch affordance — **done** (expand e2e + 1024px compact viewport)

## Definition of done at 95+

- Free path: curated lesson + diagram + terms + quiz with **zero** AI required
- Labs: learn → IOS practice → verify for every config-heavy objective
- Works on iPhone portrait/landscape, iPad, MacBook without layout breaks
- 183+ tests green; new engines have unit tests
- No regressions in premium gates or offline curated content
