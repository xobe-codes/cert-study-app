# Project Profile — CCNA Study App

This file is a quick-reference snapshot of the project so Claude Code (and you) don't need to re-scan everything every session.

## Identity

| Item | Value |
|---|---|
| Project name | `ccna-study-app` |
| Project type | Single-page React web app (Vite), deployed via Cloudflare Pages |
| Tech stack | React 18, Vite 5, `@vitejs/plugin-react`, Cloudflare Pages Functions |
| Package manager | npm (`package-lock.json`) |
| Purpose | CCNA certification study app — curated objective content (CKUs, questions, flashcards), hands-on labs (topology, validators, diagrams), domain-organized study packages |

## Structure

| Path | What it is |
|---|---|
| `src/main.jsx`, `index.html` | App entry points |
| `src/App.jsx` | Main app component (large — ~5,300 lines) |
| `src/data/ccnaCurated.js` | Curated study content (objectives, CKUs, questions, flashcards, glossary, etc.) |
| `src/data/ccnaLabs.js` | Hands-on lab bundles (topology, validators, diagrams, packet flows) |
| `src/domain-packages/*.json` | Generated study packages — produced by `npm run compile:ccna`, do not hand-edit |
| `scripts/compileCcnaPackages.mjs` | Script that compiles curated/lab data into domain packages |
| `functions/api/claude.js`, `functions/api/sync.js` | Cloudflare Pages server-side API routes |
| `.github/workflows/deploy.yml` | CI/CD deployment pipeline |
| `vite.config.js` | Build configuration |

## Conventions

- Curated content lives in `ccnaCurated.js` as a `CURATED` map keyed by objective ID (e.g. `'1.5'`), plus a `SUPPLEMENTAL` map for unregistered/shelved content.
- Lab bundles live in `ccnaLabs.js` as `{ lab, topology, validator, diagram, packetFlows }` objects, registered in a `LABS` map keyed by lab ID.
- After editing `ccnaCurated.js` or `ccnaLabs.js`, run `npm run compile:ccna` to regenerate `src/domain-packages/*.json`.
- `validateCurated()` and `validateLabs()` (in `ccnaCurated.js` / `ccnaLabs.js`) check structural correctness — run these after content edits.
- Domain IDs use short keys: `fundamentals`, `access`, `connectivity`, `services`, `security`, `automation`.

## Last Known State (as of this scan)

- 11 curated objectives, 6 labs across all 6 domains.
- No test, lint, or typecheck scripts configured yet.
