import React from 'react'
import ExportModal from '../export/ExportModal.jsx'
import SyncModal from '../sync/SyncModal.jsx'
import GlobalSearchModal from '../search/GlobalSearchModal.jsx'
import SettingsSheet from '../../components/SettingsSheet.jsx'
import { PremiumToast } from '../../components/PremiumPreview.jsx'
import AppTour from '../../components/AppTour.jsx'

/** Settings, search, sync, export, and tour overlays extracted from App.jsx. */
export default function AppChromeOverlays({
  showExport,
  showSearch,
  showSync,
  showSettings,
  showTour,
  progress,
  missed,
  streak,
  onImport,
  onCloseExport,
  onSelectObjective,
  onCloseSearch,
  sync,
  onCloseSync,
  settings,
  premiumToast,
  onDismissPremiumToast,
  onCompleteTour,
  onSkipTour,
}) {
  return (
    <>
      {showExport && (
        <ExportModal
          progress={progress}
          missed={missed}
          streak={streak}
          onImport={onImport}
          onClose={onCloseExport}
        />
      )}
      {showSearch && (
        <GlobalSearchModal
          progress={progress}
          onSelectObjective={onSelectObjective}
          onClose={onCloseSearch}
        />
      )}
      {showSync && (
        <SyncModal
          syncCode={sync.syncCode}
          lastSynced={sync.lastSynced}
          busy={sync.busy}
          msg={sync.msg}
          online={sync.online}
          onGenerate={sync.onGenerate}
          onLink={sync.onLink}
          onSyncNow={sync.onSyncNow}
          onUnlink={sync.onUnlink}
          onClose={onCloseSync}
        />
      )}
      {showSettings && (
        <SettingsSheet
          onClose={settings.onClose}
          theme={settings.theme}
          onToggleTheme={settings.onToggleTheme}
          examDate={settings.examDate}
          onSaveExamDate={settings.onSaveExamDate}
          onClearExamDate={settings.onClearExamDate}
          quizSessionSize={settings.quizSessionSize}
          onQuizSessionSizeChange={settings.onQuizSessionSizeChange}
          reduceMotion={settings.reduceMotion}
          onReduceMotionChange={settings.onReduceMotionChange}
          examMode={settings.examMode}
          onExamModeChange={settings.onExamModeChange}
          cleanBankGenericExamTips={settings.cleanBankGenericExamTips}
          onReplayPlacement={settings.onReplayPlacement}
          onShowTour={settings.onShowTour}
          onOpenSync={settings.onOpenSync}
          onOpenExport={settings.onOpenExport}
          onImportPick={settings.onImportPick}
          onClearTutorChat={settings.onClearTutorChat}
          onClearAiCaches={settings.onClearAiCaches}
          onResetProgress={settings.onResetProgress}
          offlineReadyCount={settings.offlineReadyCount}
          objectiveCount={settings.objectiveCount}
          cleanBankObjectives={settings.cleanBankObjectives}
          cleanBankQuestions={settings.cleanBankQuestions}
          appVersion={settings.appVersion}
          onDonatePreview={settings.onDonatePreview}
          premiumUnlocked={settings.premiumUnlocked}
          onTogglePremium={settings.onTogglePremium}
        />
      )}
      <PremiumToast message={premiumToast} onDismiss={onDismissPremiumToast} />
      {showTour && <AppTour onComplete={onCompleteTour} onSkip={onSkipTour} />}
    </>
  )
}
