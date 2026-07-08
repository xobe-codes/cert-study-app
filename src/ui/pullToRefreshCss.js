/** Pull-to-refresh layout CSS (appShell companion — not theme tokens). */
export function buildPullToRefreshCss(colors) {
  return `
    .route-shell--ptr {
      position: relative;
    }
    .pull-refresh-host {
      position: absolute;
      top: 0;
      left: 50%;
      z-index: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      width: min(100%, 320px);
      height: 52px;
      margin-left: -50%;
      pointer-events: none;
      color: ${colors.silverMid};
      font-size: var(--ccna-type-xs);
      font-weight: 600;
      letter-spacing: 0.02em;
      opacity: 0;
      transform: translateY(-8px);
      transition: opacity .18s ease, transform .18s ease;
    }
    .pull-refresh-host--visible {
      opacity: 1;
      transform: translateY(0);
    }
    .pull-refresh-host__icon {
      width: 22px;
      height: 22px;
      margin-bottom: 4px;
      border: 2px solid ${colors.borderGlow};
      border-top-color: ${colors.brandGlow};
      border-radius: 50%;
      box-sizing: border-box;
    }
    .pull-refresh-host--refreshing .pull-refresh-host__icon {
      animation: pull-refresh-spin .75s linear infinite;
    }
    .pull-refresh-host--pulling .pull-refresh-host__icon {
      border-top-color: ${colors.mint};
      transform: rotate(var(--ptr-rotate, 0deg));
      transition: transform .08s linear;
    }
    @keyframes pull-refresh-spin {
      to { transform: rotate(360deg); }
    }
    .route-scroll--ptr-shift {
      will-change: transform;
      transition: transform .22s cubic-bezier(.2,.8,.2,1);
    }
    .route-scroll--ptr-dragging {
      transition: none;
    }
    html[data-reduce-motion="true"] .pull-refresh-host__icon,
    html[data-reduce-motion="true"] .route-scroll--ptr-shift {
      animation: none !important;
      transition: none !important;
    }
  `
}
