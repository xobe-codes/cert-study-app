/* Design tokens — semantic color system for dark/light themes */

const PALETTES = {
  dark: {
    bg: '#2D132C',
    surface: '#510A32',
    card: '#7F1437',
    cardHover: '#8b1a42',
    border: '#5c1838',
    borderGlow: '#C72B40',
    brand: '#EE4540',
    brandM: '#C72B40',
    brandGlow: '#f06a65',
    brandDim: '#510A32',
    purple: '#7c3aed',
    purpleM: '#9333ea',
    purpleGlow: '#c084fc',
    purpleDim: '#3d1535',
    mint: '#d4f7d4',
    mintDim: '#1a3320',
    mintBorder: '#3a6640',
    sky: '#baf0fa',
    skyDim: '#0d2a35',
    skyBorder: '#1a5060',
    blush: '#fde8e8',
    blushDim: '#2a1520',
    blushBorder: '#5a2530',
    rose: '#e0a0a0',
    roseDim: '#2a1010',
    roseBorder: '#7a3535',
    amber: '#fcd980',
    amberDim: '#2a2410',
    amberBorder: '#6b5618',
    silver: '#d9d9d9',
    silverMid: '#b08a9a',
    silverDim: '#6a3a55',
    glowA: '#C72B4055',
    glowB: '#510A3266',
    focus: '#EE454055',
    shimmerLine: '#ffffff22',
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
  card: { background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 14, marginBottom: 10, boxShadow: '0 4px 16px #00000033', maxWidth: '100%', boxSizing: 'border-box', overflow: 'hidden' },
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
