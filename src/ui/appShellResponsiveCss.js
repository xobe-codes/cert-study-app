/** Responsive layout CSS for the app shell — split from appShell.js to keep each module focused. */
import { SITE_COLUMN_MAX } from './appShell.js'

export function buildAppShellResponsiveCss(colors) {
  return `
    /* ---- Responsive layout: phone, tablet, desktop ---- */
    .ccna-home-topbar {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
      max-width: 100%;
      overflow: visible;
    }
    .ccna-home-topbar__row1 {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      min-width: 0;
      max-width: 100%;
    }
    .ccna-home-topbar__title-wrap {
      flex: 1 1 auto;
      min-width: 0;
    }
    .ccna-home-topbar__title {
      margin: 0 !important;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      line-height: 1.2 !important;
    }
    .ccna-home-topbar__subtitle {
      font-size: var(--ccna-type-xs);
      color: ${colors.silverMid};
      line-height: 1.3;
      margin-top: 1px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .ccna-home-topbar__actions {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0;
      flex-shrink: 0;
    }
    .ccna-home-topbar__stats {
      padding: 2px 0 !important;
      min-height: 0 !important;
    }
    .ccna-home-topbar__streak {
      font-size: var(--ccna-type-xs);
      color: ${colors.mint};
      line-height: 1.3;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      min-width: 0;
      max-width: 100%;
    }
    .ccna-home-topbar__chips {
      display: flex;
      flex-wrap: nowrap;
      gap: 6px;
      min-width: 0;
      max-width: 100%;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      padding-bottom: 2px;
    }
    @media (max-width: 390px) {
      .ccna-home-topbar__title {
        max-width: 100%;
      }
    }
    .ccna-home-scroll {
      min-width: 0;
      max-width: 100%;
      box-sizing: border-box;
    }
    .home-study-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
    }
    .ccna-home-section-label {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }
    .ccna-home-for-you__title {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
      overflow-wrap: anywhere;
      word-break: normal;
    }
    .ccna-home-domain-header {
      display: flex;
      align-items: baseline;
      gap: 6px;
      margin-bottom: 2px;
      flex-wrap: wrap;
    }
    .ccna-home-domain-title {
      flex: 1 1 auto;
      min-width: 0;
    }
    @media (max-width: 399px) {
      .ccna-home-domain-legend {
        display: none;
      }
      .ccna-home-domain-pill {
        font-size: var(--ccna-type-micro) !important;
        padding: 2px 7px !important;
        line-height: 1.25 !important;
      }
      .ccna-home-domain-title {
        flex-basis: 100%;
      }
    }
    .home-study-grid button {
      word-break: normal;
      overflow-wrap: normal;
      white-space: normal;
      line-height: 1.3;
      hyphens: none;
    }
    .ccna-metrics-section-title {
      white-space: normal;
      overflow-wrap: anywhere;
      word-break: normal;
      line-height: 1.35;
    }
    .ccna-domain-baseline-row,
    .ccna-placement-objective-row {
      min-width: 0;
    }
    .ccna-placement-objective-row__title {
      flex: 1;
      min-width: 0;
      font-size: var(--ccna-type-xs);
      color: ${colors.silver};
      line-height: 1.35;
    }
    .ccna-weak-area-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 0;
      border-bottom: 1px solid ${colors.border};
      min-width: 0;
      max-width: 100%;
    }
    .ccna-weak-area-row__cta {
      width: auto !important;
      max-width: 42%;
      box-sizing: border-box;
      white-space: nowrap;
    }
    .ccna-weak-area-row:last-child {
      border-bottom: none;
      padding-bottom: 0;
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
        padding-top: max(12px, var(--ccna-safe-top));
        padding-bottom: 20px;
      }
    }
    @media (min-width: 1024px) {
      .site-column {
        padding-left: max(28px, var(--ccna-safe-left));
        padding-right: max(28px, var(--ccna-safe-right));
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
    .ccna-answer-review {
      min-width: 0;
      max-width: 100%;
    }
    .ccna-answer-review .ccna-review-block {
      max-width: 100%;
    }
    @media (max-width: 480px) {
      .ccna-answer-review .ccna-review-block {
        padding: 8px 10px;
      }
      .ccna-answer-review--compact .ccna-review-block {
        margin-bottom: 6px;
      }
      .ccna-answer-review--compact .ccna-review-block__body {
        margin-top: 6px;
        font-size: var(--ccna-type-sm);
        line-height: 1.45;
      }
      .ccna-answer-review .ccna-review-block .ccna-review-block {
        padding: 8px;
        margin-bottom: 6px;
      }
      .ccna-answer-review .ccna-review-block__title {
        font-size: var(--ccna-type-caption);
      }
      .ccna-quiz-reveal {
        padding: 8px 10px !important;
        margin-top: 6px !important;
      }
      .ccna-confidence-strip {
        margin-bottom: 8px;
      }
      .ccna-confidence-strip .ccna-confidence-strip__label {
        font-size: var(--ccna-type-caption);
        margin-bottom: 4px;
      }
      .ccna-confidence-strip button {
        min-height: 44px !important;
        padding: 8px 4px !important;
        font-size: var(--ccna-type-caption) !important;
      }
      .ccna-mock-debrief__labs button {
        padding: 8px 10px;
      }
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
      min-width: 0;
      background: #05060a;
    }
    .cisco-terminal--fluid {
      flex: 1;
      min-height: min(28dvh, 240px);
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
      flex: 1;
      min-width: 0;
    }
    .cisco-terminal--fluid .cisco-terminal-scroll {
      flex: 1;
      min-height: 22dvh;
      height: auto;
      max-height: min(48dvh, 480px);
    }
    .cisco-terminal-input-row {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
      flex-shrink: 0;
      padding: 8px 12px calc(12px + var(--ccna-safe-bottom));
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
    .lab-sticky-header {
      position: sticky;
      top: var(--ccna-safe-top);
      z-index: 12;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 0 10px;
      margin: -4px 0 4px;
      background: linear-gradient(180deg, color-mix(in srgb, ${colors.bg} 96%, transparent) 0%, color-mix(in srgb, ${colors.bg} 70%, transparent) 100%);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }
    .lab-sticky-back {
      flex-shrink: 0;
      margin-bottom: 0 !important;
    }
    .lab-sticky-title {
      flex: 1;
      min-width: 0;
      font-size: var(--ccna-type-sm);
      font-weight: 600;
      color: ${colors.silver};
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .lab-view--complete .lab-practice-layout {
      opacity: 0.92;
    }
    .trap-drill-sticky-header {
      position: sticky;
      top: var(--ccna-safe-top);
      z-index: 12;
      padding: 6px 0 8px;
      margin-bottom: 4px;
      background: linear-gradient(180deg, color-mix(in srgb, ${colors.bg} 96%, transparent) 0%, color-mix(in srgb, ${colors.bg} 75%, transparent) 100%);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }
    .trap-drill-sticky-header .ccna-back-btn,
    .trap-drill-sticky-header button[style] {
      margin-bottom: 0 !important;
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

    .global-search-overlay {
      padding-top: max(60px, var(--ccna-safe-top));
      padding-left: max(16px, var(--ccna-safe-left));
      padding-right: max(16px, var(--ccna-safe-right));
      padding-bottom: max(16px, var(--ccna-safe-bottom));
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
        padding-top: max(12px, var(--ccna-safe-top)) !important;
        padding-left: max(12px, var(--ccna-safe-left)) !important;
        padding-right: max(12px, var(--ccna-safe-right)) !important;
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
      .lab-sticky-header {
        padding-top: 4px;
        padding-bottom: 6px;
      }
      .lab-sticky-title {
        font-size: var(--ccna-type-xs);
      }
      .trap-drill-sticky-header,
      .study-mode-header {
        padding-top: 4px;
        padding-bottom: 6px;
        margin-bottom: 6px;
      }
      .study-mode-header__title {
        font-size: var(--ccna-type-lg);
        margin-bottom: 2px;
      }
      .cisco-terminal-scroll {
        height: clamp(24dvh, 28dvh, 180px);
        min-height: 20dvh;
      }
      .home-study-grid {
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 6px;
      }
      .lab-practice-layout {
        min-height: min(52dvh, 360px) !important;
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
      bottom: calc(var(--ccna-bottom-nav-height) + var(--ccna-safe-bottom) + var(--vv-bottom-inset, 0px));
      width: 100%;
      max-width: min(${SITE_COLUMN_MAX}px, 100%);
      margin: 0;
      padding: 10px max(16px, var(--ccna-safe-left)) 10px max(16px, var(--ccna-safe-right));
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
    .onboarding-shell {
      padding-bottom: calc(var(--ccna-safe-bottom) + 16px);
    }
    .onboarding-shell--quiz {
      padding-bottom: calc(var(--ccna-safe-bottom) + 24px);
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
      padding-bottom: calc(var(--ccna-bottom-nav-height) + 120px + var(--ccna-safe-bottom) + var(--vv-bottom-inset, 0px));
    }
    .topic-focus-session {
      padding-bottom: calc(var(--ccna-bottom-nav-height) + var(--ccna-safe-bottom) + var(--vv-bottom-inset, 0px) + 16px);
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
    .command-hub-domain-section {
      min-width: 0;
    }
    .command-hub-domain-section__header {
      min-height: 40px;
      touch-action: manipulation;
    }
    .command-hub-primary-tabs,
    .command-hub-device-filters,
    .command-hub-domain-filters {
      min-width: 0;
    }
    .study-lens-search:focus {
      outline: 2px solid ${colors.skyBorder};
      outline-offset: 1px;
    }
    .study-lens-studio .study-lens-list {
      max-height: none;
    }

    .ccna-mock-results {
      min-width: 0;
      padding-bottom: calc(var(--ccna-safe-bottom) + var(--vv-bottom-inset, 0px) + 8px);
    }
    .ccna-review-flow {
      min-width: 0;
      max-height: min(100vh, calc(100vh - 64px));
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      overscroll-behavior: contain;
      padding-bottom: calc(var(--ccna-safe-bottom) + var(--vv-bottom-inset, 0px) + 12px);
    }
    @supports (height: 100dvh) {
      .ccna-review-flow {
        max-height: min(92dvh, calc(100dvh - 72px));
      }
    }
    .app-shell--with-bottom-nav .ccna-review-flow {
      padding-bottom: calc(var(--ccna-bottom-nav-height) + var(--ccna-safe-bottom) + var(--vv-bottom-inset, 0px) + 16px);
    }
    .ccna-practice-active {
      min-width: 0;
    }
    .objective-body .ccna-review-flow {
      max-height: none;
      overflow: visible;
      padding-bottom: 0;
    }
    .objective-body:has(.ccna-practice-active) .objective-body-intro .ccna-mastery-checklist {
      display: none;
    }
    @media (max-width: 480px) {
      .ccna-mock-results > h1 {
        font-size: var(--ccna-type-xl);
        margin: 4px 0 8px;
      }
      .ccna-mock-results .ccna-mock-results__score,
      .ccna-mock-results .ccna-mock-results__grid,
      .ccna-mock-results .ccna-mock-results__domains,
      .ccna-mock-debrief {
        padding: 10px 12px !important;
        margin-bottom: 8px !important;
      }
      .ccna-mock-results .ccna-mock-results__qgrid button {
        min-width: 36px;
        min-height: 36px;
        padding: 4px 6px;
        font-size: var(--ccna-type-xs);
      }
      .ccna-mock-debrief__title {
        font-size: var(--ccna-type-lg) !important;
        margin-bottom: 2px !important;
      }
      .ccna-mock-debrief__lead {
        margin-bottom: 6px !important;
        font-size: var(--ccna-type-caption) !important;
      }
      .ccna-trap-debrief__item {
        padding: 6px 8px !important;
        margin-bottom: 4px !important;
      }
      .ccna-mock-debrief__actions button {
        padding: 7px 8px !important;
        font-size: var(--ccna-type-xs) !important;
      }
      .ccna-study-practice-cta {
        padding: 10px 12px !important;
        font-size: var(--ccna-type-sm) !important;
        margin-top: 8px !important;
      }
      .ccna-quiz-idle--slim .ccna-quiz-idle__lead {
        font-size: var(--ccna-type-sm);
        margin-bottom: 2px;
      }
      .ccna-quiz-idle--slim > p:nth-of-type(2) {
        margin-bottom: 6px;
        font-size: var(--ccna-type-caption);
      }
    }
    @media (orientation: landscape) and (max-height: 500px) {
      .ccna-mock-results > h1 {
        font-size: var(--ccna-type-lg);
        margin: 2px 0 6px;
      }
      .ccna-mock-results .ccna-mock-results__score {
        padding: 8px 10px !important;
        margin-bottom: 6px !important;
      }
      .ccna-mock-results .ccna-mock-results__score p {
        font-size: var(--ccna-type-xl) !important;
        margin: 2px 0 !important;
      }
      .ccna-mock-results .ccna-mock-results__grid,
      .ccna-mock-results .ccna-mock-results__domains {
        padding: 8px 10px !important;
        margin-bottom: 6px !important;
      }
      .ccna-mock-debrief {
        padding: 8px 10px !important;
        margin-bottom: 6px !important;
      }
      .ccna-mock-debrief__lead {
        display: none;
      }
      .ccna-mock-results .ccna-mock-results__qgrid button {
        min-width: 32px;
        min-height: 32px;
        font-size: var(--ccna-type-caption);
      }
      .ccna-review-flow > h1,
      .ccna-mock-review > h1 {
        font-size: var(--ccna-type-md);
        margin: 2px 0 4px;
      }
      .ccna-review-flow .ccna-quiz-reveal {
        padding: 6px 8px !important;
        margin-top: 4px !important;
      }
    }
  `
}
