import React, { useState } from 'react'
import { hasCuratedReading, hasCuratedQuestions } from '../../data/ccnaCurated.js'
import { labsForObjective } from '../../data/ccnaLabs.js'
import { DOMAINS, ALL_OBJECTIVES } from '../../data/ccnaDomains.js'
import { COLORS, accentColors, styles } from '../../ui/appTheme.js'
import CuratedStaticBadge from '../../components/CuratedStaticBadge.jsx'
import { QuizChoiceText } from '../../components/QuizQuestionChrome.jsx'
import OverflowMarquee from '../../components/OverflowMarquee.jsx'
import ProgressBar from '../../components/ProgressBar.jsx'

const DAY_MS = 86400000

export const RETENTION_META = {
  strong: { accent: 'mint', label: 'STRONG', icon: '🛡️', note: () => 'All items in long intervals' },
  fading: { accent: 'amber', label: 'FADING', icon: '⏳', note: (r) => r.dueNow > 0 ? `${r.dueNow} item${r.dueNow === 1 ? '' : 's'} due soon` : 'Building strength' },
  weak: { accent: 'sky', label: 'STUDY', icon: '📘', note: () => 'Multiple lapses — revisit Explain first' },
}

export function SegmentedBar({ segments, accent = 'mint' }) {
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

export function quadrantOf(acc, conf) {
  if (acc >= 0.7 && conf >= 0.6) return 'strong'
  if (acc >= 0.7 && conf < 0.6) return 'reassure'
  if (acc < 0.7 && conf >= 0.6) return 'hidden'
  return 'priority'
}

export function MetricsCollapsibleSection({ title, summary, defaultOpen = false, children }) {
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

// Content coverage — shows which objectives have CURATED static content / a
// LAB vs which still use the AI fallback. The "waypoint" that makes scaling
// the content library a visible checklist you can chip away at over time.
export function ContentCoverage({ onOpen, bare = false }) {
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

export function MockHistorySection({ mockHistory }) {
  return (
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
  )
}

export function RetentionHealthSection({ retention, retentionSummary, open }) {
  return (
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
  )
}

export function BankedQuestionsSection({ quizBank, openBankIds, setOpenBankIds }) {
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
                              ✓ <QuizChoiceText text={correctAnswer} />
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
}

export function AiUsageSection({ usage }) {
  return (
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
  )
}
