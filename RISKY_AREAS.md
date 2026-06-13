# Risky Areas — CCNA Study App

These are paths Claude Code should **not edit, read in full, or run commands against without your explicit approval**.

## Never Touch

| Path | Why it's risky |
|---|---|
| `.env.local` | Contains environment variables/secrets. Never read, display, or edit. |
| `package-lock.json` | Lockfile — changes can break dependency resolution. Only change when explicitly approved as part of a dependency update. |
| `node_modules/`, `.wrangler/`, `dist/` | Generated/installed — never hand-edit; safe to ignore in scans. |

## Ask Before Touching

| Path | Why it's risky |
|---|---|
| `functions/api/claude.js` | Server-side API route — likely handles an API key/credential for Claude API calls. Changes affect the deployed backend. |
| `functions/api/sync.js` | Server-side API route — handles data sync; changes affect deployed behavior and possibly stored data. |
| `.github/workflows/deploy.yml` | CI/CD pipeline — changes affect automated deployments. |
| `vite.config.js` | Build configuration — changes affect how the whole app builds. |
| `src/domain-packages/*.json` | Generated from `ccnaCurated.js`/`ccnaLabs.js` via `npm run compile:ccna`. Don't hand-edit — regenerate via the script instead. |

## Edit With Care (large files — keep edits targeted)

| Path | Note |
|---|---|
| `src/App.jsx` | ~5,300 lines. Use targeted reads/edits, not full-file rewrites. |
| `src/data/ccnaCurated.js` | ~1,585 lines. Edit specific objective blocks, not the whole file. |
| `src/data/ccnaLabs.js` | ~969 lines. Edit specific lab bundles, not the whole file. |

## General Rules (from global `~/.claude/CLAUDE.md`)

- No dependency installs without approval.
- No edits to auth, database/schema, migrations, deployment, or build config without approval.
- No edits to more than 5-8 files without approval.
- Always run `npm run compile:ccna` and the relevant `validate*()` function after editing curated/lab data, before considering a content task done.
