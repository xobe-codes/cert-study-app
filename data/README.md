# CCNA data pipeline

This folder holds **non-runtime** question-bank and knowledge-base files.

## Layout

| Path | Git | Purpose |
|------|-----|---------|
| `source-question-bank/` | **ignored** | Private source-mapped JSON (read-only masters) |
| `clean-question-bank/` | committed | Student-facing generated quiz JSON |
| `shelved-questions/` | committed | Exhibit-dependent / out-of-scope review bucket |
| `knowledge-base/` | committed | Extracted CKUs, glossary, traps (Phase 2+) |

## Setup (one time)

Copy validation packages from `~/Downloads/` into the repo:

```bash
npm run import:source-bank
```

Then build the Domain 4 pilot clean bank:

```bash
npm run build:clean-bank
npm run validate:clean-bank
npm test
```

## Rules

- Never commit files under `source-question-bank/` (gitignored).
- Do not hand-edit generated clean bank files — regenerate via scripts.
- `~/Downloads/` is a backup/import location only; scripts read from `data/source-question-bank/` first.
