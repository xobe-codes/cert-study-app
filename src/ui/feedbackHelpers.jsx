import React, { useEffect, useState } from 'react'
import { COLORS } from './appTheme.js'

export function Skeleton({ width = '100%', height = 14, style }) {
  return <div className="ccna-skeleton" style={{ width, height, marginBottom: 8, ...style }} />
}

// Short haptic pulse on supported devices (mobile). Silent no-op elsewhere.
export function haptic(pattern) {
  try { if (navigator.vibrate) navigator.vibrate(pattern) } catch { /* unsupported */ }
}

// Lightweight, dependency-free confetti burst (used on mastery). Self-cleans.
export function celebrate() {
  if (typeof document === 'undefined') return
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const colors = ['#EE4540', '#C72B40', '#7F1437', '#baf0fa', '#d4f7d4', '#fcd980']
  const canvas = document.createElement('canvas')
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999'
  canvas.width = window.innerWidth; canvas.height = window.innerHeight
  document.body.appendChild(canvas)
  const ctx = canvas.getContext('2d')
  const N = 110
  const parts = Array.from({ length: N }, () => ({
    x: canvas.width / 2, y: canvas.height * 0.35,
    vx: (Math.random() - 0.5) * 14, vy: Math.random() * -12 - 4,
    s: Math.random() * 5 + 3, c: colors[(Math.random() * colors.length) | 0],
    rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.4, life: 1,
  }))
  const start = performance.now()
  function frame(t) {
    const elapsed = t - start
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    parts.forEach(p => {
      p.vy += 0.35; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life = 1 - elapsed / 1300
      ctx.save(); ctx.globalAlpha = Math.max(0, p.life); ctx.translate(p.x, p.y); ctx.rotate(p.rot)
      ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 1.6); ctx.restore()
    })
    if (elapsed < 1300) requestAnimationFrame(frame)
    else canvas.remove()
  }
  requestAnimationFrame(frame)
}
