# Current App and Database Inventory

## App shell
| Layer | Path |
|-------|------|
| Router / state | `src/App.jsx` |
| Objective UI | `src/ObjectiveScreen.jsx` |
| Home | `src/HomeScreen.jsx` |
| Study tab | `src/tabs/ExplainTab.jsx` |
| Practice tab | `src/tabs/QuizTab.jsx` |

## Content sources
| Asset | Location | Count |
|-------|----------|------:|
| Objectives | `src/data/ccnaDomains.js` | 53 |
| Hand curated | `src/data/ccnaCurated.js` | 53 rich+ |
| Factory supplements | `curatedReadingSupplement*.js` | 0 thin |
| KB patches | `kbCompiledPatches.js` | 42 |
| Clean bank | `data/clean-question-bank/` | 1313 Q |
| Labs | `ccnaLabs*.js` | 82 labs · 53/53 objs |
| Lab-lite | interpret-only | 57 |
| App.jsx lines | `src/App.jsx` | ~371 |

## Learner storage (localStorage)
- `ccna_progress_v1` — per-objective mastery, reading tier, SRS
- `ccna_missed_v1` — wrong answers with trap metadata
- `ccna_quiz_bank_v1` — spaced repetition bank

