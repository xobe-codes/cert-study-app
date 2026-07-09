import React, { useEffect, useMemo, useState } from 'react'
import { labsForObjective, getLab } from '../data/ccnaLabs.js'
import { labTierLabel } from '../lab/labLearnSpec.js'
import { COLORS, styles } from '../ui/appTheme.js'

export default function ObjectiveLabCTA({ objectiveId, onOpenLab }) {
  const objectiveLabs = useMemo(
    () => labsForObjective(objectiveId).map(l => getLab(l.id)?.lab).filter(Boolean),
    [objectiveId],
  )
  const [pickedId, setPickedId] = useState(objectiveLabs[0]?.id)

  useEffect(() => {
    setPickedId(objectiveLabs[0]?.id)
  }, [objectiveId, objectiveLabs])

  if (!objectiveLabs.length || !onOpenLab) return null
  const picked = objectiveLabs.find(l => l.id === pickedId) || objectiveLabs[0]

  return (
    <div className="objective-lab-cta" style={{ flexDirection: 'column', alignItems: 'stretch', marginTop: 12 }}>
      <div style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.silver, marginBottom: 10, lineHeight: 1.45 }}>
        Hands-on CLI for this topic — verify commands in the lab before exam day.
      </div>
      {objectiveLabs.length > 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
          <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 700, color: COLORS.silverMid }}>Choose a lab</div>
          {objectiveLabs.map(lab => {
            const active = lab.id === picked.id
            return (
              <button
                key={lab.id}
                type="button"
                onClick={() => setPickedId(lab.id)}
                style={{
                  ...styles.card,
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  border: `1px solid ${active ? COLORS.skyBorder : COLORS.border}`,
                  background: active ? COLORS.skyDim : COLORS.surface,
                  padding: '8px 10px',
                }}
              >
                <div style={{ fontSize: 'var(--ccna-type-sm)', fontWeight: 600, color: COLORS.silver, marginBottom: 4 }}>{lab.title}</div>
                <span style={{ ...styles.pill(lab.interpretOnly ? 'mint' : 'sky'), fontSize: 'var(--ccna-type-micro)' }}>{labTierLabel(lab)}</span>
              </button>
            )
          })}
        </div>
      )}
      <button type="button" style={styles.primaryBtn} onClick={() => onOpenLab(picked.id)}>
        Open lab{objectiveLabs.length > 1 ? `: ${picked.title}` : ' for this topic'}
      </button>
    </div>
  )
}
