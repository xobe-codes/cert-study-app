/** Viewport-locked app shell — document never scrolls; routes use internal panels. */

export const SITE_COLUMN_MAX = 720

export function buildAppShellCss(colors) {
  return `
    html, body, #root {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      overflow: hidden;
    }
    #root {
      display: flex;
      flex-direction: column;
      min-height: 0;
      align-items: center;
    }
    .app-shell {
      width: 100%;
      max-width: ${SITE_COLUMN_MAX}px;
      height: 100vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      min-height: 0;
      margin: 0 auto;
      background:
        radial-gradient(1100px 560px at 50% -12%, ${colors.glowA}, transparent 60%),
        radial-gradient(760px 460px at 100% 0%, ${colors.glowB}, transparent 55%),
        ${colors.bg};
      color: ${colors.silver};
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      position: relative;
      box-sizing: border-box;
    }
    @supports (height: 100dvh) {
      .app-shell { height: 100dvh; }
    }
    .site-column {
      width: 100%;
      max-width: ${SITE_COLUMN_MAX}px;
      margin-left: auto;
      margin-right: auto;
      padding-left: max(16px, env(safe-area-inset-left));
      padding-right: max(16px, env(safe-area-inset-right));
      box-sizing: border-box;
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
    .app-chrome-search {
      min-height: 44px;
      height: 44px;
      padding: 0 18px;
      border-radius: 999px;
      border: 1px solid ${colors.border};
      background: ${colors.card};
      color: ${colors.silverMid};
      font-size: 13px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 2px 10px #00000033;
      font-family: inherit;
    }
    .app-chrome-theme {
      width: 40px;
      height: 40px;
      border-radius: 999px;
      border: 1px solid ${colors.border};
      background: ${colors.card};
      color: ${colors.silver};
      font-size: 18px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 10px #00000033;
      flex-shrink: 0;
    }
    .route-shell {
      flex: 1;
      min-height: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .route-shell--fill .route-inner {
      height: 100%;
      min-height: 0;
    }
    .internal-scroll {
      min-height: 0;
      overflow-y: auto;
      overflow-x: hidden;
      overscroll-behavior: contain;
      -webkit-overflow-scrolling: touch;
    }
    .route-scroll {
      flex: 1;
      min-height: 0;
    }
    .route-inner.ccna-container {
      width: 100%;
      margin: 0 auto;
      padding: 8px 0 16px;
      box-sizing: border-box;
    }
    .page-fill {
      height: 100%;
      min-height: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .objective-shell {
      height: 100%;
      min-height: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .objective-header {
      flex-shrink: 0;
    }
    .objective-body {
      flex: 1;
      min-height: 0;
    }
    .tutor-shell {
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
  `
}
