import React, { forwardRef } from 'react'

/**
 * @param {{ children: React.ReactNode, scroll?: boolean, innerClassName?: string }} props
 */
const RouteShell = forwardRef(function RouteShell({ children, scroll = true, innerClassName = '' }, ref) {
  if (!scroll) {
    return (
      <div className="route-shell route-shell--fill site-column">
        <div className={`route-inner ccna-container page-fill ${innerClassName}`.trim()}>
          {children}
        </div>
      </div>
    )
  }
  return (
    <div className="route-shell site-column">
      <div className="route-scroll internal-scroll" ref={ref}>
        <div className={`route-inner ccna-container ccna-view ${innerClassName}`.trim()}>
          {children}
        </div>
      </div>
    </div>
  )
})

export default RouteShell
