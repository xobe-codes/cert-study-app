import React from 'react'

export default function BottomNav({ active, onHome, onSearch, onMore }) {
  const items = [
    { id: 'home', label: 'Home', icon: '🏠', onClick: onHome },
    { id: 'search', label: 'Search', icon: '🔍', onClick: onSearch },
    { id: 'more', label: 'More', icon: '☰', onClick: onMore },
  ]

  return (
    <nav className="app-bottom-nav site-column" aria-label="Main navigation">
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
            <span className="app-bottom-nav-icon" aria-hidden>{item.icon}</span>
            <span className="app-bottom-nav-label">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
