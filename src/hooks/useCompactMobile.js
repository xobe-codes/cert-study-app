import { useEffect, useState } from 'react'

/** True when viewport is phone-narrow (Practice review compaction). */
export function useCompactMobile(breakpointPx = 480) {
  const query = `(max-width: ${breakpointPx}px)`
  const [compact, setCompact] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia(query).matches,
  )
  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = () => setCompact(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [query])
  return compact
}
