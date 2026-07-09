import { useEffect, useState } from 'react'
import { getMobileGestureBlocks, subscribeMobileGestureBlocks } from './mobileGestureBlocks.js'

export function useMobileGestureBlocks() {
  const [blocks, setBlocks] = useState(getMobileGestureBlocks)
  useEffect(() => subscribeMobileGestureBlocks(setBlocks), [])
  return blocks
}
