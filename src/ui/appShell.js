/** Viewport-locked app shell — document never scrolls; routes use internal panels. */

export const SITE_COLUMN_MAX = 720

const FLUID_TYPE_CSS = `
    :root {
      --ccna-bottom-nav-height: 64px;
      --vv-bottom-inset: 0px;
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
    .app-chrome-bottom--dock {
      position: fixed;
      left: 0;
      right: 0;
      bottom: var(--vv-bottom-inset, 0px);
      z-index: 200;
      padding-top: 0;
      padding-bottom: 0;
      background: linear-gradient(
        to top,
        color-mix(in srgb, ${colors.bg} 96%, transparent) 55%,
        color-mix(in srgb, ${colors.bg} 72%, transparent) 80%,
        transparent
      );
      pointer-events: none;
    }
    .app-chrome-bottom--dock .app-bottom-nav {
      pointer-events: auto;
    }
    .app-bottom-nav {
      flex-shrink: 0;
      display: flex;
      align-items: stretch;
      width: 100%;
      border-top: 1px solid ${colors.border};
      background: color-mix(in srgb, ${colors.bg} 94%, transparent);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      padding-bottom: env(safe-area-inset-bottom);
      z-index: 125;
      box-shadow: 0 -4px 24px color-mix(in srgb, ${colors.bg} 55%, transparent);
    }
    .app-bottom-nav-btn {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      min-height: 56px;
      padding: 8px 4px 10px;
      background: none;
      border: none;
      color: ${colors.silverMid};
      font-family: inherit;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
    }
    .app-bottom-nav-btn--active {
      color: ${colors.brandGlow};
      position: relative;
    }
    .app-bottom-nav-btn--active::after {
      content: '';
      position: absolute;
      bottom: 6px;
      left: 25%;
      right: 25%;
      height: 3px;
      border-radius: 999px;
      background: ${colors.brandGlow};
      transition: left .22s ease, right .22s ease, opacity .22s ease;
    }
    .app-bottom-nav--compact .app-bottom-nav-btn {
      min-height: 52px;
      padding-top: 6px;
      padding-bottom: 6px;
    }
    .app-bottom-nav--compact .app-bottom-nav-label {
      font-size: 10px;
    }
    .app-bottom-nav-svg {
      display: block;
    }
    .app-bottom-nav-icon {
      font-size: 18px;
      line-height: 1;
    }
    .app-shell--with-bottom-nav .route-scroll .route-inner.ccna-container,
    .app-shell--with-bottom-nav .route-shell--fill .route-inner.ccna-container:not(.page-fill) {
      padding-bottom: calc(
        var(--ccna-bottom-nav-height) + env(safe-area-inset-bottom) + var(--vv-bottom-inset, 0px) + 16px
      );
    }
    html[data-reduce-motion="true"] .ccna-view,
    html[data-reduce-motion="true"] .ccna-overlay,
    html[data-reduce-motion="true"] .ccna-sheet,
    html[data-reduce-motion="true"] .ccna-stagger > *,
    html[data-reduce-motion="true"] .ccna-quiz-reveal,
    html[data-reduce-motion="true"] .ccna-shimmer::after,
    html[data-reduce-motion="true"] .ccna-skeleton,
    html[data-reduce-motion="true"] .ccna-pulse,
    html[data-reduce-motion="true"] button:active:not(:disabled) {
      animation: none !important;
      transform: none !important;
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
      width: 44px;
      height: 44px;
      min-width: 44px;
      min-height: 44px;
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
    .app-chrome-settings {
      width: 40px;
      height: 40px;
      border-radius: 999px;
      border: 1px solid ${colors.border};
      background: ${colors.surface};
      color: ${colors.silver};
      font-size: 17px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: ${colors.cardShadow || '0 2px 10px #00000033'};
      flex-shrink: 0;
    }
    [data-theme="dark"] .app-shell .app-chrome-search,
    [data-theme="dark"] .app-shell .app-chrome-theme,
    [data-theme="dark"] .app-shell .app-chrome-settings,
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
    .page-fill > .objective-shell,
    .page-fill > .tutor-shell {
      flex: 1;
      min-height: 0;
      height: auto;
    }
    .objective-shell {
      flex: 1;
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
    .objective-header--sticky {
      position: sticky;
      top: 0;
      z-index: 40;
    }
    .objective-header--sticky .objective-sticky-chrome {
      position: static;
      box-shadow: none;
      background: linear-gradient(
        to bottom,
        color-mix(in srgb, ${colors.bg} 96%, transparent) 0%,
        color-mix(in srgb, ${colors.bg} 88%, transparent) 88%,
        transparent 100%
      );
      padding-bottom: 6px;
      margin-bottom: 0;
    }
    .objective-title--header {
      margin-bottom: 6px;
      font-size: var(--ccna-type-lg);
      -webkit-line-clamp: 2;
    }
    .objective-body-intro {
      flex-shrink: 0;
      margin-bottom: 12px;
      padding-bottom: 4px;
      border-bottom: 1px solid color-mix(in srgb, ${colors.border} 55%, transparent);
    }
    .objective-wayfind-row {
      display: flex;
      align-items: center;
      margin-bottom: 6px;
      min-width: 0;
    }
    .objective-back-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      min-height: 44px;
      padding: 0 12px 0 4px;
      margin: 0;
      border: 1px solid ${colors.border};
      border-radius: 10px;
      background: ${colors.surface};
      color: ${colors.silver};
      font-size: var(--ccna-type-sm);
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      flex-shrink: 0;
    }
    .objective-back-btn__icon {
      font-size: var(--ccna-type-md);
      line-height: 1;
      color: ${colors.silverMid};
    }
    .objective-study-row {
      margin-bottom: 8px;
      min-width: 0;
    }
    .objective-study-row .study-block-strip {
      flex: none;
      width: 100%;
    }
    .objective-title {
      margin: 0 0 4px;
      font-size: var(--ccna-type-xl);
      font-weight: 700;
      line-height: 1.25;
      color: ${colors.silver};
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .objective-actions-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      flex-wrap: wrap;
    }
    .objective-nav-row {
      display: flex;
      gap: 6px;
      flex: 1;
      min-width: 0;
    }
    .objective-sibling-btn {
      flex: 1;
      min-height: 44px;
      min-width: 44px;
      border-radius: 8px;
      border: 1px solid ${colors.border};
      background: ${colors.surface};
      color: ${colors.silver};
      font-size: var(--ccna-type-xs);
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      padding: 4px 10px;
      text-align: left;
    }
    .objective-sibling-btn--next {
      text-align: right;
    }
    .objective-sibling-btn:disabled {
      color: ${colors.silverDim};
      opacity: 0.35;
      cursor: default;
    }
    .objective-offline-action {
      flex-shrink: 0;
    }
    .objective-offline-btn {
      background: none;
      border: 1px solid ${colors.border};
      border-radius: 999px;
      color: ${colors.silverMid};
      font-size: var(--ccna-type-xs);
      font-weight: 600;
      padding: 4px 12px;
      min-height: 44px;
      min-width: 44px;
      cursor: pointer;
      font-family: inherit;
    }
    .objective-offline-btn:disabled {
      color: ${colors.silverDim};
      cursor: default;
    }
    .objective-lab-cta {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      text-align: left;
      cursor: pointer;
      font-family: inherit;
      margin-bottom: 12px;
      padding: 12px;
      border-radius: 12px;
      border: 1px solid ${colors.border};
      border-left: 3px solid ${colors.mint};
      background: ${colors.card};
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
      transition: transform .35s ease, width .35s ease;
    }
    .study-block-chip--break .study-block-chip__progress {
      background: ${colors.amber};
    }
    .study-block-mode-btn,
    .study-block-stop-btn {
      min-height: 44px;
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
      max-height: min(50dvh, 280px);
      overflow-y: auto;
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
    @keyframes ccna-attribution-marquee {
      0%, 100% { transform: translateX(0); }
      6% { transform: translateX(0); }
      28% { transform: translateX(calc(-1 * var(--ccna-marquee-distance))); }
      28.5% { transform: translateX(0); }
      34% { transform: translateX(0); }
      56% { transform: translateX(calc(-1 * var(--ccna-marquee-distance))); }
      56.5% { transform: translateX(0); }
      62% { transform: translateX(0); }
      84% { transform: translateX(calc(-1 * var(--ccna-marquee-distance))); }
      84.5% { transform: translateX(0); }
      94% { transform: translateX(0); }
    }
    .ccna-overflow-marquee__track {
      animation-name: ccna-attribution-marquee;
      animation-timing-function: linear;
      animation-fill-mode: forwards;
      animation-iteration-count: 1;
    }
    .objective-sticky-chrome {
      flex-shrink: 0;
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
    .mc-choices-accordion__toggle:focus-visible {
      outline: 2px solid ${colors.sky};
      outline-offset: 2px;
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
      .objective-title--header {
        font-size: var(--ccna-type-xl);
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
      .app-shell--compact-top .app-chrome-toolbar .app-chrome-theme,
      .app-shell--compact-top .app-chrome-toolbar .app-chrome-settings {
        pointer-events: auto;
        width: 36px;
        height: 36px;
        font-size: 16px;
      }
      .app-shell--compact-top .route-inner.ccna-container.page-fill {
        padding-top: calc(env(safe-area-inset-top) + 2px);
      }
      .app-shell--compact-top .objective-header {
        padding-right: 0;
      }
      .app-shell--compact-top .objective-wayfind-row .objective-back-btn {
        min-height: 40px;
        padding: 0 10px 0 2px;
      }
      .app-shell--compact-top .objective-title {
        font-size: var(--ccna-type-lg);
        -webkit-line-clamp: 2;
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
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }
    .study-mode-header {
      position: sticky;
      top: 0;
      z-index: 45;
      margin: 0 0 10px;
      padding: calc(env(safe-area-inset-top) + 2px) 0 10px;
      background: linear-gradient(
        to bottom,
        color-mix(in srgb, ${colors.bg} 98%, transparent) 0%,
        color-mix(in srgb, ${colors.bg} 92%, transparent) 85%,
        transparent 100%
      );
    }
    .study-mode-back-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      min-height: 44px;
      padding: 0 12px 0 4px;
      margin: 0 0 6px;
      border: 1px solid ${colors.border};
      border-radius: 10px;
      background: ${colors.surface};
      color: ${colors.silver};
      font-size: var(--ccna-type-sm);
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      flex-shrink: 0;
    }
    .study-mode-back-btn__icon {
      font-size: var(--ccna-type-md);
      line-height: 1;
      color: ${colors.silverMid};
    }
    .study-mode-header__title {
      margin: 0 0 4px;
      font-size: var(--ccna-type-xl);
      font-weight: 700;
      line-height: 1.25;
      color: ${colors.silver};
    }
    .study-mode-header__subtitle {
      margin: 0;
      font-size: var(--ccna-type-sm);
      line-height: 1.5;
      color: ${colors.silverMid};
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
    .tutor-shell {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .domain-accordion-panel {
      overflow: hidden;
      transition: opacity .25s ease, max-height .3s ease;
    }
    .objective-wayfind-row--compact {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .objective-overflow-btn {
      min-width: 44px;
      min-height: 44px;
      border-radius: 10px;
      border: 1px solid ${colors.border};
      background: ${colors.surface};
      color: ${colors.silver};
      font-size: var(--ccna-type-lg);
      line-height: 1;
      cursor: pointer;
      font-family: inherit;
      padding: 0 10px;
    }
    .objective-overflow-item {
      display: block;
      width: 100%;
      text-align: left;
      background: none;
      border: none;
      color: ${colors.silver};
      font-size: var(--ccna-type-sm);
      padding: 10px 12px;
      min-height: 44px;
      cursor: pointer;
      font-family: inherit;
    }
    .objective-overflow-item:hover {
      background: ${colors.surface};
    }
    .objective-overflow-menu {
      max-height: min(70dvh, calc(100dvh - 120px));
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }
    .app-shell--with-bottom-nav .objective-body {
      padding-bottom: calc(var(--ccna-bottom-nav-height) + env(safe-area-inset-bottom) + var(--vv-bottom-inset, 0px) + 8px);
    }
    html[data-reduce-motion="true"] .domain-accordion-panel,
    html[data-reduce-motion="true"] .objective-tab-panel,
    html[data-reduce-motion="true"] .app-bottom-nav-btn--active::after,
    html[data-reduce-motion="true"] .study-block-chip__progress {
      transition: none !important;
      animation: none !important;
    }
    .tutor-messages {
      flex: 1;
      min-height: 0;
      overflow: auto;
    }
    .tutor-input-bar {
      flex-shrink: 0;
      display: flex;
      gap: 8px;
      padding-bottom: calc(env(safe-area-inset-bottom) + var(--vv-bottom-inset, 0px));
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
      .ccna-overflow-marquee__track { animation: none !important; }
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
    .study-visual-section,
    .curated-diagram-card {
      max-width: 100%;
      min-width: 0;
    }
    .curated-diagram-canvas {
      touch-action: manipulation;
    }
    @media (max-width: 640px) {
      .study-visual-section {
        margin-left: 0;
        margin-right: 0;
      }
      .curated-diagram-modal-panel {
        border-left: none !important;
        border-right: none !important;
        border-top: none !important;
        border-bottom: none !important;
      }
      .curated-diagram-expand-btn {
        font-size: var(--ccna-type-sm);
      }
    }

    /* ---- Responsive layout: phone, tablet, desktop ---- */
    .home-page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 4px;
    }
    .home-study-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
    }
    @media (min-width: 540px) {
      .home-study-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 10px;
      }
    }
    @media (min-width: 768px) {
      .home-study-grid {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
      .route-inner.ccna-container {
        padding-top: 12px;
        padding-bottom: 20px;
      }
    }
    @media (min-width: 1024px) {
      .site-column {
        padding-left: max(28px, env(safe-area-inset-left));
        padding-right: max(28px, env(safe-area-inset-right));
      }
    }

    .objective-tab-bar {
      overflow-x: auto;
      overscroll-behavior-x: contain;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      flex-wrap: nowrap !important;
      padding-bottom: 2px;
    }
    .objective-tab-bar::-webkit-scrollbar {
      display: none;
    }
    @media (min-width: 480px) {
      .objective-tab-bar {
        flex-wrap: wrap !important;
        overflow-x: visible;
      }
    }

    .ccna-h-scroll {
      touch-action: pan-x;
      overscroll-behavior-x: contain;
      -webkit-overflow-scrolling: touch;
    }
    .key-term-card {
      width: clamp(148px, 42vw, 192px) !important;
    }
    @media (min-width: 768px) {
      .key-term-card {
        width: 168px !important;
      }
    }

    .cisco-terminal {
      display: flex;
      flex-direction: column;
      min-height: 0;
      background: #05060a;
    }
    .cisco-terminal-scroll {
      padding: 10px 12px;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      font-family: ui-monospace, Menlo, monospace;
      font-size: var(--ccna-type-sm);
      line-height: 1.55;
      height: clamp(28dvh, 32dvh, 280px);
      min-height: 22dvh;
    }
    .cisco-terminal-input-row {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
      padding: 8px 12px 12px;
      border-top: 1px solid ${colors.border};
    }
    .cisco-terminal-prompt {
      font-family: ui-monospace, monospace;
      font-size: var(--ccna-type-sm);
      color: #8a8fa8;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .cisco-terminal-input-row input {
      flex: 1 1 120px;
      min-width: 0;
    }

    .lab-practice-layout {
      display: flex;
      flex-direction: column;
    }
    .lab-practice-tasks {
      min-width: 0;
    }
    @media (orientation: landscape) and (min-width: 640px) and (min-height: 320px) {
      .lab-practice-layout {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(240px, 42%);
        align-items: stretch;
        min-height: min(68dvh, 520px);
      }
      .lab-practice-tasks {
        border-right: 1px solid ${colors.border};
      }
      .lab-practice-terminal.cisco-terminal {
        border-top: none;
        height: 100%;
      }
      .lab-practice-terminal .cisco-terminal-scroll {
        height: auto;
        flex: 1;
        min-height: 0;
        max-height: none;
      }
      .lab-practice-layout .lab-practice-tasks [style*="minHeight: 120"] {
        min-height: 96px !important;
      }
    }

    .global-search-panel {
      width: 100%;
      max-width: min(540px, 100%);
    }
    .global-search-results {
      max-height: min(60dvh, 520px);
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }
    @media (orientation: landscape) and (max-height: 500px) {
      .global-search-overlay {
        padding-top: max(12px, env(safe-area-inset-top)) !important;
      }
      .global-search-results {
        max-height: min(50dvh, 280px);
      }
    }

    .ccna-sheet {
      width: 100%;
      max-width: min(640px, 100%);
      max-height: min(90dvh, 720px);
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }
    @media (max-width: 640px) {
      .ccna-sheet {
        max-width: 100%;
        max-height: 92dvh;
        border-radius: 16px 16px 0 0 !important;
      }
    }
    @media (min-width: 768px) {
      .ccna-sheet--centered {
        border-radius: 16px !important;
        margin: auto;
      }
    }

    @media (orientation: landscape) and (max-height: 500px) {
      .objective-title--header {
        font-size: var(--ccna-type-md);
        margin-bottom: 4px;
      }
      .objective-body-intro {
        margin-bottom: 8px;
        padding-bottom: 2px;
      }
      .objective-body-intro .study-block-switch-prompt {
        display: none;
      }
      .objective-sticky-chrome .objective-tab-bar {
        margin-bottom: 4px !important;
      }
      .cisco-terminal-scroll {
        height: clamp(24dvh, 28dvh, 180px);
        min-height: 20dvh;
      }
      .home-study-grid {
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 6px;
      }
    }

    @media (orientation: landscape) and (min-width: 768px) and (min-height: 500px) {
      .home-study-grid {
        grid-template-columns: repeat(5, minmax(0, 1fr));
      }
    }

    .topic-focus-bar {
      position: fixed;
      left: 50%;
      transform: translateX(-50%);
      bottom: calc(var(--ccna-bottom-nav-height) + env(safe-area-inset-bottom) + var(--vv-bottom-inset, 0px));
      width: 100%;
      max-width: min(${SITE_COLUMN_MAX}px, 100%);
      margin: 0;
      padding: 10px max(16px, env(safe-area-inset-left)) 10px max(16px, env(safe-area-inset-right));
      background: color-mix(in srgb, ${colors.card} 94%, transparent);
      border-top: 1px solid ${colors.border};
      backdrop-filter: blur(10px);
      z-index: 210;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }
    .topic-focus-bar--active {
      border-top-color: ${colors.mintBorder};
      box-shadow: 0 -8px 28px color-mix(in srgb, ${colors.mint} 22%, transparent);
    }
    .topic-focus-bar--pulse {
      animation: topic-focus-bar-pulse 0.5s ease-out;
    }
    @keyframes topic-focus-bar-pulse {
      0% { transform: translateX(-50%) scale(1); }
      35% { transform: translateX(-50%) scale(1.015); }
      100% { transform: translateX(-50%) scale(1); }
    }
    .topic-focus-toast {
      margin-bottom: 8px;
      padding: 8px 12px;
      border-radius: 10px;
      background: color-mix(in srgb, ${colors.mintDim} 88%, ${colors.card});
      border: 1px solid ${colors.mintBorder};
      color: ${colors.mint};
      font-size: var(--ccna-type-sm);
      font-weight: 600;
      line-height: 1.35;
      animation: topic-focus-toast-in 0.28s ease both;
    }
    @keyframes topic-focus-toast-in {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: none; }
    }
    .topic-focus-bar__stats {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 6px;
      font-size: var(--ccna-type-xs);
      color: ${colors.silverMid};
    }
    .topic-focus-bar__stat {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      border-radius: 999px;
      background: ${colors.surface};
      border: 1px solid ${colors.border};
      transition: transform 0.22s ease, border-color 0.22s ease, color 0.22s ease;
    }
    .topic-focus-bar__stat--bump {
      transform: scale(1.06);
      border-color: ${colors.mintBorder};
      color: ${colors.mint};
    }
    .topic-focus-bar__stat--questions {
      font-weight: 700;
      color: ${colors.silver};
    }
    .topic-focus-bar__hint,
    .topic-focus-bar__warn {
      margin-bottom: 8px;
      font-size: var(--ccna-type-xs);
      line-height: 1.4;
    }
    .topic-focus-bar__hint { color: ${colors.silverMid}; }
    .topic-focus-bar__warn { color: ${colors.amber}; }
    .topic-focus-card--selected {
      animation: topic-focus-card-select 0.35s ease both;
    }
    @keyframes topic-focus-card-select {
      from { box-shadow: 0 0 0 0 color-mix(in srgb, ${colors.mint} 45%, transparent); }
      to { box-shadow: none; }
    }
    .topic-focus-add-btn--added {
      background: ${colors.mintDim} !important;
      border-color: ${colors.mintBorder} !important;
      color: ${colors.mint} !important;
    }
    .topic-focus-concept-pill--selected {
      animation: topic-focus-pill-pop 0.28s ease both;
    }
    @keyframes topic-focus-pill-pop {
      0% { transform: scale(0.94); }
      55% { transform: scale(1.04); }
      100% { transform: scale(1); }
    }
    html[data-reduce-motion="true"] .topic-focus-bar--pulse,
    html[data-reduce-motion="true"] .topic-focus-toast,
    html[data-reduce-motion="true"] .topic-focus-card--selected,
    html[data-reduce-motion="true"] .topic-focus-concept-pill--selected {
      animation: none !important;
    }
    .app-shell--with-bottom-nav .topic-focus-list {
      padding-bottom: calc(var(--ccna-bottom-nav-height) + 120px + env(safe-area-inset-bottom) + var(--vv-bottom-inset, 0px));
    }
    .topic-focus-session {
      padding-bottom: calc(var(--ccna-bottom-nav-height) + env(safe-area-inset-bottom) + var(--vv-bottom-inset, 0px) + 16px);
    }
    .topic-focus-studio .topic-focus-list {
      max-height: none;
    }
    .topic-focus-search:focus {
      outline: 2px solid ${colors.skyBorder};
      outline-offset: 1px;
    }
    .topic-term-detail {
      padding: 14px;
      border-radius: 12px;
      border: 1px solid ${colors.purpleBorder};
      background: color-mix(in srgb, ${colors.card} 96%, ${colors.purpleDim});
    }
    .topic-focus-cluster button:focus-visible,
    .topic-focus-studio .topic-focus-list button:focus-visible {
      outline: 2px solid ${colors.skyBorder};
      outline-offset: 2px;
    }
    .command-detail-panel {
      padding: 14px;
      border-radius: 12px;
      border: 1px solid ${colors.mintBorder};
      background: color-mix(in srgb, ${colors.card} 96%, ${colors.mintDim});
    }
    .command-hub-search:focus {
      outline: 2px solid ${colors.mintBorder};
      outline-offset: 1px;
    }
    .command-hub-studio .command-hub-list {
      max-height: none;
    }
    .study-lens-search:focus {
      outline: 2px solid ${colors.skyBorder};
      outline-offset: 1px;
    }
    .study-lens-studio .study-lens-list {
      max-height: none;
    }
  `
}
