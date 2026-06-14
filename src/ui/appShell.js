/** Viewport-locked app shell — document never scrolls; routes use internal panels. */

export const SITE_COLUMN_MAX = 720

const FLUID_TYPE_CSS = `
    :root {
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
      .app-shell { height: 100dvh; }
    }
    .site-column {
      width: 100%;
      max-width: min(${SITE_COLUMN_MAX}px, 100%);
      margin-left: auto;
      margin-right: auto;
      padding-left: max(16px, env(safe-area-inset-left));
      padding-right: max(16px, env(safe-area-inset-right));
      box-sizing: border-box;
      min-width: 0;
      overflow-x: hidden;
    }
    @media (min-width: 768px) {
      .site-column {
        padding-left: max(24px, env(safe-area-inset-left));
        padding-right: max(24px, env(safe-area-inset-right));
      }
    }
    .app-chrome-top {
      flex-shrink: 0;
      z-index: 120;
      width: 100%;
    }
    .app-chrome-toolbar {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 8px;
      padding-top: calc(env(safe-area-inset-top) + 6px);
      padding-bottom: 6px;
      min-height: 0;
      width: 100%;
    }
    .app-chrome-bottom {
      flex-shrink: 0;
      display: flex;
      justify-content: center;
      width: 100%;
      padding-top: 8px;
      padding-bottom: calc(env(safe-area-inset-bottom) + 10px);
      z-index: 120;
      background: linear-gradient(to top, ${colors.bg} 70%, transparent);
    }
    [data-theme="dark"] .app-shell .app-chrome-bottom {
      background: linear-gradient(to top, color-mix(in srgb, ${colors.bg} 88%, transparent) 70%, transparent);
    }
    .app-chrome-search {
      min-height: 44px;
      height: 44px;
      padding: 0 18px;
      border-radius: 999px;
      border: 1px solid ${colors.border};
      background: ${colors.surface};
      color: ${colors.silverMid};
      font-size: 13px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      box-shadow: ${colors.cardShadow || '0 2px 10px #00000033'};
      font-family: inherit;
    }
    .app-chrome-theme {
      width: 40px;
      height: 40px;
      border-radius: 999px;
      border: 1px solid ${colors.border};
      background: ${colors.surface};
      color: ${colors.silver};
      font-size: 18px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: ${colors.cardShadow || '0 2px 10px #00000033'};
      flex-shrink: 0;
    }
    [data-theme="dark"] .app-shell .app-chrome-search,
    [data-theme="dark"] .app-shell .app-chrome-theme,
    [data-theme="dark"] .app-shell .app-chrome-bottom {
      backdrop-filter: blur(14px) saturate(1.1);
      -webkit-backdrop-filter: blur(14px) saturate(1.1);
    }
    [data-theme="dark"] .app-shell .route-inner textarea,
    [data-theme="dark"] .app-shell .route-inner input:not([type="checkbox"]):not([type="radio"]):not([type="file"]) {
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }
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
      padding: 8px 0 16px;
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
    .objective-shell {
      height: 100%;
      min-height: 0;
      min-width: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      overflow-x: hidden;
    }
    .objective-header {
      flex-shrink: 0;
    }
    .objective-top-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
      min-width: 0;
    }
    .objective-top-row .objective-back-btn {
      flex-shrink: 0;
      margin: 0;
    }
    .study-block-strip {
      flex: 1;
      min-width: 0;
      display: flex;
      align-items: center;
      gap: 6px;
      position: relative;
    }
    .study-block-chip {
      position: relative;
      overflow: hidden;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      min-height: 36px;
      padding: 0 12px;
      border-radius: 999px;
      border: 1px solid ${colors.border};
      background: ${colors.surface};
      color: ${colors.silver};
      font-size: var(--ccna-type-timer);
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      flex-shrink: 0;
      max-width: 100%;
    }
    .study-block-chip--active {
      border-color: ${colors.brandGlow};
      background: color-mix(in srgb, ${colors.brandDim} 70%, ${colors.surface});
    }
    .study-block-chip--break {
      border-color: ${colors.amberBorder};
      background: color-mix(in srgb, ${colors.amberDim} 65%, ${colors.surface});
      color: ${colors.amber};
    }
    .study-block-chip__play {
      font-size: 11px;
      opacity: 0.9;
    }
    .study-block-chip__phase {
      font-size: var(--ccna-type-caption);
      font-weight: 600;
      color: ${colors.silverMid};
      white-space: nowrap;
    }
    .study-block-chip__progress {
      position: absolute;
      left: 0;
      bottom: 0;
      height: 2px;
      width: 100%;
      transform-origin: left center;
      background: ${colors.brand};
    }
    .study-block-chip--break .study-block-chip__progress {
      background: ${colors.amber};
    }
    .study-block-mode-btn,
    .study-block-stop-btn {
      min-height: 32px;
      padding: 0 10px;
      border-radius: 999px;
      border: 1px solid ${colors.border};
      background: ${colors.surface};
      color: ${colors.silverMid};
      font-size: var(--ccna-type-caption);
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      flex-shrink: 0;
    }
    .study-block-mode-menu {
      position: absolute;
      top: calc(100% + 6px);
      left: 0;
      z-index: 140;
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-width: 180px;
      padding: 8px;
      border-radius: 12px;
      border: 1px solid ${colors.border};
      background: ${colors.card};
      box-shadow: ${colors.cardShadow || '0 10px 32px #00000033'};
    }
    .study-block-mode-option {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      width: 100%;
      min-height: 40px;
      padding: 8px 10px;
      border-radius: 8px;
      font-family: inherit;
      cursor: pointer;
      text-align: left;
    }
    .study-block-other-hint {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .objective-header-scroll {
      flex-shrink: 0;
    }
    .objective-sticky-chrome {
      position: sticky;
      top: 0;
      z-index: 40;
      flex-shrink: 0;
      padding-bottom: 4px;
      margin-bottom: 4px;
      background: linear-gradient(to bottom, color-mix(in srgb, ${colors.bg} 94%, transparent) 75%, transparent);
    }
    .objective-sticky-chrome .objective-tab-bar {
      margin-bottom: 0 !important;
    }
    .study-block-complete-card {
      margin-bottom: 12px;
      flex-shrink: 0;
    }
    .objective-reading-prose {
      max-width: 68ch;
    }
    .lesson-prose {
      line-height: var(--ccna-line-read, 1.62);
      font-size: var(--ccna-type-md);
    }
    .lesson-prose li {
      margin-bottom: 0.45em;
    }
    .objective-shell--deep-read .objective-reading-prose,
    .app-shell--deep-work .objective-reading-prose {
      line-height: var(--ccna-line-read);
    }
    .objective-shell--deep-read .objective-reading-prose p,
    .app-shell--deep-work .objective-reading-prose p {
      margin-bottom: 1.15em;
    }
    @media (min-width: 768px) {
      .objective-reading-prose {
        max-width: 68ch;
      }
      .objective-header-scroll h1 {
        font-size: var(--ccna-type-display);
      }
    }
    @media (max-width: 640px) {
      .app-shell--compact-top > .app-chrome-toolbar {
        position: absolute;
        top: calc(env(safe-area-inset-top) + 2px);
        right: max(16px, env(safe-area-inset-right));
        left: auto;
        width: auto;
        z-index: 130;
        padding: 0;
        min-height: 0;
        height: 0;
        overflow: visible;
        pointer-events: none;
        flex: none;
      }
      .app-shell--compact-top .app-chrome-toolbar .app-chrome-theme {
        pointer-events: auto;
        width: 36px;
        height: 36px;
        font-size: 16px;
      }
      .app-shell--compact-top .route-inner.ccna-container.page-fill {
        padding-top: calc(env(safe-area-inset-top) + 2px);
      }
      .app-shell--compact-top .objective-header {
        padding-right: 44px;
      }
      .app-shell--compact-top .objective-top-row .objective-back-btn {
        padding: 2px 0 4px;
        min-height: 36px;
      }
      .app-shell--compact-top .objective-header h1 {
        margin-top: 0;
        line-height: 1.2;
      }
      .app-shell--compact-top .objective-domain {
        margin-bottom: 4px !important;
      }
      .app-shell--compact-top .objective-meta-row {
        margin-bottom: 4px !important;
      }
      .app-shell--compact-top .objective-nav-row {
        margin-bottom: 6px !important;
      }
      .app-shell--compact-top .objective-tab-bar {
        margin-bottom: 6px !important;
      }
    }
    @media (max-width: 640px) {
      .app-chrome-toolbar {
        padding-top: calc(env(safe-area-inset-top) + 4px);
        padding-bottom: 4px;
      }
    }
    .objective-body {
      flex: 1;
      min-height: 0;
      min-width: 0;
      overflow-x: hidden;
    }
    .stats-bottom-bar {
      margin-bottom: 8px;
    }
    .stats-chart-card {
      overflow: hidden;
    }
    .stats-combo-chart {
      display: block;
      width: 100%;
      max-width: 100%;
    }
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .tutor-messages {
      flex: 1;
      min-height: 0;
    }
    .ccna-overlay {
      position: fixed;
      inset: 0;
      z-index: 300;
    }
    .nav-hint-layer {
      position: absolute;
      inset: 0;
      z-index: 200;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      padding: 0 max(16px, env(safe-area-inset-right)) calc(env(safe-area-inset-bottom) + 72px) max(16px, env(safe-area-inset-left));
      pointer-events: none;
    }
    .nav-hint-toast {
      pointer-events: auto;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      width: min(100%, 420px);
      padding: 12px 14px;
      border-radius: 14px;
      animation: nav-hint-in 0.38s cubic-bezier(.2,.8,.2,1) both;
    }
    @keyframes nav-hint-in {
      from { opacity: 0; transform: translateY(14px) scale(0.97); }
      to { opacity: 1; transform: none; }
    }
    .nav-hint-check-mark {
      stroke-dasharray: 36;
      stroke-dashoffset: 36;
      animation: nav-hint-check-draw 0.55s ease 0.12s forwards;
    }
    @keyframes nav-hint-check-draw {
      to { stroke-dashoffset: 0; }
    }
    .nav-hint-check-ring {
      transform-origin: 24px 24px;
      animation: nav-hint-pulse 1.6s ease-in-out 0.2s infinite;
    }
    .nav-hint-retry-ring {
      transform-origin: 24px 28px;
      animation: nav-hint-spin 1.4s linear infinite;
    }
    .nav-hint-retry-arrow {
      animation: nav-hint-bob 1.2s ease-in-out infinite;
    }
    .nav-hint-next-head {
      animation: nav-hint-nudge 1.1s ease-in-out infinite;
    }
    @keyframes nav-hint-pulse {
      0%, 100% { opacity: 0.28; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(1.04); }
    }
    @keyframes nav-hint-spin {
      to { transform: rotate(360deg); }
    }
    @keyframes nav-hint-bob {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-2px); }
    }
    @keyframes nav-hint-nudge {
      0%, 100% { transform: translateX(0); }
      50% { transform: translateX(3px); }
    }
    @media (prefers-reduced-motion: reduce) {
      .nav-hint-toast { animation: none; }
      .nav-hint-check-mark,
      .nav-hint-check-ring,
      .nav-hint-retry-ring,
      .nav-hint-retry-arrow,
      .nav-hint-next-head { animation: none; stroke-dashoffset: 0; }
      .svg-confetti-piece { animation: none; opacity: 0; }
    }
    .svg-confetti-layer {
      position: fixed;
      inset: 0;
      z-index: 9999;
      pointer-events: none;
      overflow: hidden;
    }
    .svg-confetti-piece {
      position: absolute;
      top: 28%;
      animation-name: svg-confetti-fall;
      animation-timing-function: cubic-bezier(.25,.8,.35,1);
      animation-fill-mode: forwards;
      will-change: transform, opacity;
    }
    @keyframes svg-confetti-fall {
      0% {
        transform: translate3d(0, -12vh, 0) rotate(0deg) scale(0.6);
        opacity: 0;
      }
      12% {
        opacity: 1;
        transform: translate3d(0, 0, 0) rotate(45deg) scale(1);
      }
      100% {
        transform: translate3d(var(--confetti-drift, 0px), 72vh, 0) rotate(var(--confetti-spin, 360deg)) scale(0.85);
        opacity: 0;
      }
    }
  `
}
