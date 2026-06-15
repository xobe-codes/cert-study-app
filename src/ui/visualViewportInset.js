import { useEffect } from 'react'

/** Keeps fixed bottom chrome above iOS Safari's collapsing toolbar. */
export function useVisualViewportBottomInset(enabled) {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return
    const root = document.documentElement
    const vv = window.visualViewport
    if (!vv) return

    function update() {
      const inset = Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop))
      root.style.setProperty('--vv-bottom-inset', `${inset}px`)
    }

    update()
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    window.addEventListener('orientationchange', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
      window.removeEventListener('orientationchange', update)
      root.style.removeProperty('--vv-bottom-inset')
    }
  }, [enabled])
}
