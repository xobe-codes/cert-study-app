import React from 'react'
import { COLORS, styles } from '../../ui/appTheme.js'
import CuratedStaticBadge from '../../components/CuratedStaticBadge.jsx'
import MasteryChecklist from '../../components/MasteryChecklist.jsx'
import ObjectiveOverflowMenu from '../../components/ObjectiveOverflowMenu.jsx'
import { MAIN_TABS } from './objectiveTabUtils.js'

export default function ObjectiveHeader({
  objective,
  backLabel,
  onBack,
  tab,
  toolPanel,
  setTab,
  setToolPanel,
  objectiveTabId,
  objectivePanelId,
  status,
  curated,
  StatusLabel,
  prevObj,
  nextObj,
  onSelectSibling,
  objLabs,
  onOpenLab,
  isOffline,
  isPackaging,
  apiOnline,
  premiumUnlocked,
  onPackage,
  onPremiumBlocked,
  showOfflineAction,
  toolItems,
  onOpenTool,
  onToggleTheme,
  theme,
}) {
  const tabBar = (
    <div role="tablist" aria-label={`${objective.id} study activities`} className="objective-tab-bar" style={styles.tabBar}>
      {MAIN_TABS.map((t, idx) => (
        <button
          key={t}
          type="button"
          role="tab"
          id={objectiveTabId(objective.id, t)}
          aria-selected={tab === t && !toolPanel}
          aria-controls={objectivePanelId(objective.id, t)}
          tabIndex={tab === t && !toolPanel ? 0 : -1}
          style={styles.tabBtn(tab === t && !toolPanel)}
          onClick={() => { setTab(t); setToolPanel(null) }}
          onKeyDown={(e) => {
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return
            e.preventDefault()
            let next = idx
            if (e.key === 'ArrowRight') next = (idx + 1) % MAIN_TABS.length
            else if (e.key === 'ArrowLeft') next = (idx - 1 + MAIN_TABS.length) % MAIN_TABS.length
            else if (e.key === 'Home') next = 0
            else if (e.key === 'End') next = MAIN_TABS.length - 1
            setTab(MAIN_TABS[next])
            setToolPanel(null)
          }}
        >{t}</button>
      ))}
    </div>
  )

  return (
    <div className="objective-header objective-header--sticky">
      <div className="objective-sticky-chrome">
        <div className="objective-wayfind-row objective-wayfind-row--compact">
          <button type="button" className="objective-back-btn" onClick={onBack} aria-label={`Back to ${backLabel.toLowerCase()}`}>
            <span className="objective-back-btn__icon" aria-hidden="true">←</span>
            <span className="objective-back-btn__label">{backLabel}</span>
          </button>
          <ObjectiveOverflowMenu
            objective={objective}
            prevObj={prevObj}
            nextObj={nextObj}
            onSelectSibling={onSelectSibling}
            objLabs={objLabs}
            onOpenLab={onOpenLab}
            isOffline={isOffline}
            isPackaging={isPackaging}
            apiOnline={apiOnline}
            premiumUnlocked={premiumUnlocked}
            onPackage={onPackage}
            onPremiumBlocked={onPremiumBlocked}
            showOfflineAction={showOfflineAction}
            toolItems={toolItems}
            onOpenTool={onOpenTool}
            onToggleTheme={onToggleTheme}
            theme={theme}
          />
        </div>
        <div className="objective-meta-row" style={{ marginBottom: 4, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
          <span style={styles.pill(objective.accent)}>{objective.id}</span>
          <span><StatusLabel status={status} /></span>
          {curated ? (
            <CuratedStaticBadge objectiveId={objective.id} fontSize={9} showIncluded />
          ) : (
            <span style={{ ...styles.pill('purple'), fontSize: 'var(--ccna-type-micro)' }}>AI on demand</span>
          )}
        </div>
        <h1 className="objective-title objective-title--header">{objective.title}</h1>
        {tabBar}
      </div>
    </div>
  )
}

export function ObjectiveBodyIntro({
  whyLine,
  switchPrompt,
  blockState,
  confirmSwitch,
  setSwitchPrompt,
  tab,
  toolPanel,
  progressEntry,
  computeMastery,
  masteryPct,
  objective,
  ProgressBar,
}) {
  return (
    <div className="objective-body-intro">
      {whyLine && (
        <p style={{ ...styles.small, marginBottom: 8, lineHeight: 1.45, color: COLORS.silverMid }}>
          {whyLine}
        </p>
      )}

      {switchPrompt && (
        <div className="study-block-switch-prompt" style={{ ...styles.card, marginBottom: 10, borderColor: COLORS.amberBorder }}>
          <p style={{ ...styles.small, margin: '0 0 8px' }}>
            Study block running on <strong>{blockState.objectiveId}</strong>. Open <strong>{switchPrompt.id}</strong>?
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <button type="button" style={styles.primaryBtn} onClick={() => confirmSwitch('continue')}>Continue block here</button>
            <button type="button" style={styles.secondaryBtn} onClick={() => confirmSwitch('switch')}>Switch topic</button>
            <button type="button" style={styles.secondaryBtn} onClick={() => setSwitchPrompt(null)}>Cancel</button>
          </div>
        </div>
      )}

      {tab === 'Practice' && !toolPanel && (
        <MasteryChecklist progressEntry={progressEntry} compact />
      )}

      {(progressEntry?.quizScores || []).length > 0 && (
        <ProgressBar
          value={computeMastery(progressEntry).score}
          max={1}
          accent={objective.accent}
          label="Topic mastery"
          sublabel={`${masteryPct}%`}
          height={7}
        />
      )}
    </div>
  )
}
