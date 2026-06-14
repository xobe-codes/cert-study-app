/* Design tokens — semantic color system for dark/light themes */

const PALETTES = {
  dark: {
    bg: '#07080d', surface: '#0d0e18', card: '#111220', cardHover: '#161728',
    border: '#1e2035', borderGlow: '#2e2050',
    purple: '#7c3aed', purpleM: '#9333ea', purpleGlow: '#c084fc', purpleDim: '#2d1f5e',
    mint: '#d4f7d4', mintDim: '#1a3320', mintBorder: '#3a6640',
    sky: '#baf0fa', skyDim: '#0d2a35', skyBorder: '#1a5060',
    blush: '#fde8e8', blushDim: '#2a1520', blushBorder: '#5a2530',
    rose: '#e0a0a0', roseDim: '#2a1010', roseBorder: '#7a3535',
    amber: '#fcd980', amberDim: '#2a2410', amberBorder: '#6b5618',
    silver: '#d9d9d9', silverMid: '#8a8fa8', silverDim: '#3a3f55',
    glowA: '#2d1f5e88', glowB: '#0d2a3588', focus: '#c084fc55', shimmerLine: '#ffffff22',
  },
  light: {
    bg: '#eef0f6', surface: '#e6e9f2', card: '#ffffff', cardHover: '#f4f6fb',
    border: '#d5d9e6', borderGlow: '#b3a3e6',
    purple: '#6d28d9', purpleM: '#7c3aed', purpleGlow: '#6d28d9', purpleDim: '#ece9fb',
    mint: '#1f7a35', mintDim: '#e4f3df', mintBorder: '#86bf57',
    sky: '#0e5aa0', skyDim: '#e1f0fb', skyBorder: '#8cc0ec',
    blush: '#9a3b3b', blushDim: '#fdeaea', blushBorder: '#f0b0b0',
    rose: '#a32d2d', roseDim: '#fcebeb', roseBorder: '#ef9595',
    amber: '#8a5208', amberDim: '#fbeedb', amberBorder: '#eaa53a',
    silver: '#1e2130', silverMid: '#5b6178', silverDim: '#c4c8d8',
    glowA: '#dcd6f7aa', glowB: '#dcebfaaa', focus: '#6d28d955', shimmerLine: '#00000014',
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
    case 'purple':
    default: return { dim: COLORS.purpleDim, border: COLORS.purpleDim, text: COLORS.purpleGlow }
  }
}

const styles = {
  page: { minHeight: '100vh', background: COLORS.bg, color: COLORS.silver, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', paddingBottom: 'calc(env(safe-area-inset-bottom) + 80px)', paddingTop: 'env(safe-area-inset-top)', paddingLeft: 'env(safe-area-inset-left)', paddingRight: 'env(safe-area-inset-right)' },
  container: { maxWidth: 640, margin: '0 auto', padding: '16px 16px 40px' },
  card: { background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 16, marginBottom: 12, boxShadow: '0 4px 16px #00000033' },
  cardHover: { background: COLORS.cardHover },
  h1: { fontSize: 22, fontWeight: 700, color: COLORS.silver, margin: '4px 0 4px' },
  h2: { fontSize: 17, fontWeight: 600, color: COLORS.silver, margin: '0 0 8px' },
  small: { fontSize: 13, color: COLORS.silverMid },
  primaryBtn: {
    background: `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.purpleM})`,
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
  tabBar: { display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' },
  tabBtn: (active) => ({
    flex: '1 1 auto', minHeight: 44, borderRadius: 10, border: `1px solid ${active ? COLORS.purpleGlow : COLORS.border}`,
    background: active ? COLORS.purpleDim : COLORS.surface, color: active ? COLORS.purpleGlow : COLORS.silverMid,
    fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: '10px 8px',
  }),
  backBtn: { background: 'none', border: 'none', color: COLORS.silverMid, fontSize: 15, cursor: 'pointer', padding: '10px 0', minHeight: 44, display: 'flex', alignItems: 'center', gap: 6 },
}

export { PALETTES, COLORS, THEME_CSS, accentColors, styles }
