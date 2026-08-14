import { buildAppShellResponsiveCss } from './appShellResponsiveCss.js'
import { buildAppShellChromeCss } from './appShellChromeCss.js'
import { buildAppShellObjectiveCss } from './appShellObjectiveCss.js'
/** Viewport-locked app shell — document never scrolls; routes use internal panels. */

export const SITE_COLUMN_MAX = 720

const FLUID_TYPE_CSS = `
    :root {
      --ccna-bottom-nav-height: 64px;
      --vv-bottom-inset: 0px;
      --ccna-safe-top: env(safe-area-inset-top, 0px);
      --ccna-safe-right: env(safe-area-inset-right, 0px);
      --ccna-safe-bottom: env(safe-area-inset-bottom, 0px);
      --ccna-safe-left: env(safe-area-inset-left, 0px);
      --ccna-type-caption: clamp(12px, 0.65vmin + 10px, 14px);
      --ccna-type-micro: clamp(12px, 0.55vmin + 10px, 13px);
      --ccna-type-xs: clamp(13px, 0.7vmin + 11px, 15px);
      --ccna-type-sm: clamp(14px, 0.85vmin + 11px, 16px);
      --ccna-type-md: clamp(16px, 1vmin + 13px, 18px);
      --ccna-type-lg: clamp(17px, 1.15vmin + 13px, 20px);
      --ccna-type-xl: clamp(19px, 1.35vmin + 14px, 24px);
      --ccna-type-2xl: clamp(22px, 1.65vmin + 15px, 28px);
      --ccna-type-display: clamp(26px, 2.1vmin + 16px, 34px);
      --ccna-type-timer: clamp(15px, 1.1vmin + 12px, 18px);
      --ccna-line-body: 1.52;
      --ccna-line-read: 1.65;
    }
`

export function buildAppShellCss(colors) {
  return `
    ${FLUID_TYPE_CSS}
    html, body, #root {
      width: 100%;
      max-width: 100%;
      min-height: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      overflow: hidden;
      overflow-x: hidden;
      overscroll-behavior-x: none;
      touch-action: pan-y;
      background-color: ${colors.bg};
      background-image:
        radial-gradient(120vmax 62vmax at 50% -18%, ${colors.glowA}, transparent 58%),
        radial-gradient(90vmax 48vmax at 100% 0%, ${colors.glowB}, transparent 52%),
        radial-gradient(90vmax 48vmax at 0% 100%, ${colors.glowB}, transparent 52%);
      background-attachment: fixed;
      background-repeat: no-repeat;
    }
    #root {
      display: flex;
      flex-direction: column;
      min-height: 0;
      min-width: 0;
      align-items: center;
      position: relative;
      isolation: isolate;
    }
    #root::before {
      content: '';
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 0;
      background: linear-gradient(
        90deg,
        color-mix(in srgb, ${colors.bg} 92%, #000 8%) 0%,
        transparent min(20vw, 140px),
        transparent calc(100% - min(20vw, 140px)),
        color-mix(in srgb, ${colors.bg} 92%, #000 8%) 100%
      );
    }
    .app-shell {
      width: 100%;
      max-width: min(${SITE_COLUMN_MAX}px, 100%);
      height: 100vh;
      min-height: 100vh;
      overflow: hidden;
      overflow-x: hidden;
      overscroll-behavior-x: none;
      touch-action: pan-y;
      display: flex;
      flex-direction: column;
      min-height: 0;
      margin: 0 auto;
      position: relative;
      z-index: 1;
      background: transparent;
      color: ${colors.silver};
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: var(--ccna-type-md);
      line-height: var(--ccna-line-body);
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
      box-sizing: border-box;
    }
    .app-shell button,
    .app-shell input,
    .app-shell textarea,
    .app-shell select {
      font-family: inherit;
    }
    @media (min-width: ${SITE_COLUMN_MAX + 1}px) {
      .app-shell {
        border-left: 1px solid color-mix(in srgb, ${colors.border} 65%, transparent);
        border-right: 1px solid color-mix(in srgb, ${colors.border} 65%, transparent);
      }
    }
    @supports (height: 100dvh) {
      .app-shell {
        height: 100dvh;
        min-height: 100dvh;
      }
    }
    .site-column {
      width: 100%;
      max-width: min(${SITE_COLUMN_MAX}px, 100%);
      margin-left: auto;
      margin-right: auto;
      padding-left: max(16px, var(--ccna-safe-left));
      padding-right: max(16px, var(--ccna-safe-right));
      box-sizing: border-box;
      min-width: 0;
      overflow-x: hidden;
    }
    @media (min-width: 768px) {
      .site-column {
        padding-left: max(24px, var(--ccna-safe-left));
        padding-right: max(24px, var(--ccna-safe-right));
      }
    }
    ${buildAppShellChromeCss(colors)}
    .route-shell {
      flex: 1;
      min-height: 0;
      min-width: 0;
      overflow: hidden;
      overflow-x: hidden;
      display: flex;
      flex-direction: column;
    }
    .route-shell--fill .route-inner {
      height: 100%;
      min-height: 0;
    }
    .internal-scroll {
      min-height: 0;
      min-width: 0;
      overflow-y: auto;
      overflow-x: hidden;
      overscroll-behavior: contain;
      overscroll-behavior-x: none;
      touch-action: pan-y;
      -webkit-overflow-scrolling: touch;
    }
    .route-scroll {
      flex: 1;
      min-height: 0;
      min-width: 0;
      max-width: 100%;
    }
    .route-inner.ccna-container {
      width: 100%;
      max-width: 100%;
      min-width: 0;
      margin: 0 auto;
      padding-top: max(8px, var(--ccna-safe-top));
      padding-bottom: 16px;
      box-sizing: border-box;
      overflow-x: hidden;
    }
    .app-shell img,
    .app-shell svg,
    .app-shell video,
    .app-shell canvas,
    .app-shell table,
    .app-shell pre {
      max-width: 100%;
    }
    .app-shell pre,
    .app-shell code {
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      word-break: break-word;
    }
    .app-shell p,
    .app-shell li,
    .app-shell h1,
    .app-shell h2,
    .app-shell h3,
    .app-shell button,
    .app-shell [role="tabpanel"],
    .app-shell .ccna-view,
    .app-shell .ccna-quiz-reveal {
      overflow-wrap: anywhere;
      word-break: break-word;
    }
    .app-shell button {
      max-width: 100%;
      box-sizing: border-box;
    }
    .page-fill {
      height: 100%;
      min-height: 0;
      min-width: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      overflow-x: hidden;
    }
    .page-fill > .objective-shell,
    .page-fill > .tutor-shell {
      flex: 1;
      min-height: 0;
      height: auto;
    }
    ${buildAppShellObjectiveCss(colors)}
    ${buildAppShellResponsiveCss(colors)}
  `
}
