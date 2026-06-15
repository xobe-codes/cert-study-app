# Do Not Touch

Per audit constraints — agents must not modify:

- `.env`, `.env.*`, secrets, `.mcp-auth`, `.claude.json`, `settings.local.json`
- Theme tokens in `src/ui/appTheme.js` (colors, typography, layout chrome)
- Hash routing structure in `src/App.jsx` (route keys, view state machine)
- Deployment secrets / Cloudflare credentials
- Delete existing components or routes
- Live AI calls on page load (curated-first; AI on demand only)

## Safe additive patterns
- New fields on curated objects (`engineerView`, traps, flashcards)
- New components under `src/components/` or `src/tabs/`
- Build-time scripts under `scripts/`
- `ai-improvement-logs/` reports

