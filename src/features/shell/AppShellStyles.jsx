import React from 'react'
import { COLORS, THEME_CSS } from '../../ui/appTheme.js'
import { buildAppShellCss } from '../../ui/appShell.js'
import { buildPullToRefreshCss } from '../../ui/pullToRefreshCss.js'

/** Runtime shell CSS — appShell tokens, theme, animations, and touch polish. */
export default function AppShellStyles({ minimal = false }) {
  if (minimal) {
    return <style>{`${buildAppShellCss(COLORS)}\n${THEME_CSS}`}</style>
  }

  return (
    <style>{`
      ${buildAppShellCss(COLORS)}
      ${buildPullToRefreshCss(COLORS)}
      ${THEME_CSS}
      * { -webkit-tap-highlight-color: transparent; }
      button { transition: transform .12s ease, opacity .12s ease, box-shadow .12s ease; }
      button:active:not(:disabled) { transform: scale(0.97); }
      button:disabled { opacity: 0.5; cursor: default !important; }
      input:focus, textarea:focus { outline: none; box-shadow: 0 0 0 2px ${COLORS.focus}; }
      :focus-visible { outline: 2px solid ${COLORS.brandGlow}; outline-offset: 2px; }
      * { scrollbar-width: thin; scrollbar-color: ${COLORS.silverDim} transparent; }
      *::-webkit-scrollbar { width: 8px; height: 8px; }
      *::-webkit-scrollbar-thumb { background: ${COLORS.silverDim}; border-radius: 8px; }
      *::-webkit-scrollbar-track { background: transparent; }
      .ccna-grad-text {
        color: ${COLORS.silver};
        background: linear-gradient(90deg, ${COLORS.brandGlow}, ${COLORS.sky});
        -webkit-background-clip: text; background-clip: text; color: transparent;
      }
      @media (hover: hover) {
        .ccna-hover { transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease; }
        .ccna-hover:hover { transform: translateY(-2px); box-shadow: 0 12px 30px #00000055; border-color: ${COLORS.borderGlow}; }
      }
      @keyframes ccna-shimmer { to { transform: translateX(100%); } }
      .ccna-shimmer { position: relative; overflow: hidden; }
      .ccna-shimmer::after {
        content:''; position:absolute; inset:0;
        background: linear-gradient(90deg, transparent, ${COLORS.shimmerLine}, transparent);
        transform: translateX(-100%); animation: ccna-shimmer 2.4s ease-in-out infinite;
      }
      @keyframes ccna-skel { to { background-position: -200% 0; } }
      .ccna-skeleton {
        background: linear-gradient(90deg, ${COLORS.card}, ${COLORS.cardHover}, ${COLORS.card});
        background-size: 200% 100%; animation: ccna-skel 1.3s ease-in-out infinite; border-radius: 8px;
      }
      @keyframes ccna-pulse { 0% { box-shadow: 0 0 0 0 currentColor; opacity:.7 } 100% { box-shadow: 0 0 0 10px transparent; opacity:1 } }
      .ccna-pulse { animation: ccna-pulse .45s ease-out; }
      @keyframes ccna-quiz-reveal { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
      .ccna-quiz-reveal { animation: ccna-quiz-reveal .2s ease both; }
      @keyframes ccna-route-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
      .ccna-route-in { animation: ccna-route-in .32s ease both; }
      .objective-tab-panel { animation: ccna-route-in .22s ease both; }
      @keyframes key-term-flip { from { transform: rotateY(90deg); opacity: 0.4; } to { transform: rotateY(0); opacity: 1; } }
      .key-term-card { transition: background .2s ease, border-color .2s ease; perspective: 600px; }
      .key-term-card--flipped { animation: key-term-flip .28s ease both; }
      @media (pointer: coarse) {
        .ordering-touch-first [draggable="true"] { cursor: default; }
        .ordering-touch-first .ordering-touch-hint { display: block; }
      }
      html[data-reduce-motion="true"] .objective-tab-panel,
      html[data-reduce-motion="true"] .ccna-route-in,
      html[data-reduce-motion="true"] .key-term-card--flipped { animation: none !important; }
      .ccna-stagger > * { animation: ccna-route-in .42s ease both; }
      ${[1, 2, 3, 4, 5, 6, 7, 8].map(i => `.ccna-stagger > *:nth-child(${i}){animation-delay:${i * 0.04}s}`).join('')}
      @keyframes ccna-overlay-in { from { opacity: 0; } to { opacity: 1; } }
      @keyframes ccna-sheet-in { from { transform: translateY(100%); } to { transform: none; } }
      .ccna-overlay { animation: ccna-overlay-in .2s ease both; }
      .ccna-sheet { animation: ccna-sheet-in .3s cubic-bezier(.2,.8,.2,1) both; }
      @media (max-width: 480px) {
        .ccna-compact-p { font-size: var(--ccna-type-xs) !important; line-height: 1.4 !important; }
      }
      @media (prefers-reduced-motion: reduce) {
        .ccna-view, .ccna-route-in, .ccna-overlay, .ccna-sheet, .ccna-stagger > *, .ccna-quiz-reveal, .ccna-shimmer::after, .ccna-skeleton, .ccna-pulse { animation: none; }
        button:active:not(:disabled) { transform: none; }
      }
      .ccna-quiz-idle {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      @media (max-height: 740px) {
        .mc-choices-tip { display: none; }
      }
    `}</style>
  )
}
