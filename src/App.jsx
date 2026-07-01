import React, { useState, useEffect, useMemo, useCallback, useRef, useId, lazy, Suspense } from 'react'
import { getCurated, hasCuratedReading, hasCuratedQuestions, getCuratedQuestions } from './data/ccnaCurated.js'
import { getLab } from './data/ccnaLabs.js'
import {
  TYPE_LABEL, SKILL_LABEL, isOrderingQuestion, isMcQuestion, gradeQuestion, correctAnswerLabel,
  shuffleArrayCopy, randomizeQuestionOrder, computeBankMix, normalizeQuestionForBank, inferSkill, buildMissedEntry,
} from './questionUtils.js'
import { getLessonReference, hasLessonReference } from './lesson/knowledgeReference.js'
import { pickReviewSet, computeCkuCoverage, getObjectiveCkuIds } from './lesson/quizCoverage.js'
import {
  READING_TIERS,
  computeDefaultReadingTier,
  getReadingTier,
  readingTierHint,
  studyMetaToProgress,
  READING_TIER_KEYS,
} from './lesson/readingTier.js'
import {
  explanationBodyFromReading,
  explanationBodyFromAi,
  resolveBigTakeaway,
  resolveAiTakeaway,
} from './lesson/explanationFormat.js'
import CuratedDiagram from './components/CuratedDiagram.jsx'
import { preloadCleanBank, getCleanBankStats } from './data/cleanQuestionAdapter.js'
import { DOMAINS, ALL_OBJECTIVES } from './data/ccnaDomains.js'
import { PALETTES, COLORS, THEME_CSS, accentColors, styles } from './ui/appTheme.js'
import { STATIC_COPY } from './ui/staticContentCopy.js'
import { buildAppShellCss } from './ui/appShell.js'
import { useVisualViewportBottomInset } from './ui/visualViewportInset.js'
import CuratedStaticBadge from './components/CuratedStaticBadge.jsx'
import OverflowMarquee from './components/OverflowMarquee.jsx'
import DeferredExamTips from './components/DeferredExamTips.jsx'
import { ExplainTab, QuizTab, objectiveTabId, objectivePanelId, SubnetPracticeHome } from './tabs/studyQuizTabs.jsx'
import { BOOK_REF } from './data/bookRefFull.js'
import { formatCuratedAttribution } from './curatedDisplay.js'
import { STORAGE_KEYS } from './storageKeys.js'
import McChoices from './components/McChoices.jsx'
import AnswerReview from './components/AnswerReview.jsx'
import { QuizRichText, QuestionMeta, OrderingQuestion } from './components/QuizQuestionChrome.jsx'
import Spinner from './components/Spinner.jsx'
import ErrorBox from './components/ErrorBox.jsx'
import StatusDot from './components/StatusDot.jsx'
import StatusLabel from './components/StatusLabel.jsx'
import HomeScreen from './HomeScreen.jsx'
import StatsPage from './StatsPage.jsx'
import ObjectiveScreen from './ObjectiveScreen.jsx'
import { bumpSessionStudy } from './home/sessionRecap.js'
const MockExam = lazy(() => import('./MockExam.jsx'))
const ExtraStudyMode = lazy(() => import('./ExtraStudyMode.jsx'))
const ExamTrapStudyMode = lazy(() => import('./ExamTrapStudyMode.jsx'))
const RoutingDecoderMode = lazy(() => import('./RoutingDecoderMode.jsx'))
import { DEFAULT_QUIZ_SESSION_SIZE, MAX_QUIZ_SESSION_SIZE, clampQuizSessionSize, loadQuizSessionSize, saveQuizSessionSize } from './quizSessionConfig.js'
import { loadDueQuestions, countDueQuestions, REVIEW_SESSION_CAP } from './quiz/srsReview.js'
import { NavHintProvider, useNavHint } from './components/NavHintProvider.jsx'
import StudyBlockProvider, { useStudyBlock } from './components/StudyBlockProvider.jsx'
import SvgConfetti from './components/SvgConfetti.jsx'
import RouteShell from './components/RouteShell.jsx'
import SettingsSheet from './components/SettingsSheet.jsx'
import { PremiumBlockedShell, PremiumToast } from './components/PremiumPreview.jsx'
import {
  loadPremiumUnlocked,
  logPremiumBlocked,
  PREMIUM_FEATURES,
  PREMIUM_COMING_SOON_LABEL,
} from './premium/premiumFeatures.js'
import AppTour from './components/AppTour.jsx'
import BottomNav from './components/BottomNav.jsx'
const LabsHub = lazy(() => import('./lab/LabsHub.jsx'))
const LabView = lazy(() => import('./lab/LabView.jsx'))
const TopicFocusStudio = lazy(() => import('./topic/TopicFocusStudio.jsx'))
const TopicFocusSession = lazy(() => import('./topic/TopicFocusSession.jsx'))
const CommandHubStudio = lazy(() => import('./commands/CommandHubStudio.jsx'))
const StudyLensStudio = lazy(() => import('./lens/StudyLensStudio.jsx'))
import { COMMAND_DRILLS } from './lab/commandDrills.js'
import CLIDrillTab from './lab/CLIDrillTab.jsx'
import {
  QUIZ_BANK_MIN, MASTERY_GATE,
  loadQuizBank, saveQuizBank, mergeIntoBank, enableSectionReview,
} from './quiz/quizBankStorage.js'
import { flushQuestionFlagQueue } from './quiz/questionHealthClient.js'
import { NAV_HINT_KEYS } from './ui/navHintConfig.js'
import {
  loadExamDate,
  saveExamDate,
  clearExamDate,
  loadReduceMotion,
  saveReduceMotion,
  applyReduceMotionPreference,
  clearTutorChat,
  clearAiCaches,
  resetStudyProgress,
  loadQuizSessionSizePref,
  saveQuizSessionSizePref,
  loadTourDone,
  saveTourDone,
  loadExamMode,
  saveExamMode,
} from './settings/settingsActions.js'
import { applyAnswerReviewToQuestion, inferTrapForChoice } from './answerReviewLogic.js'
import { groupMissedByTrap } from './missed/missedTrapGroups.js'
import pkg from '../package.json'
import {
  askClaudeJSON, MODELS, QUIZ_SCHEMA, TERMS_SCHEMA, VISUAL_SCHEMA,
  checkApiReachable,
} from './ai/claudeClient.js'
import { computeMastery } from './netUtils.js'
import { logEvent } from './eventLog.js'
import { importCcnaJsonFromFile } from './features/export/importCcnaJson.js'
import ExportModal from './features/export/ExportModal.jsx'
import SyncModal from './features/sync/SyncModal.jsx'
import GlobalSearchModal from './features/search/GlobalSearchModal.jsx'
import OfflineBanner from './features/shell/OfflineBanner.jsx'
import TutorChat from './features/tutor/TutorChat.jsx'
import FocusModeSession from './features/focus/FocusModeSession.jsx'
import ReviewSession from './features/review/ReviewSession.jsx'
import Onboarding from './features/onboarding/Onboarding.jsx'
import MissedReview from './features/missed/MissedReview.jsx'
import TrapDrillSession from './features/trapDrill/TrapDrillSession.jsx'
import MetricsDashboard from './features/metrics/MetricsDashboard.jsx'
import {
  generateSyncCode, loadSyncBundle, saveSyncBundle, mergeSyncData, pullSync, pushSync,
} from './features/sync/syncMerge.js'
import { EXPLAIN_CACHE_KEY, EXPLAIN_PROMPT_SYSTEM, EXPLAIN_SCHEMA } from './tabs/studyConstants.js'
import { SubnettingTab, VLSMTab, IPv6CalcTab, ACLWildcardTab } from './tabs/subnetPracticeTabs.jsx'

const quizFeedbackA11y = { role: 'status', 'aria-live': 'polite', 'aria-atomic': true }

function LazyRoute({ children, label = 'Loading…' }) {
  return <Suspense fallback={<Spinner label={label} />}>{children}</Suspense>
}

const PREMIUM_TOAST_MESSAGES = {
  [PREMIUM_FEATURES.tutor]: 'AI Tutor and Study Lens synthesis unlock with supporter access.',
  [PREMIUM_FEATURES.offline_pack]: 'Offline AI packaging is a premium feature.',
  [PREMIUM_FEATURES.ai_visual]: 'Custom AI visuals require supporter access.',
  [PREMIUM_FEATURES.ai_terms]: 'AI key-term flashcards require supporter access.',
  [PREMIUM_FEATURES.ai_explain]: 'AI-generated explanations require supporter access.',
  [PREMIUM_FEATURES.quiz_generate]: 'Generating new quiz questions is a premium feature.',
  [PREMIUM_FEATURES.donate_preview]: 'Donations are not enabled yet — thank you for your interest.',
}



/* =========================================================================
   PERSISTENCE — all reads/writes go through window.storage
   ========================================================================= */

// progress shape: { [objectiveId]: { status: 'unseen'|'in_progress'|'mastered', quizScores: [{score,total,date}], lastSeen } }
async function loadProgress() {
  const stored = await window.storage.getItem(STORAGE_KEYS.progress)
  return stored || {}
}
async function saveProgress(progress) {
  await window.storage.setItem(STORAGE_KEYS.progress, progress)
}

// missed shape: [{ objectiveId, question, choices, correctIndex, explanation, addedAt }]
async function loadMissed() {
  const stored = await window.storage.getItem(STORAGE_KEYS.missed)
  return stored || []
}
async function saveMissed(missed) {
  await window.storage.setItem(STORAGE_KEYS.missed, missed)
}

// streak shape: { count, lastStudyDate (YYYY-MM-DD) }
async function loadStreak() {
  const stored = await window.storage.getItem(STORAGE_KEYS.streak)
  return stored || { count: 0, lastStudyDate: null }
}
async function saveStreak(streak) {
  await window.storage.setItem(STORAGE_KEYS.streak, streak)
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}
function daysBetween(a, b) {
  const ms = new Date(b) - new Date(a)
  return Math.round(ms / 86400000)
}
// Call whenever the user does study activity. Returns the updated streak.
async function bumpStreak() {
  const streak = await loadStreak()
  const today = todayStr()
  if (streak.lastStudyDate === today) return streak
  if (streak.lastStudyDate) {
    const diff = daysBetween(streak.lastStudyDate, today)
    if (diff === 1) streak.count += 1
    else if (diff > 1) streak.count = 1
    else streak.count = streak.count || 1
  } else {
    streak.count = 1
  }
  streak.lastStudyDate = today
  await saveStreak(streak)
  return streak
}

/* =========================================================================
   MOCK EXAM — domain-weighted question selection
   ========================================================================= */

function SectionLabel({ icon, label }) {
  return (
    <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 700, color: COLORS.silverMid, letterSpacing: 0.9, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
      <span>{icon}</span><span>{label}</span>
    </div>
  )
}


/* =========================================================================
   PROGRESS PRIMITIVES — local, data-driven, no API. Every bar is fed real
   learner numbers by its caller and carries a clear label.
   ========================================================================= */
function clamp01(n) { return Math.max(0, Math.min(1, isFinite(n) ? n : 0)) }

// Animates 0 -> target with easeOutCubic. Respects reduced-motion by snapping.
function useCountUp(target, ms = 700) {
  const [n, setN] = useState(target)
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  useEffect(() => {
    if (prefersReduced) { setN(target); return }
    let raf, start
    const tick = t => {
      start ??= t
      const p = Math.min((t - start) / ms, 1)
      setN(target * (1 - Math.pow(1 - p, 3)))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, ms, prefersReduced])
  return n
}

// Skeleton placeholder block (shimmer). width/height accept any CSS length.
function Skeleton({ width = '100%', height = 14, style }) {
  return <div className="ccna-skeleton" style={{ width, height, marginBottom: 8, ...style }} />
}

// Short haptic pulse on supported devices (mobile). Silent no-op elsewhere.
function haptic(pattern) {
  try { if (navigator.vibrate) navigator.vibrate(pattern) } catch { /* unsupported */ }
}

// Lightweight, dependency-free confetti burst (used on mastery). Self-cleans.
function celebrate() {
  if (typeof document === 'undefined') return
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const colors = ['#EE4540', '#C72B40', '#7F1437', '#baf0fa', '#d4f7d4', '#fcd980']
  const canvas = document.createElement('canvas')
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999'
  canvas.width = window.innerWidth; canvas.height = window.innerHeight
  document.body.appendChild(canvas)
  const ctx = canvas.getContext('2d')
  const N = 110
  const parts = Array.from({ length: N }, () => ({
    x: canvas.width / 2, y: canvas.height * 0.35,
    vx: (Math.random() - 0.5) * 14, vy: Math.random() * -12 - 4,
    s: Math.random() * 5 + 3, c: colors[(Math.random() * colors.length) | 0],
    rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.4, life: 1,
  }))
  const start = performance.now()
  function frame(t) {
    const elapsed = t - start
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    parts.forEach(p => {
      p.vy += 0.35; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life = 1 - elapsed / 1300
      ctx.save(); ctx.globalAlpha = Math.max(0, p.life); ctx.translate(p.x, p.y); ctx.rotate(p.rot)
      ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 1.6); ctx.restore()
    })
    if (elapsed < 1300) requestAnimationFrame(frame)
    else canvas.remove()
  }
  requestAnimationFrame(frame)
}

// Labeled linear completion/strength bar — gradient fill + subtle shimmer.
function ProgressBar({ value, max = 1, label, sublabel, accent = 'purple', height = 8 }) {
  const pct = clamp01(max ? value / max : 0)
  const c = accentColors(accent)
  return (
    <div style={{ marginBottom: 10 }}>
      {(label || sublabel) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4, gap: 8, minWidth: 0 }}>
          {label && <OverflowMarquee text={label} style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silver }} />}
          {sublabel && <span style={{ fontSize: 'var(--ccna-type-xs)', color: c.text, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>{sublabel}</span>}
        </div>
      )}
      <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 999, height, overflow: 'hidden' }}>
        <div className="ccna-shimmer" style={{ width: `${pct * 100}%`, height: '100%', background: `linear-gradient(90deg, ${c.border}, ${c.text})`, borderRadius: 999, transition: 'width .5s ease' }} />
      </div>
    </div>
  )
}

// Circular mastery ring — gradient stroke + glow + animated count-up.
function ProgressRing({ value, size = 72, stroke = 7, accent = 'purple', caption }) {
  const pct = clamp01(value)
  const shown = useCountUp(pct, 800)
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const c = accentColors(accent)
  const gid = useId().replace(/:/g, '')
  const pctLabel = `${Math.round(shown * 100)}%`
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg
          width={size} height={size} viewBox={`0 0 ${size} ${size}`}
          role="img" aria-label={caption ? `${caption}: ${pctLabel}` : pctLabel}
          style={{ display: 'block', overflow: 'visible' }}
        >
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={c.border} /><stop offset="100%" stopColor={c.text} />
            </linearGradient>
          </defs>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={COLORS.border} strokeWidth={stroke} opacity="0.55" />
          <circle
            cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`url(#${gid})`} strokeWidth={stroke}
            strokeDasharray={circ} strokeDashoffset={circ * (1 - shown)} strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ filter: `drop-shadow(0 0 4px ${c.text}55)` }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <span style={{ fontSize: `clamp(12px, ${Math.max(13, size * 0.28)}px, var(--ccna-type-sm))`, fontWeight: 700, color: COLORS.silver, lineHeight: 1 }}>{pctLabel}</span>
        </div>
      </div>
      {caption && <span style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, textAlign: 'center', maxWidth: size + 16, lineHeight: 1.3 }}>{caption}</span>}
    </div>
  )
}

/* =========================================================================
   VISUAL AID — structured data is generated by the AI ONCE and cached; the
   app renders it locally from reusable templates, so re-viewing a diagram
   never costs an API call. Supported template types:
     command_sequence: { type, title, steps:[string] }
     comparison:       { type, title, left:{label,points:[]}, right:{label,points:[]} }
     layer_stack:      { type, title, layers:[{label,note}] }   (top -> bottom)
     flow:             { type, title, steps:[string] }          (left -> right)
   ========================================================================= */
const VISUAL_CACHE_KEY = STORAGE_KEYS.visualCache
const VISUAL_PROMPT_SYSTEM = `You are a CCNA 200-301 visual-aid designer. Produce ONE minimalistic visual aid that teaches the core of this objective at a glance. Choose the single template type that best fits the concept. Use the provided reference notes as your primary source; you may add accurate CCNA 200-301 detail consistent with the notes.

Respond with ONLY valid JSON (no markdown fences, no commentary) using EXACTLY ONE of these shapes:
- A CLI/config or ordered procedure:
  {"type":"command_sequence","title":"...","steps":["...","..."]}
- Two things contrasted:
  {"type":"comparison","title":"...","left":{"label":"...","points":["..."]},"right":{"label":"...","points":["..."]}}
- A layered model or stack (order top to bottom):
  {"type":"layer_stack","title":"...","layers":[{"label":"...","note":"..."}]}
- A process or packet/decision flow (order first to last):
  {"type":"flow","title":"...","steps":["...","..."]}

Keep it tight: 3-6 steps/points/layers, each a short phrase. Pick the type that genuinely matches the concept (e.g. command_sequence for config tasks, comparison for A-vs-B topics, layer_stack for models, flow for processes like DORA or STP states).`

function VisualBadge({ children, accent }) {
  const c = accent || COLORS.purpleGlow
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      minWidth: 22, height: 22, borderRadius: 6, fontSize: 'var(--ccna-type-xs)', fontWeight: 700,
      background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: c, padding: '0 6px',
    }}>{children}</span>
  )
}

// Pure, local renderer — no network, no AI. Just turns the cached spec into UI.
function VisualAidRender({ spec }) {
  if (!spec || !spec.type) return null
  const frame = { ...styles.card, border: `1px solid ${COLORS.skyBorder}`, background: COLORS.skyDim }
  const titleStyle = { fontSize: 'var(--ccna-type-sm)', fontWeight: 700, color: COLORS.sky, marginBottom: 12, letterSpacing: 0.2 }

  if (spec.type === 'command_sequence' || spec.type === 'flow') {
    const horizontal = spec.type === 'flow'
    const steps = spec.steps || []
    return (
      <div style={frame}>
        <div style={titleStyle}>{spec.title}</div>
        <div style={{ display: 'flex', flexDirection: horizontal ? 'row' : 'column', flexWrap: horizontal ? 'wrap' : 'nowrap', gap: 8, alignItems: horizontal ? 'stretch' : 'stretch' }}>
          {steps.map((s, i) => (
            <React.Fragment key={i}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, flex: horizontal ? '1 1 auto' : 'none',
                background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: '8px 10px',
              }}>
                <VisualBadge accent={COLORS.sky}>{i + 1}</VisualBadge>
                <span style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.silver, fontFamily: horizontal ? 'inherit' : 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>{s}</span>
              </div>
              {i < steps.length - 1 && (
                <div style={{ alignSelf: 'center', color: COLORS.silverMid, fontSize: 'var(--ccna-type-md)', lineHeight: 1 }}>
                  {horizontal ? '→' : '↓'}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    )
  }

  if (spec.type === 'comparison') {
    const col = (side, accent, dim, border) => (
      <div style={{ flex: '1 1 0', minWidth: 0, background: dim, border: `1px solid ${border}`, borderRadius: 10, padding: 12 }}>
        <div style={{ fontSize: 'var(--ccna-type-sm)', fontWeight: 700, color: accent, marginBottom: 8 }}>{side?.label}</div>
        {(side?.points || []).map((p, i) => (
          <div key={i} style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silver, lineHeight: 1.45, marginBottom: 4, display: 'flex', gap: 6 }}>
            <span style={{ color: accent }}>•</span><span>{p}</span>
          </div>
        ))}
      </div>
    )
    return (
      <div style={frame}>
        <div style={titleStyle}>{spec.title}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {col(spec.left, COLORS.mint, COLORS.mintDim, COLORS.mintBorder)}
          {col(spec.right, COLORS.purpleGlow, COLORS.purpleDim, COLORS.borderGlow)}
        </div>
      </div>
    )
  }

  if (spec.type === 'layer_stack') {
    const layers = spec.layers || []
    return (
      <div style={frame}>
        <div style={titleStyle}>{spec.title}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {layers.map((l, i) => (
            <div key={i} style={{
              background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 8,
              padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <VisualBadge accent={COLORS.purpleGlow}>{layers.length - i}</VisualBadge>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 'var(--ccna-type-sm)', fontWeight: 600, color: COLORS.silver }}>{l.label}</div>
                {l.note && <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, lineHeight: 1.4 }}>{l.note}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return null
}

function CuratedPacketFlow({ data }) {
  const pf = data?.packetFlow
  if (!pf?.steps?.length) return null
  return (
    <div style={{ ...styles.card, border: `1px solid ${COLORS.mintBorder}`, background: COLORS.mintDim, marginTop: 8, marginBottom: 12 }}>
      <div style={{ fontSize: 'var(--ccna-type-sm)', fontWeight: 700, color: COLORS.mint, marginBottom: 10 }}>{pf.title}</div>
      {pf.steps.map((s, i) => (
        <div key={s.id} style={{ display: 'flex', gap: 8, marginBottom: i < pf.steps.length - 1 ? 8 : 0, alignItems: 'flex-start' }}>
          <VisualBadge accent={COLORS.mint}>{s.order}</VisualBadge>
          <div>
            <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 600, color: COLORS.silver }}>{s.title}</div>
            <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, lineHeight: 1.45 }}>{s.action}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function CuratedVisualAid({ data }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
        <CuratedStaticBadge objectiveId={data.objectiveId} fontSize={10} />
      </div>
      {data.diagram && <CuratedDiagram diagram={data.diagram} />}
      <CuratedPacketFlow data={data} />
    </div>
  )
}

function VisualAidTab({ objective, premiumUnlocked, onPremiumBlocked }) {
  const [spec, setSpec] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const curatedData = useMemo(() => getCurated(objective.id), [objective.id])
  const hasCuratedVisual = !!curatedData?.diagram

  const fetchVisual = useCallback(async (force) => {
    if (!premiumUnlocked) {
      onPremiumBlocked?.(PREMIUM_FEATURES.ai_visual, 'visual_tab')
      return
    }
    setLoading(true)
    setError(null)
    try {
      if (!force) {
        const cache = (await window.storage.getItem(VISUAL_CACHE_KEY)) || {}
        if (cache[objective.id]) {
          setSpec(cache[objective.id])
          setLoading(false)
          logEvent('user_viewed_visual_aid', { objectiveId: objective.id, cached: true })
          return
        }
      }
      const refNotes = BOOK_REF[objective.id] || ''
      const data = await askClaudeJSON({
        system: VISUAL_PROMPT_SYSTEM,
        messages: [{
          role: 'user',
          content: `Objective ${objective.id}: ${objective.title}\n\nReference notes:\n${refNotes}\n\nDesign one visual aid for this objective.`,
        }],
        max_tokens: 700,
        model: MODELS.fast,
        schema: VISUAL_SCHEMA,
        toolName: 'emit_visual',
        feature: 'visual',
      })
      if (!data || !data.type) throw new Error('Claude returned an unexpected format. Please try again.')
      setSpec(data)
      const cache = (await window.storage.getItem(VISUAL_CACHE_KEY)) || {}
      cache[objective.id] = data
      await window.storage.setItem(VISUAL_CACHE_KEY, cache)
      logEvent('user_viewed_visual_aid', { objectiveId: objective.id, cached: false, type: data.type })
    } catch (err) {
      setError(err.message.includes('JSON') ? 'Claude returned an unexpected format. Please try again.' : err.message)
    } finally {
      setLoading(false)
    }
  }, [objective.id, objective.title, premiumUnlocked, onPremiumBlocked])

  useEffect(() => {
    setSpec(null)
    setError(null)
    if (hasCuratedVisual) {
      setLoading(false)
      logEvent('user_viewed_visual_aid', { objectiveId: objective.id, cached: true, curated: true })
      return
    }
    if (!premiumUnlocked) {
      setLoading(false)
      return
    }
    fetchVisual(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objective.id, hasCuratedVisual, premiumUnlocked])

  return (
    <div>
      {hasCuratedVisual && <CuratedVisualAid data={curatedData} />}
      {!hasCuratedVisual && !premiumUnlocked && (
        <div style={{ ...styles.card, border: `1px solid ${COLORS.border}` }}>
          <div style={{ fontSize: 'var(--ccna-type-sm)', fontWeight: 600, color: COLORS.silver, marginBottom: 6 }}>
            No bundled diagram for this topic
          </div>
          <p style={{ ...styles.small, margin: 0, lineHeight: 1.45 }}>
            {PREMIUM_COMING_SOON_LABEL} — custom AI visuals will return with supporter access.
          </p>
        </div>
      )}
      {!hasCuratedVisual && premiumUnlocked && loading && <Spinner label="Building visual aid..." />}
      {!hasCuratedVisual && premiumUnlocked && error && <ErrorBox message={error} onRetry={() => fetchVisual(true)} />}
      {!hasCuratedVisual && premiumUnlocked && spec && !loading && <VisualAidRender spec={spec} />}
      {!loading && premiumUnlocked && (hasCuratedVisual || spec) && (
        <button style={{ ...styles.secondaryBtn, marginTop: 8 }} onClick={() => fetchVisual(true)}>
          {hasCuratedVisual ? 'Generate AI visual instead' : 'Regenerate visual'}
        </button>
      )}
    </div>
  )
}

/* =========================================================================
   OFFLINE PACKAGING
   Every AI asset (explanation, key terms, visual aid, quiz bank) is cached in
   window.storage. A topic is "offline-ready" once all four exist locally, after
   which it works with no network. Packaging pre-generates only what's missing
   (online required); re-viewing packaged content later costs zero API calls.
   ========================================================================= */
const TERMS_CACHE_KEY = 'ccna_terms_cache_v1'
const TERMS_PROMPT_SYSTEM = `You are a CCNA 200-301 study aid generator. Use the provided reference notes as your primary source; where the notes don't fully cover a detail a CCNA candidate needs, fill the gap with accurate CCNA 200-301 knowledge consistent with the notes. Produce 6-8 key-term flashcards for this objective — the most exam-relevant terms, acronyms, commands, or concepts to know cold.

Respond with ONLY valid JSON (no markdown fences, no commentary), in this exact shape:
{"cards":[{"term":"...","detail":"..."}]}

"term": a short label, max ~4 words (a word, acronym, command, or short phrase).
"detail": 1-2 short sentences with the key fact, definition, or syntax.`
const QUIZ_PROMPT_SYSTEM = `You are a CCNA 200-301 quiz generator. Use the provided reference notes as your primary source; where the notes don't cover a detail needed for a good question, you may draw on accurate broader CCNA 200-301 knowledge consistent with the notes. Write questions at genuine CCNA exam difficulty with 4 choices, short explanations, and tags for type, difficulty, skill, and concept.`

async function ensureExplanationCached(objective) {
  // Curated objectives render from bundled data — no cache entry needed
  if (hasCuratedReading(objective.id)) return
  const cache = (await window.storage.getItem(EXPLAIN_CACHE_KEY)) || {}
  if (cache[objective.id]) return
  const refNotes = BOOK_REF[objective.id] || ''
  const data = await askClaudeJSON({
    system: EXPLAIN_PROMPT_SYSTEM,
    messages: [{ role: 'user', content: `Objective ${objective.id}: ${objective.title}\n\nReference notes:\n${refNotes}\n\nExplain this objective for a CCNA candidate.` }],
    max_tokens: 1100, schema: EXPLAIN_SCHEMA, toolName: 'emit_explanation', feature: 'explain',
  })
  cache[objective.id] = data
  await window.storage.setItem(EXPLAIN_CACHE_KEY, cache)
}
async function ensureTermsCached(objective) {
  // Curated objectives serve flashcards from bundled data — no cache entry needed
  if (getCurated(objective.id)?.flashcards?.length) return
  const cache = (await window.storage.getItem(TERMS_CACHE_KEY)) || {}
  if (cache[objective.id]) return
  const refNotes = BOOK_REF[objective.id] || ''
  const data = await askClaudeJSON({
    system: TERMS_PROMPT_SYSTEM,
    messages: [{ role: 'user', content: `Objective ${objective.id}: ${objective.title}\n\nReference notes:\n${refNotes}\n\nGenerate key-term flashcards for this objective.` }],
    max_tokens: 700, model: MODELS.fast, schema: TERMS_SCHEMA, toolName: 'emit_terms', feature: 'terms',
  })
  if ((data.cards || []).length === 0) throw new Error('Could not generate key terms.')
  cache[objective.id] = data.cards
  await window.storage.setItem(TERMS_CACHE_KEY, cache)
}
async function ensureVisualCached(objective) {
  // Curated objectives serve diagrams from bundled data — no cache entry needed
  if (getCurated(objective.id)?.diagram) return
  const cache = (await window.storage.getItem(VISUAL_CACHE_KEY)) || {}
  if (cache[objective.id]) return
  const refNotes = BOOK_REF[objective.id] || ''
  const data = await askClaudeJSON({
    system: VISUAL_PROMPT_SYSTEM,
    messages: [{ role: 'user', content: `Objective ${objective.id}: ${objective.title}\n\nReference notes:\n${refNotes}\n\nDesign one visual aid for this objective.` }],
    max_tokens: 700, model: MODELS.fast, schema: VISUAL_SCHEMA, toolName: 'emit_visual', feature: 'visual',
  })
  if (!data || !data.type) throw new Error('Could not generate a visual aid.')
  cache[objective.id] = data
  await window.storage.setItem(VISUAL_CACHE_KEY, cache)
}
async function ensureQuizBankFilled(objective) {
  let bank = await loadQuizBank()
  // Seed curated questions first; only call AI if bank is still thin
  const curatedQs = getCuratedQuestions(objective.id)
  if (curatedQs.length && (bank[objective.id] || []).length < curatedQs.length) {
    bank = mergeIntoBank(bank, objective.id, curatedQs)
    await saveQuizBank(bank)
  }
  if ((bank[objective.id] || []).length >= QUIZ_BANK_MIN) return
  const refNotes = BOOK_REF[objective.id] || ''
  const data = await askClaudeJSON({
    system: QUIZ_PROMPT_SYSTEM,
    messages: [{ role: 'user', content: `Objective ${objective.id}: ${objective.title}\n\nReference notes:\n${refNotes}\n\nGenerate 8 multiple-choice questions for this objective.` }],
    max_tokens: 2200, model: MODELS.fast, schema: QUIZ_SCHEMA, toolName: 'emit_quiz', feature: 'quiz',
  })
  bank = mergeIntoBank(bank, objective.id, data.questions || [])
  await saveQuizBank(bank)
}
// Generates whatever is missing so the topic is fully usable offline.
async function packageObjectiveOffline(objective) {
  await ensureExplanationCached(objective)
  await ensureTermsCached(objective)
  await ensureVisualCached(objective)
  await ensureQuizBankFilled(objective)
  logEvent('user_packaged_offline', { objectiveId: objective.id })
}
// Returns the Set of objective ids whose four assets are all cached locally.
// Curated objectives are always "ready" since their content is bundled.
async function loadOfflineReadyIds() {
  const [ex, tm, vs, bank] = await Promise.all([
    window.storage.getItem(EXPLAIN_CACHE_KEY),
    window.storage.getItem(TERMS_CACHE_KEY),
    window.storage.getItem(VISUAL_CACHE_KEY),
    loadQuizBank(),
  ])
  const ids = ALL_OBJECTIVES.filter(o => {
    const isCurated = hasCuratedReading(o.id)
    const hasTerms = getCurated(o.id)?.flashcards?.length || (tm && tm[o.id])
    const hasVisual = getCurated(o.id)?.diagram || (vs && vs[o.id])
    const hasExplain = isCurated || (ex && ex[o.id])
    const hasBank = getCuratedQuestions(o.id).length >= QUIZ_BANK_MIN || (bank[o.id] || []).length >= QUIZ_BANK_MIN
    return hasExplain && hasTerms && hasVisual && hasBank
  }).map(o => o.id)
  return new Set(ids)
}


function parseAppHash() {
  const raw = window.location.hash.replace(/^#/, '')
  if (!raw) return null
  const objMatch = raw.match(/^\/objective\/([^/]+)(?:\/(.+))?$/)
  if (objMatch) {
    const id = decodeURIComponent(objMatch[1])
    const tab = objMatch[2] ? decodeURIComponent(objMatch[2]) : null
    const obj = ALL_OBJECTIVES.find(o => o.id === id)
    if (!obj) return null
    const domain = DOMAINS.find(d => d.objectives.some(o => o.id === id))
    if (!domain) return null
    return {
      view: 'objective',
      objective: {
        ...obj,
        domainId: domain.id,
        domainName: domain.name,
        accent: domain.accent,
        ...(tab ? { __initialTab: tab } : {}),
      },
    }
  }
  const simple = raw.replace(/^\//, '')
  // topicfocussession needs live config (topicFocusConfig) — restore picker on refresh instead.
  if (simple === 'topicfocussession') return { view: 'topicfocus' }
  if ([
    'mock', 'metrics', 'stats', 'review', 'missed', 'labs', 'focus', 'tutor',
    'topicfocus', 'commandhub', 'studylens', 'examtraps', 'trapdrill', 'subnet', 'routing', 'extrastudy',
  ].includes(simple)) {
    return { view: simple }
  }
  return null
}

function syncAppHash(view, objective) {
  if (typeof window === 'undefined') return
  const base = window.location.pathname + window.location.search
  let next = ''
  if (view === 'objective' && objective) {
    const tab = objective.__initialTab
    next = tab ? `#/objective/${objective.id}/${encodeURIComponent(tab)}` : `#/objective/${objective.id}`
  } else if (view !== 'home' && view !== 'onboarding' && view !== 'lab') {
    next = `#/${view}`
  }
  const target = next ? base + next : base
  if (window.location.pathname + window.location.search + window.location.hash !== target && (next || window.location.hash)) {
    window.history.replaceState(null, '', target)
  }
}

/* =========================================================================
   APP SHELL — study-block aware layout wrapper
   ========================================================================= */
function AppShell({ view, compactTopChrome, withBottomNav, children }) {
  const { isActive } = useStudyBlock()
  const className = `app-shell${compactTopChrome ? ' app-shell--compact-top' : ''}${view === 'objective' && isActive ? ' app-shell--deep-work' : ''}${withBottomNav ? ' app-shell--with-bottom-nav' : ''}`
  return <div className={className}>{children}</div>
}

/* =========================================================================
   APP ROOT
   ========================================================================= */
export default function App() {
  const [view, setView] = useState('home') // home | objective | mock | missed | tutor | metrics | stats | focus | topicfocus | topicfocussession | commandhub | studylens | examtraps | trapdrill | subnet | routing | extrastudy
  const [returnToView, setReturnToView] = useState('home')
  const [topicFocusConfig, setTopicFocusConfig] = useState(null)
  const [examTrapPrefill, setExamTrapPrefill] = useState(null)
  const [trapDrillPrefill, setTrapDrillPrefill] = useState(null)
  const [selectedObjective, setSelectedObjective] = useState(null)
  const [progress, setProgress] = useState({})
  const [missed, setMissed] = useState([])
  const [streak, setStreak] = useState({ count: 0, lastStudyDate: null })
  const [apiOnline, setApiOnline] = useState(true)
  const [showExport, setShowExport] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [offlineReady, setOfflineReady] = useState(() => new Set())
  const [packagingId, setPackagingId] = useState(null) // objective id currently being packaged
  const [showSync, setShowSync] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showTour, setShowTour] = useState(false)
  const onboardingReplayRef = useRef(false)
  const tourQueuedRef = useRef(false)
  const [settingsExamDate, setSettingsExamDate] = useState(null)
  const [settingsQuizSize, setSettingsQuizSize] = useState(5)
  const [settingsReduceMotion, setSettingsReduceMotion] = useState(false)
  const [settingsExamMode, setSettingsExamMode] = useState(false)
  const [cleanBankStats, setCleanBankStats] = useState({ objectives: 0, questions: 0, genericExamTips: 0 })
  const importFileRef = useRef(null)
  const mainRef = useRef(null)
  const homeScrollRef = useRef(0)
  const prevViewRef = useRef('home')
  const [syncCode, setSyncCode] = useState(null)
  const [lastSynced, setLastSynced] = useState(null)
  const [syncBusy, setSyncBusy] = useState(false)
  const [syncMsg, setSyncMsg] = useState('')
  const [dueCount, setDueCount] = useState(0)
  const [openDomain, setOpenDomain] = useState(null)
  const [selectedLab, setSelectedLab] = useState(null)
  const [labReturn, setLabReturn] = useState('labs') // where the lab's Back goes
  const openLab = useCallback((labId, from = 'labs') => { setSelectedLab(labId); setLabReturn(from); setView('lab') }, [])
  const [theme, setTheme] = useState(() =>
    (typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme')) || 'dark')
  const [premiumUnlocked, setPremiumUnlocked] = useState(false)
  const [premiumToast, setPremiumToast] = useState(null)

  const handlePremiumBlocked = useCallback((feature, source, extra) => {
    logPremiumBlocked(feature, source, extra)
    setPremiumToast(PREMIUM_TOAST_MESSAGES[feature] || 'This coach feature will unlock with supporter access.')
  }, [])

  // Flip the theme: update the root attribute (re-themes instantly via CSS
  // vars) and persist the choice. Available from a fixed control at all times.
  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark'
      document.documentElement.setAttribute('data-theme', next)
      const meta = document.querySelector('meta[name="theme-color"]')
      if (meta) meta.setAttribute('content', next === 'dark' ? '#2a1229' : '#f5f0f8')
      window.storage.setItem(STORAGE_KEYS.theme, next)
      return next
    })
  }, [])

  // Preload clean-question chunk during idle time so first quiz/mock is instant.
  useEffect(() => {
    const run = () => { preloadCleanBank().catch(() => {}) }
    if (typeof requestIdleCallback === 'function') {
      const id = requestIdleCallback(run, { timeout: 4000 })
      return () => cancelIdleCallback(id)
    }
    const t = setTimeout(run, 1500)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    (async () => {
      const [p, m, s, off, code, last, due, onboardDone, premium] = await Promise.all([
        loadProgress(), loadMissed(), loadStreak(), loadOfflineReadyIds(),
        window.storage.getItem(STORAGE_KEYS.syncCode), window.storage.getItem(STORAGE_KEYS.syncLast),
        countDueQuestions(), window.storage.getItem(STORAGE_KEYS.onboardDone),
        loadPremiumUnlocked(),
      ])
      setProgress(p)
      setMissed(m)
      setStreak(s)
      setOfflineReady(off)
      setSyncCode(code || null)
      setLastSynced(last || null)
      setDueCount(due)
      setPremiumUnlocked(premium)
      setLoaded(true)
      flushQuestionFlagQueue().catch(() => {})
      const reduceMotion = await loadReduceMotion()
      applyReduceMotionPreference(reduceMotion)
      setSettingsReduceMotion(reduceMotion)
      setSettingsExamMode(await loadExamMode())
      if (!onboardDone) {
        if (Object.keys(p).length === 0) {
          setView('onboarding')
        } else {
          await window.storage.setItem(STORAGE_KEYS.onboardDone, true)
        }
      }
      if (onboardDone || Object.keys(p).length > 0) {
        const hashRoute = parseAppHash()
        if (hashRoute?.objective) {
          setReturnToView('home')
          setSelectedObjective(hashRoute.objective)
          setView('objective')
        } else if (hashRoute?.view) {
          setReturnToView('home')
          setView(hashRoute.view)
        }
      }
      const updatedStreak = await bumpStreak()
      setStreak(updatedStreak)
    })()
  }, [])

  // Diagnostic placement check: seed quizScores for sampled objectives, then
  // hand off to the normal dashboard.

  const finishOnboarding = useCallback(async (results) => {
    if (!onboardingReplayRef.current) {
      setProgress(prev => {
        const next = { ...prev }
        for (const [objectiveId, r] of Object.entries(results || {})) {
          const entry = next[objectiveId] || { status: 'unseen', quizScores: [] }
          const newScores = [...(entry.quizScores || []), { score: r.correct, total: r.total, date: Date.now() }]
          const { score: masteryScore, mastered } = computeMastery({ quizScores: newScores, confidenceRatings: entry.confidenceRatings || [] })
          next[objectiveId] = { ...entry, status: mastered ? 'mastered' : 'in_progress', quizScores: newScores, masteryScore, lastSeen: Date.now() }
        }
        saveProgress(next)
        return next
      })
      logEvent('user_completed_onboarding', { objectivesCovered: Object.keys(results || {}).length })
    } else {
      logEvent('user_replayed_onboarding', { objectivesCovered: Object.keys(results || {}).length })
    }
    const wasReplay = onboardingReplayRef.current
    onboardingReplayRef.current = false
    await window.storage.setItem(STORAGE_KEYS.onboardDone, true)
    if (!wasReplay) {
      tourQueuedRef.current = true
      setShowTour(true)
    }
    setView('home')
  }, [])

  const skipOnboarding = useCallback(async () => {
    onboardingReplayRef.current = false
    await window.storage.setItem(STORAGE_KEYS.onboardDone, true)
    logEvent('user_skipped_onboarding', {})
    setView('home')
  }, [])

  const replayPlacementCheck = useCallback(() => {
    onboardingReplayRef.current = true
    setView('onboarding')
  }, [])

  const completeTour = useCallback(async () => {
    await saveTourDone(true)
    setShowTour(false)
  }, [])

  const skipTour = useCallback(async () => {
    await saveTourDone(true)
    setShowTour(false)
  }, [])

  const showTourAgain = useCallback(() => {
    setShowTour(true)
  }, [])

  useEffect(() => {
    if (!loaded || view !== 'home' || showTour || tourQueuedRef.current) return
    ;(async () => {
      const tourDone = await loadTourDone()
      if (!tourDone) {
        tourQueuedRef.current = true
        setShowTour(true)
      }
    })()
  }, [loaded, view, showTour])

  useEffect(() => {
    if (!showSettings) return
    let cancelled = false
    ;(async () => {
      const [exam, quiz, examMode] = await Promise.all([
        loadExamDate(),
        loadQuizSessionSizePref(),
        loadExamMode(),
      ])
      if (!cancelled) {
        setSettingsExamDate(exam)
        setSettingsQuizSize(quiz)
        setSettingsExamMode(examMode)
      }
      await preloadCleanBank()
      if (!cancelled) setCleanBankStats(getCleanBankStats())
    })()
    return () => { cancelled = true }
  }, [showSettings])

  const handleSaveExamDate = useCallback(async (iso) => {
    const saved = await saveExamDate(iso)
    setSettingsExamDate(saved)
  }, [])

  const handleClearExamDate = useCallback(async () => {
    await clearExamDate()
    setSettingsExamDate(null)
  }, [])

  const handleQuizSessionSizeChange = useCallback(async (size) => {
    const saved = await saveQuizSessionSizePref(size)
    setSettingsQuizSize(saved)
  }, [])

  const handleReduceMotionChange = useCallback(async (on) => {
    await saveReduceMotion(on)
    setSettingsReduceMotion(on)
  }, [])

  const handleExamModeChange = useCallback(async (on) => {
    await saveExamMode(on)
    setSettingsExamMode(on)
  }, [])

  const handleClearTutorChat = useCallback(() => clearTutorChat(), [])

  const refreshOffline = useCallback(async () => {
    setOfflineReady(await loadOfflineReadyIds())
  }, [])

  const handleClearAiCaches = useCallback(async () => {
    await clearAiCaches()
    await refreshOffline()
  }, [refreshOffline])

  const handleResetProgress = useCallback(async () => {
    await resetStudyProgress()
    setProgress({})
    setMissed([])
    setStreak({ count: 0, lastStudyDate: null })
    setDueCount(0)
    await refreshOffline()
  }, [refreshOffline])

  const refreshDue = useCallback(async () => {
    setDueCount(await countDueQuestions())
  }, [])

  // Recompute the due-review count whenever we land back on Home.
  useEffect(() => { if (view === 'home') refreshDue() }, [view, refreshDue])

  // Cmd+K / Ctrl+K opens global search (Phase 6).
  useEffect(() => {
    function onKey(e) {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== 'k') return
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable) return
      e.preventDefault()
      if (!showExport && !showSync && !showSettings) setShowSearch(true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showExport, showSync])

  // Preserve Home scroll position when leaving and returning (Phase 8).
  useEffect(() => {
    const prev = prevViewRef.current
    if (prev === 'home' && view !== 'home' && mainRef.current) {
      homeScrollRef.current = mainRef.current.scrollTop
    }
    if (view === 'home' && mainRef.current) {
      requestAnimationFrame(() => {
        if (mainRef.current) mainRef.current.scrollTop = homeScrollRef.current
      })
    }
    prevViewRef.current = view
  }, [view])

  useEffect(() => {
    if (!loaded) return
    syncAppHash(view, selectedObjective)
  }, [loaded, view, selectedObjective])

  useEffect(() => {
    if (!loaded) return
    function onHashChange() {
      const route = parseAppHash()
      if (route?.objective) {
        setReturnToView('home')
        setSelectedObjective(route.objective)
        setView('objective')
      } else if (route?.view) {
        setSelectedObjective(null)
        setReturnToView('home')
        setView(route.view)
      } else {
        setReturnToView('home')
        setView('home')
      }
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [loaded])

  // Pull remote → merge with local → save → refresh UI → push merged back.
  // Deterministic and convergent, so it's safe to run on any device.
  const doSync = useCallback(async (code) => {
    const useCode = code || syncCode
    if (!useCode) return
    setSyncBusy(true); setSyncMsg('Syncing…')
    try {
      const local = await loadSyncBundle()
      const remote = await pullSync(useCode)
      const merged = mergeSyncData(local, remote || {})
      await saveSyncBundle(merged)
      setProgress(merged.progress)
      setMissed(merged.missed)
      setStreak(merged.streak)
      await pushSync(useCode, merged)
      const now = Date.now()
      await window.storage.setItem(STORAGE_KEYS.syncLast, now)
      setLastSynced(now)
      await refreshOffline()
      setSyncMsg('Synced ✓')
    } catch (e) {
      setSyncMsg(/failed to fetch/i.test(e.message) ? 'Could not reach the sync server (works on the deployed site only).' : e.message)
    } finally {
      setSyncBusy(false)
    }
  }, [syncCode, refreshOffline])

  const handleGenerateSync = useCallback(async () => {
    const code = generateSyncCode()
    await window.storage.setItem(STORAGE_KEYS.syncCode, code)
    setSyncCode(code)
    doSync(code)
  }, [doSync])

  const handleLinkSync = useCallback(async (code) => {
    await window.storage.setItem(STORAGE_KEYS.syncCode, code)
    setSyncCode(code)
    doSync(code)
  }, [doSync])

  const handleUnlinkSync = useCallback(async () => {
    await window.storage.removeItem(STORAGE_KEYS.syncCode)
    setSyncCode(null)
    setLastSynced(null)
    setSyncMsg('')
  }, [])

  // Restore a Raw Data export: merge it into local data (same safe merge as
  // sync — nothing is overwritten) and refresh the UI.
  const handleImport = useCallback(async (incoming) => {
    const local = await loadSyncBundle()
    const merged = mergeSyncData(local, incoming || {})
    await saveSyncBundle(merged)
    setProgress(merged.progress)
    setMissed(merged.missed)
    setStreak(merged.streak)
    await refreshOffline()
  }, [refreshOffline])

  const handleImportFile = useCallback(async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await importCcnaJsonFromFile(file, handleImport)
    } catch {
      // invalid JSON — user can retry via Export modal for feedback
    } finally {
      if (importFileRef.current) importFileRef.current.value = ''
    }
  }, [handleImport])

  const pickImportFile = useCallback(() => { importFileRef.current?.click() }, [])

  // Auto-sync once on load if this device is already linked.
  useEffect(() => {
    if (loaded && syncCode) doSync(syncCode)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded])

  // Pre-fetch every AI asset for a topic so it works offline. No-op when offline.
  // Returns true on success. Used both manually and automatically on mastery.
  const packageObjective = useCallback(async (objective) => {
    if (!premiumUnlocked) {
      handlePremiumBlocked(PREMIUM_FEATURES.offline_pack, 'objective', { objectiveId: objective?.id })
      return false
    }
    if (!apiOnline || !objective) return false
    if (offlineReady.has(objective.id)) return true
    setPackagingId(objective.id)
    try {
      await packageObjectiveOffline(objective)
      await refreshOffline()
      return true
    } catch {
      return false
    } finally {
      setPackagingId(null)
    }
  }, [apiOnline, offlineReady, refreshOffline, premiumUnlocked, handlePremiumBlocked])

  // Periodically check API reachability for the offline banner
  useEffect(() => {
    let cancelled = false
    async function check() {
      const online = await checkApiReachable()
      if (!cancelled) setApiOnline(online)
    }
    check()
    const id = setInterval(check, 60000)
    return () => { cancelled = true; clearInterval(id) }
  }, [])

  const updateProgress = useCallback((objectiveId, patch) => {
    setProgress(prev => {
      const next = {
        ...prev,
        [objectiveId]: { status: 'unseen', quizScores: [], ...prev[objectiveId], ...patch },
      }
      saveProgress(next)
      return next
    })
  }, [])

  const handleMissed = useCallback((entry) => {
    setMissed(prev => {
      const next = [...prev, entry]
      saveMissed(next)
      return next
    })
  }, [])

  const removeMissed = useCallback((idx) => {
    setMissed(prev => {
      const next = prev.filter((_, i) => i !== idx)
      saveMissed(next)
      return next
    })
  }, [])

  function selectObjective(obj) {
    setReturnToView(view)
    bumpSessionStudy('objective', obj.id) // #16: track objective visits for session recap
    setSelectedObjective(obj)
    setView('objective')
  }

  const navigateTo = useCallback((nextView) => {
    setReturnToView(view)
    setView(nextView)
  }, [view])

  const openExamTraps = useCallback((prefill) => {
    setExamTrapPrefill(prefill || null)
    navigateTo('examtraps')
  }, [navigateTo])

  const openTrapDrill = useCallback((prefill) => {
    setTrapDrillPrefill(prefill || null)
    navigateTo('trapdrill')
  }, [navigateTo])

  const clearExamTrapPrefill = useCallback(() => setExamTrapPrefill(null), [])
  const clearTrapDrillPrefill = useCallback(() => setTrapDrillPrefill(null), [])

  const goBack = useCallback(() => {
    setView(returnToView)
  }, [returnToView])

  useEffect(() => {
    if (!loaded || view !== 'objective' || selectedObjective) return
    const route = parseAppHash()
    if (route?.objective) {
      setSelectedObjective(route.objective)
      setReturnToView('home')
      return
    }
    setView('home')
  }, [loaded, view, selectedObjective])

  const handleFocusBlockCompleted = useCallback(async () => {
    const next = await bumpStreak()
    setStreak(next)
  }, [])

  const chromeOverlayOpen = showExport || showSync || showSearch || showSettings || showTour
  const showBottomNav = loaded && !chromeOverlayOpen && !['onboarding', 'tutor', 'lab'].includes(view)
  useVisualViewportBottomInset(showBottomNav || view === 'objective' || view === 'tutor')

  if (!loaded) {
    return (
      <NavHintProvider>
        <div className="app-shell">
          <style>{`${buildAppShellCss(COLORS)}\n${THEME_CSS}`}</style>
          <RouteShell>
            <Spinner label="Loading your progress..." />
          </RouteShell>
        </div>
      </NavHintProvider>
    )
  }

  const routeScrolls = view !== 'objective' && view !== 'tutor'
  const compactTopChrome = view === 'objective' || view === 'tutor'
  const showNavBack = view !== 'home' && view !== 'onboarding' && view !== 'objective'
  const objectiveBackLabel = returnToView === 'home' ? 'Topics' : 'Back'
  const bottomNavActive = showSettings ? 'more' : showSearch ? 'search' : view === 'home' ? 'home' : view === 'objective' ? 'home' : null
  const bottomNavCompact = view === 'objective'

  return (
    <NavHintProvider>
    <StudyBlockProvider onFocusBlockCompleted={handleFocusBlockCompleted}>
    <AppShell view={view} compactTopChrome={compactTopChrome} withBottomNav={showBottomNav}>
      <style>{`
        ${buildAppShellCss(COLORS)}
        ${THEME_CSS}
        * { -webkit-tap-highlight-color: transparent; }
        button { transition: transform .12s ease, opacity .12s ease, box-shadow .12s ease; }
        button:active:not(:disabled) { transform: scale(0.97); }
        button:disabled { opacity: 0.5; cursor: default !important; }
        input:focus, textarea:focus { outline: none; box-shadow: 0 0 0 2px ${COLORS.focus}; }
        :focus-visible { outline: 2px solid ${COLORS.brandGlow}; outline-offset: 2px; }
        * { scrollbar-width: thin; scrollbar-color: ${COLORS.silverDim} transparent; }
        *::-webkit-scrollbar { width: 8px; height: 8px; }
        *::-webkit-scrollbar-thumb { background: ${COLORS.silverDim}; border-radius: 8px; }
        *::-webkit-scrollbar-track { background: transparent; }
        .ccna-grad-text {
          color: ${COLORS.silver};
          background: linear-gradient(90deg, ${COLORS.brandGlow}, ${COLORS.sky});
          -webkit-background-clip: text; background-clip: text; color: transparent;
        }
        @media (hover: hover) {
          .ccna-hover { transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease; }
          .ccna-hover:hover { transform: translateY(-2px); box-shadow: 0 12px 30px #00000055; border-color: ${COLORS.borderGlow}; }
        }
        @keyframes ccna-shimmer { to { transform: translateX(100%); } }
        .ccna-shimmer { position: relative; overflow: hidden; }
        .ccna-shimmer::after {
          content:''; position:absolute; inset:0;
          background: linear-gradient(90deg, transparent, ${COLORS.shimmerLine}, transparent);
          transform: translateX(-100%); animation: ccna-shimmer 2.4s ease-in-out infinite;
        }
        @keyframes ccna-skel { to { background-position: -200% 0; } }
        .ccna-skeleton {
          background: linear-gradient(90deg, ${COLORS.card}, ${COLORS.cardHover}, ${COLORS.card});
          background-size: 200% 100%; animation: ccna-skel 1.3s ease-in-out infinite; border-radius: 8px;
        }
        @keyframes ccna-pulse { 0% { box-shadow: 0 0 0 0 currentColor; opacity:.7 } 100% { box-shadow: 0 0 0 10px transparent; opacity:1 } }
        .ccna-pulse { animation: ccna-pulse .45s ease-out; }
        @keyframes ccna-quiz-reveal { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        .ccna-quiz-reveal { animation: ccna-quiz-reveal .2s ease both; }
        @keyframes ccna-route-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        .ccna-route-in { animation: ccna-route-in .32s ease both; }
        .objective-tab-panel { animation: ccna-route-in .22s ease both; }
        @keyframes key-term-flip { from { transform: rotateY(90deg); opacity: 0.4; } to { transform: rotateY(0); opacity: 1; } }
        .key-term-card { transition: background .2s ease, border-color .2s ease; perspective: 600px; }
        .key-term-card--flipped { animation: key-term-flip .28s ease both; }
        @media (pointer: coarse) {
          .ordering-touch-first [draggable="true"] { cursor: default; }
          .ordering-touch-first .ordering-touch-hint { display: block; }
        }
        html[data-reduce-motion="true"] .objective-tab-panel,
        html[data-reduce-motion="true"] .ccna-route-in,
        html[data-reduce-motion="true"] .key-term-card--flipped { animation: none !important; }
        .ccna-stagger > * { animation: ccna-route-in .42s ease both; }
        ${[1,2,3,4,5,6,7,8].map(i => `.ccna-stagger > *:nth-child(${i}){animation-delay:${i*0.04}s}`).join('')}
        @keyframes ccna-overlay-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes ccna-sheet-in { from { transform: translateY(100%); } to { transform: none; } }
        .ccna-overlay { animation: ccna-overlay-in .2s ease both; }
        .ccna-sheet { animation: ccna-sheet-in .3s cubic-bezier(.2,.8,.2,1) both; }
        @media (max-width: 480px) {
          .ccna-compact-p { font-size: var(--ccna-type-xs) !important; line-height: 1.4 !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ccna-view, .ccna-route-in, .ccna-overlay, .ccna-sheet, .ccna-stagger > *, .ccna-quiz-reveal, .ccna-shimmer::after, .ccna-skeleton, .ccna-pulse { animation: none; }
          button:active:not(:disabled) { transform: none; }
        }
        .ccna-quiz-idle {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        @media (max-height: 740px) {
          .mc-choices-tip { display: none; }
        }
      `}</style>
      <input ref={importFileRef} type="file" accept="application/json,.json" style={{ display: 'none' }} onChange={handleImportFile} />
      {!apiOnline && (
        <div className="app-chrome-top site-column">
          <OfflineBanner />
        </div>
      )}
      <RouteShell scroll={routeScrolls} ref={mainRef} innerClassName="ccna-route-in" key={view}>
        {view === 'onboarding' && <Onboarding onComplete={finishOnboarding} onSkip={skipOnboarding} />}
        {view === 'home' && (
          <HomeScreen
            progress={progress}
            streak={streak}
            missed={missed}
            missedCount={missed.length}
            apiOnline={apiOnline}
            offlineReady={offlineReady}
            onSelectObjective={selectObjective}
            onOpenMock={() => navigateTo('mock')}
            onOpenMissed={() => navigateTo('missed')}
            onOpenTutor={() => navigateTo('tutor')}
            premiumUnlocked={premiumUnlocked}
            onPremiumBlocked={handlePremiumBlocked}
            onOpenMetrics={() => navigateTo('metrics')}
            onOpenStats={() => navigateTo('stats')}
            onOpenSettings={() => setShowSettings(true)}
            onOpenLabs={() => navigateTo('labs')}
            onOpenReview={() => navigateTo('review')}
            onOpenFocus={() => navigateTo('focus')}
            onOpenTopicFocus={() => navigateTo('topicfocus')}
            onOpenCommandHub={() => navigateTo('commandhub')}
            onOpenStudyLens={() => navigateTo('studylens')}
            onOpenExamTraps={openExamTraps}
            onOpenTrapDrill={openTrapDrill}
            onOpenSubnet={() => navigateTo('subnet')}
            onOpenRouting={() => navigateTo('routing')}
            onOpenExtraStudy={() => navigateTo('extrastudy')}
            dueCount={dueCount}
            openDomain={openDomain}
            onOpenDomain={setOpenDomain}
            commandDrills={COMMAND_DRILLS}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        )}
        {view === 'objective' && !selectedObjective && (
          <Spinner label="Loading topic…" />
        )}
        {view === 'objective' && selectedObjective && (
          <ObjectiveScreen
            objective={selectedObjective}
            progress={progress}
            apiOnline={apiOnline}
            offlineReady={offlineReady}
            packagingId={packagingId}
            onPackage={packageObjective}
            onBack={goBack}
            backLabel={objectiveBackLabel}
            onUpdateProgress={updateProgress}
            onMissed={handleMissed}
            missed={missed}
            onOpenLab={(id) => openLab(id, 'objective')}
            onSelectObjective={selectObjective}
            onOpenMissed={() => setView('missed')}
            onOpenTrapDrill={openTrapDrill}
            ExplainTab={ExplainTab}
            VisualAidTab={VisualAidTab}
            QuizTab={QuizTab}
            CLIDrillTab={CLIDrillTab}
            SubnettingTab={SubnettingTab}
            VLSMTab={VLSMTab}
            IPv6CalcTab={IPv6CalcTab}
            ACLCalcTab={ACLWildcardTab}
            SectionLabel={SectionLabel}
            StatusLabel={StatusLabel}
            StatusDot={StatusDot}
            ProgressBar={ProgressBar}
            objectiveTabId={objectiveTabId}
            objectivePanelId={objectivePanelId}
            commandDrills={COMMAND_DRILLS}
            computeMastery={computeMastery}
            logEvent={logEvent}
            masteryGate={MASTERY_GATE}
            enableSectionReview={enableSectionReview}
            bumpSessionStudy={bumpSessionStudy}
            celebrate={celebrate}
            haptic={haptic}
            examMode={settingsExamMode}
            premiumUnlocked={premiumUnlocked}
            onPremiumBlocked={handlePremiumBlocked}
            onToggleTheme={toggleTheme}
            theme={theme}
          />
        )}
        {view === 'mock' && (
          <LazyRoute label="Loading mock exam…">
            <MockExam onExit={goBack} examMode={settingsExamMode} missed={missed} onOpenLab={(id) => openLab(id, 'mock')} />
          </LazyRoute>
        )}
        {view === 'missed' && (
          <MissedReview
            missed={missed}
            onBack={goBack}
            onRemove={removeMissed}
            onOpenExamTraps={openExamTraps}
            onOpenTrapDrill={openTrapDrill}
          />
        )}
        {view === 'tutor' && (
          premiumUnlocked
            ? <TutorChat progress={progress} missed={missed} onBack={goBack} />
            : <PremiumBlockedShell title="AI Tutor" onBack={goBack} />
        )}
        {view === 'stats' && (
          <StatsPage
            progress={progress}
            streak={streak}
            onBack={goBack}
            onOpenMetrics={() => navigateTo('metrics')}
          />
        )}
        {view === 'metrics' && <MetricsDashboard progress={progress} missed={missed} dueCount={dueCount} onBack={goBack} onSelectObjective={selectObjective} onOpenReview={() => navigateTo('review')} onOpenStats={() => navigateTo('stats')} />}
        {view === 'labs' && (
          <LazyRoute label="Loading labs…">
            <LabsHub onBack={goBack} onOpenLab={(id) => openLab(id, 'labs')} />
          </LazyRoute>
        )}
        {view === 'lab' && selectedLab && (
          <LazyRoute label="Loading lab…">
            <LabView
              bundle={getLab(selectedLab)}
              onBack={() => setView(labReturn === 'objective' ? 'objective' : 'labs')}
              celebrate={celebrate}
              haptic={haptic}
            />
          </LazyRoute>
        )}
        {view === 'review' && <ReviewSession onBack={goBack} onMissed={handleMissed} onDone={refreshDue} onOpenSection={selectObjective} />}
        {view === 'focus' && <FocusModeSession progress={progress} onBack={goBack} onMissed={handleMissed} onDone={refreshDue} />}
        {view === 'topicfocus' && (
          <LazyRoute label="Loading topic focus…">
            <TopicFocusStudio
              missed={missed}
              haptic={haptic}
              onBack={goBack}
              onStart={(config) => { setTopicFocusConfig(config); navigateTo('topicfocussession') }}
            />
          </LazyRoute>
        )}
        {view === 'topicfocussession' && topicFocusConfig && (
          <LazyRoute label="Loading session…">
            <TopicFocusSession
              config={topicFocusConfig}
              onBack={goBack}
              onMissed={handleMissed}
              onDone={refreshDue}
            />
          </LazyRoute>
        )}
        {view === 'commandhub' && (
          <LazyRoute label="Loading command hub…">
            <CommandHubStudio
              onBack={goBack}
              onSelectObjective={(objectiveId) => {
                const obj = ALL_OBJECTIVES.find(o => o.id === objectiveId)
                if (obj) selectObjective(obj)
              }}
            />
          </LazyRoute>
        )}
        {view === 'studylens' && (
          <LazyRoute label="Loading study lens…">
            <StudyLensStudio
              onBack={goBack}
              premiumUnlocked={premiumUnlocked}
              onPremiumBlocked={handlePremiumBlocked}
              onSelectObjective={(objectiveId) => {
                const obj = ALL_OBJECTIVES.find(o => o.id === objectiveId)
                if (obj) selectObjective(obj)
              }}
            />
          </LazyRoute>
        )}
        {view === 'examtraps' && (
          <LazyRoute label="Loading exam traps…">
            <ExamTrapStudyMode
              styles={styles}
              onBack={goBack}
              prefill={examTrapPrefill}
              onPrefillConsumed={clearExamTrapPrefill}
            />
          </LazyRoute>
        )}
        {view === 'trapdrill' && (
          <TrapDrillSession
            prefill={trapDrillPrefill}
            onBack={() => { clearTrapDrillPrefill(); goBack() }}
          />
        )}
        {view === 'subnet' && <SubnetPracticeHome onBack={goBack} />}
        {view === 'routing' && (
          <LazyRoute label="Loading routing decoder…">
            <RoutingDecoderMode styles={styles} COLORS={COLORS} onBack={goBack} />
          </LazyRoute>
        )}
        {view === 'extrastudy' && (
          <LazyRoute label="Loading extra study…">
            <ExtraStudyMode
              styles={styles}
              COLORS={COLORS}
              accentColors={accentColors}
              AnswerReview={AnswerReview}
              QuestionMeta={QuestionMeta}
              McChoices={McChoices}
              onBack={goBack}
            />
          </LazyRoute>
        )}
      </RouteShell>
      {showBottomNav && (
        <div className="app-chrome-bottom app-chrome-bottom--dock site-column">
          <BottomNav
            active={bottomNavActive}
            compact={bottomNavCompact}
            homeLabel={showNavBack ? 'Back' : 'Home'}
            homeIcon={showNavBack ? 'back' : 'home'}
            onHome={showNavBack ? goBack : () => setView('home')}
            onSearch={() => setShowSearch(true)}
            onMore={() => setShowSettings(true)}
          />
        </div>
      )}
      {showExport && <ExportModal progress={progress} missed={missed} streak={streak} onImport={handleImport} onClose={() => setShowExport(false)} />}
      {showSearch && <GlobalSearchModal progress={progress} onSelectObjective={selectObjective} onClose={() => setShowSearch(false)} />}
      {showSync && (
        <SyncModal
          syncCode={syncCode}
          lastSynced={lastSynced}
          busy={syncBusy}
          msg={syncMsg}
          online={apiOnline}
          onGenerate={handleGenerateSync}
          onLink={handleLinkSync}
          onSyncNow={() => doSync()}
          onUnlink={handleUnlinkSync}
          onClose={() => setShowSync(false)}
        />
      )}
      {showSettings && (
        <SettingsSheet
          onClose={() => setShowSettings(false)}
          theme={theme}
          onToggleTheme={toggleTheme}
          examDate={settingsExamDate}
          onSaveExamDate={handleSaveExamDate}
          onClearExamDate={handleClearExamDate}
          quizSessionSize={settingsQuizSize}
          onQuizSessionSizeChange={handleQuizSessionSizeChange}
          reduceMotion={settingsReduceMotion}
          onReduceMotionChange={handleReduceMotionChange}
          examMode={settingsExamMode}
          onExamModeChange={handleExamModeChange}
          cleanBankGenericExamTips={cleanBankStats.genericExamTips}
          onReplayPlacement={replayPlacementCheck}
          onShowTour={showTourAgain}
          onOpenSync={() => setShowSync(true)}
          onOpenExport={() => setShowExport(true)}
          onImportPick={pickImportFile}
          onClearTutorChat={handleClearTutorChat}
          onClearAiCaches={handleClearAiCaches}
          onResetProgress={handleResetProgress}
          offlineReadyCount={offlineReady.size}
          objectiveCount={ALL_OBJECTIVES.length}
          cleanBankObjectives={cleanBankStats.objectives}
          cleanBankQuestions={cleanBankStats.questions}
          appVersion={pkg.version}
          onDonatePreview={() => handlePremiumBlocked(PREMIUM_FEATURES.donate_preview, 'settings')}
        />
      )}
      <PremiumToast message={premiumToast} onDismiss={() => setPremiumToast(null)} />
      {showTour && <AppTour onComplete={completeTour} onSkip={skipTour} />}
    </AppShell>
    </StudyBlockProvider>
    </NavHintProvider>
  )
}
