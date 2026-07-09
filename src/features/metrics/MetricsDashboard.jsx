import React, { useState, useEffect } from 'react'
import { hasCuratedReading, hasCuratedQuestions } from '../../data/ccnaCurated.js'
import { labsForObjective } from '../../data/ccnaLabs.js'
import { DOMAINS, ALL_OBJECTIVES } from '../../data/ccnaDomains.js'
import { COLORS, accentColors, styles } from '../../ui/appTheme.js'
import { STATIC_COPY } from '../../ui/staticContentCopy.js'
import CuratedStaticBadge from '../../components/CuratedStaticBadge.jsx'
import OverflowMarquee from '../../components/OverflowMarquee.jsx'
import Spinner from '../../components/Spinner.jsx'
import ProgressBar from '../../components/ProgressBar.jsx'
import ProgressRing from '../../components/ProgressRing.jsx'
import StudyNextStrip from '../../home/StudyNextStrip.jsx'
import StudyModeHeader from '../../components/StudyModeHeader.jsx'
import {
  buildLearnerSummary,
  generateLocalSuggestions,
  loadRetentionHealth,
  pickStudyNext,
} from '../../home/learnerHome.js'
import { computeCkuWeakness, computeTrapWeakness, resolveCkuWeakAction, trapWeakTap } from '../../weaknessUtils.js'
import { masteryBreakdown } from '../../lesson/masteryCriteria.js'
import { loadCliStats } from '../../lab/cliStatsStorage.js'
import { loadOfflineDetail } from '../export/offlineDetail.js'
import { loadQuizBank } from '../../quiz/quizBankStorage.js'
import { STORAGE_KEYS } from '../../storageKeys.js'
import { AiCallsIndicator } from '../../ai/claudeClient.js'
import { COMMAND_DRILLS } from '../../lab/commandDrills.js'
import { buildStudyObjectiveHandoff } from '../../study/studyObjectiveHandoff.js'

const DAY_MS = 86400000

const RETENTION_META = {
  strong: { accent: 'mint', label: 'STRONG', icon: '🛡️', note: () => 'All items in long intervals' },
  fading: { accent: 'amber', label: 'FADING', icon: '⏳', note: (r) => r.dueNow > 0 ? `${r.dueNow} item${r.dueNow === 1 ? '' : 's'} due soon` : 'Building strength' },
  weak: { accent: 'sky', label: 'STUDY', icon: '📘', note: () => 'Multiple lapses — revisit Explain first' },
}

function SegmentedBar({ segments, accent = 'mint' }) {
  const c = accentColors(accent)
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {segments.map((s, i) => (
        <div key={i} title={s.label} style={{
          flex: 1, height: 6, borderRadius: 3,
          background: s.done ? c.text : COLORS.surface,
          border: `1px solid ${s.done ? c.border : COLORS.border}`,
        }} />
      ))}
    </div>
  )
}
function quadrantOf(acc, conf) {
  if (acc >= 0.7 && conf >= 0.6) return 'strong'
  if (acc >= 0.7 && conf < 0.6) return 'reassure'
  if (acc < 0.7 && conf >= 0.6) return 'hidden'
  return 'priority'
}

// Content coverage — shows which objectives have CURATED static content / a
// LAB vs which still use the AI fallback. The "waypoint" that makes scaling
// the content library a visible checklist you can chip away at over time.

function MetricsCollapsibleSection({ title, summary, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={styles.card}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        style={{
          display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left',
          background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        <span style={{ flex: 1, minWidth: 0 }}>
          <span className="ccna-metrics-section-title" style={{ display: 'block', fontSize: 'var(--ccna-type-sm)', fontWeight: 700, color: COLORS.silver, letterSpacing: 0.5 }}>{title}</span>
          {!open && summary && (
            <span style={{ display: 'block', fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginTop: 4, lineHeight: 1.35 }}>{summary}</span>
          )}
        </span>
        <span style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, flexShrink: 0 }} aria-hidden="true">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div style={{ marginTop: 12 }}>{children}</div>}
    </div>
  )
}

function ContentCoverage({ onOpen, bare = false }) {
  const rows = DOMAINS.map(d => {
    const objs = d.objectives
    const curated = objs.filter(o => hasCuratedReading(o.id)).length
    const questionsOnly = objs.filter(o => !hasCuratedReading(o.id) && hasCuratedQuestions(o.id)).length
    const labs = objs.filter(o => labsForObjective(o.id).length > 0).length
    return { ...d, total: objs.length, curated, questionsOnly, labs, objs }
  })
  const totalObj = rows.reduce((s, r) => s + r.total, 0)
  const totalCurated = rows.reduce((s, r) => s + r.curated, 0)
  const totalQuestionsOnly = rows.reduce((s, r) => s + r.questionsOnly, 0)
  const totalLabs = rows.reduce((s, r) => s + r.labs, 0)
  const [openId, setOpenId] = useState(null)

  const body = (
    <>
      {!bare && <div style={{ fontSize: 'var(--ccna-type-sm)', fontWeight: 700, color: COLORS.silver, letterSpacing: 0.5, marginBottom: 4 }}>CONTENT COVERAGE</div>}
      <div style={{ ...styles.small, marginBottom: 10 }}>{totalCurated}/{totalObj} objectives curated{totalQuestionsOnly > 0 ? ` · ${totalQuestionsOnly} with curated questions only` : ''} · {totalLabs} with labs. Uncurated objectives still work via AI (hybrid).</div>
      <ProgressBar value={totalCurated} max={totalObj} accent="mint" label="Curated (static, source-grounded)" sublabel={`${totalCurated}/${totalObj}`} height={8} />
      {rows.map(r => (
        <div key={r.id} style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 8, marginTop: 8 }}>
          <button onClick={() => setOpenId(o => o === r.id ? null : r.id)} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
            <span style={{ flex: 1, fontSize: 'var(--ccna-type-sm)', color: COLORS.silver }}>{r.name}</span>
            <span style={{ ...styles.pill(r.curated === r.total ? 'mint' : r.curated > 0 ? 'amber' : 'silver'), fontSize: 'var(--ccna-type-micro)' }}>{r.curated}/{r.total} curated</span>
            {r.questionsOnly > 0 && <span style={{ ...styles.pill('sky'), fontSize: 'var(--ccna-type-micro)' }}>{r.questionsOnly} Q-only</span>}
            {r.labs > 0 && <span style={{ ...styles.pill('sky'), fontSize: 'var(--ccna-type-micro)' }}>🧪 {r.labs}</span>}
            <span style={{ color: COLORS.silverMid, fontSize: 'var(--ccna-type-xs)' }}>{openId === r.id ? '−' : '+'}</span>
          </button>
          {openId === r.id && (
            <div style={{ marginTop: 8 }}>
              {r.objs.map(o => {
                const c = hasCuratedReading(o.id), q = !c && hasCuratedQuestions(o.id), l = labsForObjective(o.id).length > 0
                return (
                  <button key={o.id} onClick={() => onOpen({ ...o, domainId: r.id, domainName: r.name, accent: r.accent })} style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', minWidth: 0, background: 'none', border: 'none', padding: '4px 0', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
                    <span style={{ width: 7, height: 7, borderRadius: 999, background: c ? COLORS.mint : q ? COLORS.sky : COLORS.silverDim, flexShrink: 0 }} />
                    <OverflowMarquee
                      text={`${o.id} ${o.title}`}
                      style={{ fontSize: 'var(--ccna-type-xs)', color: c || q ? COLORS.silver : COLORS.silverMid }}
                    />
                    {(c || q) && <CuratedStaticBadge objectiveId={o.id} fontSize={8} />}
                    {!c && !q && <span style={{ fontSize: 'var(--ccna-type-micro)', color: COLORS.silverDim }}>AI</span>}
                    {l && <span style={{ fontSize: 'var(--ccna-type-xs)' }}>🧪</span>}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      ))}
    </>
  )

  if (bare) return body
  return <div style={{ ...styles.card }}>{body}</div>
}

export default function MetricsDashboard({ progress, missed, dueCount = 0, onBack, onSelectObjective, onOpenReview, onOpenStats, onOpenTrapDrill, onOpenExamTraps }) {
  const [data, setData] = useState(null)
  const [openBankIds, setOpenBankIds] = useState(new Set())

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [summary, cli, offlineDetail, usage, retention, mockHistory, quizBank] = await Promise.all([
        buildLearnerSummary(progress, missed || []),
        loadCliStats(),
        loadOfflineDetail(),
        window.storage.getItem(STORAGE_KEYS.usage),
        loadRetentionHealth(),
        window.storage.getItem(STORAGE_KEYS.mockHistory),
        loadQuizBank(),
      ])
      if (!cancelled) setData({ summary, cli, offlineDetail, usage, retention, mockHistory: mockHistory || [], quizBank: quizBank || {} })
    })()
    return () => { cancelled = true }
  }, [progress, missed])

  if (!data) {
    return (
      <div>
        <StudyModeHeader title="Learner Metrics" onBack={onBack} />
        <Spinner label="Crunching your metrics..." />
      </div>
    )
  }

  const { summary, cli, offlineDetail, usage, retention, mockHistory, quizBank } = data
  const objs = summary.perObjective
  const studied = objs.filter(o => o.attempts > 0)

  // ---- Mastery overview ----
  const overall = objs.reduce((s, o) => s + o.mastery, 0) / objs.length
  const masteredCount = objs.filter(o => o.status === 'mastered').length
  const offlineCount = Object.values(offlineDetail).filter(d => d.ready).length

  // ---- Weak areas ----
  const weak = [...studied].filter(o => o.status !== 'mastered').sort((a, b) => a.mastery - b.mastery).slice(0, 6)
  const missedTop = Object.entries(summary.missedByObj).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const ckuWeak = computeCkuWeakness(missed || []).slice(0, 6)
  const trapWeak = computeTrapWeakness(missed || []).slice(0, 5)

  // ---- Confidence vs accuracy ----
  const quads = { strong: [], reassure: [], hidden: [], priority: [] }
  studied.forEach(o => {
    const { acc, conf, has } = masteryBreakdown(progress[o.id])
    if (has) quads[quadrantOf(acc, conf)].push({ ...o, acc, conf })
  })
  const avgAcc = studied.length ? studied.reduce((s, o) => s + masteryBreakdown(progress[o.id]).acc, 0) / studied.length : 0
  const avgConf = studied.length ? studied.reduce((s, o) => s + masteryBreakdown(progress[o.id]).conf, 0) / studied.length : 0

  // ---- CLI skills ----
  const cliRows = Object.entries(cli).map(([id, s]) => {
    const o = ALL_OBJECTIVES.find(x => x.id === id)
    return { id, title: o ? o.title : id, ...s }
  }).sort((a, b) => (b.bestScore || 0) - (a.bestScore || 0))
  const cliTotals = cliRows.reduce((t, r) => ({
    runs: t.runs + (r.runs || 0), syntax: t.syntax + (r.syntaxErrors || 0), mode: t.mode + (r.wrongModeErrors || 0),
  }), { runs: 0, syntax: 0, mode: 0 })

  // ---- Review readiness ----
  const reviewCards = generateLocalSuggestions(summary, COMMAND_DRILLS)

  // ---- Offline unlock progress (topics 1-3 of 4 done) ----
  const offlineInProgress = ALL_OBJECTIVES
    .map(o => ({ o, d: offlineDetail[o.id] }))
    .filter(x => x.d.count > 0 && !x.d.ready)
    .sort((a, b) => b.d.count - a.d.count)
    .slice(0, 5)

  const studyNext = pickStudyNext(summary, dueCount)
  const coverageCurated = ALL_OBJECTIVES.filter(o => hasCuratedReading(o.id)).length
  const coverageLabs = ALL_OBJECTIVES.filter(o => labsForObjective(o.id).length > 0).length
  const retentionSummary = retention.length === 0
    ? 'No sections in spaced review yet'
    : `${retention.filter(r => r.state === 'strong').length} strong · ${retention.filter(r => r.state === 'fading').length} fading · ${retention.filter(r => r.state === 'weak').length} weak`
  const weakSummary = weak.length === 0
    ? 'Take quizzes to surface gaps'
    : `${weak[0].id} lowest at ${Math.round(weak[0].mastery * 100)}%`
  const overconfident = quads.hidden
  const underconfident = quads.reassure
  const confidenceReportSummary = studied.length === 0
    ? 'Answer questions to build your profile'
    : overconfident.length || underconfident.length
      ? `${overconfident.length} overconfident · ${underconfident.length} underconfident`
      : 'Well calibrated'
  const open = (o) => {
    const handoff = buildStudyObjectiveHandoff(o.id, { tab: o.__initialTab || 'Practice' })
    if (handoff) onSelectObjective(handoff)
  }
  const weakRowBtn = {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px 0',
    fontFamily: 'inherit',
  }
  function handleCkuWeakClick(id) {
    const action = resolveCkuWeakAction(id, missed || [])
    if (action.kind === 'study') {
      const handoff = buildStudyObjectiveHandoff(action.payload.objectiveId, { tab: 'Practice' })
      if (handoff) onSelectObjective?.(handoff)
      return
    }
    onOpenTrapDrill?.(action.payload)
  }
  function handleTrapWeakClick(trap) {
    trapWeakTap(trap, missed || [], {
      onOpenTrapDrill,
      onOpenExamTraps,
      onStudyObjective: (objectiveId) => {
        const handoff = buildStudyObjectiveHandoff(objectiveId, { tab: 'Practice' })
        if (handoff) onSelectObjective?.(handoff)
      },
    })
  }
  const quadCell = (key, label, accent, hint) => (
    <div style={{ flex: '1 1 45%', background: accentColors(accent).dim, border: `1px solid ${accentColors(accent).border}`, borderRadius: 10, padding: 10 }}>
      <div style={{ fontSize: 'var(--ccna-type-xl)', fontWeight: 700, color: accentColors(accent).text }}>{quads[key].length}</div>
      <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 600, color: COLORS.silver }}>{label}</div>
      <div style={{ fontSize: 'var(--ccna-type-micro)', color: COLORS.silverMid, lineHeight: 1.3 }}>{hint}</div>
    </div>
  )

  return (
    <div>
      <StudyModeHeader title="Learner Metrics" onBack={onBack} />
      {onOpenStats && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 6 }}>
          <button
            type="button"
            onClick={onOpenStats}
            style={{
              flexShrink: 0, minHeight: 36, padding: '6px 12px', borderRadius: 999,
              border: `1px solid ${COLORS.border}`, background: COLORS.surface,
              color: COLORS.silverMid, fontSize: 'var(--ccna-type-caption)', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Stats →
          </button>
        </div>
      )}
      <div style={{ ...styles.small, marginBottom: 10 }}>Everything below is {STATIC_COPY.metrics}.</div>

      {studyNext && (
        <div className="ccna-safe-sticky-top" style={{ paddingBottom: 10, marginBottom: 4 }}>
          <StudyNextStrip next={studyNext} onSelectObjective={onSelectObjective} onOpenReview={onOpenReview} sticky />
        </div>
      )}

      <AiCallsIndicator />

      <MetricsCollapsibleSection
        title="QUESTION HEALTH — SADE QUARANTINE"
        summary="Compile-time distractor audit & auto-quarantine"
      >
        <QuestionHealthAdminSection showWhenClean embedded />
      </MetricsCollapsibleSection>

      <MetricsCollapsibleSection
        title="MASTERY OVERVIEW"
        summary={`${Math.round(overall * 100)}% course · ${masteredCount}/${objs.length} mastered`}
        defaultOpen
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
          <ProgressRing value={overall} size={84} accent="purple" caption="Course mastery" />
          <div style={{ flex: 1 }}>
            <div style={{ ...styles.small, marginBottom: 6 }}>{masteredCount}/{objs.length} objectives mastered · ⤓ {offlineCount} offline-ready</div>
            <ProgressBar value={masteredCount} max={objs.length} accent="mint" label="Mastered" sublabel={`${masteredCount}/${objs.length}`} height={7} />
            <ProgressBar value={studied.length} max={objs.length} accent="sky" label="Started" sublabel={`${studied.length}/${objs.length}`} height={7} />
          </div>
        </div>
        {summary.domainStats.map(d => (
          <ProgressBar key={d.id} value={d.avg} max={1} accent="purple" label={d.name} sublabel={`${Math.round(d.avg * 100)}% · ${d.mastered}/${d.total}`} height={6} />
        ))}
      </MetricsCollapsibleSection>

      <MetricsCollapsibleSection
        title="CONTENT COVERAGE"
        summary={`${coverageCurated}/${ALL_OBJECTIVES.length} curated · ${coverageLabs} with labs`}
      >
        <ContentCoverage onOpen={open} bare />
      </MetricsCollapsibleSection>

      {mockHistory.length > 0 && (
        <MetricsCollapsibleSection
          title="MOCK EXAM HISTORY"
          summary={`Last ${mockHistory[mockHistory.length - 1].pct}% · ${mockHistory.length} attempt${mockHistory.length !== 1 ? 's' : ''}`}
        >
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 60, marginBottom: 8 }}>
            {mockHistory.slice(-12).map((h, i) => {
              const color = h.pct >= 80 ? COLORS.mint : h.pct >= 70 ? COLORS.sky : COLORS.rose
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <div style={{ fontSize: 'var(--ccna-type-micro)', color: COLORS.silverMid, textAlign: 'center' }}>{h.pct}%</div>
                  <div style={{ width: '100%', borderRadius: '3px 3px 0 0', background: color, height: `${Math.max(4, h.pct * 0.55)}px` }} />
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--ccna-type-micro)', color: COLORS.silverMid }}>
            <span>{new Date(mockHistory[Math.max(0, mockHistory.length - 12)].date).toLocaleDateString()}</span>
            <span>{mockHistory.length} attempt{mockHistory.length !== 1 ? 's' : ''} total</span>
            <span>{new Date(mockHistory[mockHistory.length - 1].date).toLocaleDateString()}</span>
          </div>
          {mockHistory.length >= 2 && (() => {
            const trend = mockHistory[mockHistory.length - 1].pct - mockHistory[mockHistory.length - 2].pct
            return <div style={{ ...styles.small, marginTop: 6 }}>Last attempt: <strong style={{ color: mockHistory[mockHistory.length - 1].pct >= 70 ? COLORS.mint : COLORS.rose }}>{mockHistory[mockHistory.length - 1].pct}%</strong>{trend !== 0 && <> · {trend > 0 ? `+${trend}` : trend}pp vs prior</>}</div>
          })()}
        </MetricsCollapsibleSection>
      )}

      <MetricsCollapsibleSection title="RETENTION HEALTH" summary={retentionSummary}>
        {retention.length === 0 ? (
          <div style={styles.small}>No sections in spaced review yet. Score ≥70% on a section's quiz and its questions start coming back on a forgetting-curve schedule — their retention state will show here.</div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
              {['strong', 'fading', 'weak'].map(st => {
                const n = retention.filter(r => r.state === st).length
                const m = RETENTION_META[st]
                const c = accentColors(m.accent)
                return (
                  <div key={st} style={{ flex: 1, textAlign: 'center', background: c.dim, border: `1px solid ${c.border}`, borderRadius: 10, padding: '8px 4px' }}>
                    <div style={{ fontSize: 'var(--ccna-type-xl)', fontWeight: 700, color: c.text }}>{n}</div>
                    <div style={{ fontSize: 'var(--ccna-type-micro)', color: c.text, fontWeight: 600 }}>{m.icon} {m.label}</div>
                  </div>
                )
              })}
            </div>
            {retention.map(r => {
              const m = RETENTION_META[r.state]
              const c = accentColors(m.accent)
              return (
                <button key={r.id} onClick={() => open(r.objective)} style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 10, textAlign: 'left', background: 'none', border: 'none', borderTop: `1px solid ${COLORS.border}`, cursor: 'pointer', padding: '10px 2px', fontFamily: 'inherit' }}>
                  <span style={{ fontSize: 'var(--ccna-type-lg)' }} aria-hidden="true">{m.icon}</span>
                  <span style={{ flex: 1 }}>
                    <span style={{ display: 'block', fontSize: 'var(--ccna-type-sm)', color: COLORS.silver }}>{r.id} {r.title}</span>
                    <span style={{ display: 'block', fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid }}>{m.note(r)} · {r.count} item{r.count === 1 ? '' : 's'}</span>
                  </span>
                  <span style={{ ...styles.pill(m.accent), fontSize: 'var(--ccna-type-micro)' }}>{m.label}</span>
                </button>
              )
            })}
          </>
        )}
      </MetricsCollapsibleSection>

      <MetricsCollapsibleSection title="WEAK AREAS — IMPROVEMENT MAP" summary={weakSummary}>
        {weak.length === 0 && <div style={styles.small}>Take a few quizzes and your weakest topics will surface here.</div>}
        {weak.map(o => (
          <button key={o.id} onClick={() => open(o)} style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 4, fontFamily: 'inherit' }}>
            <ProgressBar value={o.mastery} max={1} accent="rose" label={`${o.id} ${o.title}`} sublabel={`${Math.round(o.mastery * 100)}%`} height={7} />
          </button>
        ))}
        {missedTop.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <div style={{ ...styles.small, fontWeight: 600, marginBottom: 4 }}>Most-missed concepts</div>
            {missedTop.map(([id, n]) => {
              const o = ALL_OBJECTIVES.find(x => x.id === id)
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => o && open(o)}
                  style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: o ? 'pointer' : 'default', padding: '4px 0', fontFamily: 'inherit' }}
                >
                  <span style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid }}>
                    {id} {o ? o.title : ''} — <span style={{ color: COLORS.rose }}>missed {n}×</span>
                  </span>
                </button>
              )
            })}
          </div>
        )}
        {ckuWeak.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <div style={{ ...styles.small, fontWeight: 600, marginBottom: 4 }}>Weak CKUs (from missed bank)</div>
            {ckuWeak.map(({ id, count }) => {
              const actionable = !!(onOpenTrapDrill || onSelectObjective)
              return (
                <button
                  key={id}
                  type="button"
                  disabled={!actionable}
                  onClick={() => handleCkuWeakClick(id)}
                  style={{ ...weakRowBtn, cursor: actionable ? 'pointer' : 'default' }}
                >
                  <span style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid }}>
                    {id} — <span style={{ color: COLORS.amber }}>missed {count}×</span>
                  </span>
                </button>
              )
            })}
          </div>
        )}
        {trapWeak.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <div style={{ ...styles.small, fontWeight: 600, marginBottom: 4 }}>Repeated exam traps</div>
            {trapWeak.map(({ trap, count }) => {
              const actionable = !!(onOpenTrapDrill || onOpenExamTraps || onSelectObjective)
              return (
              <button
                key={trap}
                type="button"
                disabled={!actionable}
                onClick={() => handleTrapWeakClick(trap)}
                style={{ ...weakRowBtn, cursor: actionable ? 'pointer' : 'default' }}
              >
                <span style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid }}>
                  {trap} — <span style={{ color: COLORS.amber }}>{count}×</span>
                </span>
              </button>
              )
            })}
          </div>
        )}
      </MetricsCollapsibleSection>

      <MetricsCollapsibleSection
        title="CONFIDENCE vs ACCURACY"
        summary={`Accuracy ${Math.round(avgAcc * 100)}% · Confidence ${Math.round(avgConf * 100)}%`}
      >
        <ProgressBar value={avgAcc} max={1} accent="sky" label="Avg accuracy" sublabel={`${Math.round(avgAcc * 100)}%`} height={7} />
        <ProgressBar value={avgConf} max={1} accent="mint" label="Avg confidence" sublabel={`${Math.round(avgConf * 100)}%`} height={7} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
          {quadCell('strong', 'Strong mastery', 'mint', 'High accuracy + confidence')}
          {quadCell('hidden', 'Hidden weakness', 'rose', 'Confident but inaccurate — priority')}
          {quadCell('reassure', 'Needs reassurance', 'sky', 'Accurate but unsure')}
          {quadCell('priority', 'Priority review', 'purple', 'Low accuracy + confidence')}
        </div>
        {quads.hidden.length > 0 && (
          <div style={{ ...styles.small, marginTop: 8, color: COLORS.rose }}>
            Hidden weakness: {quads.hidden.slice(0, 3).map(o => `${o.id}`).join(', ')} — you feel confident but accuracy is low. Re-quiz these.
          </div>
        )}
      </MetricsCollapsibleSection>

      <MetricsCollapsibleSection title="🎯 CONFIDENCE REPORT" summary={confidenceReportSummary}>
        {studied.length === 0 ? (
          <div style={styles.small}>Keep studying — your calibration profile builds as you answer questions.</div>
        ) : (
          <>
            {overconfident.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 700, color: COLORS.rose, marginBottom: 6 }}>You overestimate your knowledge on:</div>
                {overconfident.map(o => (
                  <button key={o.id} onClick={() => open(o)} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', background: 'none', border: 'none', padding: '6px 0', borderTop: `1px solid ${COLORS.border}`, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
                    <span style={{ fontSize: 'var(--ccna-type-md)' }}>⚠️</span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <OverflowMarquee text={`${o.id} ${o.title}`} style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.silver }} />
                      <span style={{ display: 'block', fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginTop: 2 }}>Accuracy {Math.round(o.acc * 100)}% · Confidence {Math.round(o.conf * 100)}%</span>
                    </span>
                    <span style={{ ...styles.pill('rose'), fontSize: 'var(--ccna-type-micro)' }}>Overconfident</span>
                  </button>
                ))}
              </div>
            )}
            {underconfident.length > 0 && (
              <div style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 700, color: COLORS.sky, marginBottom: 6 }}>You know more than you think about:</div>
                {underconfident.map(o => (
                  <button key={o.id} onClick={() => open(o)} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', background: 'none', border: 'none', padding: '6px 0', borderTop: `1px solid ${COLORS.border}`, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
                    <span style={{ fontSize: 'var(--ccna-type-md)' }}>💪🏾</span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <OverflowMarquee text={`${o.id} ${o.title}`} style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.silver }} />
                      <span style={{ display: 'block', fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginTop: 2 }}>Accuracy {Math.round(o.acc * 100)}% · Confidence {Math.round(o.conf * 100)}%</span>
                    </span>
                    <span style={{ ...styles.pill('sky'), fontSize: 'var(--ccna-type-micro)' }}>Trust yourself</span>
                  </button>
                ))}
              </div>
            )}
            {overconfident.length === 0 && underconfident.length === 0 && (
              <div style={styles.small}>Your confidence and accuracy are well-calibrated. Keep it up!</div>
            )}
          </>
        )}
      </MetricsCollapsibleSection>

      <MetricsCollapsibleSection
        title="CISCO CLI SKILLS"
        summary={cliRows.length === 0 ? 'No CLI labs completed yet' : `${cliRows.length} objectives · ${cliTotals.runs} lab${cliTotals.runs === 1 ? '' : 's'}`}
      >
        {cliRows.length === 0 && <div style={styles.small}>Complete a CLI lab to start tracking command skills.</div>}
        {cliRows.map(r => (
          <ProgressBar key={r.id} value={(r.bestScore || 0) / 100} max={1} accent="sky" label={`${r.id} ${r.title}`} sublabel={`${r.bestScore || 0}%`} height={7} />
        ))}
        {cliRows.length > 0 && (
          <div style={{ ...styles.small, marginTop: 6 }}>
            {cliTotals.runs} lab{cliTotals.runs === 1 ? '' : 's'} completed · {cliTotals.syntax} syntax error{cliTotals.syntax === 1 ? '' : 's'} · {cliTotals.mode} wrong-mode error{cliTotals.mode === 1 ? '' : 's'}
          </div>
        )}
      </MetricsCollapsibleSection>

      <MetricsCollapsibleSection
        title="REVIEW READINESS QUEUE"
        summary={reviewCards.length === 0 ? 'All caught up' : `${reviewCards.length} suggestion${reviewCards.length === 1 ? '' : 's'} · ${reviewCards[0].chip}`}
      >
        {reviewCards.length === 0 && <div style={styles.small}>You're all caught up. Start a new topic to populate your queue.</div>}
        {reviewCards.map(s => (
          <button key={s.key} onClick={() => onSelectObjective({ ...s.objective, __initialTab: s.tab })} style={{ display: 'block', width: '100%', textAlign: 'left', background: accentColors(s.accent).dim, border: `1px solid ${accentColors(s.accent).border}`, borderRadius: 10, padding: 10, marginBottom: 8, cursor: 'pointer', fontFamily: 'inherit' }}>
            <span style={{ ...styles.pill(s.accent), fontSize: 'var(--ccna-type-micro)' }}>{s.chip}</span>
            <div style={{ fontSize: 'var(--ccna-type-sm)', fontWeight: 600, color: COLORS.silver, margin: '4px 0 2px' }}>{s.title}</div>
            <div style={{ ...styles.small, lineHeight: 1.4 }}>{s.body}</div>
          </button>
        ))}
      </MetricsCollapsibleSection>

      <MetricsCollapsibleSection
        title="OFFLINE UNLOCK PROGRESS"
        summary={`${offlineCount} offline-ready · ${offlineInProgress.length} in progress`}
      >
        <div style={{ ...styles.small, marginBottom: 10 }}>{offlineCount} topic{offlineCount === 1 ? '' : 's'} fully offline-ready. Closest to unlocking:</div>
        {offlineInProgress.length === 0 && <div style={styles.small}>Open a topic's tabs (or tap "Make available offline") to start downloading assets.</div>}
        {offlineInProgress.map(({ o, d }) => (
          <div key={o.id} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 4, minWidth: 0 }}>
              <OverflowMarquee text={`${o.id} ${o.title}`} style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silver }} />
              <span style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.mint, fontWeight: 600, flexShrink: 0 }}>{d.count} of 4</span>
            </div>
            <SegmentedBar segments={d.reqs} accent="mint" />
          </div>
        ))}
      </MetricsCollapsibleSection>

      {/* Banked Questions — grouped by objective, collapsible */}
      {(() => {
        const now = Date.now()
        const bankedGroups = Object.entries(quizBank)
          .map(([objId, questions]) => {
            const qs = Array.isArray(questions) ? questions : []
            if (qs.length === 0) return null
            const obj = ALL_OBJECTIVES.find(x => x.id === objId)
            const masteredCount = qs.filter(q => q.srs && (q.srs.intervalIndex || 0) >= 2 && (q.srs.lapses || 0) === 0).length
            return { objId, obj, qs, masteredCount }
          })
          .filter(Boolean)
          .sort((a, b) => b.qs.length - a.qs.length)

        const toggleBank = (id) => setOpenBankIds(prev => {
          const next = new Set(prev)
          next.has(id) ? next.delete(id) : next.add(id)
          return next
        })

        const srsBadge = (q) => {
          if (!q.srs || (q.attempts?.length || 0) === 0) return { label: 'Not reviewed', accent: 'silver' }
          if ((q.srs.intervalIndex || 0) >= 2 && (q.srs.lapses || 0) === 0) return { label: 'Mastered', accent: 'mint' }
          if ((q.srs.due ?? 0) <= now) return { label: 'Due now', accent: 'amber' }
          const daysLeft = Math.ceil(((q.srs.due ?? now) - now) / DAY_MS)
          return { label: `Due in ${daysLeft}d`, accent: 'sky' }
        }

        const bankedTotal = bankedGroups.reduce((s, g) => s + g.qs.length, 0)
        const bankedMastered = bankedGroups.reduce((s, g) => s + g.masteredCount, 0)

        return (
          <MetricsCollapsibleSection
            title="BANKED QUESTIONS"
            summary={bankedGroups.length === 0 ? 'No questions banked yet' : `${bankedTotal} questions · ${bankedMastered} mastered`}
          >
            {bankedGroups.length === 0 ? (
              <div style={styles.small}>No questions banked yet. Complete a quiz to start building your personal question bank.</div>
            ) : (
              <>
                <div style={{ ...styles.small, marginBottom: 10 }}>
                  {bankedTotal} questions across {bankedGroups.length} objective{bankedGroups.length !== 1 ? 's' : ''} · {bankedMastered} mastered
                </div>
                {bankedGroups.map(({ objId, obj, qs, masteredCount }) => {
                  const isOpen = openBankIds.has(objId)
                  const accent = obj?.accent || 'purple'
                  const c = accentColors(accent)
                  return (
                    <div key={objId} style={{ marginBottom: 6 }}>
                      <button
                        onClick={() => toggleBank(objId)}
                        style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 10, textAlign: 'left', background: isOpen ? c.dim : 'none', border: `1px solid ${isOpen ? c.border : COLORS.border}`, borderRadius: isOpen ? '10px 10px 0 0' : 10, cursor: 'pointer', padding: '10px 12px', fontFamily: 'inherit', transition: 'background 0.15s' }}
                      >
                        <span style={{ flex: 1, minWidth: 0 }}>
                          <OverflowMarquee
                            text={obj ? `${objId} ${obj.title}` : objId}
                            style={{ fontSize: 'var(--ccna-type-sm)', fontWeight: 600, color: COLORS.silver }}
                          />
                          <span style={{ display: 'block', fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginTop: 2 }}>
                            {qs.length} question{qs.length !== 1 ? 's' : ''} · {masteredCount} mastered
                          </span>
                        </span>
                        <span style={{ ...styles.pill(accent), fontSize: 'var(--ccna-type-micro)' }}>{qs.length}</span>
                        {masteredCount > 0 && <span style={{ ...styles.pill('mint'), fontSize: 'var(--ccna-type-micro)' }}>✓ {masteredCount}</span>}
                        <span style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginLeft: 2 }}>{isOpen ? '▲' : '▼'}</span>
                      </button>
                      {isOpen && (
                        <div style={{ border: `1px solid ${c.border}`, borderTop: 'none', borderRadius: '0 0 10px 10px', background: COLORS.surface, padding: '4px 0' }}>
                          {qs.map((q, i) => {
                            const badge = srsBadge(q)
                            const correctAnswer = Array.isArray(q.choices) ? q.choices[q.correctIndex] : ''
                            return (
                              <div key={q.id || i} style={{ padding: '10px 14px', borderTop: i > 0 ? `1px solid ${COLORS.border}` : 'none' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 4, minWidth: 0 }}>
                                  <OverflowMarquee text={q.question} style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silver, lineHeight: 1.4 }} />
                                  <span style={{ ...styles.pill(badge.accent), fontSize: 'var(--ccna-type-micro)', whiteSpace: 'nowrap', flexShrink: 0 }}>{badge.label}</span>
                                </div>
                                {correctAnswer && (
                                  <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.mint, marginTop: 2 }}>
                                    ✓ {correctAnswer}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </>
            )}
          </MetricsCollapsibleSection>
        )
      })()}

      <MetricsCollapsibleSection
        title="AI USAGE & ESTIMATED COST"
        summary={!usage || !usage.calls ? 'No AI calls yet' : `$${usage.costUSD.toFixed(3)} · ${usage.calls} calls`}
      >
        {!usage || !usage.calls ? (
          <div style={styles.small}>No AI calls recorded yet. Generate an explanation or quiz to start tracking spend.</div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 16, alignItems: 'baseline', marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 'var(--ccna-type-2xl)', fontWeight: 700, color: COLORS.mint }}>${usage.costUSD.toFixed(3)}</div>
                <div style={styles.small}>estimated total</div>
              </div>
              <div>
                <div style={{ fontSize: 'var(--ccna-type-lg)', fontWeight: 600, color: COLORS.silver }}>{usage.calls}</div>
                <div style={styles.small}>API calls</div>
              </div>
              <div>
                <div style={{ fontSize: 'var(--ccna-type-lg)', fontWeight: 600, color: COLORS.silver }}>{Math.round((usage.input + usage.output) / 1000)}k</div>
                <div style={styles.small}>tokens</div>
              </div>
            </div>
            <div style={{ ...styles.small, fontWeight: 600, marginBottom: 4 }}>By feature</div>
            {Object.entries(usage.byFeature).sort((a, b) => b[1].costUSD - a[1].costUSD).map(([f, e]) => (
              <div key={f} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 2 }}>
                <span>{f} · {e.calls} call{e.calls === 1 ? '' : 's'}</span>
                <span style={{ color: COLORS.sky }}>${e.costUSD.toFixed(3)}</span>
              </div>
            ))}
            <div style={{ ...styles.small, marginTop: 8, fontSize: 'var(--ccna-type-xs)' }}>Estimate based on public token pricing; cached/free reuse isn't billed.</div>
          </>
        )}
      </MetricsCollapsibleSection>
    </div>
  )
}
