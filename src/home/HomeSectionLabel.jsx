import React from 'react'
import { homeSectionLabel } from './homeUi.js'

/** Section header with nowrap — prevents vertical letter stacking on narrow viewports. */
export default function HomeSectionLabel({ color, children, style }) {
  return (
    <div className="ccna-home-section-label" style={{ ...homeSectionLabel(color), ...style }}>
      {children}
    </div>
  )
}
