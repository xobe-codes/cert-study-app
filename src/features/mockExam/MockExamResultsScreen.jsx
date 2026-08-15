import React from 'react'
import { DOMAINS } from '../../data/ccnaDomains.js'
import { gradeQuestion } from '../../questionUtils.js'
import { COLORS, styles } from '../../ui/appTheme.js'
import StudyModeHeader from '../../components/StudyModeHeader.jsx'
import DeferredExamTips from '../../components/DeferredExamTips.jsx'
import MockExamDebriefActions from './MockExamDebriefActions.jsx'

/** The "done" phase (exam/study results) screen for MockExam.jsx — extracted for ≤900L maintainability. */
export default function MockExamResultsScreen({
  report,
  responses,
  questions,
  sessionKind,
  coverageDelta,
  missed,
  onOpenTrapDrill,
  onOpenLab,
  onOpenDomainPass,
  onSelectObjective,
  onOpenMockInterview,
  onExit,
  isStudyMode,
  setCurrent,
  setPhase,
  setSelectedDomainIds,
  setIntroTab,
  restartSession,
}) {
  const pct = report.total > 0 ? Math.round((report.correct / report.total) * 100) : 0
  const skippedCount = report.total - Object.keys(responses).length
  const wrongCount = report.total - report.correct - skippedCount
  return (
    <div className="ccna-mock-results">
      <StudyModeHeader title={isStudyMode ? 'Study Results' : 'Exam Results'} onBack={onExit} backLabel="Back to Home" />
      <div className="ccna-mock-results__score" style={styles.card}>
        <div style={{ fontSize: 'var(--ccna-type-display)', fontWeight: 700, color: pct >= 70 ? COLORS.mint : COLORS.rose }}>{pct}%</div>
        <div style={styles.small}>{report.correct} / {report.total} correct</div>
        <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.mint }}>✓ {report.correct} correct</span>
          {wrongCount > 0 && <span style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.rose }}>✗ {wrongCount} incorrect</span>}
          {skippedCount > 0 && <span style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.amber }}>— {skippedCount} skipped</span>}
        </div>
      </div>
      {sessionKind === 'bank' && coverageDelta?.length > 0 && (
        <div style={{ ...styles.card, border: `1px solid ${COLORS.mintBorder}`, background: COLORS.mintDim }}>
          <h2 style={{ ...styles.h2, color: COLORS.mint }}>Bank coverage</h2>
          {coverageDelta.map(d => {
            const gained = d.seenAfter - d.seenBefore
            return (
              <div key={d.domainId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--ccna-type-sm)', marginBottom: 4, gap: 8 }}>
                <span>{d.name}</span>
                <span style={{ fontWeight: 600 }}>
                  {d.seenAfter}/{d.bankCount} seen{gained > 0 ? ` (+${gained})` : ''}
                </span>
              </div>
            )
          })}
        </div>
      )}
      <div className="ccna-mock-results__grid" style={styles.card}>
        <h2 style={styles.h2}>Question summary</h2>
        <div className="ccna-mock-results__qgrid" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
          {questions.map((qItem, idx) => {
            const sel = responses[idx]
            const isCorrect = sel != null && gradeQuestion(qItem, sel)
            const isSkipped = sel == null
            return (
              <button
                key={idx}
                type="button"
                title={`Q${idx + 1}: ${isSkipped ? 'Skipped' : isCorrect ? 'Correct' : 'Incorrect'}`}
                onClick={() => { setCurrent(idx); setPhase('review') }}
                style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: isSkipped ? COLORS.surface : isCorrect ? COLORS.mintDim : COLORS.roseDim,
                  border: `2px solid ${isSkipped ? COLORS.border : isCorrect ? COLORS.mintBorder : COLORS.rose}`,
                  color: isSkipped ? COLORS.silverMid : isCorrect ? COLORS.mint : COLORS.rose,
                  fontWeight: 700, fontSize: 'var(--ccna-type-xs)', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'inherit',
                }}
              >
                {idx + 1}
              </button>
            )
          })}
        </div>
        <div style={{ ...styles.small, color: COLORS.silverMid }}>Tap any number to jump straight to that question's review</div>
      </div>
      <div className="ccna-mock-results__domains" style={styles.card}>
        <h2 style={styles.h2}>By Domain</h2>
        {DOMAINS.map(d => {
          const r = report.byDomain[d.id]
          if (!r || r.total === 0) return null
          const dpct = Math.round((r.correct / r.total) * 100)
          return (
            <div key={d.id} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--ccna-type-sm)', marginBottom: 4 }}>
                <span>{d.name}</span>
                <span style={{ color: dpct >= 70 ? COLORS.mint : COLORS.rose, fontWeight: 600 }}>{r.correct}/{r.total} ({dpct}%)</span>
              </div>
              <div style={{ height: 6, borderRadius: 999, background: COLORS.surface, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${dpct}%`, background: dpct >= 70 ? COLORS.mint : COLORS.rose }} />
              </div>
            </div>
          )
        })}
      </div>
      <MockExamDebriefActions
        report={report}
        questions={questions}
        responses={responses}
        domains={DOMAINS}
        missed={missed}
        onOpenTrapDrill={onOpenTrapDrill}
        onOpenLab={onOpenLab}
        onOpenDomainPass={onOpenDomainPass}
        onStudyDomain={(domainId) => {
          setSelectedDomainIds([domainId])
          setIntroTab('domain')
          setPhase('intro')
        }}
        onSelectObjective={onSelectObjective}
      />
      {onOpenMockInterview && pct < 80 && (
        <button
          type="button"
          style={{ ...styles.secondaryBtn, marginTop: 8 }}
          onClick={onOpenMockInterview}
        >
          Exam day interview — verbal warm-up on weak spots
        </button>
      )}
      {report.deferredTips?.length > 0 && <DeferredExamTips tips={report.deferredTips} />}
      {(() => {
        const firstWrongIdx = questions.findIndex((qItem, idx) => {
          const sel = responses[idx]
          return sel != null && !gradeQuestion(qItem, sel)
        })
        return firstWrongIdx >= 0 ? (
          <button
            style={{ ...styles.primaryBtn, background: COLORS.roseDim, borderColor: COLORS.rose, color: COLORS.rose }}
            onClick={() => { setCurrent(firstWrongIdx); setPhase('review') }}
          >
            Review first wrong answer (Q{firstWrongIdx + 1}) →
          </button>
        ) : null
      })()}
      <button style={{ ...styles.primaryBtn, marginTop: 8 }} onClick={() => { setCurrent(0); setPhase('review') }}>Review all answers</button>
      <button
        style={{ ...styles.secondaryBtn, marginTop: 8 }}
        onClick={restartSession}
      >
        {sessionKind === 'bank' ? 'Burn more bank' : isStudyMode ? 'Study again' : sessionKind === 'domainSim' ? 'Retake domain sim' : 'Retake mock exam'}
      </button>
      {isStudyMode && (
        <button
          style={{ ...styles.secondaryBtn, marginTop: 8, background: 'none', border: 'none', color: COLORS.silverMid }}
          onClick={() => setPhase('intro')}
        >
          Change domains
        </button>
      )}
    </div>
  )
}
