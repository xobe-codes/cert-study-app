import React from 'react'
import { DOMAINS } from '../../data/ccnaDomains.js'
import { COLORS, styles } from '../../ui/appTheme.js'
import { homeCard, homeSectionLabel, homeBodySm } from '../../home/homeUi.js'
import { placementDomainIds } from './placementBlueprints.js'

/** First-use nudge — set domain baselines to study faster. */
export default function DomainBaselinePrompt({
  placementBaselineCount,
  placementRecords = {},
  onOpenDomainPlacement,
  onOpenDomain,
}) {
  const total = placementDomainIds().length
  if (placementBaselineCount >= total) return null

  const nextDomain = placementDomainIds()
    .map(id => DOMAINS.find(d => d.id === id))
    .find(d => d && !placementRecords[d.id]?.lastAttempt)

  return (
    <div
      className="ccna-baseline-prompt"
      style={homeCard({ border: `1px solid ${COLORS.skyBorder}`, background: COLORS.skyDim })}
    >
      <div style={homeSectionLabel(COLORS.sky)}>SET YOUR BASELINE</div>
      <p style={{ ...homeBodySm, margin: '0 0 10px', lineHeight: 1.5 }}>
        Check each domain once ({placementBaselineCount}/{total} done). Strong subsections get marked complete;
        weak ones highlight where to focus — so you study faster from day one.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {nextDomain && (
          <button
            type="button"
            className="ccna-hover"
            style={{ ...styles.primaryBtn, marginBottom: 0, flex: '1 1 auto', minWidth: 140 }}
            onClick={() => {
              onOpenDomain?.(nextDomain.id)
              onOpenDomainPlacement?.({ domainId: nextDomain.id, expandOnReturn: true })
            }}
          >
            Start {nextDomain.name} →
          </button>
        )}
        <button
          type="button"
          className="ccna-hover"
          style={{ ...styles.secondaryBtn, marginBottom: 0, flex: '1 1 auto', minWidth: 120 }}
          onClick={() => onOpenDomainPlacement?.()}
        >
          All domains
        </button>
      </div>
    </div>
  )
}
