#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# audit.sh  —  React/Vite study-app audit
#
# Checks every category of issue found and fixed during the June 2026 session:
#   1. Build health
#   2. Heading text-squish (flex layout + word-break CSS)
#   3. Search index coverage
#   4. Answer feedback quality
#   5. Accessibility basics
#   6. Content field completeness
#   7. TTS / read-aloud presence
#   8. Modal / overlay patterns
#   9. Dead code / unused imports (quick scan)
#  10. Known risky patterns
#
# Usage:  ./audit.sh [--src <dir>]  (default: ./src)
# ─────────────────────────────────────────────────────────────────────────────

set -u
SRC="${1:-./src}"
if [[ "${1:-}" == "--src" ]]; then SRC="${2:-./src}"; fi

PASS=0; WARN=0; FAIL=0
declare -a ISSUES=()

# ── helpers ──────────────────────────────────────────────────────────────────
bold()  { printf '\033[1m%s\033[0m' "$*"; }
green() { printf '\033[32m%s\033[0m' "$*"; }
yellow(){ printf '\033[33m%s\033[0m' "$*"; }
red()   { printf '\033[31m%s\033[0m' "$*"; }
dim()   { printf '\033[2m%s\033[0m' "$*"; }

pass() { PASS=$(( PASS + 1 )); printf "  $(green '✓') %s\n" "$*"; }
warn() { WARN=$(( WARN + 1 )); printf "  $(yellow '⚠') %s\n" "$*"; ISSUES+=("WARN: $*"); }
fail() { FAIL=$(( FAIL + 1 )); printf "  $(red '✗') %s\n" "$*"; ISSUES+=("FAIL: $*"); }

section() { echo; printf "$(bold '▶ %s')\n" "$*"; echo "  ─────────────────────────────────────────────────"; }
rg_count() { grep -rE "$1" "$SRC" --include="*.jsx" --include="*.js" --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l | tr -d ' '; }
rg_files()  { grep -rlE "$1" "$SRC" --include="*.jsx" --include="*.js" --include="*.ts" --include="*.tsx" 2>/dev/null | sed "s|$SRC/||" | head -"${2:-5}"; }
file_has()  { grep -qE "$1" "$2" 2>/dev/null || false; }

echo
printf "$(bold '╔══════════════════════════════════════════════════════╗')\n"
printf "$(bold '║   React Study-App  Full Audit                        ║')\n"
printf "$(bold '╚══════════════════════════════════════════════════════╝')\n"
printf "  Source: $(dim "$SRC")   Date: $(date '+%Y-%m-%d %H:%M')\n"

# ─────────────────────────────────────────────────────────────────────────────
# 1. BUILD HEALTH
# ─────────────────────────────────────────────────────────────────────────────
section "1 · Build Health"

if [[ ! -f package.json ]]; then
  fail "No package.json found — run from repo root"
else
  pass "package.json present"

  # node_modules
  if [[ -d node_modules ]]; then
    pass "node_modules exists"
  else
    warn "node_modules missing — run 'npm install' before deploying"
  fi

  # lock file
  if [[ -f package-lock.json || -f yarn.lock || -f pnpm-lock.yaml ]]; then
    pass "Lock file present"
  else
    warn "No lock file — dependency versions not pinned"
  fi

  # scripts
  for script in build lint; do
    if node -e "const p=require('./package.json'); process.exit(p.scripts && p.scripts['$script'] ? 0 : 1)" 2>/dev/null; then
      pass "npm run $script defined"
    else
      warn "npm run $script not defined"
    fi
  done

  # type-check
  if node -e "const p=require('./package.json'); process.exit((p.scripts && (p.scripts['typecheck'] || p.scripts['type-check'] || p.scripts['compile'])) ? 0 : 1)" 2>/dev/null; then
    pass "Type-check script defined"
  else
    warn "No typecheck/compile script — consider adding one"
  fi

  # build attempt (skip if --no-build flag set)
  if [[ "${SKIP_BUILD:-0}" != "1" ]]; then
    printf "  $(dim '  running npm run build …')\n"
    if npm run build --silent 2>/dev/null; then
      pass "Production build succeeds"
    else
      fail "Production build FAILED — run 'npm run build' for details"
    fi
  else
    warn "Build skipped (SKIP_BUILD=1)"
  fi
fi

# ─────────────────────────────────────────────────────────────────────────────
# 2. HEADING TEXT-SQUISH  (the flex + word-break bug)
# ─────────────────────────────────────────────────────────────────────────────
section "2 · Heading Text-Squish (Flex Layout)"

# 2a. Global CSS: word-break: break-word applied to headings
CSS_FILES=$(find "$SRC" -name "*.css" -o -name "*.js" -o -name "*.ts" | xargs grep -lE 'h[123].*word-break|word-break.*h[123]' 2>/dev/null | head -5)
WB_ON_HEADINGS=$(grep -rE 'h[1-3][^{]*\{[^}]*word-break\s*:\s*break-(word|all)' "$SRC" 2>/dev/null | wc -l | tr -d ' ')
# Also check JS template strings (appShell pattern)
WB_JS=$(grep -rE '"h[1-3]".*word-break|h[1-3].*word-break.*break-(word|all)' "$SRC" 2>/dev/null | wc -l | tr -d ' ')
SHELL_WB=$(grep -rE 'app-shell h[1-3]' "$SRC" --include="*.js" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')

if [[ "$WB_ON_HEADINGS" -gt 0 || "$WB_JS" -gt 0 ]]; then
  fail "word-break: break-word applied to h1/h2/h3 globally — causes character-level line breaks in flex rows"
  rg_files 'word-break' 5 | while read -r f; do printf "    $(dim "$f")\n"; done
  printf "  $(dim '  Fix: use overflow-wrap: anywhere instead; remove word-break: break-word from headings')\n"
else
  pass "No word-break: break-word on heading selectors"
fi

# 2b. h1/h2/h3 as flex children without flex:1 or min-width:0
RISKY_FLEX_HEADINGS=$(grep -rn '<h[1-3][^>]*style=' "$SRC" --include="*.jsx" --include="*.tsx" 2>/dev/null | \
  python3 -c "
import sys, re
hits = []
for line in sys.stdin:
    style = re.search(r'style=\{\{([^}]+)\}\}', line)
    if style:
        s = style.group(1)
        has_flex1 = 'flex: 1' in s or 'flex:1' in s
        has_minw  = 'minWidth' in s or 'min-width' in s
        if not has_flex1 and not has_minw:
            hits.append(line.strip())
for h in hits[:8]:
    print(h[:120])
" 2>/dev/null | wc -l | tr -d ' ')

# Simpler heuristic: look for space-between flex rows that contain h1/h2 nearby
FLEX_H_FILES=$(grep -rlE 'justifyContent.*space-between|space-between.*justifyContent' "$SRC" --include="*.jsx" --include="*.tsx" 2>/dev/null | head -10)
if [[ -n "$FLEX_H_FILES" ]]; then
  AFFECTED=0
  while IFS= read -r file; do
    # Check if file has BOTH space-between AND an h1/h2/h3 without flex:1/minWidth:0
    if grep -qE 'space-between' "$file" && grep -qE '<h[1-3]' "$file"; then
      # Check if any h1/h2/h3 in that file lacks flex:1 or minWidth
      HAS_SAFE=$(grep -cE 'flex.*1.*minWidth|minWidth.*flex.*1|flex: 1|minWidth: 0' "$file" 2>/dev/null)
      H_COUNT=$(grep -cE '<h[1-3]' "$file" 2>/dev/null)
      if [[ "$H_COUNT" -gt 0 && ( "$HAS_SAFE" -eq 0 || "$H_COUNT" -gt "$HAS_SAFE" ) ]]; then
        AFFECTED=$(( AFFECTED + 1 ))
        printf "  $(yellow '⚠') Check: $(dim "${file##$SRC/}") — h1/h2/h3 in flex space-between rows may need flex:1;minWidth:0\n"
      fi
    fi
  done <<< "$FLEX_H_FILES"
  if [[ "$AFFECTED" -eq 0 ]]; then
    pass "Heading flex-row layouts appear safe"
  fi
else
  pass "No flex space-between rows with headings detected"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 3. SEARCH INDEX COVERAGE
# ─────────────────────────────────────────────────────────────────────────────
section "3 · Search Index Coverage"

SEARCH_FILES=$(rg_files 'search|Search|_search|index.*search|searchIndex' 6)
if [[ -z "$SEARCH_FILES" ]]; then
  warn "No search index or search functionality detected"
else
  pass "Search-related code found"
  echo "$SEARCH_FILES" | while read -r f; do printf "    $(dim "$f")\n"; done
fi

# Check if search covers multiple content types
DATA_FILES=$(find "$SRC/data" -name "*.js" -o -name "*.ts" 2>/dev/null | wc -l | tr -d ' ')
SEARCH_DATA_REFS=$(grep -rE 'data/|curated|questions|labs|glossary' "$SRC" --include="*.jsx" --include="*.js" 2>/dev/null | grep -iE 'search|index|_search' | wc -l | tr -d ' ')

if [[ "$DATA_FILES" -gt 3 && "$SEARCH_DATA_REFS" -lt 2 ]]; then
  warn "Search may not index all $DATA_FILES data files — verify all content types are included"
else
  pass "Search references multiple data sources ($SEARCH_DATA_REFS references)"
fi

# Warn if filter/search runs on every keystroke without memoization
KEYSTROKE_SEARCH=$(grep -rE 'filter\(.*toLowerCase|\.toLowerCase.*filter' "$SRC" --include="*.jsx" --include="*.tsx" 2>/dev/null | grep -v 'useMemo\|useCallback\|_search' | wc -l | tr -d ' ')
if [[ "$KEYSTROKE_SEARCH" -gt 3 ]]; then
  warn "$KEYSTROKE_SEARCH places filter content inline on render — consider pre-built search index for performance"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 4. ANSWER FEEDBACK QUALITY
# ─────────────────────────────────────────────────────────────────────────────
section "4 · Answer Feedback Quality"

# ✓/✗ markers on choices
CHECK_MARKS=$(rg_count '✓|✗|checkmark|correct.*marker|marker.*correct')
if [[ "$CHECK_MARKS" -gt 0 ]]; then
  pass "✓/✗ choice markers present ($CHECK_MARKS hits)"
else
  warn "No ✓/✗ markers on answer choices — users can't see which was correct at a glance"
fi

# Wrong-answer explanation
WRONG_EXPLAIN=$(rg_count 'wrongExplain|buildWrong|incorrectExplain|answerReview|AnswerReview|wrongAnswer')
if [[ "$WRONG_EXPLAIN" -gt 0 ]]; then
  pass "Wrong-answer explanation component present ($WRONG_EXPLAIN references)"
else
  warn "No wrong-answer explanation detected — students don't learn WHY an answer is wrong"
fi

# Curated exam traps / misconceptions surfaced on wrong answer
EXAM_TRAPS=$(rg_count 'examTrap|exam_trap|misconception')
if [[ "$EXAM_TRAPS" -gt 0 ]]; then
  pass "Exam traps / misconceptions referenced ($EXAM_TRAPS hits)"
else
  warn "No examTraps/misconceptions surfaced on wrong answers — missed teaching opportunity"
fi

# Auto-advance after reveal (time pressure)
AUTO_ADVANCE=$(rg_count 'autoLeft|auto.*advance|AUTO_ADVANCE')
if [[ "$AUTO_ADVANCE" -gt 0 ]]; then
  pass "Auto-advance after reveal present"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 5. ACCESSIBILITY BASICS
# ─────────────────────────────────────────────────────────────────────────────
section "5 · Accessibility Basics"

# Buttons without aria-label (icon-only buttons are risky)
ICON_BTNS_NO_ARIA=$(grep -rEn '<button[^>]*>[^<]{0,2}</button>|<button[^>]*>✕</button>|<button[^>]*>×</button>' \
  "$SRC" --include="*.jsx" --include="*.tsx" 2>/dev/null | \
  grep -v 'aria-label' | wc -l | tr -d ' ')
if [[ "$ICON_BTNS_NO_ARIA" -gt 0 ]]; then
  warn "$ICON_BTNS_NO_ARIA icon-only button(s) without aria-label"
else
  pass "Icon-only buttons appear to have aria-labels"
fi

# Modals / dialogs with role="dialog"
DIALOG_ROLE=$(rg_count 'role="dialog"|role=\{.dialog.\}')
DIALOG_ARIA=$(rg_count 'aria-modal|aria-labelledby')
if [[ "$DIALOG_ROLE" -gt 0 ]]; then
  pass "Modal role=\"dialog\" present ($DIALOG_ROLE)"
  if [[ "$DIALOG_ARIA" -gt 0 ]]; then
    pass "aria-modal / aria-labelledby used on dialogs"
  else
    warn "Modals found but no aria-modal/aria-labelledby — screen readers won't announce dialog context"
  fi
else
  # Only warn if there are overlay/modal patterns
  OVERLAY=$(rg_count 'modal|overlay|ccna-overlay|position.*fixed.*zIndex')
  if [[ "$OVERLAY" -gt 2 ]]; then
    warn "Modal/overlay components found but none have role=\"dialog\""
  fi
fi

# Focus trap in modals
FOCUS_TRAP=$(rg_count 'focusTrap|useFocusTrap|focus.*trap|trapFocus')
if [[ "$FOCUS_TRAP" -gt 0 ]]; then
  pass "Focus trap implementation present"
else
  MODAL_COUNT=$(rg_count 'role="dialog"')
  if [[ "$MODAL_COUNT" -gt 0 ]]; then
    warn "Modals present but no focus trap — keyboard users can tab outside the dialog"
  fi
fi

# Keyboard handler on non-button interactive elements
DIV_ONCLICK=$(grep -rEn '<div[^>]*onClick=' "$SRC" --include="*.jsx" --include="*.tsx" 2>/dev/null | grep -v 'onKeyDown\|onKeyPress\|role=' | wc -l | tr -d ' ')
if [[ "$DIV_ONCLICK" -gt 5 ]]; then
  warn "$DIV_ONCLICK div onClick handlers without keyboard equivalent (onKeyDown) or role"
else
  pass "Interactive divs appear to have keyboard handlers or roles"
fi

# alt text on images
IMG_NO_ALT=$(grep -rEn '<img[^>]*>' "$SRC" --include="*.jsx" --include="*.tsx" 2>/dev/null | grep -v 'alt=' | wc -l | tr -d ' ')
if [[ "$IMG_NO_ALT" -gt 0 ]]; then
  warn "$IMG_NO_ALT <img> element(s) without alt attribute"
else
  pass "All <img> elements appear to have alt attributes"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 6. CONTENT FIELD COMPLETENESS
# ─────────────────────────────────────────────────────────────────────────────
section "6 · Content Field Completeness"

DATA_DIR="$SRC/data"
if [[ ! -d "$DATA_DIR" ]]; then
  warn "No src/data directory found — adjust path if data lives elsewhere"
else
  # Count JS data files
  DATA_COUNT=$(find "$DATA_DIR" -name "*.js" -o -name "*.ts" | wc -l | tr -d ' ')
  pass "$DATA_COUNT data files in $DATA_DIR"

  # Check for required fields in question objects
  QUESTIONS_FILES=$(grep -rl 'question\|correctIndex\|choices\|answers' "$DATA_DIR" 2>/dev/null | wc -l | tr -d ' ')
  if [[ "$QUESTIONS_FILES" -gt 0 ]]; then
    pass "Question bank files detected ($QUESTIONS_FILES)"

    # Questions missing correctIndex
    NO_CORRECT=$(grep -rE '"question"' "$DATA_DIR" 2>/dev/null | grep -v 'correctIndex\|correct_index\|correctAnswer\|answer' | wc -l | tr -d ' ')
    if [[ "$NO_CORRECT" -gt 10 ]]; then
      warn "$NO_CORRECT question-like objects may be missing correctIndex"
    else
      pass "Question objects appear to have answer fields"
    fi
  fi

  # Check curated content completeness
  CURATED=$(grep -rl 'examTraps\|flashcards\|glossary\|ckus\|reading' "$DATA_DIR" 2>/dev/null | wc -l | tr -d ' ')
  if [[ "$CURATED" -gt 0 ]]; then
    pass "Curated content fields present in $CURATED files"

    # Look for stubs (examTraps: [] or empty arrays)
    EMPTY_TRAPS=$(grep -rE 'examTraps\s*:\s*\[\s*\]' "$DATA_DIR" 2>/dev/null | wc -l | tr -d ' ')
    EMPTY_FLASH=$(grep -rE 'flashcards\s*:\s*\[\s*\]' "$DATA_DIR" 2>/dev/null | wc -l | tr -d ' ')
    [[ "$EMPTY_TRAPS" -gt 0 ]] && warn "$EMPTY_TRAPS objective(s) have empty examTraps arrays"
    [[ "$EMPTY_FLASH" -gt 0 ]] && warn "$EMPTY_FLASH objective(s) have empty flashcards arrays"
  fi

  # objectiveId presence in questions (enables cross-referencing for feedback)
  OBJ_ID=$(grep -rE 'objectiveId' "$DATA_DIR" 2>/dev/null | wc -l | tr -d ' ')
  CKUIDS=$(grep -rE 'ckuIds' "$DATA_DIR" 2>/dev/null | wc -l | tr -d ' ')
  if [[ "$OBJ_ID" -gt 0 ]]; then
    pass "objectiveId field present on questions ($OBJ_ID references)"
  else
    warn "No objectiveId on questions — curated-content cross-referencing won't work"
  fi
  if [[ "$CKUIDS" -gt 0 ]]; then
    pass "ckuIds cross-reference field present ($CKUIDS references)"
  else
    warn "No ckuIds on questions — per-CKU exam-trap / misconception surfacing won't work"
  fi
fi

# ─────────────────────────────────────────────────────────────────────────────
# 7. TTS / VOICE / READ-ALOUD
# ─────────────────────────────────────────────────────────────────────────────
section "7 · TTS / Voice Read-Aloud"

TTS=$(rg_count 'speechSynthesis|SpeechSynthesisUtterance|useTTS|SpeakButton')
if [[ "$TTS" -gt 0 ]]; then
  pass "Browser speechSynthesis TTS present ($TTS references)"
  # Check that it has a stop/cancel path
  STOP=$(rg_count 'speechSynthesis\.cancel|\.stop()')
  if [[ "$STOP" -gt 0 ]]; then
    pass "TTS stop/cancel implemented"
  else
    warn "TTS found but no speechSynthesis.cancel() — 'stop' button may be broken"
  fi
  # Markup stripping before speaking
  STRIP=$(rg_count '_stripMarkup\|stripMarkdown\|replace.*\*\*\|replace.*backtick')
  if [[ "$STRIP" -gt 0 ]]; then
    pass "Markdown/markup stripping before TTS present"
  else
    warn "No markup stripping before TTS — asterisks/backticks will be read aloud"
  fi
else
  warn "No TTS / read-aloud feature — consider adding browser speechSynthesis (zero cost, no deps)"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 8. MODAL / OVERLAY PATTERNS
# ─────────────────────────────────────────────────────────────────────────────
section "8 · Modal / Overlay Patterns"

# Body scroll lock when modal is open
SCROLL_LOCK=$(rg_count 'document\.body\.style\.overflow|body.*overflow.*hidden')
MODAL_TOTAL=$(rg_count 'role="dialog"')
if [[ "$MODAL_TOTAL" -gt 0 ]]; then
  if [[ "$SCROLL_LOCK" -gt 0 ]]; then
    pass "Body scroll lock present with modals"
  else
    warn "Modals found but no body overflow:hidden lock — background scrolls while modal is open"
  fi
fi

# Escape key handler on modals
ESC_HANDLER=$(rg_count "key === 'Escape'|key === 'Esc'|keyCode === 27")
if [[ "$MODAL_TOTAL" -gt 0 && "$ESC_HANDLER" -eq 0 ]]; then
  warn "Modals present but no Escape-key handler to close them"
elif [[ "$ESC_HANDLER" -gt 0 ]]; then
  pass "Escape key handler present"
fi

# Backdrop click to close
BACKDROP=$(rg_count 'onClick.*onClose|backdrop.*click|overlay.*onClick')
if [[ "$MODAL_TOTAL" -gt 0 && "$BACKDROP" -gt 0 ]]; then
  pass "Backdrop click-to-close present"
fi

# Click propagation stop (prevents backdrop close when clicking content)
STOP_PROP=$(rg_count 'stopPropagation')
if [[ "$MODAL_TOTAL" -gt 0 && "$STOP_PROP" -eq 0 ]]; then
  warn "Modal content doesn't call stopPropagation — backdrop click closes even when clicking inside"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 9. DEAD CODE / UNUSED IMPORTS (quick scan)
# ─────────────────────────────────────────────────────────────────────────────
section "9 · Dead Code / Unused Imports"

# console.log left in source
CONSOLE_LOGS=$(grep -rEn 'console\.(log|warn|error|debug)' "$SRC" --include="*.jsx" --include="*.tsx" --include="*.js" --include="*.ts" 2>/dev/null | grep -v '__tests__\|test\.' | wc -l | tr -d ' ')
if [[ "$CONSOLE_LOGS" -gt 5 ]]; then
  warn "$CONSOLE_LOGS console.log/warn/error statements in production source"
else
  pass "Minimal console statements ($CONSOLE_LOGS)"
fi

# TODO/FIXME/HACK comments
TODOS=$(grep -rEn 'TODO|FIXME|HACK|XXX' "$SRC" --include="*.jsx" --include="*.tsx" --include="*.js" --include="*.ts" 2>/dev/null | grep -v '__tests__' | wc -l | tr -d ' ')
if [[ "$TODOS" -gt 0 ]]; then
  warn "$TODOS TODO/FIXME/HACK comments in source"
  grep -rEn 'TODO|FIXME|HACK' "$SRC" --include="*.jsx" --include="*.js" 2>/dev/null | head -5 | while read -r line; do
    printf "    $(dim "${line:0:100}")\n"
  done
fi

# Duplicate import of same module
DUP_IMPORTS=$(grep -rEh "^import .* from '[^']+'" "$SRC" --include="*.jsx" --include="*.tsx" 2>/dev/null | sort | uniq -d | wc -l | tr -d ' ')
if [[ "$DUP_IMPORTS" -gt 0 ]]; then
  warn "$DUP_IMPORTS duplicate import statements across files"
fi

# ─────────────────────────────────────────────────────────────────────────────
# 10. KNOWN RISKY PATTERNS
# ─────────────────────────────────────────────────────────────────────────────
section "10 · Known Risky Patterns"

# dangerouslySetInnerHTML
DSIHTML=$(rg_count 'dangerouslySetInnerHTML')
if [[ "$DSIHTML" -gt 0 ]]; then
  fail "$DSIHTML dangerouslySetInnerHTML usage — XSS risk if content is user-supplied"
  rg_files 'dangerouslySetInnerHTML' 5 | while read -r f; do printf "    $(dim "$f")\n"; done
else
  pass "No dangerouslySetInnerHTML"
fi

# eval / new Function
EVAL=$(rg_count '\beval\(|new Function\(')
if [[ "$EVAL" -gt 0 ]]; then
  fail "$EVAL eval() / new Function() calls — code injection risk"
else
  pass "No eval() or new Function()"
fi

# API keys / secrets in source
SECRETS=$(grep -rEn 'api[_-]?key|secret[_-]?key|password\s*=\s*["\x27][^"\x27]{6}' \
  "$SRC" --include="*.jsx" --include="*.js" --include="*.ts" 2>/dev/null | \
  grep -viE 'process\.env|import\.meta\.env|placeholder|example|test|spec|__tests__' | wc -l | tr -d ' ')
if [[ "$SECRETS" -gt 0 ]]; then
  fail "$SECRETS possible hardcoded secret(s) in source"
  grep -rEn 'api[_-]?key|secret[_-]?key' "$SRC" --include="*.jsx" --include="*.js" 2>/dev/null | \
    grep -viE 'process\.env|import\.meta\.env|placeholder|example|test' | head -3 | \
    while read -r line; do printf "    $(red "${line:0:100}")\n"; done
else
  pass "No hardcoded secrets detected"
fi

# Unkeyed list renders (missing key prop)
UNKEYED=$(grep -rEn '\.map\([^)]+\)\s*=>\s*<' "$SRC" --include="*.jsx" --include="*.tsx" 2>/dev/null | \
  grep -v 'key=' | wc -l | tr -d ' ')
if [[ "$UNKEYED" -gt 3 ]]; then
  warn "$UNKEYED .map() renders possibly missing 'key' prop — causes React reconciliation bugs"
else
  pass "List renders appear to have key props"
fi

# useEffect without dependency array (runs every render — intentional sometimes, risky often)
EFFECT_NO_DEP=$(grep -rEn 'useEffect\(' "$SRC" --include="*.jsx" --include="*.tsx" 2>/dev/null | \
  grep -v '\[\])\|, \[' | wc -l | tr -d ' ')
if [[ "$EFFECT_NO_DEP" -gt 3 ]]; then
  warn "$EFFECT_NO_DEP useEffect() without dependency array — runs on every render (may be intentional for timers, verify)"
fi

# Inline object/function in JSX props (causes re-render every time)
INLINE_OBJ=$(grep -rEn 'style=\{\{[^}]{80,}\}\}' "$SRC" --include="*.jsx" --include="*.tsx" 2>/dev/null | wc -l | tr -d ' ')
if [[ "$INLINE_OBJ" -gt 20 ]]; then
  warn "$INLINE_OBJ very large inline style objects — consider extracting to constants"
fi

# ─────────────────────────────────────────────────────────────────────────────
# SUMMARY
# ─────────────────────────────────────────────────────────────────────────────
echo
printf "$(bold '══════════════════════════════════════════════════════')\n"
printf "$(bold '  AUDIT SUMMARY')\n"
printf "  $(green "✓ $PASS passed")   $(yellow "⚠ $WARN warnings")   $(red "✗ $FAIL failures")\n"
printf "$(bold '══════════════════════════════════════════════════════')\n"

if [[ ${#ISSUES[@]} -gt 0 ]]; then
  echo
  printf "$(bold '  Issues to address:')\n"
  for issue in "${ISSUES[@]}"; do
    if [[ "$issue" == FAIL:* ]]; then
      printf "  $(red '✗') ${issue#FAIL: }\n"
    else
      printf "  $(yellow '⚠') ${issue#WARN: }\n"
    fi
  done
fi

echo
if [[ "$FAIL" -gt 0 ]]; then
  printf "  $(red '  → Fix FAIL items before shipping.')\n"
  exit 1
elif [[ "$WARN" -gt 5 ]]; then
  printf "  $(yellow '  → Several warnings — address before production deploy.')\n"
  exit 0
else
  printf "  $(green '  → Looking good!')\n"
  exit 0
fi
