# Lighthouse CI — Setup & Baseline Targets

Added: 2026-07-10

## What Was Added

| File | Purpose |
|------|---------|
| `.lighthouserc.js` | Lighthouse CI config — collect, assert, upload settings |
| `package.json` | Added `@lhci/cli ^0.14.0` to devDependencies |
| `package.json` | Added `"lighthouse": "lhci autorun"` script |

## How to Run

```bash
npm run build          # produces dist/
npm run lighthouse     # spins up a local server against dist/, runs 2 Lighthouse passes
```

## Baseline Thresholds

| Category | Gate | Score |
|----------|------|-------|
| Performance | warn | ≥ 85 |
| Accessibility | error (hard fail) | ≥ 90 |
| Best Practices | error (hard fail) | ≥ 90 |
| PWA | warn | ≥ 80 |

Performance is warn-only until we measure a few real runs and confirm the baseline is stable. Once the app consistently clears 85 on performance, promote it to `error`.

## Next Steps

1. Run `npm install` to pull in `@lhci/cli`.
2. Run `npm run build && npm run lighthouse` to capture first scores.
3. Record actual scores below, then tighten thresholds where headroom exists.
4. Consider wiring `npm run lighthouse` into the `verify:ship` script once scores are stable.

## Score History

| Date | Performance | Accessibility | Best Practices | PWA |
|------|-------------|---------------|----------------|-----|
| (first run pending) | — | — | — | — |
