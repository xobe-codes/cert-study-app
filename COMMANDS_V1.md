# Commands — CCNA Study App

Verified commands for this project. Run these from the project root:

```bash
cd "/Users/zycooks/Documents/Apps/CCNA App"
```

## Available Commands

| Purpose | Command | Notes |
|---|---|---|
| Start dev server | `npm run dev` | Runs Vite dev server with hot reload |
| Build for production | `npm run build` | Outputs to `dist/` |
| Preview production build | `npm run preview` | Serves the built `dist/` folder locally |
| Compile CCNA data packages | `npm run compile:ccna` | Regenerates `src/domain-packages/*.json` from `ccnaCurated.js` / `ccnaLabs.js` — **run this after editing curated content or labs** |

## Not Yet Available

| Purpose | Status |
|---|---|
| Test | No test script or framework configured |
| Lint | No lint script or ESLint config found |
| Typecheck | N/A — project uses `.jsx`, no TypeScript config |

If these get added later, update this file with the new commands.

## Validation Helpers (not npm scripts, run via Node)

These are functions inside the data files, useful to sanity-check content edits:

| Function | Where | What it checks |
|---|---|---|
| `validateCurated()` | `src/data/ccnaCurated.js` | Structural correctness of curated objective content |
| `validateLabs()` | `src/data/ccnaLabs.js` | Structural correctness of lab bundles |

## Deployment

Deployment is handled by `.github/workflows/deploy.yml` (Cloudflare Pages). Do not modify this without approval.
