/** Chrome toolbar + bottom nav CSS — extracted from appShell.js for ≤900L maintainability. */
export function buildAppShellChromeCss(colors) {
  return `
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
      padding-top: calc(var(--ccna-safe-top) + 6px);
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
      padding-bottom: calc(var(--ccna-safe-bottom) + 10px);
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
      padding-bottom: var(--ccna-safe-bottom);
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
        var(--ccna-bottom-nav-height) + var(--ccna-safe-bottom) + var(--vv-bottom-inset, 0px) + 16px
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
    .ccna-quiz-reveal {
      min-width: 0;
      max-width: 100%;
    }
    .ccna-quiz-reveal .ccna-answer-review {
      margin-top: 6px;
    }
    .ccna-confidence-strip {
      margin-top: 4px;
    }
    .ccna-quiz-exhibit {
      max-width: 100%;
      margin-bottom: 4px;
      border-radius: 12px;
      border: 1px solid var(--ccna-border, rgba(180, 120, 140, 0.22));
      background: #0c1018;
      overflow: hidden;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.04);
    }
    [data-theme="light"] .ccna-quiz-exhibit {
      background: #1a2230;
    }
    .ccna-quiz-exhibit__chrome {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 12px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      background: rgba(255,255,255,0.03);
    }
    .ccna-quiz-exhibit__dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: rgba(255,255,255,0.18);
      flex-shrink: 0;
    }
    .ccna-quiz-exhibit__dot:nth-child(1) { background: #ff5f57; }
    .ccna-quiz-exhibit__dot:nth-child(2) { background: #febc2e; }
    .ccna-quiz-exhibit__dot:nth-child(3) { background: #28c840; }
    .ccna-quiz-exhibit__label {
      margin-left: 6px;
      font-size: var(--ccna-type-micro);
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: rgba(221, 208, 214, 0.72);
    }
    .ccna-quiz-exhibit__body {
      padding: 10px 12px 12px;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: var(--ccna-type-sm);
      line-height: 1.55;
      color: #d7dde8;
    }
    .ccna-quiz-exhibit__title {
      font-weight: 700;
      color: #9ecbff;
      margin-bottom: 8px;
    }
    .ccna-quiz-exhibit__meta {
      color: #a8b0c0;
      margin-bottom: 4px;
      white-space: pre;
    }
    .ccna-quiz-exhibit__legend {
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px dashed rgba(255,255,255,0.12);
      color: #8b93a7;
      font-size: var(--ccna-type-xs);
      white-space: pre-wrap;
    }
    .ccna-quiz-exhibit__route {
      display: grid;
      grid-template-columns: 3.2rem minmax(7.5rem, max-content) 1fr;
      gap: 8px 10px;
      align-items: baseline;
      padding: 3px 0;
      min-width: 280px;
    }
    .ccna-quiz-exhibit__code {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 2.4rem;
      padding: 1px 6px;
      border-radius: 6px;
      border: 1px solid currentColor;
      background: rgba(255,255,255,0.04);
      font-weight: 700;
      font-size: var(--ccna-type-xs);
      letter-spacing: 0.02em;
    }
    .ccna-quiz-exhibit__prefix {
      color: #e8eef8;
      font-weight: 700;
      white-space: nowrap;
    }
    .ccna-quiz-exhibit__detail {
      color: #b7c0d0;
      white-space: nowrap;
    }
    .ccna-quiz-exhibit__text {
      white-space: pre;
      color: #c5ccd8;
    }
    .ccna-quiz-exhibit__blank {
      height: 6px;
    }
    @media (max-width: 640px) {
      .ccna-quiz-reveal {
        padding: 10px !important;
      }
      .ccna-quiz-exhibit__route {
        grid-template-columns: 2.8rem minmax(6.5rem, max-content) 1fr;
        gap: 6px 8px;
        min-width: 260px;
      }
      .ccna-quiz-exhibit__body {
        font-size: var(--ccna-type-xs);
        padding: 8px 10px 10px;
      }
    }
  `
}
