# Private source question bank

Place source-mapped validation JSON here. Files in this folder are **gitignored** and must not be committed.

## Import from Downloads

```bash
npm run import:source-bank
```

Copies validation packages into this directory. Original files in `~/Downloads/` are not modified.

## Domain 4 pilot files

Expected under `domain4-ip-services-validation/`:

- `objective-4.1-nat-inside-source-source-questions.json`
- `objective-4.2-ntp-client-server-source-questions.json`
- … through `objective-4.9-tftp-ftp-source-questions.json`

Do not edit source files in place. Regenerate clean output via `npm run build:clean-bank`.
