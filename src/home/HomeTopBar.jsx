import React from 'react'
import { COLORS, styles } from '../ui/appTheme.js'
import ThemeToggleButton from '../components/ThemeToggleButton.jsx'
import { HOME_SECTION_GAP, homePill, homeLinkBtn } from './homeUi.js'
import { formatStreakLine, buildProgressChipLabels } from './homeTopBarUtils.js'

export default function HomeTopBar({
  streak,
  totals,
  theme,
  onToggleTheme,
  onOpenStats,
  offlineReady,
  readinessScore,
}) {
  const streakLine = formatStreakLine(streak)
  const chips = buildProgressChipLabels(totals, offlineReady?.size ?? 0)
  const showReadiness = typeof readinessScore === 'number' && Number.isFinite(readinessScore)

  return (
    <header className="ccna-home-topbar" style={{ marginBottom: HOME_SECTION_GAP }}>
      <div className="ccna-home-topbar__row1">
        <div className="ccna-home-topbar__title-wrap">
          <h1 className="ccna-home-topbar__title ccna-grad-text" style={styles.h1}>
            CCNA 200-301
          </h1>
          {showReadiness && (
            <div className="ccna-home-topbar__subtitle">{Math.round(readinessScore)}% exam ready</div>
          )}
        </div>
        <div className="ccna-home-topbar__actions">
          <ThemeToggleButton theme={theme} onToggle={onToggleTheme} />
          {onOpenStats && (
            <button type="button" className="ccna-home-topbar__stats" onClick={onOpenStats} style={homeLinkBtn(COLORS.purpleGlow)}>
              Stats →
            </button>
          )}
        </div>
      </div>

      {streakLine && (
        <div className="ccna-home-topbar__streak" aria-label="Study streak">
          {streakLine}
        </div>
      )}

      <div className="ccna-home-topbar__chips ccna-h-scroll" role="list" aria-label="Objective progress">
        {chips.map(chip => (
          <span key={chip.label} role="listitem" style={homePill(chip.accent)}>
            {chip.label}
          </span>
        ))}
      </div>
    </header>
  )
}
