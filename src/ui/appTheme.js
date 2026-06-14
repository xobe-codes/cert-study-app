/* Design tokens — semantic color system for dark/light themes */

const PALETTES = {
  dark: {
    bg: '#2a1229',
    surface: 'rgba(55, 20, 42, 0.72)',
    card: 'rgba(72, 26, 50, 0.84)',
    cardHover: 'rgba(82, 30, 56, 0.9)',
    border: 'rgba(180, 120, 140, 0.22)',
    borderGlow: 'rgba(238, 69, 64, 0.34)',
    brand: '#EE4540',
    brandM: '#C72B40',
    brandGlow: '#f06a65',
    brandDim: 'rgba(55, 20, 42, 0.72)',
    purple: '#7c3aed',
    purpleM: '#9333ea',
    purpleGlow: '#c084fc',
    purpleDim: 'rgba(61, 21, 53, 0.78)',
    mint: '#d4f7d4',
    mintDim: 'rgba(26, 51, 32, 0.82)',
    mintBorder: 'rgba(58, 102, 64, 0.55)',
    sky: '#baf0fa',
    skyDim: 'rgba(13, 42, 53, 0.82)',
    skyBorder: 'rgba(26, 80, 96, 0.55)',
    blush: '#fde8e8',
    blushDim: 'rgba(42, 21, 32, 0.82)',
    blushBorder: 'rgba(90, 37, 48, 0.55)',
    rose: '#e0a0a0',
    roseDim: 'rgba(42, 16, 16, 0.82)',
    roseBorder: 'rgba(122, 53, 53, 0.55)',
    amber: '#fcd980',
    amberDim: 'rgba(42, 36, 16, 0.82)',
    amberBorder: 'rgba(107, 86, 24, 0.55)',
    silver: '#ddd0d6',
    silverMid: '#b89aa8',
    silverDim: 'rgba(106, 58, 85, 0.45)',
    cardShadow: '0 10px 32px rgba(0, 0, 0, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
    glowA: '#C72B4030',
    glowB: '#510A3238',
    focus: '#EE454048',
    shimmerLine: '#ffffff18',
  },
  light: {
    bg: '#eef0f6',
    surface: '#e6e9f2',
    card: '#ffffff',
    cardHover: '#f4f6fb',
    border: '#d5d9e6',
    borderGlow: '#b3a3e6',
    brand: '#C72B40',
    brandM: '#EE4540',
    brandGlow: '#C72B40',
    brandDim: '#fde8ea',
    purple: '#6d28d9',
    purpleM: '#7c3aed',
    purpleGlow: '#6d28d9',
    purpleDim: '#ece9fb',
    mint: '#1f7a35',
    mintDim: '#e4f3df',
    mintBorder: '#86bf57',
    sky: '#0e5aa0',
    skyDim: '#e1f0fb',
    skyBorder: '#8cc0ec',
    blush: '#9a3b3b',
    blushDim: '#fdeaea',
    blushBorder: '#f0b0b0',
    rose: '#a32d2d',
    roseDim: '#fcebeb',
    roseBorder: '#ef9595',
    amber: '#8a5208',
    amberDim: '#fbeedb',
    amberBorder: '#eaa53a',
    silver: '#1e2130',
    silverMid: '#5b6178',
    silverDim: '#c4c8d8',
    cardShadow: '0 4px 16px #00000033',
    glowA: '#dcd6f7aa',
    glowB: '#dcebfaaa',
    focus: '#C72B4055',
    shimmerLine: '#00000014',
  },
}
const COLOR_KEYS = Object.keys(PALETTES.dark)
const COLORS = Object.fromEntries(COLOR_KEYS.map(k => [k, `var(--ccna-${k})`]))
// CSS that publishes each palette under its [data-theme] selector.
const THEME_CSS = Object.entries(PALETTES)
  .map(([name, p]) => `[data-theme="${name}"]{${Object.entries(p).map(([k, v]) => `--ccna-${k}:${v};`).join('')}}`)
  .join('\n')
function accentColors(accent) {
  switch (accent) {
    case 'mint': return { dim: COLORS.mintDim, border: COLORS.mintBorder, text: COLORS.mint }
    case 'sky': return { dim: COLORS.skyDim, border: COLORS.skyBorder, text: COLORS.sky }
    case 'amber': return { dim: COLORS.amberDim, border: COLORS.amberBorder, text: COLORS.amber }
    case 'blush': return { dim: COLORS.blushDim, border: COLORS.blushBorder, text: COLORS.blush }
    case 'rose': return { dim: COLORS.roseDim, border: COLORS.roseBorder, text: COLORS.rose }
    case 'silver': return { dim: COLORS.silverDim, border: COLORS.silverDim, text: COLORS.silver }
    case 'brand': return { dim: COLORS.brandDim, border: COLORS.borderGlow, text: COLORS.brandGlow }
    case 'purple':
    default: return { dim: COLORS.purpleDim, border: COLORS.purpleDim, text: COLORS.purpleGlow }
  }
}

const styles = {
  page: { width: '100%', height: '100%', overflow: 'hidden' },
  container: { width: '100%', margin: '0 auto', padding: '8px 0 16px', boxSizing: 'border-box' },
  card: { background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 14, marginBottom: 10, boxShadow: COLORS.cardShadow, maxWidth: '100%', boxSizing: 'border-box', overflow: 'hidden' },
  cardHover: { background: COLORS.cardHover },
  h1: { fontSize: 20, fontWeight: 700, color: COLORS.silver, margin: '2px 0 4px', lineHeight: 1.25 },
  h2: { fontSize: 17, fontWeight: 600, color: COLORS.silver, margin: '0 0 8px' },
  small: { fontSize: 13, color: COLORS.silverMid },
  primaryBtn: {
    background: `linear-gradient(135deg, ${COLORS.brand}, ${COLORS.brandM})`,
    color: '#fff', border: 'none', borderRadius: 12, padding: '12px 18px',
    fontSize: 15, fontWeight: 600, minHeight: 44, cursor: 'pointer', width: '100%',
  },
  secondaryBtn: {
    background: COLORS.card, color: COLORS.silver, border: `1px solid ${COLORS.border}`,
    borderRadius: 12, padding: '12px 18px', fontSize: 15, fontWeight: 600, minHeight: 44, cursor: 'pointer', width: '100%',
  },
  input: {
    width: '100%', boxSizing: 'border-box', background: COLORS.surface, color: COLORS.silver,
    border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: '12px 14px', fontSize: 15,
    minHeight: 44, fontFamily: 'inherit',
  },
  pill: (accent) => {
    const c = accentColors(accent)
    return { display: 'inline-block', background: c.dim, border: `1px solid ${c.border}`, color: c.text, borderRadius: 999, padding: '3px 10px', fontSize: 12, fontWeight: 600 }
  },
  tabBar: { display: 'flex', gap: 4, marginBottom: 10, flexWrap: 'wrap' },
  tabBtn: (active) => ({
    flex: '1 1 auto', minHeight: 40, borderRadius: 10, border: `1px solid ${active ? COLORS.brandGlow : COLORS.border}`,
    background: active ? COLORS.brandDim : COLORS.surface, color: active ? COLORS.brandGlow : COLORS.silverMid,
    fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: '8px 6px',
  }),
  backBtn: { background: 'none', border: 'none', color: COLORS.silverMid, fontSize: 15, cursor: 'pointer', padding: '10px 0', minHeight: 44, display: 'flex', alignItems: 'center', gap: 6 },
}

export { PALETTES, COLORS, THEME_CSS, accentColors, styles }
