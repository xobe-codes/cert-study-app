import { useEffect } from 'react'

export function useFocusTrap(containerRef) {
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const focusable = el.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    first?.focus()
    function onKey(e) {
      if (e.key !== 'Tab') return
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus() }
      } else if (document.activeElement === last) {
        e.preventDefault()
        first?.focus()
      }
    }
    el.addEventListener('keydown', onKey)
    return () => el.removeEventListener('keydown', onKey)
  }, [containerRef])
}
