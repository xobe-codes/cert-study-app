import { useEffect } from 'react'
import { setMobileGestureBlocks } from './mobileGestureBlocks.js'

/** Register temporary PTR / edge-back blocks for nested study surfaces (quiz, lab, mock). */
export function useMobileGestureBlock({ pull = false, edge = false } = {}) {
  useEffect(() => {
    setMobileGestureBlocks({ pull, edge })
    return () => setMobileGestureBlocks({ pull: false, edge: false })
  }, [pull, edge])
}
