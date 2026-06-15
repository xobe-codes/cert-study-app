# Path to 95+ — living checklist

North star: **95+ overall**. Baseline after lab/responsive/premium sprint: **~79**.

## Score targets (must all be ≥90 for 95+ overall)

| Area | Now (~) | 95+ target | Highest-leverage work |
|------|--------:|-------------:|------------------------|
| Coverage breadth | 92 | 95 | Remaining factory shells → rich diagrams |
| Coverage depth | 72 | 95 | CKU traps, verify steps, engineer view per domain |
| Learning flow | 82 | 95 | Remove friction, single diagram/terms per lesson |
| Labs / CLI | 76 | 95 | Fluid CLI (`dvh`/flex), +10 lab scenarios from queue |
| Mobile / responsive | 78 | 95 | Keyboard-aware terminal, modal unification |
| Exam traps | 83 | 95 | Trap drills linked from quiz misses |
| Maintainability | 64 | 90 | Split `App.jsx`; route-level code splitting |
| Tests / CI | 85 | 95 | cliEngine + lab runner + critical tab smoke |

## Automatic agent behavior

Cursor rule `.cursor/rules/score-95-plus.mdc` (`alwaysApply: true`) requires every **implementation** to end with **Path to 95+** suggestions.

## Quick wins (do first)

1. Responsive lab CLI — flex terminal, no fixed `height`
2. `lab_31_route_lite` + 2 routing labs from `IMPLEMENTATION_QUEUE.json`
3. Extract `App.jsx` tutor/search/modals into `src/routes/` or `src/features/`
4. iPad diagram: touch affordance without hover-only “View full”

## Definition of done at 95+

- Free path: curated lesson + diagram + terms + quiz with **zero** AI required
- Labs: learn → IOS practice → verify for every config-heavy objective
- Works on iPhone portrait/landscape, iPad, MacBook without layout breaks
- 183+ tests green; new engines have unit tests
- No regressions in premium gates or offline curated content
