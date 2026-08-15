import { useEffect, useState } from 'react'

const FOCUSABLE_SELECTOR = 'a[href],button:not([disabled]),textarea,input:not([type="hidden"]),select,[tabindex]:not([tabindex="-1"])'

export function useCompactViewport(maxWidth = 1024) {
  const [compact, setCompact] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia(`(max-width: ${maxWidth}px)`).matches,
  )

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia(`(max-width: ${maxWidth}px)`)
    const onChange = () => setCompact(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [maxWidth])

  return compact
}

export function useLandscapeViewport() {
  const [landscape, setLandscape] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia('(orientation: landscape)').matches
      || (window.innerWidth > window.innerHeight && window.innerWidth >= 700)
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(orientation: landscape)')
    const onChange = () => {
      setLandscape(mq.matches || (window.innerWidth > window.innerHeight && window.innerWidth >= 700))
    }
    onChange()
    mq.addEventListener('change', onChange)
    window.addEventListener('resize', onChange)
    return () => {
      mq.removeEventListener('change', onChange)
      window.removeEventListener('resize', onChange)
    }
  }, [])

  return landscape
}

/** Touch / coarse-pointer devices (iPad, phones) — no hover-only affordances. */
export function useTouchFriendly() {
  const [touchFriendly, setTouchFriendly] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia('(pointer: coarse)').matches
      || window.matchMedia('(hover: none)').matches
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const coarse = window.matchMedia('(pointer: coarse)')
    const noHover = window.matchMedia('(hover: none)')
    const onChange = () => setTouchFriendly(coarse.matches || noHover.matches)
    onChange()
    coarse.addEventListener('change', onChange)
    noHover.addEventListener('change', onChange)
    return () => {
      coarse.removeEventListener('change', onChange)
      noHover.removeEventListener('change', onChange)
    }
  }, [])

  return touchFriendly
}

/**
 * Live CSS width of the diagram frame. Lets the viewBox track real pixels so
 * text renders at the size the font floors specify rather than being scaled
 * down with the rest of the drawing.
 */
export function useMeasuredWidth(ref) {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const read = () => {
      const next = Math.round(el.clientWidth || 0)
      setWidth(prev => (Math.abs(prev - next) >= 2 ? next : prev))
    }
    read()
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(read)
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])

  return width
}

export function useFocusTrap(containerRef) {
  useEffect(() => {
    const root = containerRef.current
    if (!root) return
    const previous = document.activeElement

    function focusables() {
      return [...root.querySelectorAll(FOCUSABLE_SELECTOR)].filter(el => !el.hasAttribute('disabled'))
    }

    const nodes = focusables()
    if (nodes.length) nodes[0].focus()
    else {
      root.tabIndex = -1
      root.focus()
    }

    function onKeyDown(e) {
      if (e.key !== 'Tab') return
      const list = focusables()
      if (!list.length) {
        e.preventDefault()
        return
      }
      const first = list[0]
      const last = list[list.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    root.addEventListener('keydown', onKeyDown)
    return () => {
      root.removeEventListener('keydown', onKeyDown)
      if (previous?.focus) previous.focus()
    }
  }, [containerRef])
}
