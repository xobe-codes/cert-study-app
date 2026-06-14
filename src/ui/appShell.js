/** Viewport-locked app shell — document never scrolls; routes use internal panels. */

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
    }
    .app-shell {
      width: 100%;
      height: 100vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      min-height: 0;
      background:
        radial-gradient(1100px 560px at 50% -12%, ${colors.glowA}, transparent 60%),
        radial-gradient(760px 460px at 100% 0%, ${colors.glowB}, transparent 55%),
        ${colors.bg};
      color: ${colors.silver};
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      position: relative;
    }
    @supports (height: 100dvh) {
      .app-shell { height: 100dvh; }
    }
    .app-chrome-top {
      flex-shrink: 0;
      z-index: 120;
    }
    .app-chrome-toolbar {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 8px;
      padding: calc(env(safe-area-inset-top) + 6px) max(12px, env(safe-area-inset-right)) 6px max(12px, env(safe-area-inset-left));
      min-height: 0;
    }
    .app-chrome-bottom {
      flex-shrink: 0;
      display: flex;
      justify-content: center;
      padding: 8px max(16px, env(safe-area-inset-right)) calc(env(safe-area-inset-bottom) + 10px) max(16px, env(safe-area-inset-left));
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
      max-width: 680px;
      margin: 0 auto;
      padding: 8px max(16px, env(safe-area-inset-left)) 16px max(16px, env(safe-area-inset-right));
      box-sizing: border-box;
    }
    @media (min-width: 768px) {
      .route-inner.ccna-container {
        max-width: 720px;
        padding-left: max(24px, env(safe-area-inset-left));
        padding-right: max(24px, env(safe-area-inset-right));
      }
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
