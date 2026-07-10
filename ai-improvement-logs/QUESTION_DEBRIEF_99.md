# Question Debrief 99+ (stem-grounded + family UI)

Runtime contract for MC wrong-answer teaching. Clean-bank templates are rebuilt via SADE — do not mass-edit domain JSON for this.

## Loop

> Miss → **whyWrongHere** (stem) → whatItDoes → **Trap family chip** → Correct → other options → Exam tip → Lab/Wildcard

## Content

| Field | Rule |
|-------|------|
| whyWrongHere | Stem hooks + correct vs wrong contrast; never `satisfies what this question tests` |
| whatItDoes | True general idea of the distractor |
| misconceptionTested | Stable family → Trap Drill aliases |
| Detection | `isTemplateWhyWrongHere` / `FALLBACK_EXPLANATION_RE` in `answerReviewQuality.js` |
| Rebuild | `mergeSadeFields` + `resolveIncorrectItem` prefer SADE when template |

## UI (`AnswerReview.jsx`)

1. Your wrong first (when miss)
2. Why wrong here → what it implies → family chip (`onOpenTrapDrill`)
3. Correct
4. Other options collapsed
5. Soft “Generic debrief” only if template still detected
6. Streak full-width CTA only at ≥2 same family (`QuizTab`)

## Helpers

- `familyRemediationActions` — trap + optional Wildcard
- `TRAP_DRILL_LABEL_ALIASES` — SADE/inferTrap labels → CKU

## Out of scope

Theme tokens · App.jsx routing · live AI free debriefs · mass cleanQuestions rewrite
