import React from 'react'

function NavIcon({ name }) {
  if (name === 'back') {
    return (
      <svg className="app-bottom-nav-svg" viewBox="0 0 24 24" width="20" height="20" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 18 9 12l6-6" />
      </svg>
    )
  }
  if (name === 'home') {
    return (
      <svg className="app-bottom-nav-svg" viewBox="0 0 24 24" width="20" height="20" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 9.5V20h14V9.5" />
      </svg>
    )
  }
  if (name === 'search') {
    return (
      <svg className="app-bottom-nav-svg" viewBox="0 0 24 24" width="20" height="20" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
    )
  }
  return (
    <svg className="app-bottom-nav-svg" viewBox="0 0 24 24" width="20" height="20" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

export default function BottomNav({ active, onHome, onSearch, onMore, compact = false, homeLabel = 'Home', homeIcon = 'home' }) {
  const items = [
    { id: 'home', label: homeLabel, icon: homeIcon, onClick: onHome },
    { id: 'search', label: 'Search', icon: 'search', onClick: onSearch },
    { id: 'more', label: 'More', icon: 'more', onClick: onMore },
  ]

  return (
    <nav className={`app-bottom-nav${compact ? ' app-bottom-nav--compact' : ''}`} aria-label="Main navigation">
      {items.map(item => {
        const isActive = active === item.id
        return (
          <button
            key={item.id}
            type="button"
            className={`app-bottom-nav-btn${isActive ? ' app-bottom-nav-btn--active' : ''}`}
            onClick={item.onClick}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="app-bottom-nav-icon" aria-hidden><NavIcon name={item.icon} /></span>
            <span className="app-bottom-nav-label">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
