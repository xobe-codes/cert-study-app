import React from 'react'
import { DOMAINS } from '../../data/ccnaDomains.js'
import { COLORS, styles } from '../../ui/appTheme.js'
import { homeCard, homeSectionLabel, homeBodySm } from '../../home/homeUi.js'
import { placementDomainIds } from './placementBlueprints.js'
import { getStaleBaselineDomains } from './placementBlueprintCoverage.js'

/** First-use nudge — set domain baselines to study faster. */
export default function DomainBaselinePrompt({
  placementBaselineCount,
  placementRecords = {},
  onOpenDomainPlacement,
  onOpenDomain,
}) {
  const total = placementDomainIds().length
  const staleDomains = getStaleBaselineDomains(placementRecords)
  const allSet = placementBaselineCount >= total

  if (allSet && !staleDomains.length) return null

  const nextDomain = placementDomainIds()
    .map(id => DOMAINS.find(d => d.id === id))
    .find(d => d && !placementRecords[d.id]?.lastAttempt)

  const remapDomain = staleDomains[0]

  return (
    <div
      className="ccna-baseline-prompt"
      style={homeCard({
        border: `1px solid ${remapDomain ? COLORS.amberBorder : COLORS.skyBorder}`,
        background: remapDomain ? COLORS.amberDim : COLORS.skyDim,
      })}
    >
      <div style={homeSectionLabel(remapDomain ? COLORS.amber : COLORS.sky)}>
        {remapDomain ? 'UPDATE YOUR BASELINE MAP' : 'SET YOUR BASELINE'}
      </div>
      <p style={{ ...homeBodySm, margin: '0 0 10px', lineHeight: 1.5 }}>
        {remapDomain
          ? `${remapDomain.name} uses an older baseline — full remap samples every subsection so strong vs weak routing is complete.`
          : `Check each domain once (${placementBaselineCount}/${total} done). Every subsection is sampled; weak areas highlight where to focus.`}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {remapDomain ? (
          <button
            type="button"
            className="ccna-hover"
            style={{ ...styles.primaryBtn, marginBottom: 0, flex: '1 1 auto', minWidth: 140 }}
            onClick={() => {
              onOpenDomain?.(remapDomain.id)
              onOpenDomainPlacement?.({ domainId: remapDomain.id, expandOnReturn: true })
            }}
          >
            Full remap {remapDomain.name} →
          </button>
        ) : nextDomain ? (
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
        ) : null}
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
