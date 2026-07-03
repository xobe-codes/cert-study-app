# Path to 95+ — living checklist

North star: **95+ overall**. Baseline after lab/responsive/premium sprint: **~79**. **Post–tier 5: ~89.** **Post–build-order wave: ~91.**

## Score targets (must all be ≥90 for 95+ overall)

| Area | Was (~79) | Now (~91) | 95+ target | Highest-leverage work |
|------|--------:|----------:|-------------:|------------------------|
| Coverage breadth | 92 | 93 | 95 | Rich diagrams on remaining factory shells |
| Coverage depth | 72 | 82 | 95 | Gold reviews 500+; wave 5 depth for remaining Tier B |
| Learning flow | 82 | 93 | 95 | Mock interview polish; per-domain mock history |
| Labs / CLI | 76 | 86 | 95 | Stem-replay links for new labs; more 4.x services labs |
| Mobile / responsive | 78 | 87 | 95 | Lab landscape in ship gate; broader offline chunks |
| Exam traps | 83 | 88 | 95 | Trap wave 5 for objectives still at 2 traps |
| Maintainability | 64 | 76 | 90 | Continue App.jsx extraction (session/review views) |
| Tests / CI | 85 | 94 | 95 | 572 unit + 15 e2e in verify:ship |

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
