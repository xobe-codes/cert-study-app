import { COLORS, styles, accentColors } from '../ui/appTheme.js'

/** Uniform vertical rhythm on the home screen. */
export const HOME_SECTION_GAP = 12

/** Standard home card — consistent margin below each block. */
export function homeCard(extra = {}) {
  return { ...styles.card, marginBottom: HOME_SECTION_GAP, ...extra }
}

/** Uppercase section headers (FOR YOU, STUDY MODES, YOUR PROGRESS, …). */
export function homeSectionLabel(color = COLORS.silver) {
  return {
    fontSize: 'var(--ccna-type-xs)',
    fontWeight: 700,
    color,
    letterSpacing: 0.5,
    marginBottom: 8,
    lineHeight: 1.3,
  }
}

/** Semantic chips (STUDY NEXT, streak, domain weight, suggestion chip). */
export function homePill(accent) {
  return {
    ...styles.pill(accent),
    fontSize: 'var(--ccna-type-xs)',
    lineHeight: 1.3,
    padding: '4px 10px',
  }
}

/** Compact numeric badges (trap counts, 3×, etc.). */
export function homePillCount(accent) {
  return {
    ...styles.pill(accent),
    fontSize: 'var(--ccna-type-micro)',
    padding: '2px 8px',
    minWidth: 30,
    textAlign: 'center',
    lineHeight: 1.35,
  }
}

/** Text link buttons in card headers (Stats →, Review missed →). */
export function homeLinkBtn(color) {
  return {
    background: 'none',
    border: 'none',
    color,
    fontSize: 'var(--ccna-type-xs)',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    padding: '10px 0',
    minHeight: 44,
    flexShrink: 0,
  }
}

/** Card dismiss (×) — 44px touch target. */
export const homeDismissBtn = {
  position: 'absolute',
  top: 8,
  right: 8,
  background: 'none',
  border: 'none',
  color: COLORS.silverMid,
  fontSize: 'var(--ccna-type-lg)',
  cursor: 'pointer',
  lineHeight: 1,
  padding: 0,
  minWidth: 44,
  minHeight: 44,
}

/** Secondary body copy inside cards. */
export const homeBodySm = {
  fontSize: 'var(--ccna-type-sm)',
  color: COLORS.silverMid,
  lineHeight: 1.5,
}

/** Body copy on accent-tinted strips/cards — use silver (not silverMid) for contrast on dim backgrounds. */
export const homeBodyOnAccent = {
  fontSize: 'var(--ccna-type-sm)',
  color: COLORS.silver,
  lineHeight: 1.5,
}

/** Primary in-card title line. */
export const homeTitleSm = {
  fontSize: 'var(--ccna-type-sm)',
  fontWeight: 600,
  color: COLORS.silver,
  lineHeight: 1.4,
}

/** Study Next / accent CTA strip — matches card radius and padding. */
export function homeAccentStrip(accent) {
  const c = accentColors(accent)
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    textAlign: 'left',
    cursor: 'pointer',
    fontFamily: 'inherit',
    background: c.dim,
    border: `1px solid ${c.border}`,
    borderRadius: 14,
    padding: '12px 14px',
    marginBottom: HOME_SECTION_GAP,
  }
}
