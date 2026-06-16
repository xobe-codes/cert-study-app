import React, { useState, useEffect, useMemo, useCallback, useRef, useId } from 'react'
import { getCurated, hasCuratedReading, hasCuratedQuestions, getCuratedQuestions } from './data/ccnaCurated.js'
import { getLab, labsForObjective, allLabs } from './data/ccnaLabs.js'
import {
  TYPE_LABEL, SKILL_LABEL, isOrderingQuestion, isMcQuestion, gradeQuestion, correctAnswerLabel,
  shuffleArrayCopy, randomizeQuestionOrder, computeBankMix, normalizeQuestionForBank, inferSkill, buildMissedEntry,
} from './questionUtils.js'
import { computeCkuWeakness, computeTrapWeakness } from './weaknessUtils.js'
import { getLessonReference, hasLessonReference } from './lesson/knowledgeReference.js'
import { buildConceptDetail } from './lesson/conceptDetail.js'
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
import { parseRichTextSegments } from './lesson/richTextParse.js'
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
import { ExplainTab, QuizTab } from './tabs/studyQuizTabs.jsx'
import { BOOK_REF } from './data/bookRefFull.js'
import { formatCuratedAttribution } from './curatedDisplay.js'
import { STORAGE_KEYS } from './storageKeys.js'
import McChoices from './components/McChoices.jsx'
import AnswerReview from './components/AnswerReview.jsx'
import Spinner from './components/Spinner.jsx'
import ErrorBox from './components/ErrorBox.jsx'
import StatusDot from './components/StatusDot.jsx'
import StatusLabel from './components/StatusLabel.jsx'
import HomeScreen from './HomeScreen.jsx'
import StatsPage from './StatsPage.jsx'
import ObjectiveScreen from './ObjectiveScreen.jsx'
import MockExam from './MockExam.jsx'
import StudyNextStrip from './home/StudyNextStrip.jsx'
import { bumpSessionStudy } from './home/sessionRecap.js'
import {
  buildLearnerSummary,
  generateLocalSuggestions,
  loadRetentionHealth,
  pickStudyNext,
} from './home/learnerHome.js'
import ExtraStudyMode from './ExtraStudyMode.jsx'
import ExamTrapStudyMode from './ExamTrapStudyMode.jsx'
import RoutingDecoderMode from './RoutingDecoderMode.jsx'
import { DEFAULT_QUIZ_SESSION_SIZE, MAX_QUIZ_SESSION_SIZE, clampQuizSessionSize, loadQuizSessionSize, saveQuizSessionSize } from './quizSessionConfig.js'
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
import CiscoTerminal from './components/CiscoTerminal.jsx'
import LabView from './lab/LabView.jsx'
import LabsHub from './lab/LabsHub.jsx'
import {
  normalizeCmd,
  processCliLine,
  cliHostnameForObjective,
} from './lab/cliEngine.js'
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

const PREMIUM_TOAST_MESSAGES = {
  [PREMIUM_FEATURES.tutor]: 'AI Tutor will unlock with supporter access.',
  [PREMIUM_FEATURES.offline_pack]: 'Offline AI packaging is a premium feature.',
  [PREMIUM_FEATURES.ai_visual]: 'Custom AI visuals require supporter access.',
  [PREMIUM_FEATURES.ai_terms]: 'AI key-term flashcards require supporter access.',
  [PREMIUM_FEATURES.ai_explain]: 'AI-generated explanations require supporter access.',
  [PREMIUM_FEATURES.quiz_generate]: 'Generating new quiz questions is a premium feature.',
  [PREMIUM_FEATURES.donate_preview]: 'Donations are not enabled yet — thank you for your interest.',
}



/* =========================================================================
   COMMAND_DRILLS — CLI config drills for 14 config-heavy objectives
   Each step: { prompt, answer, hint }. answer may be an array of acceptable
   strings (case-insensitive, whitespace-normalized match).
   ========================================================================= */
const COMMAND_DRILLS = {
  '1.6': [
    { prompt: 'Enter interface configuration mode for GigabitEthernet0/1', answer: ['interface gigabitethernet0/1', 'interface gi0/1', 'int g0/1'], hint: "Use 'interface' followed by the interface name." },
    { prompt: 'Assign the IP address 192.168.10.1 with subnet mask 255.255.255.0', answer: ['ip address 192.168.10.1 255.255.255.0'], hint: "ip address <address> <mask>" },
    { prompt: 'Enable the interface (bring it up)', answer: ['no shutdown', 'no shut'], hint: 'Interfaces are shut down by default.' },
  ],
  '1.8': [
    { prompt: 'Enable IPv6 routing on the device', answer: ['ipv6 unicast-routing'], hint: 'Global config command, required to forward IPv6.' },
    { prompt: 'On interface Gi0/1, configure IPv6 address 2001:db8:acad:1::1/64', answer: ['ipv6 address 2001:db8:acad:1::1/64'], hint: 'ipv6 address <address>/<prefix-length>' },
    { prompt: 'Enable the interface to use a link-local address automatically generated via EUI-64, in addition to the global address', answer: ['ipv6 enable'], hint: 'This command alone generates only a link-local address.' },
  ],
  '2.1': [
    { prompt: 'Create VLAN 20', answer: ['vlan 20'], hint: 'Global config command.' },
    { prompt: 'Name VLAN 20 "SALES"', answer: ['name sales', 'name SALES'], hint: 'Entered while inside VLAN config mode.' },
    { prompt: 'On interface Fa0/5, set it as an access port', answer: ['switchport mode access'], hint: 'switchport mode <mode>' },
    { prompt: 'Assign Fa0/5 to VLAN 20', answer: ['switchport access vlan 20'], hint: 'switchport access vlan <id>' },
  ],
  '2.2': [
    { prompt: 'Set interface Gi0/1 to trunk mode', answer: ['switchport mode trunk'], hint: 'switchport mode <mode>' },
    { prompt: 'Set the native VLAN on this trunk to 99', answer: ['switchport trunk native vlan 99'], hint: 'switchport trunk native vlan <id>' },
    { prompt: 'Restrict the trunk to allow only VLANs 10, 20, and 99', answer: ['switchport trunk allowed vlan 10,20,99', 'switchport trunk allowed vlan 10, 20, 99'], hint: 'switchport trunk allowed vlan <list> (comma separated, no spaces needed)' },
  ],
  '2.3': [
    { prompt: 'Globally disable CDP on the device', answer: ['no cdp run'], hint: 'CDP is enabled by default; this is a global config command.' },
    { prompt: 'Re-enable CDP globally', answer: ['cdp run'], hint: 'Opposite of the previous command.' },
    { prompt: 'On a single interface, disable CDP only on that port', answer: ['no cdp enable'], hint: 'Interface-level command (note: different keyword than the global one).' },
    { prompt: 'Globally enable LLDP', answer: ['lldp run'], hint: 'LLDP is disabled by default, unlike CDP.' },
  ],
  '2.4': [
    { prompt: 'On interface Gi0/1, add it to EtherChannel group 1 using LACP active mode', answer: ['channel-group 1 mode active'], hint: 'channel-group <number> mode <active|passive|desirable|auto>' },
    { prompt: 'On interface Gi0/2, add it to the same EtherChannel group 1 using LACP active mode', answer: ['channel-group 1 mode active'], hint: 'Same command on the second member interface.' },
    { prompt: 'Verify the EtherChannel status and member ports', answer: ['show etherchannel summary'], hint: 'show etherchannel <option>' },
  ],
  '3.3': [
    { prompt: 'Configure a static route to network 192.168.30.0/24 via next-hop 10.0.0.2', answer: ['ip route 192.168.30.0 255.255.255.0 10.0.0.2'], hint: 'ip route <network> <mask> <next-hop>' },
    { prompt: 'Configure a default static route pointing to next-hop 203.0.113.1', answer: ['ip route 0.0.0.0 0.0.0.0 203.0.113.1'], hint: 'A default route matches all destinations.' },
    { prompt: 'Configure a static IPv6 route to 2001:db8:acad:2::/64 via next-hop 2001:db8:acad:1::2', answer: ['ipv6 route 2001:db8:acad:2::/64 2001:db8:acad:1::2'], hint: 'ipv6 route <prefix>/<length> <next-hop>' },
  ],
  '3.4': [
    { prompt: 'Enter OSPF process 1 configuration mode', answer: ['router ospf 1'], hint: 'Global config command, process ID is locally significant.' },
    { prompt: 'Advertise network 10.0.0.0/24 into OSPF area 0 using a wildcard mask', answer: ['network 10.0.0.0 0.0.0.255 area 0'], hint: 'network <address> <wildcard-mask> area <area-id>' },
    { prompt: 'Set the router ID to 1.1.1.1', answer: ['router-id 1.1.1.1'], hint: 'Entered inside router ospf config mode.' },
    { prompt: 'Verify OSPF neighbor adjacencies', answer: ['show ip ospf neighbor'], hint: 'show ip ospf <option>' },
  ],
  '3.5': [
    { prompt: 'On interface Gi0/1, enable HSRP group 1 with virtual IP 192.168.1.1', answer: ['standby 1 ip 192.168.1.1'], hint: 'standby <group> ip <virtual-ip>' },
    { prompt: 'Set this router\'s HSRP priority to 150 for group 1', answer: ['standby 1 priority 150'], hint: 'standby <group> priority <value> (default is 100)' },
    { prompt: 'Enable preemption for HSRP group 1', answer: ['standby 1 preempt'], hint: 'standby <group> preempt' },
  ],
  '4.1': [
    { prompt: 'Mark interface Gi0/0 as the inside NAT interface', answer: ['ip nat inside'], hint: 'Applied on the private/LAN-facing interface.' },
    { prompt: 'Mark interface Gi0/1 as the outside NAT interface', answer: ['ip nat outside'], hint: 'Applied on the public/WAN-facing interface.' },
    { prompt: 'Configure PAT overload on Gi0/1 for ACL 1', answer: ['ip nat inside source list 1 interface gigabitethernet0/1 overload', 'ip nat inside source list 1 interface gi0/1 overload'], hint: 'ip nat inside source list <acl> interface <if> overload' },
    { prompt: 'Show active NAT translations', answer: ['show ip nat translations'], hint: 'Verify NAT mappings in privileged EXEC.' },
  ],
  '4.6': [
    { prompt: 'Create a DHCP pool named LAN_POOL', answer: ['ip dhcp pool LAN_POOL', 'ip dhcp pool lan_pool'], hint: 'Global config command.' },
    { prompt: 'Set the pool network to 192.168.1.0/24', answer: ['network 192.168.1.0 255.255.255.0'], hint: 'network <network> <mask>, entered inside the DHCP pool.' },
    { prompt: 'Set the default gateway for clients to 192.168.1.1', answer: ['default-router 192.168.1.1'], hint: 'default-router <ip>' },
    { prompt: 'On the router interface facing remote clients, relay DHCP requests to server 10.0.0.5', answer: ['ip helper-address 10.0.0.5'], hint: 'Interface-level command.' },
  ],
  '4.8': [
    { prompt: 'Set the domain name to ccna.local (required before generating SSH keys)', answer: ['ip domain-name ccna.local'], hint: 'Global config command.' },
    { prompt: 'Generate RSA keys with a modulus of 2048 bits', answer: ['crypto key generate rsa modulus 2048', 'crypto key generate rsa'], hint: 'crypto key generate rsa modulus <bits>' },
    { prompt: 'On the vty lines, allow only SSH for incoming connections', answer: ['transport input ssh'], hint: 'Entered inside line vty configuration.' },
    { prompt: 'Configure the vty lines to authenticate using the local user database', answer: ['login local'], hint: 'login local' },
  ],
  '5.3': [
    { prompt: 'Set the enable secret password to "ciscoenable"', answer: ['enable secret ciscoenable'], hint: 'enable secret <password> (encrypted, preferred over enable password)' },
    { prompt: 'Create a local user "admin" with privilege level 15 and secret "adminpass"', answer: ['username admin privilege 15 secret adminpass'], hint: 'username <name> privilege <level> secret <password>' },
    { prompt: 'On the console line, require login using the local user database', answer: ['login local'], hint: 'Entered inside line con 0 configuration.' },
  ],
  '5.5': [
    { prompt: 'Create a named extended ACL called "BLOCK_TELNET"', answer: ['ip access-list extended BLOCK_TELNET', 'ip access-list extended block_telnet'], hint: 'ip access-list extended <name>' },
    { prompt: 'Add a line denying TCP traffic from any source to any destination on port 23 (Telnet)', answer: ['deny tcp any any eq 23', 'deny tcp any any eq telnet'], hint: 'deny tcp <source> <destination> eq <port>' },
    { prompt: 'Add a line permitting all other IP traffic', answer: ['permit ip any any'], hint: 'There is an implicit deny at the end, so this is needed to allow everything else.' },
    { prompt: 'Apply this ACL inbound on interface Gi0/0', answer: ['ip access-group BLOCK_TELNET in', 'ip access-group block_telnet in'], hint: 'ip access-group <name> in|out, entered on the interface.' },
  ],
  '5.6': [
    { prompt: 'On an access port, enable port security', answer: ['switchport port-security'], hint: 'Interface must already be in access mode.' },
    { prompt: 'Set the maximum number of secure MAC addresses to 2', answer: ['switchport port-security maximum 2'], hint: 'switchport port-security maximum <number>' },
    { prompt: 'Configure sticky learning of MAC addresses', answer: ['switchport port-security mac-address sticky'], hint: 'switchport port-security mac-address sticky' },
    { prompt: 'Set the violation action to shutdown the port', answer: ['switchport port-security violation shutdown'], hint: 'switchport port-security violation <protect|restrict|shutdown> (shutdown is default)' },
  ],
}

/* =========================================================================
   ANTHROPIC API HELPER
   ========================================================================= */
const API_URL = 'https://api.anthropic.com/v1/messages'
const PROXY_URL = '/api/claude'
// Model tiers: cheap/mechanical generation runs on Haiku, reasoning-heavy work
// (explanations, quizzes, tutor) on Sonnet. Routing per task keeps cost down.
const MODELS = { smart: 'claude-sonnet-4-6', fast: 'claude-haiku-4-5' }
const MODEL = MODELS.smart

// Wraps a system string as a cacheable block so a stable prefix can be reused
// across calls (prompt caching). Used where the context is large/repeated
// (tutor turns, mock-exam domain notes).
function cachedSystem(text) {
  return [{ type: 'text', text, cache_control: { type: 'ephemeral' } }]
}

// In production we call our same-origin Cloudflare Pages Function, which holds
// the API key server-side. During local `npm run dev` (no Function running) we
// fall back to a direct browser call using the local .env key, so dev still works.
const DEV_DIRECT = import.meta.env.DEV && !!import.meta.env.VITE_ANTHROPIC_API_KEY
function claudeFetch(body) {
  if (DEV_DIRECT) {
    return fetch(API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify(body),
    })
  }
  return fetch(PROXY_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

/* ---- Per-session AI call counter (in-memory; resets on page reload) ---- */
// Lightweight pub/sub so any component can subscribe to call-count updates.
let _sessionAiCalls = 0
const _aiCallListeners = new Set()
function bumpSessionAiCalls() {
  _sessionAiCalls += 1
  _aiCallListeners.forEach(fn => fn(_sessionAiCalls))
}
function getSessionAiCalls() { return _sessionAiCalls }
function subscribeAiCalls(fn) { _aiCallListeners.add(fn); return () => _aiCallListeners.delete(fn) }

const AI_BUDGET_LIMIT = 20

// Hook: re-renders the consumer whenever a new AI call completes.
function useAiCallCount() {
  const [count, setCount] = useState(() => getSessionAiCalls())
  useEffect(() => subscribeAiCalls(setCount), [])
  return count
}

// Subtle budget warning shown inside AI-powered sections once calls > 20.
function AiBudgetWarning() {
  const count = useAiCallCount()
  if (count <= AI_BUDGET_LIMIT) return null
  return (
    <div style={{
      background: COLORS.amberDim, border: `1px solid ${COLORS.amberBorder}`,
      borderRadius: 8, padding: '6px 10px', fontSize: 'var(--ccna-type-xs)', color: COLORS.amber,
      marginBottom: 8,
    }}>
      ⚠ High API usage today ({count} calls) — consider packaging this objective offline for faster, free access.
    </div>
  )
}

// Small home-screen indicator showing how many AI calls have been made this session.
function AiCallsIndicator() {
  const count = useAiCallCount()
  if (count === 0) return null
  const overBudget = count > AI_BUDGET_LIMIT
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      fontSize: 'var(--ccna-type-xs)', color: overBudget ? COLORS.amber : COLORS.silverMid,
      marginBottom: 12,
    }}>
      <span style={{ opacity: 0.7 }}>🤖</span>
      <span>{count} AI call{count === 1 ? '' : 's'} this session</span>
      {overBudget && <span style={{ color: COLORS.amber, fontWeight: 600 }}>· High usage</span>}
    </div>
  )
}

/* ---- Token usage + cost telemetry (local; no network) ---- */
// $ per 1M tokens. Cache reads are ~0.1x input; cache writes ~1.25x.
const PRICING = {
  'claude-sonnet-4-6': { in: 3, out: 15 },
  'claude-haiku-4-5': { in: 1, out: 5 },
  default: { in: 3, out: 15 },
}
function estimateCost(model, u = {}) {
  const r = PRICING[model] || PRICING.default
  const input = u.input_tokens || 0
  const cacheRead = u.cache_read_input_tokens || 0
  const cacheWrite = u.cache_creation_input_tokens || 0
  const output = u.output_tokens || 0
  return (input * r.in + cacheRead * r.in * 0.1 + cacheWrite * r.in * 1.25 + output * r.out) / 1e6
}
// Fire-and-forget: accumulate per-feature / per-model token + cost totals.
async function logUsage(feature, model, u) {
  try {
    if (!u) return
    const store = (await window.storage.getItem(STORAGE_KEYS.usage)) || { since: Date.now(), calls: 0, input: 0, output: 0, costUSD: 0, byFeature: {}, byModel: {} }
    const cost = estimateCost(model, u)
    const inTok = (u.input_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0)
    const out = u.output_tokens || 0
    store.calls += 1; store.input += inTok; store.output += out; store.costUSD += cost
    const bump = (map, key) => {
      const e = map[key] || { calls: 0, input: 0, output: 0, costUSD: 0 }
      e.calls += 1; e.input += inTok; e.output += out; e.costUSD += cost
      map[key] = e
    }
    bump(store.byFeature, feature || 'other')
    bump(store.byModel, model || 'unknown')
    await window.storage.setItem(STORAGE_KEYS.usage, store)
  } catch { /* telemetry must never break the app */ }
}

// Core request loop: tries up to (1 + retries) times with 800ms / 1600ms backoff
// (+jitter), retrying network errors and 429/5xx/529. Returns the parsed
// response object. Throws an Error with a user-facing message on failure.
async function callClaude(body, retries = 2, feature = 'other') {
  const delays = [800, 1600]
  const wait = (ms) => new Promise(r => setTimeout(r, ms + Math.floor(Math.random() * 200)))
  let lastError = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await claudeFetch(body)

      if (!res.ok) {
        let detail = ''
        try { detail = (await res.json())?.error?.message || '' } catch { /* body wasn't JSON */ }
        // Retry on rate limit, overloaded (529), or server errors.
        if (res.status === 429 || res.status === 529 || res.status >= 500) {
          lastError = new Error(`Claude API error ${res.status}${detail ? `: ${detail}` : ''}`)
          if (attempt < retries) { await wait(delays[attempt] || 1600); continue }
          throw lastError
        }
        throw new Error(`Claude API error ${res.status}${detail ? `: ${detail}` : ' — check your API key and request.'}`)
      }

      const data = await res.json()
      if (data?.usage) logUsage(feature, body.model, data.usage)
      bumpSessionAiCalls()
      return data
    } catch (err) {
      lastError = err
      const isNetworkError = err instanceof TypeError || /failed to fetch|network/i.test(err.message || '')
      if (isNetworkError && attempt < retries) { await wait(delays[attempt] || 1600); continue }
      if (isNetworkError) {
        throw new Error('Network error: could not reach the Claude API. Check your internet connection (this is common on flaky mobile/LTE connections) and try again.')
      }
      throw err
    }
  }
  throw lastError || new Error('Unknown error contacting Claude API.')
}

// Text completion. `model` lets callers pick a tier (defaults to Sonnet).
async function askClaude({ system, messages, max_tokens = 1000, model = MODEL, feature = 'other', retries = 2 }) {
  const data = await callClaude({ model, max_tokens, system, messages }, retries, feature)
  const text = data?.content?.find(b => b.type === 'text')?.text
  if (!text) throw new Error('Claude API returned an empty response.')
  return text
}

// Structured output via a forced tool call: Claude must return data matching
// `schema`, so we get a guaranteed-shaped object instead of parsing JSON out of
// prose. Eliminates the whole "unexpected format" failure class.
async function askClaudeJSON({ system, messages, max_tokens = 1500, model = MODEL, schema, toolName = 'emit_result', feature = 'other', retries = 2 }) {
  const tool = { name: toolName, description: 'Return the result as structured data.', input_schema: schema }
  const data = await callClaude({
    model, max_tokens, system, messages,
    tools: [tool], tool_choice: { type: 'tool', name: toolName },
  }, retries, feature)
  const block = data?.content?.find(b => b.type === 'tool_use')
  if (!block || !block.input) throw new Error('Claude returned no structured result. Please try again.')
  return block.input
}

// Streaming text completion — for long tutor replies, shows tokens as they
// arrive instead of one long wait. `onDelta(textChunk)` fires per chunk;
// resolves with the full text once the stream ends. Retries on 529/5xx
// before the stream starts (partial in-flight streams are not retried).
async function askClaudeStream({ system, messages, max_tokens = 1000, model = MODEL, feature = 'other', onDelta }) {
  const streamDelays = [1000, 3000]
  const wait = (ms) => new Promise(r => setTimeout(r, ms))
  let res
  for (let attempt = 0; attempt <= 2; attempt++) {
    res = await claudeFetch({ model, max_tokens, system, messages, stream: true })
    if (res.ok) break
    if ((res.status === 529 || res.status >= 500) && attempt < 2) {
      await wait(streamDelays[attempt])
      continue
    }
    let detail = ''
    try { detail = (await res.json())?.error?.message || '' } catch { /* not JSON */ }
    throw new Error(`Claude API error ${res.status}${detail ? `: ${detail}` : ''}`)
  }
  if (!res.ok) {
    let detail = ''
    try { detail = (await res.json())?.error?.message || '' } catch { /* not JSON */ }
    throw new Error(`Claude API error ${res.status}${detail ? `: ${detail}` : ''}`)
  }
  if (!res.body) {
    // Environment doesn't support streaming responses — fall back to one shot.
    return askClaude({ system, messages, max_tokens, model, feature })
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let text = ''
  const usage = {}

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() // keep any partial line for the next chunk
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      let evt
      try { evt = JSON.parse(line.slice(6)) } catch { continue }
      if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') {
        text += evt.delta.text
        onDelta?.(evt.delta.text)
      } else if (evt.type === 'message_start' && evt.message?.usage) {
        Object.assign(usage, evt.message.usage)
      } else if (evt.type === 'message_delta' && evt.usage) {
        Object.assign(usage, evt.usage)
      } else if (evt.type === 'error') {
        throw new Error(`Claude API error: ${evt.error?.message || 'stream error'}`)
      }
    }
  }
  if (Object.keys(usage).length) logUsage(feature, model, usage)
  if (!text) throw new Error('Claude API returned an empty response.')
  bumpSessionAiCalls()
  return text
}

/* ---- JSON Schemas for structured generation ---- */
const QUIZ_SCHEMA = {
  type: 'object', required: ['questions'],
  properties: { questions: { type: 'array', items: {
    type: 'object', required: ['question', 'choices', 'correctIndex', 'explanation', 'type', 'difficulty'],
    properties: {
      question: { type: 'string' },
      choices: { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 4 },
      correctIndex: { type: 'integer', minimum: 0, maximum: 3 },
      explanation: { type: 'string' },
      type: { type: 'string', enum: ['definition', 'scenario', 'application', 'true-false', 'troubleshooting'] },
      difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
      concept: { type: 'string' },
    },
  } } },
}
const MOCK_SCHEMA = {
  type: 'object', required: ['questions'],
  properties: { questions: { type: 'array', items: {
    type: 'object', required: ['objectiveId', 'question', 'choices', 'correctIndex', 'explanation'],
    properties: {
      objectiveId: { type: 'string' },
      question: { type: 'string' },
      choices: { type: 'array', items: { type: 'string' }, minItems: 4, maxItems: 4 },
      correctIndex: { type: 'integer', minimum: 0, maximum: 3 },
      explanation: { type: 'string' },
    },
  } } },
}
const TERMS_SCHEMA = {
  type: 'object', required: ['cards'],
  properties: { cards: { type: 'array', items: {
    type: 'object', required: ['term', 'detail'],
    properties: { term: { type: 'string' }, detail: { type: 'string' } },
  } } },
}
const VISUAL_SCHEMA = {
  type: 'object', required: ['type', 'title'],
  properties: {
    type: { type: 'string', enum: ['command_sequence', 'comparison', 'layer_stack', 'flow'] },
    title: { type: 'string' },
    steps: { type: 'array', items: { type: 'string' } },
    layers: { type: 'array', items: { type: 'object', required: ['label'], properties: { label: { type: 'string' }, note: { type: 'string' } } } },
    left: { type: 'object', properties: { label: { type: 'string' }, points: { type: 'array', items: { type: 'string' } } } },
    right: { type: 'object', properties: { label: { type: 'string' }, points: { type: 'array', items: { type: 'string' } } } },
  },
}

// Lightweight reachability check for the offline banner — does not consume
// significant tokens, just confirms the API endpoint responds.
async function checkApiReachable() {
  try {
    const res = await claudeFetch({ model: MODELS.fast, max_tokens: 1, messages: [{ role: 'user', content: 'hi' }] })
    // Any HTTP response (even an error like 400/401) means the network path works.
    return res.status !== 0
  } catch {
    return false
  }
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
   QUIZ BANK — generate-once, reuse-often. Questions are stored permanently
   per objective so review sessions cost zero API calls. We only call the API
   when the bank is too small or the learner explicitly asks for fresh ones.
   bank shape: { [objectiveId]: [{ id, question, choices, correctIndex,
                 explanation, ratings:[{value,at}], attempts:[{correct,at}] }] }
   ========================================================================= */
const QUIZ_BANK_MIN = 5   // questions needed before we can run a no-API session
const QUIZ_SESSION_SIZE = 5
const REVIEW_SESSION_CAP = 20

async function loadQuizBank() {
  return (await window.storage.getItem(STORAGE_KEYS.quizBank)) || {}
}
async function saveQuizBank(bank) {
  await window.storage.setItem(STORAGE_KEYS.quizBank, bank)
}
function normalizeQuestionText(q) {
  return (q || '').trim().toLowerCase().replace(/\s+/g, ' ')
}
// Adds new questions to an objective's bank, skipping duplicates. Returns the
// updated full bank object (caller persists it).
function mergeIntoBank(bank, objectiveId, questions) {
  const existing = bank[objectiveId] || []
  const seen = new Set(existing.map(q => normalizeQuestionText(q.question)))
  let counter = existing.length
  const added = questions
    .filter(q => q && q.question && !seen.has(normalizeQuestionText(q.question)))
    .map(q => normalizeQuestionForBank(q, objectiveId, counter++))
  bank[objectiveId] = [...existing, ...added]
  return bank
}
// Picks up to sessionSize questions — see lesson/quizCoverage.js for CKU-aware logic.
// Records an attempt + optional confidence rating against a banked question.
// `schedule` gates spaced-repetition: a question only joins the review queue
// once its section has cleared the mastery gate (see enableSectionReview).
// Reviewing material the learner doesn't yet understand just reinforces
// confusion, so until the gate opens we record attempts but assign no schedule.
async function recordQuizResult(objectiveId, questionId, { correct, rating, schedule = true } = {}) {
  const bank = await loadQuizBank()
  const list = bank[objectiveId]
  if (!list) return
  const q = list.find(x => x.id === questionId)
  if (!q) return
  if (typeof correct === 'boolean') {
    q.attempts.push({ correct, at: Date.now() })
    if (schedule) q.srs = nextSrs(q.srs, correct) // advance spaced-repetition schedule
  }
  if (rating) q.ratings.push({ value: rating, at: Date.now() })
  await saveQuizBank(bank)
}

/* =========================================================================
   SPACED REPETITION — expanding fixed-ladder scheduler grounded in the
   forgetting curve. Each answered question carries a schedule so it returns
   for review on the right day, across sessions and devices (synced). All local.
   srs shape: { due (ts), interval (days), reps (consecutiveCorrect),
                lapses, intervalIndex }
   ========================================================================= */
const DAY_MS = 86400000
// Expanding intervals (days): 2d → 1wk → 2wk → 1mo → 2mo (maintenance).
const SRS_LADDER = [2, 7, 14, 30, 60]
const MASTERY_GATE = 0.7 // section accuracy required before reviews schedule
function nextSrs(prev, correct) {
  const s = prev || { reps: 0, lapses: 0 }
  let reps = s.reps || 0
  let lapses = s.lapses || 0
  if (correct) {
    reps += 1                       // advance to the next, longer interval
  } else {
    reps = 0                        // lapse: reset to the 2-day interval + flag
    lapses += 1
  }
  const intervalIndex = Math.min(Math.max(reps - 1, 0), SRS_LADDER.length - 1)
  const interval = SRS_LADDER[intervalIndex]
  return { interval, reps, lapses, intervalIndex, due: Date.now() + interval * DAY_MS }
}
// Mastery gate: once a learner clears MASTERY_GATE on a section, its already-
// answered questions enter the review queue (seeded from their last attempt).
// Mirrors seedTestedOutReview but for the normal "studied + passed" path.
async function enableSectionReview(objectiveId) {
  const bank = await loadQuizBank()
  const list = bank[objectiveId]
  if (!list) return
  let changed = false
  list.forEach(q => {
    if ((q.attempts?.length || 0) > 0 && !q.srs) {
      q.srs = nextSrs(undefined, q.attempts[q.attempts.length - 1].correct)
      changed = true
    }
  })
  if (changed) await saveQuizBank(bank)
}
// All banked questions due for review now (scheduled + seen), across every
// objective. Returned INTERLEAVED: round-robin across sections so similar
// concepts never sit adjacent — forcing discrimination strengthens recall.
async function loadDueQuestions(limit = 20) {
  const bank = await loadQuizBank()
  const progress = await loadProgress()
  const now = Date.now()
  // If exam date is set and within 30 days, boost troubleshooting questions
  const examDate = await window.storage.getItem(STORAGE_KEYS.examDate)
  const daysToExam = examDate ? Math.ceil((new Date(examDate) - now) / 86400000) : 999
  const nearExam = daysToExam > 0 && daysToExam <= 30

  // #22: overconfidence detection — last rating 'easy' but has prior lapses
  function isOverconfident(q) {
    if (!q.srs || (q.srs.lapses || 0) === 0) return false
    const lastRating = q.ratings?.length ? q.ratings[q.ratings.length - 1].value : null
    return lastRating === 'easy'
  }

  // #22: declining accuracy — mastery >= 80% but last 3 quiz sessions got worse
  function hasDecliningAccuracy(objId) {
    const entry = progress[objId]
    if (!entry) return false
    const { score: masteryScore } = computeMastery(entry)
    if (masteryScore < 0.8) return false
    const scores = (entry.quizScores || []).slice(-3)
    if (scores.length < 3) return false
    const accs = scores.map(s => s.score / Math.max(s.total, 1))
    return accs[0] > accs[1] && accs[1] > accs[2]
  }

  // Priority tiers: 0=troubleshooting, 1=overconfident, 2=regular due
  function qPriority(q, overconf) {
    if (q.type === 'troubleshooting' && (nearExam || (q.srs?.intervalIndex || 0) >= 2)) return 0
    if (overconf) return 1
    return 2
  }

  const bySection = {}
  for (const objectiveId of Object.keys(bank)) {
    const declining = hasDecliningAccuracy(objectiveId)
    for (const q of bank[objectiveId]) {
      if (!q.srs || (q.attempts?.length || 0) === 0) continue
      const due = (q.srs.due ?? 0) <= now
      const overconf = isOverconfident(q)
      // Include if: normally due, OR overconfident (high-confidence but lapsed), OR in a declining-accuracy objective
      if (!due && !overconf && !declining) continue
      const priority = qPriority(q, overconf)
      ;(bySection[objectiveId] ||= []).push({ ...q, objectiveId, dueAt: q.srs.due ?? 0, _priority: priority })
    }
  }

  const queues = Object.values(bySection)
    .map(arr => arr.sort((a, b) => a._priority - b._priority || a.dueAt - b.dueAt))
    .sort(() => Math.random() - 0.5)
  const interleaved = []
  let added = true
  while (added && interleaved.length < limit) {
    added = false
    for (const queue of queues) {
      if (queue.length) { interleaved.push(queue.shift()); added = true; if (interleaved.length >= limit) break }
    }
  }
  // Final pass: randomize presentation order across sections.
  return randomizeQuestionOrder(interleaved)
}
async function countDueQuestions() {
  const bank = await loadQuizBank()
  const now = Date.now()
  let n = 0
  for (const objectiveId of Object.keys(bank)) {
    for (const q of bank[objectiveId]) {
      if (q.srs && (q.attempts?.length || 0) > 0 && (q.srs.due ?? 0) <= now) n++
    }
  }
  return n
}

const RETENTION_META = {
  strong: { accent: 'mint', label: 'STRONG', icon: '🛡️', note: () => 'All items in long intervals' },
  fading: { accent: 'amber', label: 'FADING', icon: '⏳', note: (r) => r.dueNow > 0 ? `${r.dueNow} item${r.dueNow === 1 ? '' : 's'} due soon` : 'Building strength' },
  weak: { accent: 'sky', label: 'STUDY', icon: '📘', note: () => 'Multiple lapses — revisit Explain first' },
}

/* =========================================================================
   EVENT LOG — lightweight, append-only behaviour stream (capped). Feeds the
   mastery engine and tutor without any AI calls. Business logic only.
   ========================================================================= */
const EVENT_LOG_CAP = 600
async function logEvent(type, payload = {}) {
  try {
    const events = (await window.storage.getItem(STORAGE_KEYS.events)) || []
    events.push({ type, at: Date.now(), ...payload })
    const trimmed = events.length > EVENT_LOG_CAP ? events.slice(-EVENT_LOG_CAP) : events
    await window.storage.setItem(STORAGE_KEYS.events, trimmed)
  } catch {
    // logging must never break the study flow
  }
}

/* =========================================================================
   MASTERY ENGINE — deterministic, multi-factor (not a single percentage).
   Combines recent quiz accuracy with learner confidence so a topic is only
   "mastered" when the learner is both accurate AND confident.
   ========================================================================= */
const RATING_CONFIDENCE = { easy: 1, medium: 0.6, hard: 0.3, practice: 0.1 }
// Returns { score: 0..1, mastered: boolean } from a progress entry.
function computeMastery(entry) {
  if (!entry) return { score: 0, mastered: false }
  const scores = entry.quizScores || []
  if (scores.length === 0) return { score: 0, mastered: false }
  // accuracy: weight recent sessions more (last 3)
  const recent = scores.slice(-3)
  const acc = recent.reduce((s, r) => s + (r.score / Math.max(r.total, 1)), 0) / recent.length
  // confidence: average of stored confidence ratings, default neutral 0.6
  const ratings = entry.confidenceRatings || []
  const conf = ratings.length
    ? ratings.reduce((s, r) => s + (RATING_CONFIDENCE[r] ?? 0.6), 0) / ratings.length
    : 0.6
  const score = acc * 0.7 + conf * 0.3
  // mastered requires strong accuracy, decent confidence, and at least one full session
  const mastered = acc >= 0.8 && conf >= 0.5 && recent.some(r => r.total >= 3)
  return { score, mastered }
}

// Separate accuracy vs confidence (for the confidence-vs-accuracy quadrant).
function masteryBreakdown(entry) {
  const scores = entry?.quizScores || []
  if (scores.length === 0) return { acc: 0, conf: 0, has: false }
  const recent = scores.slice(-3)
  const acc = recent.reduce((s, r) => s + (r.score / Math.max(r.total, 1)), 0) / recent.length
  const ratings = entry.confidenceRatings || []
  const conf = ratings.length
    ? ratings.reduce((s, r) => s + (RATING_CONFIDENCE[r] ?? 0.6), 0) / ratings.length
    : 0.6
  return { acc, conf, has: true }
}

/* =========================================================================
   CROSS-DEVICE SYNC  — shareable code + D1 (via /api/sync). The bundle holds
   the user-specific learning data; merges are deterministic and convergent so
   syncing the same code on two devices ends with both holding the union.
   ========================================================================= */
const SYNC_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
function generateSyncCode() {
  let s = ''
  for (let i = 0; i < 16; i++) {
    if (i && i % 4 === 0) s += '-'
    s += SYNC_CODE_ALPHABET[Math.floor(Math.random() * SYNC_CODE_ALPHABET.length)]
  }
  return s
}

async function loadSyncBundle() {
  const [progress, missed, quizBank, cliStats, streak] = await Promise.all([
    window.storage.getItem(STORAGE_KEYS.progress),
    window.storage.getItem(STORAGE_KEYS.missed),
    window.storage.getItem(STORAGE_KEYS.quizBank),
    window.storage.getItem(STORAGE_KEYS.cliStats),
    window.storage.getItem(STORAGE_KEYS.streak),
  ])
  return {
    progress: progress || {}, missed: missed || [], quizBank: quizBank || {},
    cliStats: cliStats || {}, streak: streak || { count: 0, lastStudyDate: null },
  }
}
async function saveSyncBundle(b) {
  await Promise.all([
    window.storage.setItem(STORAGE_KEYS.progress, b.progress),
    window.storage.setItem(STORAGE_KEYS.missed, b.missed),
    window.storage.setItem(STORAGE_KEYS.quizBank, b.quizBank),
    window.storage.setItem(STORAGE_KEYS.cliStats, b.cliStats),
    window.storage.setItem(STORAGE_KEYS.streak, b.streak),
  ])
}

// Merge a single progress entry: union quiz sessions by date, keep the richer
// confidence history, recompute mastery from the merged data.
function mergeProgressEntry(a, b) {
  if (!a) return b
  if (!b) return a
  const byDate = {}
  ;[...(a.quizScores || []), ...(b.quizScores || [])].forEach(s => { byDate[s.date] = s })
  const quizScores = Object.values(byDate).sort((x, y) => x.date - y.date)
  const confidenceRatings = ((a.confidenceRatings || []).length >= (b.confidenceRatings || []).length ? a.confidenceRatings : b.confidenceRatings) || []
  const { score, mastered } = computeMastery({ quizScores, confidenceRatings })
  return {
    status: mastered ? 'mastered' : (quizScores.length ? 'in_progress' : (a.status || b.status || 'unseen')),
    quizScores, confidenceRatings, masteryScore: score,
    lastSeen: Math.max(a.lastSeen || 0, b.lastSeen || 0),
  }
}
function mergeProgress(a = {}, b = {}) {
  const out = { ...a }
  for (const id of new Set([...Object.keys(a), ...Object.keys(b)])) {
    out[id] = mergeProgressEntry(a[id], b[id])
  }
  return out
}
function mergeMissed(a = [], b = []) {
  const seen = new Set()
  const out = []
  ;[...a, ...b].forEach(m => {
    const k = `${m.objectiveId}::${m.question}`
    if (!seen.has(k)) { seen.add(k); out.push(m) }
  })
  return out
}
function mergeQuizBank(a = {}, b = {}) {
  const out = {}
  for (const id of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const map = {}
    ;[...(a[id] || []), ...(b[id] || [])].forEach(q => {
      const k = normalizeQuestionText(q.question)
      // keep the copy with more recorded attempts (more learner history)
      if (!map[k] || (q.attempts?.length || 0) > (map[k].attempts?.length || 0)) map[k] = q
    })
    out[id] = Object.values(map)
  }
  return out
}
function mergeCliStats(a = {}, b = {}) {
  const out = { ...a }
  for (const id of Object.keys(b)) {
    if (!out[id] || (b[id].updatedAt || 0) > (out[id].updatedAt || 0)) out[id] = b[id]
  }
  return out
}
function mergeStreak(a = { count: 0 }, b = { count: 0 }) {
  const ad = a?.lastStudyDate || '', bd = b?.lastStudyDate || ''
  if (bd > ad) return b
  if (ad > bd) return a
  return (b?.count || 0) > (a?.count || 0) ? b : a
}
function mergeSyncData(local, remote = {}) {
  return {
    progress: mergeProgress(local.progress, remote.progress || {}),
    missed: mergeMissed(local.missed, remote.missed || []),
    quizBank: mergeQuizBank(local.quizBank, remote.quizBank || {}),
    cliStats: mergeCliStats(local.cliStats, remote.cliStats || {}),
    streak: mergeStreak(local.streak, remote.streak || { count: 0, lastStudyDate: null }),
  }
}

async function pullSync(code) {
  const res = await fetch(`/api/sync?code=${encodeURIComponent(code)}`)
  if (!res.ok) throw new Error(`Sync server error ${res.status}`)
  const j = await res.json()
  return j.data || null
}
async function pushSync(code, data) {
  const res = await fetch('/api/sync', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ code, data }),
  })
  if (!res.ok) throw new Error(`Sync server error ${res.status}`)
  return res.json()
}

/* =========================================================================
   LEARNER SUMMARY + LOCAL RECOMMENDATION ENGINE
   Deterministic analysis of progress + event log + missed bank. Produces both
   the "For You" suggestion cards and the behaviour context the AI tutor reads.
   No AI and no network — recommendations are business logic, generated locally.
   ========================================================================= */

// Compact behaviour context for the tutor's system prompt (string block).
function summarizeForTutor(summary) {
  const { perObjective, domainStats, missedByObj, recentTopics } = summary
  const weak = [...perObjective]
    .filter(o => o.status !== 'mastered' && o.attempts > 0)
    .sort((a, b) => a.mastery - b.mastery)
    .slice(0, 5)
    .map(o => `${o.id} ${o.title} (${Math.round(o.mastery * 100)}%${o.hardCount >= 2 ? ', low confidence' : ''})`)
  const masteredCount = perObjective.filter(o => o.status === 'mastered').length
  const domains = domainStats
    .map(d => `${d.name}: ${Math.round(d.avg * 100)}% avg, ${d.mastered}/${d.total} mastered`)
    .join('; ')
  const missedConcepts = Object.entries(missedByObj)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([id, n]) => {
      const o = ALL_OBJECTIVES.find(x => x.id === id)
      return `${id} ${o ? o.title : ''} (missed ${n})`
    })
  const recent = recentTopics
    .map(id => { const o = ALL_OBJECTIVES.find(x => x.id === id); return o ? `${id} ${o.title}` : id })

  return [
    `Objectives mastered so far: ${masteredCount} of ${ALL_OBJECTIVES.length}.`,
    `Per-domain mastery — ${domains}.`,
    `Weakest active objectives: ${weak.length ? weak.join('; ') : 'none yet'}.`,
    `Most frequently missed: ${missedConcepts.length ? missedConcepts.join('; ') : 'none recorded'}.`,
    `Recently studied: ${recent.length ? recent.join('; ') : 'nothing yet this session'}.`,
  ].join('\n')
}

/* =========================================================================
   SUBNETTING PROBLEM GENERATOR
   ========================================================================= */
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }

function ipToOctets(ip) { return ip.split('.').map(Number) }
function octetsToIp(o) { return o.join('.') }
function maskFromCidr(cidr) {
  const bits = '1'.repeat(cidr) + '0'.repeat(32 - cidr)
  return [0, 8, 16, 24].map(i => parseInt(bits.slice(i, i + 8), 2))
}
function cidrFromMask(mask) {
  return mask.reduce((acc, o) => acc + o.toString(2).split('1').length - 1, 0)
}

// Generates a random "given an IP and CIDR, find network/broadcast/range/etc" problem
function generateSubnetProblem() {
  const cidr = randInt(2, 30)
  const octets = [randInt(1, 223), randInt(0, 255), randInt(0, 255), randInt(1, 254)]
  const ip = octetsToIp(octets)
  const mask = maskFromCidr(cidr)

  const networkOctets = octets.map((o, i) => o & mask[i])
  const wildcard = mask.map(m => 255 - m)
  const broadcastOctets = networkOctets.map((o, i) => o | wildcard[i])

  const hostBits = 32 - cidr
  const totalHosts = Math.pow(2, hostBits)
  const usableHosts = hostBits >= 1 ? Math.max(totalHosts - 2, 0) : 0

  const firstUsable = [...networkOctets]
  const lastUsable = [...broadcastOctets]
  if (hostBits >= 1) {
    firstUsable[3] += 1
    lastUsable[3] -= 1
  }

  // block size = 256 - interesting octet of mask (find first non-255 octet)
  let blockSizeOctetIndex = mask.findIndex(m => m !== 255 && m !== 0)
  if (blockSizeOctetIndex === -1) blockSizeOctetIndex = cidr === 32 ? 3 : 0
  const blockSize = 256 - mask[blockSizeOctetIndex]

  return {
    type: 'subnet',
    ip,
    cidr,
    mask: octetsToIp(mask),
    network: octetsToIp(networkOctets),
    broadcast: octetsToIp(broadcastOctets),
    firstUsable: hostBits >= 1 ? octetsToIp(firstUsable) : null,
    lastUsable: hostBits >= 1 ? octetsToIp(lastUsable) : null,
    usableHosts,
    totalHosts,
    blockSize,
    blockSizeOctetIndex,
    steps: [
      `Block size = 256 - ${mask[blockSizeOctetIndex]} (octet ${blockSizeOctetIndex + 1} of the mask) = ${blockSize}`,
      `Network address: round octet ${blockSizeOctetIndex + 1} of ${ip} down to the nearest multiple of ${blockSize} → ${octetsToIp(networkOctets)}`,
      `Broadcast address: add (block size - 1) = ${blockSize - 1} to octet ${blockSizeOctetIndex + 1} of the network address, set octets after it to 255 → ${octetsToIp(broadcastOctets)}`,
      hostBits >= 1
        ? `Usable host range: ${octetsToIp(firstUsable)} - ${octetsToIp(lastUsable)} (${usableHosts} usable hosts = 2^${hostBits} - 2)`
        : `/${cidr} has no usable hosts (point-to-point or host route).`,
    ],
  }
}

// VLSM: given a base network and a list of required host counts, allocate
// subnets in descending order of size (largest-first allocation).
function generateVLSMProblem() {
  const baseCidr = 24
  const octets = [randInt(1, 223), randInt(0, 255), randInt(0, 255), 0]
  const baseNetwork = octetsToIp(octets)

  // Generate 3-4 requirements that fit within a /24 (max 254 usable)
  const numReqs = randInt(3, 4)
  const reqs = []
  let remaining = 200
  for (let i = 0; i < numReqs; i++) {
    const maxForThis = Math.floor(remaining / (numReqs - i)) || 2
    const hosts = randInt(2, Math.max(2, Math.min(maxForThis, 60)))
    reqs.push({ name: `Subnet ${String.fromCharCode(65 + i)}`, hostsNeeded: hosts })
    remaining -= hosts
  }
  // sort largest first for allocation (this is the "answer order")
  const sorted = [...reqs].sort((a, b) => b.hostsNeeded - a.hostsNeeded)

  let cursor = ipToOctets(baseNetwork)
  const allocations = sorted.map(req => {
    // smallest CIDR that fits hostsNeeded + 2 (network + broadcast)
    let hostBits = 1
    while (Math.pow(2, hostBits) - 2 < req.hostsNeeded) hostBits++
    const cidr = 32 - hostBits
    const blockSize = Math.pow(2, hostBits)
    const mask = maskFromCidr(cidr)

    const network = [...cursor]
    const broadcastOctets = network.map((o, i) => o | (255 - mask[i]))
    const firstUsable = [...network]; firstUsable[3] += 1
    const lastUsable = [...broadcastOctets]; lastUsable[3] -= 1

    const allocation = {
      name: req.name,
      hostsNeeded: req.hostsNeeded,
      cidr,
      mask: octetsToIp(mask),
      network: octetsToIp(network),
      broadcast: octetsToIp(broadcastOctets),
      firstUsable: octetsToIp(firstUsable),
      lastUsable: octetsToIp(lastUsable),
      usableHosts: blockSize - 2,
      blockSize,
    }

    // advance cursor by blockSize (32-bit addition on the 4th octet, carrying)
    let val = cursor[0] * 16777216 + cursor[1] * 65536 + cursor[2] * 256 + cursor[3]
    val += blockSize
    cursor = [
      (val >>> 24) & 255,
      (val >>> 16) & 255,
      (val >>> 8) & 255,
      val & 255,
    ]

    return allocation
  })

  return {
    type: 'vlsm',
    baseNetwork: `${baseNetwork}/${baseCidr}`,
    requirements: reqs,
    allocations,
  }
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

// Segmented requirement bar (e.g. offline unlock: N of 4 assets ready).
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

/* =========================================================================
   EXPLAIN TAB
   ========================================================================= */
const EXPLAIN_CACHE_KEY = 'ccna_explain_cache_v2' // v2: structured sections (was prose)
const EXPLAIN_PROMPT_SYSTEM = `You are a CCNA 200-301 tutor. Use the provided reference notes as your primary source. If the notes don't fully cover something a CCNA candidate needs, fill the gap with accurate, exam-relevant CCNA 200-301 knowledge — but never contradict the reference notes. Produce a clear, layered explanation in the requested structured fields. Keep each field tight and scannable: short sentences, plain language. The "advanced" field holds deeper detail a learner can skip on first pass.${''}
- definition: 2-4 short plain-English sentences — what it is and why it matters. No commands, formulas, exam traps, or citations here.
- bigTakeaway: one sentence the learner must remember (max ~25 words).
- keyPoints: 3-5 of the most testable core facts (short phrases) — formulas and commands belong here.
- realWorld: 1-2 sentences of practical/exam/lab context
- commonMistakes: 2-3 things students typically confuse or get wrong
- related: 2-4 prerequisite or follow-on topics (short labels)
- advanced: optional deeper detail (1-3 sentences), or omit if not needed`
const EXPLAIN_SCHEMA = {
  type: 'object',
  required: ['definition', 'bigTakeaway', 'keyPoints', 'commonMistakes'],
  properties: {
    definition: { type: 'string' },
    bigTakeaway: { type: 'string' },
    keyPoints: { type: 'array', items: { type: 'string' } },
    realWorld: { type: 'string' },
    commonMistakes: { type: 'array', items: { type: 'string' } },
    related: { type: 'array', items: { type: 'string' } },
    advanced: { type: 'string' },
  },
}

/* =========================================================================
   SOURCES — verifiable only. We cite the authoritative Cisco exam blueprint
   (objective id/title) and named reference works. No AI-invented page numbers.
   Lives here as exam-level config so it generalises to other certifications.
   ========================================================================= */
const EXAM_SOURCES = {
  examName: 'CCNA 200-301',
  blueprintUrl: 'https://learningnetwork.cisco.com/s/ccna-exam-topics',
  references: [
    { title: 'CCNA 200-301 Official Cert Guide (Vol 1 & 2)', author: 'Wendell Odom', publisher: 'Cisco Press' },
  ],
}

/* =========================================================================
   PRE-ASSESSMENT — test out of a section before studying it.
   ========================================================================= */
const PREASSESS_CACHE_KEY = 'ccna_preassess_v1'
const PREASSESS_PROMPT_SYSTEM = `You are a CCNA 200-301 assessment writer. Using the reference notes as your primary source (supplement with accurate CCNA knowledge consistent with them), write 6 multiple-choice questions that test whether a learner already knows this section's core concepts. Cover distinct sub-concepts so a wrong answer pinpoints a specific gap. Tag each question with the short sub-concept it tests.`
const PREASSESS_SCHEMA = {
  type: 'object', required: ['questions'],
  properties: { questions: { type: 'array', items: {
    type: 'object', required: ['question', 'choices', 'correctIndex', 'explanation', 'concept'],
    properties: {
      question: { type: 'string' },
      choices: { type: 'array', items: { type: 'string' }, minItems: 4, maxItems: 4 },
      correctIndex: { type: 'integer', minimum: 0, maximum: 3 },
      explanation: { type: 'string' },
      concept: { type: 'string' },
    },
  } } },
}

/* =========================================================================
   KEY TERMS CAROUSEL — horizontal "flash card" pockets of must-know terms
   ========================================================================= */
const TERMS_CACHE_KEY = 'ccna_terms_cache_v1'
const TERMS_PROMPT_SYSTEM = `You are a CCNA 200-301 study aid generator. Use the provided reference notes as your primary source; where the notes don't fully cover a detail a CCNA candidate needs, fill the gap with accurate CCNA 200-301 knowledge consistent with the notes. Produce 6-8 key-term flashcards for this objective — the most exam-relevant terms, acronyms, commands, or concepts to know cold.

Respond with ONLY valid JSON (no markdown fences, no commentary), in this exact shape:
{"cards":[{"term":"...","detail":"..."}]}

"term": a short label, max ~4 words (a word, acronym, command, or short phrase).
"detail": 1-2 short sentences with the key fact, definition, or syntax.`

function KeyTermsCarousel({ objective, premiumUnlocked = false, onPremiumBlocked }) {
  const [cards, setCards] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [flipped, setFlipped] = useState(() => new Set())
  const [detailIdx, setDetailIdx] = useState(null)
  const [fromCurated, setFromCurated] = useState(false)
  const curatedFlashcards = useMemo(() => getCurated(objective.id)?.flashcards || null, [objective.id])

  const fetchTerms = useCallback(async (force) => {
    setLoading(true)
    setError(null)
    setFromCurated(false)
    try {
      if (!force && curatedFlashcards?.length) {
        setCards(curatedFlashcards.map(f => ({ term: f.front, detail: f.back, ckuId: f.ckuId || null, id: f.id })))
        setFromCurated(true)
        setLoading(false)
        return
      }
      if (!force) {
        const cache = (await window.storage.getItem(TERMS_CACHE_KEY)) || {}
        if (cache[objective.id]) {
          setCards(cache[objective.id])
          setLoading(false)
          return
        }
      }
      if (!premiumUnlocked) {
        onPremiumBlocked?.(PREMIUM_FEATURES.ai_terms, 'key_terms', { objectiveId: objective.id })
        setCards(null)
        setLoading(false)
        return
      }
      const refNotes = BOOK_REF[objective.id] || ''
      const data = await askClaudeJSON({
        system: TERMS_PROMPT_SYSTEM,
        messages: [{
          role: 'user',
          content: `Objective ${objective.id}: ${objective.title}\n\nReference notes:\n${refNotes}\n\nGenerate key-term flashcards for this objective.`,
        }],
        max_tokens: 700,
        model: MODELS.fast,
        schema: TERMS_SCHEMA,
        toolName: 'emit_terms',
        feature: 'terms',
      })
      const list = data.cards || []
      if (list.length === 0) throw new Error('Claude returned no flashcards.')
      setCards(list)
      const cache = (await window.storage.getItem(TERMS_CACHE_KEY)) || {}
      cache[objective.id] = list
      await window.storage.setItem(TERMS_CACHE_KEY, cache)
    } catch (err) {
      setError(err.message.includes('JSON') ? 'Claude returned an unexpected format. Please try again.' : err.message)
    } finally {
      setLoading(false)
    }
  }, [objective.id, objective.title, curatedFlashcards, premiumUnlocked, onPremiumBlocked])

  useEffect(() => {
    setCards(null)
    setError(null)
    setFlipped(new Set())
    setDetailIdx(null)
    fetchTerms(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objective.id])

  const toggleFlip = (idx) => {
    setFlipped(prev => {
      const next = new Set(prev)
      if (next.has(idx)) {
        next.delete(idx)
        setDetailIdx(current => (current === idx ? null : current))
      } else {
        next.add(idx)
        setDetailIdx(idx)
      }
      return next
    })
  }

  if (loading) return <Spinner label="Pulling key terms..." />
  if (error) return <ErrorBox message={error} onRetry={() => fetchTerms(true)} />
  if (!cards) return null

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 700, color: COLORS.silverMid, letterSpacing: 0.9 }}>🃏 KEY TERMS</div>
            <div style={{ ...styles.small, fontSize: 'var(--ccna-type-xs)', marginTop: 1 }}>Tap a card to flip</div>
          </div>
          {fromCurated && <CuratedStaticBadge objectiveId={objective.id} fontSize={9} />}
        </div>
        {premiumUnlocked && (
          <button
            type="button"
            style={{ background: 'none', border: 'none', color: COLORS.silverMid, fontSize: 'var(--ccna-type-xs)', cursor: 'pointer', padding: '4px 0', minHeight: 32 }}
            onClick={() => fetchTerms(true)}
          >
            {fromCurated ? 'Generate with AI' : 'Refresh'}
          </button>
        )}
      </div>
      <div style={{
        display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6, width: '100%', maxWidth: '100%',
        scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch',
        overscrollBehaviorX: 'contain', touchAction: 'pan-x pan-y',
      }}>
        {cards.map((c, idx) => {
          const isFlipped = flipped.has(idx)
          return (
            <button
              key={idx}
              onClick={() => toggleFlip(idx)}
              className={`key-term-card${isFlipped ? ' key-term-card--flipped' : ''}`}
              style={{
                flex: '0 0 auto', width: 168, minHeight: 110, scrollSnapAlign: 'start',
                background: isFlipped ? COLORS.skyDim : COLORS.purpleDim,
                border: `1px solid ${isFlipped ? COLORS.skyBorder : COLORS.borderGlow}`,
                borderRadius: 12, padding: 12, textAlign: 'left', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6,
                fontFamily: 'inherit', color: COLORS.silver,
              }}
            >
              <div style={{ fontSize: 'var(--ccna-type-sm)', fontWeight: 700, color: isFlipped ? COLORS.sky : COLORS.purpleGlow }}>
                {c.term}
              </div>
              {isFlipped ? (
                <div style={{ fontSize: 'var(--ccna-type-xs)', lineHeight: 1.4, color: COLORS.silver }}>{c.detail}</div>
              ) : (
                <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid }}>Tap to reveal</div>
              )}
            </button>
          )
        })}
      </div>
      {detailIdx != null && cards[detailIdx] && flipped.has(detailIdx) && (
        <ConceptDetailPanel objectiveId={objective.id} card={cards[detailIdx]} />
      )}
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

// Tested-out topics still re-surface in spaced repetition: add the
// pre-assessment questions to the quiz bank with an SRS review due in ~7 days.
async function seedTestedOutReview(objectiveId, questions) {
  let bank = await loadQuizBank()
  bank = mergeIntoBank(bank, objectiveId, questions)
  const now = Date.now()
  const incoming = new Set(questions.map(q => normalizeQuestionText(q.question)))
  bank[objectiveId].forEach(q => {
    if (incoming.has(normalizeQuestionText(q.question)) && (q.attempts?.length || 0) === 0) {
      q.attempts = [{ correct: true, at: now }]
      // Tested out → seed at the 1-week interval (ladder index 1).
      q.srs = { interval: SRS_LADDER[1], reps: 2, lapses: 0, intervalIndex: 1, due: now + SRS_LADDER[1] * DAY_MS }
    }
  })
  await saveQuizBank(bank)
}

/* =========================================================================
   CLI DRILL TAB — uses shared engine in src/lab/cliEngine.js
   ========================================================================= */

/* ---- CLI skill metrics (local, feeds the future dashboard) ---- */
async function loadCliStats() {
  return (await window.storage.getItem(STORAGE_KEYS.cliStats)) || {}
}
async function recordCliLabResult(objectiveId, patch) {
  const all = await loadCliStats()
  const prev = all[objectiveId] || { runs: 0, bestScore: 0, lastScore: 0, commandsEntered: 0, syntaxErrors: 0, wrongModeErrors: 0, hintsUsed: 0, completedObjectives: 0, totalObjectives: 0 }
  const merged = {
    ...prev,
    runs: prev.runs + (patch.completed ? 1 : 0),
    bestScore: Math.max(prev.bestScore, patch.score ?? 0),
    lastScore: patch.score ?? prev.lastScore,
    commandsEntered: prev.commandsEntered + (patch.commandsEntered || 0),
    syntaxErrors: prev.syntaxErrors + (patch.syntaxErrors || 0),
    wrongModeErrors: prev.wrongModeErrors + (patch.wrongModeErrors || 0),
    hintsUsed: prev.hintsUsed + (patch.hintsUsed || 0),
    completedObjectives: Math.max(prev.completedObjectives, patch.completedObjectives || 0),
    totalObjectives: patch.totalObjectives || prev.totalObjectives,
    updatedAt: Date.now(),
  }
  all[objectiveId] = merged
  await window.storage.setItem(STORAGE_KEYS.cliStats, all)
}

function CLIDrillTab({ objective }) {
  const drills = COMMAND_DRILLS[objective.id] || []
  const host = cliHostnameForObjective(objective.id)

  const [mode, setMode] = useState('user')
  const [input, setInput] = useState('')
  const [history, setHistory] = useState([])
  const [statuses, setStatuses] = useState(() => drills.map(() => false))
  const [hintIdx, setHintIdx] = useState(null)
  const [done, setDone] = useState(false)
  const counters = useRef({ commandsEntered: 0, syntaxErrors: 0, wrongModeErrors: 0, hintsUsed: 0 })

  const reset = useCallback(() => {
    setMode('user'); setInput(''); setHistory([]); setStatuses(drills.map(() => false))
    setHintIdx(null); setDone(false)
    counters.current = { commandsEntered: 0, syntaxErrors: 0, wrongModeErrors: 0, hintsUsed: 0 }
  }, [drills])

  useEffect(() => { reset() }, [objective.id, reset])

  if (drills.length === 0) {
    return <p style={styles.small}>No CLI lab is defined for this objective.</p>
  }

  function submit() {
    const raw = input.trim()
    if (!raw) return

    const objectives = drills.map(d => ({ answer: d.answer, label: d.prompt, hint: d.hint }))
    const result = processCliLine({ raw, mode, host, objectives, completed: statuses })

    setInput('')
    counters.current.commandsEntered += 1
    counters.current.syntaxErrors += result.counters.syntaxErrors
    counters.current.wrongModeErrors += result.counters.wrongModeErrors

    if (normalizeCmd(raw) === 'hint') {
      const nextIdx = statuses.findIndex(s => !s)
      if (nextIdx >= 0) { setHintIdx(nextIdx); counters.current.hintsUsed += 1 }
    }

    let lines = [...result.lines]
    let nextStatuses = statuses

    if (result.newlyCompleted.length) {
      nextStatuses = [...statuses]
      result.newlyCompleted.forEach(i => {
        nextStatuses[i] = true
        lines = lines.map(l => (
          l.kind === 'ok' && l.text.startsWith('% OK —')
            ? { text: `% Objective complete: ${drills[i].prompt}`, kind: 'ok' }
            : l
        ))
        logEvent('user_entered_cli_command', { objectiveId: objective.id, ok: true })
      })
      setStatuses(nextStatuses)

      if (nextStatuses.every(Boolean)) {
        const completedCount = nextStatuses.filter(Boolean).length
        const score = Math.round((completedCount / drills.length) * 100)
        lines.push({ text: `% Lab complete — ${completedCount}/${drills.length} objectives. Score: ${score}%`, kind: 'ok' })
        setDone(true)
        recordCliLabResult(objective.id, {
          completed: true, score,
          completedObjectives: completedCount, totalObjectives: drills.length,
          ...counters.current,
        })
        logEvent('user_completed_cli_lab', { objectiveId: objective.id, score })
      }
    } else if (result.counters.syntaxErrors) {
      logEvent('user_entered_cli_command', { objectiveId: objective.id, ok: false, reason: 'syntax' })
    } else if (result.counters.wrongModeErrors) {
      logEvent('user_entered_cli_command', { objectiveId: objective.id, ok: false, reason: 'mode' })
    }

    setHistory(h => [...h, ...lines])
    setMode(result.newMode)
  }

  const completed = statuses.filter(Boolean).length

  return (
    <div>
      <p style={{ ...styles.small, marginBottom: 10 }}>
        Interactive IOS lab. Type real commands — navigate with <code style={{ fontFamily: 'ui-monospace, monospace' }}>enable</code>, <code style={{ fontFamily: 'ui-monospace, monospace' }}>configure terminal</code>, <code style={{ fontFamily: 'ui-monospace, monospace' }}>interface …</code>, <code style={{ fontFamily: 'ui-monospace, monospace' }}>exit</code>. Type <code style={{ fontFamily: 'ui-monospace, monospace' }}>hint</code> anytime.
      </p>

      <div style={{ ...styles.card, padding: 12, marginBottom: 10 }}>
        <div style={{ ...styles.small, fontWeight: 700, marginBottom: 8 }}>Lab objectives · {completed}/{drills.length}</div>
        {drills.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '4px 0', borderBottom: i < drills.length - 1 ? `1px solid ${COLORS.border}` : 'none' }}>
            <span style={{ color: statuses[i] ? COLORS.mint : COLORS.silverDim, fontSize: 'var(--ccna-type-sm)', marginTop: 1 }}>{statuses[i] ? '✓' : '○'}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 'var(--ccna-type-sm)', color: statuses[i] ? COLORS.silverMid : COLORS.silver, lineHeight: 1.4, textDecoration: statuses[i] ? 'line-through' : 'none' }}>
                <OverflowMarquee text={d.prompt} style={{ fontSize: 'var(--ccna-type-sm)' }} />
              </div>
              {hintIdx === i && <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.sky, marginTop: 2 }}>Hint: {d.hint}</div>}
            </div>
            {!statuses[i] && (
              <button
                type="button"
                onClick={() => { setHintIdx(i); counters.current.hintsUsed += 1 }}
                style={{ background: 'none', border: 'none', color: COLORS.silverMid, fontSize: 'var(--ccna-type-xs)', cursor: 'pointer', padding: '2px 4px', minHeight: 28 }}
              >Hint</button>
            )}
          </div>
        ))}
      </div>

      <div style={{ ...styles.card, padding: 0, overflow: 'hidden', border: `1px solid ${COLORS.border}`, marginBottom: 8 }}>
        <CiscoTerminal
          host={host}
          mode={mode}
          history={history}
          input={input}
          onInputChange={setInput}
          onSubmit={submit}
          disabled={done}
          emptyMessage={`${host} terminal ready. Type enable to begin.`}
        />
      </div>

      {done && (
        <button type="button" style={styles.primaryBtn} onClick={reset}>Restart lab</button>
      )}
    </div>
  )
}

/* =========================================================================
   SUBNETTING TAB
   ========================================================================= */
function SubnetField({ label, value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 4 }}>{label}</div>
      <input style={{ ...styles.input, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}
        value={value} onChange={onChange} placeholder={placeholder}
        autoCapitalize="none" autoCorrect="off" spellCheck={false} inputMode="decimal" />
    </div>
  )
}

function SubnettingTab() {
  const [problem, setProblem] = useState(() => generateSubnetProblem())
  const [answers, setAnswers] = useState({ network: '', broadcast: '', firstUsable: '', lastUsable: '', usableHosts: '' })
  const [checked, setChecked] = useState(false)
  const [drillMode, setDrillMode] = useState(false) // binary step-by-step drill

  function newProblem() {
    setProblem(generateSubnetProblem())
    setAnswers({ network: '', broadcast: '', firstUsable: '', lastUsable: '', usableHosts: '' })
    setChecked(false)
  }

  function field(key) {
    return { value: answers[key], onChange: e => setAnswers(a => ({ ...a, [key]: e.target.value })) }
  }

  function isCorrect(key, expected) {
    if (!checked) return null
    const got = (answers[key] || '').trim()
    return got === String(expected ?? '')
  }

  // Binary drill: show IP in binary + step-by-step prompts
  const ipBin = drillMode ? problem.ip.split('.').map(o => parseInt(o).toString(2).padStart(8, '0')).join('.') : null
  const maskBin = drillMode ? maskFromCidr(problem.cidr).map(o => o.toString(2).padStart(8, '0')).join('.') : null

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        {[false, true].map(dm => (
          <button key={String(dm)} onClick={() => { setDrillMode(dm); newProblem() }}
            style={{ flex: 1, minHeight: 36, borderRadius: 10, border: `1px solid ${drillMode === dm ? COLORS.skyBorder : COLORS.border}`, background: drillMode === dm ? COLORS.skyDim : COLORS.surface, color: drillMode === dm ? COLORS.sky : COLORS.silverMid, fontSize: 'var(--ccna-type-xs)', cursor: 'pointer', fontFamily: 'inherit' }}>
            {dm ? '🔢 Binary Drill' : '🔣 Standard'}
          </button>
        ))}
      </div>

      <div style={styles.card}>
        <div style={styles.small}>Given:</div>
        <div style={{ fontSize: 'var(--ccna-type-lg)', fontWeight: 700, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', marginTop: 4, marginBottom: drillMode ? 4 : 12 }}>
          {problem.ip} /{problem.cidr}
        </div>
        {drillMode && (
          <div style={{ fontSize: 'var(--ccna-type-xs)', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', color: COLORS.sky, marginBottom: 12, lineHeight: 1.8 }}>
            <div>IP:   {ipBin}</div>
            <div>Mask: {maskBin}</div>
            <div style={{ color: COLORS.silverMid, fontSize: 'var(--ccna-type-micro)', marginTop: 4 }}>AND the IP with the mask to find the network; OR with wildcard for broadcast</div>
          </div>
        )}
        <SubnetField label="Network address" placeholder="x.x.x.x" {...field('network')} />
        <SubnetField label="Broadcast address" placeholder="x.x.x.x" {...field('broadcast')} />
        <SubnetField label="First usable host" placeholder="x.x.x.x or n/a" {...field('firstUsable')} />
        <SubnetField label="Last usable host" placeholder="x.x.x.x or n/a" {...field('lastUsable')} />
        <SubnetField label="Number of usable hosts" placeholder="0" {...field('usableHosts')} />

        {checked && (
          <div style={{ marginTop: 4, marginBottom: 4 }}>
            {[
              ['network', problem.network],
              ['broadcast', problem.broadcast],
              ['firstUsable', problem.firstUsable ?? 'n/a'],
              ['lastUsable', problem.lastUsable ?? 'n/a'],
              ['usableHosts', problem.usableHosts],
            ].map(([key, expected]) => {
              const ok = isCorrect(key, expected)
              return (
                <div key={key} style={{ fontSize: 'var(--ccna-type-sm)', color: ok ? COLORS.mint : COLORS.rose, marginBottom: 2 }}>
                  {ok ? '✓' : '✗'} {key}: expected {String(expected)}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {checked && (
        <div style={{ ...styles.card, background: COLORS.skyDim, border: `1px solid ${COLORS.skyBorder}` }}>
          <div style={styles.h2}>Step-by-step solution</div>
          {drillMode && (
            <div style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 'var(--ccna-type-xs)', color: COLORS.sky, marginBottom: 10, lineHeight: 1.8 }}>
              <div>IP:        {ipBin}</div>
              <div>Mask:      {maskBin}</div>
              <div>Network:   {problem.network.split('.').map(o => parseInt(o).toString(2).padStart(8,'0')).join('.')} = {problem.network}</div>
              <div>Broadcast: {problem.broadcast.split('.').map(o => parseInt(o).toString(2).padStart(8,'0')).join('.')} = {problem.broadcast}</div>
            </div>
          )}
          <ol style={{ paddingLeft: 18, margin: 0, fontSize: 'var(--ccna-type-sm)', lineHeight: 1.7 }}>
            {problem.steps.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        {!checked && <button style={styles.primaryBtn} onClick={() => setChecked(true)}>Check answers</button>}
        <button style={checked ? styles.primaryBtn : styles.secondaryBtn} onClick={newProblem}>New problem</button>
      </div>
    </div>
  )
}
/* =========================================================================
   VLSM PRACTICE TAB
   ========================================================================= */
function VLSMTab() {
  const [problem, setProblem] = useState(() => generateVLSMProblem())
  const [answers, setAnswers] = useState({})
  const [checked, setChecked] = useState(false)

  function newProblem() {
    setProblem(generateVLSMProblem())
    setAnswers({})
    setChecked(false)
  }

  function setField(name, key, value) {
    setAnswers(a => ({ ...a, [`${name}_${key}`]: value }))
  }

  return (
    <div>
      <div style={styles.card}>
        <div style={styles.small}>Base network: <strong style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', color: COLORS.silver }}>{problem.baseNetwork}</strong></div>
        <div style={{ ...styles.small, marginTop: 8, marginBottom: 4 }}>Allocate subnets in order, largest requirement first:</div>
        <ul style={{ paddingLeft: 18, margin: 0, fontSize: 'var(--ccna-type-sm)', lineHeight: 1.7 }}>
          {problem.requirements.map(r => (
            <li key={r.name}>{r.name}: {r.hostsNeeded} hosts needed</li>
          ))}
        </ul>
      </div>

      {problem.allocations.map((a, idx) => (
        <div key={a.name} style={styles.card}>
          <div style={{ ...styles.h2, fontSize: 'var(--ccna-type-md)' }}>{idx + 1}. {a.name} ({a.hostsNeeded} hosts needed)</div>
          <SubnetField label="Network address" placeholder="x.x.x.x" value={answers[`${a.name}_network`] || ''} onChange={e => setField(a.name, 'network', e.target.value)} />
          <SubnetField label="CIDR (/n)" placeholder="/n" value={answers[`${a.name}_cidr`] || ''} onChange={e => setField(a.name, 'cidr', e.target.value)} />
          <SubnetField label="Broadcast address" placeholder="x.x.x.x" value={answers[`${a.name}_broadcast`] || ''} onChange={e => setField(a.name, 'broadcast', e.target.value)} />
          {checked && (
            <div style={{ marginTop: 4 }}>
              {[
                ['network', a.network], ['cidr', `/${a.cidr}`], ['broadcast', a.broadcast],
              ].map(([key, expected]) => {
                const got = (answers[`${a.name}_${key}`] || '').trim()
                const ok = got === String(expected)
                return (
                  <div key={key} style={{ fontSize: 'var(--ccna-type-sm)', color: ok ? COLORS.mint : COLORS.rose, marginBottom: 2 }}>
                    {ok ? '✓' : '✗'} {key}: expected {expected}
                  </div>
                )
              })}
              <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginTop: 4 }}>
                Usable range: {a.firstUsable} - {a.lastUsable} ({a.usableHosts} usable hosts, block size {a.blockSize})
              </div>
            </div>
          )}
        </div>
      ))}

      <div style={{ display: 'flex', gap: 8 }}>
        {!checked && <button style={styles.primaryBtn} onClick={() => setChecked(true)}>Check answers</button>}
        <button style={checked ? styles.primaryBtn : styles.secondaryBtn} onClick={newProblem}>New problem</button>
      </div>
    </div>
  )
}


/* =========================================================================
   IPv6 ADDRESSING CALCULATOR — prefix notation, expanded/compressed forms,
   and prefix range for a given IPv6 address/prefix length. Zero API cost.
   ========================================================================= */
function expandIPv6(addr) {
  // Expand :: shorthand and pad each group to 4 hex digits
  let full = addr.trim()
  if (full.includes('::')) {
    const [left, right] = full.split('::')
    const leftGroups = left ? left.split(':') : []
    const rightGroups = right ? right.split(':') : []
    const missing = 8 - leftGroups.length - rightGroups.length
    const mid = Array(missing).fill('0000')
    full = [...leftGroups, ...mid, ...rightGroups].join(':')
  }
  return full.split(':').map(g => g.padStart(4, '0')).join(':')
}
function compressIPv6(expanded) {
  // Remove leading zeros in each group, then find longest run of :0: for ::
  const groups = expanded.split(':').map(g => g.replace(/^0+/, '') || '0')
  const str = groups.join(':')
  // Find longest consecutive sequence of :0: groups
  let best = '', bestLen = 0, cur = '', curLen = 0
  for (let i = 0; i < groups.length; i++) {
    if (groups[i] === '0') { cur += (cur ? ':' : '') + '0'; curLen++; if (curLen > bestLen) { best = cur; bestLen = curLen } }
    else { cur = ''; curLen = 0 }
  }
  if (bestLen >= 2) {
    const rx = new RegExp('(^|:)' + best.replace(/:/g, ':') + '($|:)')
    return str.replace(rx, '::').replace(/:{3,}/, '::')
  }
  return str
}

function IPv6CalcTab() {
  const [input, setInput] = useState('')
  const [prefix, setPrefix] = useState('64')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  function calculate() {
    setError('')
    try {
      const pfx = parseInt(prefix, 10)
      if (isNaN(pfx) || pfx < 0 || pfx > 128) throw new Error('Prefix length must be 0–128.')
      let addr = input.trim()
      if (!addr) throw new Error('Enter an IPv6 address.')
      // Basic validation: allow hex digits, colons, double colon
      if (!/^[0-9a-fA-F:]+$/.test(addr)) throw new Error('Invalid characters — use hex digits and colons.')
      const expanded = expandIPv6(addr)
      const groups = expanded.split(':')
      if (groups.length !== 8) throw new Error('Invalid IPv6 address (need 8 groups after expansion).')
      // Convert to 128-bit bigint
      const full = BigInt('0x' + groups.map(g => g.padStart(4, '0')).join(''))
      const mask = pfx === 0 ? 0n : (((1n << BigInt(pfx)) - 1n) << BigInt(128 - pfx))
      const network = full & mask
      const lastAddr = pfx === 128 ? network : network | ((1n << BigInt(128 - pfx)) - 1n)
      function bigToIPv6(n) {
        const hex = n.toString(16).padStart(32, '0')
        return compressIPv6(hex.match(/.{4}/g).join(':'))
      }
      setResult({
        expanded: expanded.toLowerCase(),
        compressed: compressIPv6(expanded.toLowerCase()),
        prefixLength: pfx,
        networkPrefix: bigToIPv6(network) + '/' + pfx,
        firstHost: pfx < 128 ? bigToIPv6(network + 1n) : bigToIPv6(network),
        lastAddr: bigToIPv6(lastAddr),
        totalAddresses: pfx <= 64 ? '2^' + (128 - pfx) + ' (' + ((128 - pfx) >= 64 ? '≥18 quintillion' : String(2n ** BigInt(128 - pfx))) + ')' : String(2n ** BigInt(128 - pfx)),
      })
    } catch (e) { setError(e.message) }
  }

  return (
    <div>
      <div style={styles.card}>
        <div style={{ ...styles.small, fontWeight: 700, marginBottom: 10 }}>IPv6 Address / Prefix Calculator</div>
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 4 }}>IPv6 Address</div>
          <input style={{ ...styles.input, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}
            value={input} onChange={e => setInput(e.target.value)} placeholder="e.g. 2001:db8::1 or 2001:0db8::" autoCapitalize="none" autoCorrect="off" />
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 4 }}>Prefix Length</div>
          <input style={{ ...styles.input, width: 80 }} value={prefix} onChange={e => setPrefix(e.target.value)} placeholder="64" inputMode="numeric" />
        </div>
        <button style={styles.primaryBtn} onClick={calculate}>Calculate</button>
      </div>
      {error && <div style={{ color: COLORS.rose, fontSize: 'var(--ccna-type-sm)', marginTop: 8 }}>{error}</div>}
      {result && (
        <div style={styles.card}>
          {[
            ['Expanded form', result.expanded],
            ['Compressed form', result.compressed],
            ['Network prefix', result.networkPrefix],
            ['First host address', result.firstHost],
            ['Last address in block', result.lastAddr],
            ['Total addresses', result.totalAddresses],
          ].map(([label, val]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 4 }}>
              <span style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid }}>{label}</span>
              <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 'var(--ccna-type-sm)', color: COLORS.sky }}>{val}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* =========================================================================
   ACL WILDCARD-MASK CALCULATOR — converts subnet mask ↔ wildcard mask,
   and shows the matching network range for a given address + wildcard.
   ========================================================================= */
function ACLWildcardTab() {
  const [mode, setMode] = useState('mask') // mask | range
  const [mask, setMask] = useState('')
  const [address, setAddress] = useState('')
  const [wildcard, setWildcard] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  function validateOctets(ip) {
    const parts = ip.split('.')
    if (parts.length !== 4) return false
    return parts.every(p => { const n = parseInt(p, 10); return !isNaN(n) && n >= 0 && n <= 255 && String(n) === p })
  }

  function calculate() {
    setError(''); setResult(null)
    try {
      if (mode === 'mask') {
        if (!validateOctets(mask)) throw new Error('Enter a valid subnet mask (e.g. 255.255.255.0)')
        const maskOcts = mask.split('.').map(Number)
        const wildcardOcts = maskOcts.map(o => 255 - o)
        const cidr = maskOcts.reduce((s, o) => s + o.toString(2).split('').filter(b => b === '1').length, 0)
        setResult({
          subnetMask: mask,
          wildcardMask: wildcardOcts.join('.'),
          cidr: '/' + cidr,
          note: 'Wildcard = bitwise NOT of subnet mask',
        })
      } else {
        if (!validateOctets(address)) throw new Error('Enter a valid IP address.')
        if (!validateOctets(wildcard)) throw new Error('Enter a valid wildcard mask.')
        const addrOcts = address.split('.').map(Number)
        const wcOcts = wildcard.split('.').map(Number)
        // Network = address AND (NOT wildcard)
        const netOcts = addrOcts.map((o, i) => o & (255 - wcOcts[i]))
        // Broadcast = network OR wildcard
        const broadOcts = netOcts.map((o, i) => o | wcOcts[i])
        const subnetMask = wcOcts.map(o => 255 - o).join('.')
        const cidr = wcOcts.map(o => (255 - o).toString(2).split('1').length - 1).reduce((a, b) => a + b, 0)
        const hosts = wcOcts.reduce((prod, o) => prod * (o + 1), 1)
        setResult({
          networkAddress: netOcts.join('.'),
          broadcastAddress: broadOcts.join('.'),
          subnetMask,
          cidr: '/' + cidr,
          matchingHosts: hosts + ' IP address' + (hosts !== 1 ? 'es' : ''),
          aclStatement: `access-list 1 permit ${netOcts.join('.')} ${wildcard}`,
        })
      }
    } catch (e) { setError(e.message) }
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {[['mask', 'Mask → Wildcard'], ['range', 'Address + Wildcard → Range']].map(([m, label]) => (
          <button key={m} onClick={() => { setMode(m); setResult(null); setError('') }}
            style={{ flex: 1, minHeight: 36, borderRadius: 10, border: `1px solid ${mode === m ? COLORS.skyBorder : COLORS.border}`, background: mode === m ? COLORS.skyDim : COLORS.surface, color: mode === m ? COLORS.sky : COLORS.silverMid, fontSize: 'var(--ccna-type-xs)', cursor: 'pointer', fontFamily: 'inherit' }}>
            {label}
          </button>
        ))}
      </div>
      <div style={styles.card}>
        {mode === 'mask' ? (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 4 }}>Subnet Mask</div>
            <input style={{ ...styles.input, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}
              value={mask} onChange={e => setMask(e.target.value)} placeholder="255.255.255.0" inputMode="decimal" />
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 4 }}>IP Address</div>
              <input style={{ ...styles.input, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}
                value={address} onChange={e => setAddress(e.target.value)} placeholder="192.168.1.0" inputMode="decimal" />
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 4 }}>Wildcard Mask</div>
              <input style={{ ...styles.input, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}
                value={wildcard} onChange={e => setWildcard(e.target.value)} placeholder="0.0.0.255" inputMode="decimal" />
            </div>
          </>
        )}
        <button style={styles.primaryBtn} onClick={calculate}>Calculate</button>
      </div>
      {error && <div style={{ color: COLORS.rose, fontSize: 'var(--ccna-type-sm)', marginTop: 8 }}>{error}</div>}
      {result && (
        <div style={styles.card}>
          {Object.entries(result).map(([key, val]) => (
            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 4 }}>
              <span style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
              <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 'var(--ccna-type-sm)', color: COLORS.sky }}>{val}</span>
            </div>
          ))}
        </div>
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
// Per-objective offline asset checklist (for the unlock progress bars).
async function loadOfflineDetail() {
  const [ex, tm, vs, bank] = await Promise.all([
    window.storage.getItem(EXPLAIN_CACHE_KEY),
    window.storage.getItem(TERMS_CACHE_KEY),
    window.storage.getItem(VISUAL_CACHE_KEY),
    loadQuizBank(),
  ])
  const map = {}
  ALL_OBJECTIVES.forEach(o => {
    const reqs = [
      { label: 'Explanation', done: !!(ex && ex[o.id]) },
      { label: 'Key terms', done: !!(tm && tm[o.id]) },
      { label: 'Visual aid', done: !!(vs && vs[o.id]) },
      { label: 'Quiz bank', done: (bank[o.id] || []).length >= QUIZ_BANK_MIN },
    ]
    const count = reqs.filter(r => r.done).length
    map[o.id] = { reqs, count, ready: count === 4 }
  })
  return map
}

/* =========================================================================
   LEARNER METRICS DASHBOARD  (Phase 6)
   A separate command center. Every number and bar is computed locally from
   stored data (progress, events, quiz bank, CLI stats, offline caches).
   No API calls — works offline.
   ========================================================================= */
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
          <span style={{ display: 'block', fontSize: 'var(--ccna-type-sm)', fontWeight: 700, color: COLORS.silver, letterSpacing: 0.5 }}>{title}</span>
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

function MetricsDashboard({ progress, missed, dueCount = 0, onBack, onSelectObjective, onOpenReview, onOpenStats }) {
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
        <button style={styles.backBtn} onClick={onBack}>‹ Back</button>
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
  const open = (o) => onSelectObjective({ ...o, domainId: o.domainId, domainName: o.domainName, accent: o.accent })
  const quadCell = (key, label, accent, hint) => (
    <div style={{ flex: '1 1 45%', background: accentColors(accent).dim, border: `1px solid ${accentColors(accent).border}`, borderRadius: 10, padding: 10 }}>
      <div style={{ fontSize: 'var(--ccna-type-xl)', fontWeight: 700, color: accentColors(accent).text }}>{quads[key].length}</div>
      <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 600, color: COLORS.silver }}>{label}</div>
      <div style={{ fontSize: 'var(--ccna-type-micro)', color: COLORS.silverMid, lineHeight: 1.3 }}>{hint}</div>
    </div>
  )

  return (
    <div>
      <button style={styles.backBtn} onClick={onBack}>‹ Back</button>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
        <h1 style={{ ...styles.h1, margin: 0 }}>Learner Metrics</h1>
        {onOpenStats && (
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
        )}
      </div>
      <div style={{ ...styles.small, marginBottom: 10 }}>Everything below is {STATIC_COPY.metrics}.</div>

      {studyNext && (
        <div style={{ position: 'sticky', top: 0, zIndex: 5, background: COLORS.bg, paddingBottom: 10, marginBottom: 4 }}>
          <StudyNextStrip next={studyNext} onSelectObjective={onSelectObjective} onOpenReview={onOpenReview} sticky />
        </div>
      )}

      <AiCallsIndicator />

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
              return <div key={id} style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 2 }}>{id} {o ? o.title : ''} — <span style={{ color: COLORS.rose }}>missed {n}×</span></div>
            })}
          </div>
        )}
        {ckuWeak.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <div style={{ ...styles.small, fontWeight: 600, marginBottom: 4 }}>Weak CKUs (from missed bank)</div>
            {ckuWeak.map(({ id, count }) => (
              <div key={id} style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 2 }}>
                {id} — <span style={{ color: COLORS.amber }}>missed {count}×</span>
              </div>
            ))}
          </div>
        )}
        {trapWeak.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <div style={{ ...styles.small, fontWeight: 600, marginBottom: 4 }}>Repeated exam traps</div>
            {trapWeak.map(({ trap, count }) => (
              <div key={trap} style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 2 }}>
                {trap} — <span style={{ color: COLORS.amber }}>{count}×</span>
              </div>
            ))}
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

/* =========================================================================
   REVIEW SESSION — spaced-repetition review of all questions due today,
   pulled across every objective. Answering advances each card's schedule.
   ========================================================================= */
/* =========================================================================
   FOCUS MODE — review session scoped to weak-area objectives only.
   Pulls questions from the local quiz bank for objectives where mastery < 50%,
   so the learner can drill gaps without wading through material they already know.
   ========================================================================= */
function FocusModeSession({ progress, onBack, onMissed, onDone }) {
  const showNavHint = useNavHint()
  const doneHintFired = useRef(false)
  const [phase, setPhase] = useState('loading')
  const [queue, setQueue] = useState([])
  const [current, setCurrent] = useState(null)
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [orderDraft, setOrderDraft] = useState([])
  const [stats, setStats] = useState({ correct: 0, total: 0 })
  const [total, setTotal] = useState(0)
  const [weakIds, setWeakIds] = useState([])

  useEffect(() => {
    if (current && isOrderingQuestion(current)) {
      setOrderDraft(shuffleArrayCopy(current.orderItems))
    } else {
      setOrderDraft([])
    }
  }, [current])

  useEffect(() => {
    if (phase !== 'done') {
      doneHintFired.current = false
      return
    }
    if (doneHintFired.current) return
    doneHintFired.current = true
    showNavHint(NAV_HINT_KEYS.FOCUS_DONE)
  }, [phase, showNavHint])

  useEffect(() => {
    (async () => {
      const bank = await loadQuizBank()
      // Identify weak objectives: studied but mastery < 50%, or have misses but no mastery
      const weak = ALL_OBJECTIVES.filter(o => {
        const p = progress[o.id]
        if (!p) return false
        const { score } = computeMastery(p)
        return score < 0.5
      }).map(o => o.id)
      setWeakIds(weak)
      if (weak.length === 0) { setPhase('empty'); return }
      // Collect questions from weak objectives
      const questions = []
      for (const id of weak) {
        const qs = bank[id] || []
        // Prefer questions with lapses or low accuracy
        const sorted = [...qs].sort((a, b) => {
          const typeA = (a.type === 'troubleshooting' || a.type === 'ordering') ? 1 : 0
          const typeB = (b.type === 'troubleshooting' || b.type === 'ordering') ? 1 : 0
          if (typeB !== typeA) return typeB - typeA
          const lapA = a.srs?.lapses || 0, lapB = b.srs?.lapses || 0
          return lapB - lapA
        })
        sorted.slice(0, 3).forEach(q => questions.push({ ...q, objectiveId: id }))
      }
      const shuffled = randomizeQuestionOrder(questions).slice(0, REVIEW_SESSION_CAP)
      if (shuffled.length === 0) { setPhase('empty'); return }
      setTotal(shuffled.length)
      setCurrent(shuffled[0])
      setQueue(shuffled.slice(1))
      setPhase('active')
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function answer(idx) {
    if (revealed || !isMcQuestion(current)) return
    const correct = gradeQuestion(current, idx)
    setSelected(idx); setRevealed(true)
    haptic(correct ? 15 : [10, 40, 10])
    setStats(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
    recordQuizResult(current.objectiveId, current.id, { correct })
    if (!correct) onMissed(buildMissedEntry(current.objectiveId, current, { selectedIndex: idx }))
  }
  function submitOrder() {
    if (revealed || !isOrderingQuestion(current)) return
    const correct = gradeQuestion(current, orderDraft)
    setRevealed(true)
    haptic(correct ? 15 : [10, 40, 10])
    setStats(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
    recordQuizResult(current.objectiveId, current.id, { correct })
    if (!correct) onMissed(buildMissedEntry(current.objectiveId, current, { orderAnswer: orderDraft }))
  }
  function next() {
    if (queue.length === 0) { setPhase('done'); onDone?.(); return }
    setCurrent(queue[0]); setQueue(q => q.slice(1)); setSelected(null); setRevealed(false)
  }

  const ordering = current && isOrderingQuestion(current)
  const isCorrect = revealed && (ordering ? gradeQuestion(current, orderDraft) : gradeQuestion(current, selected))
  const obj = current ? ALL_OBJECTIVES.find(o => o.id === current.objectiveId) : null

  if (phase === 'loading') return <div><button style={styles.backBtn} onClick={onBack}>‹ Back</button><Spinner label="Finding your weak areas..." /></div>
  if (phase === 'empty') return (
    <div>
      <button style={styles.backBtn} onClick={onBack}>‹ Back</button>
      <h1 style={styles.h1}>Weak Areas</h1>
      <p style={styles.small}>No weak areas found! All studied objectives are above 50% mastery. Keep quizzing to identify gaps, or take a mock exam to find where to focus.</p>
    </div>
  )
  if (phase === 'done') return (
    <div>
      <button style={styles.backBtn} onClick={onBack}>‹ Back</button>
      <div style={styles.card}>
        <h2 style={styles.h2}>Weak Areas complete</h2>
        <p style={{ fontSize: 'var(--ccna-type-2xl)', fontWeight: 700, color: COLORS.mint, margin: '4px 0' }}>{stats.correct} / {stats.total}</p>
        <p style={styles.small}>{weakIds.length} weak objective{weakIds.length !== 1 ? 's' : ''} targeted. Keep drilling these until they reach 50%+.</p>
        <button style={{ ...styles.primaryBtn, marginTop: 10 }} onClick={onBack}>Done</button>
      </div>
    </div>
  )

  return (
    <div>
      <button style={styles.backBtn} onClick={onBack}>‹ Back</button>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
        <h1 style={{ ...styles.h1, margin: 0 }}>Weak Areas</h1>
        <span style={styles.small}>{total - queue.length} of {total}</span>
      </div>
      <div style={{ ...styles.small, marginBottom: 8 }}>{weakIds.length} weak objective{weakIds.length !== 1 ? 's' : ''} · {total} question{total === 1 ? '' : 's'} in this drill</div>
      {obj && <div style={{ ...styles.small, marginBottom: 8 }}>{obj.id} {obj.title}</div>}
      <div style={styles.card}>
        <QuestionMeta q={current} />
        <div style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 600, marginBottom: 14, lineHeight: 1.5, overflowWrap: 'anywhere', wordBreak: 'break-word' }}><RichText text={current.question} /></div>
        {ordering ? (
          <OrderingQuestion items={orderDraft} onChange={setOrderDraft} revealed={revealed} correctOrder={revealed ? current.orderItems : null} />
        ) : (
          <McChoices q={current} selected={selected} revealed={revealed} onSelect={answer} />
        )}
        {revealed && (
          <div className="ccna-quiz-reveal" style={{ marginTop: 8, padding: 12, borderRadius: 10, background: isCorrect ? COLORS.mintDim : COLORS.roseDim, border: `2px solid ${isCorrect ? COLORS.mintBorder : COLORS.rose}` }} {...quizFeedbackA11y}>
            <div style={{ fontWeight: 700, color: isCorrect ? COLORS.mint : COLORS.rose, marginBottom: 4, fontSize: 'var(--ccna-type-sm)' }}>{isCorrect ? 'Correct' : 'Incorrect'}</div>
            <AnswerReview q={current} selected={selected} />
          </div>
        )}
      </div>
      {ordering && !revealed && <button style={{ ...styles.primaryBtn, marginBottom: 10 }} onClick={submitOrder}>Check order</button>}
      {revealed && <button style={styles.primaryBtn} onClick={next}>{queue.length === 0 ? 'Finish' : 'Next'}</button>}
    </div>
  )
}

/* =========================================================================
   SEARCH INDEX — built once at module load so every keystroke is O(n) text
   scan against pre-concatenated strings rather than deep object traversal.
   ========================================================================= */
function _buildCuratedText(objectiveId) {
  const c = getCurated(objectiveId)
  if (!c) return ''
  const parts = []
  c.ckus?.forEach(k => { parts.push(k.title, k.summary, ...(k.aliases || []), ...(k.tags || [])) })
  const r = c.reading
  if (r) {
    parts.push(r.bigTakeaway, r.definition)
    Object.values(r.tiers || {}).forEach(t => parts.push(t))
    r.keyPoints?.forEach(k => parts.push(k))
    r.commonMistakes?.forEach(m => parts.push(m))
  }
  c.glossary?.forEach(g => parts.push(g.term, g.definition))
  c.examTraps?.forEach(t => parts.push(t.trap, t.correction))
  c.flashcards?.forEach(f => parts.push(f.front, f.back))
  c.mnemonics?.forEach(m => parts.push(m.mnemonic, m.explanation))
  c.misconceptions?.forEach(m => parts.push(m.misconception, m.reality))
  return parts.filter(Boolean).join(' ')
}

const OBJECTIVE_SEARCH_INDEX = ALL_OBJECTIVES.map(o => ({
  ...o,
  _search: (o.id + ' ' + o.title + ' ' + _buildCuratedText(o.id)).toLowerCase(),
}))

const LAB_SEARCH_INDEX = allLabs().map(lab => {
  const parts = [lab.title, lab.scenario]
  lab.learningGoals?.forEach(g => parts.push(g))
  lab.tasks?.forEach(t => parts.push(t.title, t.instruction))
  lab.commonMistakes?.forEach(m => parts.push(m))
  lab.successCriteria?.forEach(s => parts.push(s))
  lab.failureCriteria?.forEach(f => parts.push(f))
  return { ...lab, _search: parts.filter(Boolean).join(' ').toLowerCase() }
})

/* =========================================================================
   GLOBAL SEARCH — Cmd+K (desktop) or a persistent search button opens a
   full-screen modal that filters all 53 objectives in real time.
   ========================================================================= */
function GlobalSearchModal({ progress, onSelectObjective, onOpenLab, onClose }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)
  const dialogRef = useRef(null)
  useFocusTrap(dialogRef)

  useEffect(() => { inputRef.current?.focus() }, [])

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) {
      const recent = ALL_OBJECTIVES
        .map(o => ({ o, last: progress[o.id]?.lastSeen || 0 }))
        .filter(x => x.last > 0)
        .sort((a, b) => b.last - a.last)
        .slice(0, 5)
        .map(x => x.o)
      const seen = new Set(recent.map(o => o.id))
      const fill = ALL_OBJECTIVES.filter(o => !seen.has(o.id)).slice(0, Math.max(0, 12 - recent.length))
      return [...recent, ...fill].map(o => ({ type: 'objective', data: o }))
    }
    const objs = OBJECTIVE_SEARCH_INDEX
      .filter(o => o._search.includes(q))
      .slice(0, 12)
      .map(o => ({ type: 'objective', data: o }))
    const labs = LAB_SEARCH_INDEX
      .filter(l => l._search.includes(q))
      .slice(0, 5)
      .map(l => ({ type: 'lab', data: l }))
    return [...objs, ...labs]
  }, [query, progress])

  function pick(result) {
    if (result.type === 'lab') {
      onOpenLab(result.data.id)
    } else {
      const o = result.data
      const domain = DOMAINS.find(d => d.objectives.some(x => x.id === o.id))
      onSelectObjective({ ...o, domainId: domain?.id, domainName: domain?.name, accent: domain?.accent })
    }
    onClose()
  }

  return (
    <div
      ref={dialogRef}
      className="ccna-overlay global-search-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Search objectives"
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: MODAL_Z,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        paddingTop: 'max(60px, env(safe-area-inset-top))',
        paddingLeft: 'max(16px, env(safe-area-inset-left))',
        paddingRight: 'max(16px, env(safe-area-inset-right))',
        paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="global-search-panel" style={{ background: COLORS.card, borderRadius: 16, border: `1px solid ${COLORS.borderGlow}`, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: `1px solid ${COLORS.border}` }}>
          <span style={{ fontSize: 'var(--ccna-type-lg)', color: COLORS.silverMid }} aria-hidden>🔍</span>
          <input
            ref={inputRef}
            type="search"
            inputMode="search"
            enterKeyHint="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search objectives — e.g. 'OSPF' or '3.4'"
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 'var(--ccna-type-md)', color: COLORS.silver, fontFamily: 'inherit' }}
          />
          <button type="button" onClick={onClose} aria-label="Close search" style={{ background: 'none', border: 'none', color: COLORS.silverMid, fontSize: 'var(--ccna-type-sm)', cursor: 'pointer', minWidth: 44, minHeight: 44, padding: '4px 8px' }}>✕</button>
        </div>
        <div className="global-search-results">
          {results.map(result => {
            if (result.type === 'lab') {
              const lab = result.data
              const domain = DOMAINS.find(d => d.id === lab.domainId)
              return (
                <button
                  key={`lab-${lab.id}`}
                  onClick={() => pick(result)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', minWidth: 0, padding: '12px 16px', background: 'none', border: 'none', borderBottom: `1px solid ${COLORS.border}`, color: COLORS.silver, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
                >
                  <span style={{ fontSize: 'var(--ccna-type-sm)', flexShrink: 0 }} aria-hidden>🧪</span>
                  <span style={{ ...styles.pill(domain?.accent || 'silver'), fontSize: 'var(--ccna-type-micro)', flexShrink: 0 }}>Lab</span>
                  <OverflowMarquee text={lab.title} style={{ fontSize: 'var(--ccna-type-sm)', lineHeight: 1.4 }} />
                </button>
              )
            }
            const o = result.data
            const status = progress[o.id]?.status || 'unseen'
            const domain = DOMAINS.find(d => d.objectives.some(x => x.id === o.id))
            return (
              <button
                key={`obj-${o.id}`}
                onClick={() => pick(result)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', minWidth: 0, padding: '12px 16px', background: 'none', border: 'none', borderBottom: `1px solid ${COLORS.border}`, color: COLORS.silver, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
              >
                <StatusDot status={status} />
                <span style={{ ...styles.pill(domain?.accent || 'purple'), fontSize: 'var(--ccna-type-micro)', flexShrink: 0 }}>{o.id}</span>
                <OverflowMarquee text={o.title} style={{ fontSize: 'var(--ccna-type-sm)', lineHeight: 1.4 }} />
                {(hasCuratedReading(o.id) || hasCuratedQuestions(o.id)) && (
                  <CuratedStaticBadge objectiveId={o.id} fontSize={8} />
                )}
              </button>
            )
          })}
          {results.length === 0 && (
            <div style={{ padding: 20, textAlign: 'center', color: COLORS.silverMid, fontSize: 'var(--ccna-type-sm)' }}>No results match "{query}"</div>
          )}
        </div>
        {!query && <div style={{ padding: '8px 16px', fontSize: 'var(--ccna-type-xs)', color: COLORS.silverDim, borderTop: `1px solid ${COLORS.border}` }}>Recent objectives first · type to search all {ALL_OBJECTIVES.length} objectives + labs</div>}
      </div>
    </div>
  )
}

function ReviewSession({ onBack, onMissed, onDone, onOpenSection }) {
  const showNavHint = useNavHint()
  const doneHintFired = useRef(false)
  const [phase, setPhase] = useState('loading') // loading | active | empty | done
  const [queue, setQueue] = useState([])
  const [current, setCurrent] = useState(null)
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [orderDraft, setOrderDraft] = useState([])
  const [stats, setStats] = useState({ correct: 0, total: 0 })
  const [total, setTotal] = useState(0)

  useEffect(() => {
    if (current && isOrderingQuestion(current)) {
      setOrderDraft(shuffleArrayCopy(current.orderItems))
    } else {
      setOrderDraft([])
    }
  }, [current])

  useEffect(() => {
    if (phase !== 'done') {
      doneHintFired.current = false
      return
    }
    if (doneHintFired.current) return
    doneHintFired.current = true
    showNavHint(NAV_HINT_KEYS.REVIEW_DONE)
  }, [phase, showNavHint])

  useEffect(() => {
    (async () => {
      const due = randomizeQuestionOrder(await loadDueQuestions(REVIEW_SESSION_CAP))
      if (due.length === 0) { setPhase('empty'); return }
      setTotal(due.length)
      setCurrent(due[0]); setQueue(due.slice(1)); setPhase('active')
    })()
  }, [])
  // ~30s per question, shown as a gentle expectation (never a backlog count).
  const estMin = Math.max(1, Math.round(total * 0.5))

  function answer(idx) {
    if (revealed || !isMcQuestion(current)) return
    const correct = gradeQuestion(current, idx)
    setSelected(idx); setRevealed(true)
    haptic(correct ? 15 : [10, 40, 10])
    setStats(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
    recordQuizResult(current.objectiveId, current.id, { correct })
    logEvent('user_reviewed_concept', { objectiveId: current.objectiveId, questionId: current.id, correct })
    if (!correct) {
      onMissed({ objectiveId: current.objectiveId, question: current.question, choices: current.choices, correctIndex: current.correctIndex, selectedIndex: idx, explanation: current.explanation, concept: current.concept, type: current.type, skill: current.skill, addedAt: Date.now() })
    }
  }
  function submitOrder() {
    if (revealed || !isOrderingQuestion(current)) return
    const correct = gradeQuestion(current, orderDraft)
    setRevealed(true)
    haptic(correct ? 15 : [10, 40, 10])
    setStats(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
    recordQuizResult(current.objectiveId, current.id, { correct })
    logEvent('user_reviewed_concept', { objectiveId: current.objectiveId, questionId: current.id, correct })
    if (!correct) {
      onMissed({ objectiveId: current.objectiveId, question: current.question, orderItems: current.orderItems, orderAnswer: orderDraft, explanation: current.explanation, concept: current.concept, type: current.type, skill: current.skill, addedAt: Date.now() })
    }
  }
  function next() {
    if (queue.length === 0) { setPhase('done'); onDone?.(); return }
    setCurrent(queue[0]); setQueue(q => q.slice(1)); setSelected(null); setRevealed(false)
  }

  if (phase === 'loading') return <div><button style={styles.backBtn} onClick={onBack}>‹ Back</button><Spinner label="Gathering your reviews..." /></div>
  if (phase === 'empty') {
    return (
      <div>
        <button style={styles.backBtn} onClick={onBack}>‹ Back</button>
        <h1 style={styles.h1}>Daily Review</h1>
        <p style={styles.small}>Nothing due right now. Spaced repetition brings questions back on their schedule — take some quizzes and they'll reappear here over the coming days.</p>
      </div>
    )
  }
  if (phase === 'done') {
    return (
      <div>
        <button style={styles.backBtn} onClick={onBack}>‹ Back</button>
        <div style={styles.card}>
          <h2 style={styles.h2}>Review complete</h2>
          <p style={{ fontSize: 'var(--ccna-type-2xl)', fontWeight: 700, color: COLORS.mint, margin: '4px 0' }}>{stats.correct} / {stats.total}</p>
          <p style={styles.small}>Each question's next review has been rescheduled. Come back tomorrow for the next batch.</p>
          <button style={{ ...styles.primaryBtn, marginTop: 10 }} onClick={onBack}>Done</button>
        </div>
      </div>
    )
  }

  const ordering = isOrderingQuestion(current)
  const isCorrect = revealed && (ordering ? gradeQuestion(current, orderDraft) : gradeQuestion(current, selected))
  const obj = ALL_OBJECTIVES.find(o => o.id === current.objectiveId)
  return (
    <div>
      <button style={styles.backBtn} onClick={onBack}>‹ Back</button>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
        <h1 style={{ ...styles.h1, margin: 0 }}>Daily Review</h1>
        <span style={styles.small}>{total - queue.length} of {total}</span>
      </div>
      <div style={{ ...styles.small, marginBottom: 8 }}>Mixed sections · retrieval practice{revealed ? '' : ' — answer before revealing'}</div>
      {obj && <div style={{ ...styles.small, marginBottom: 8 }}>{obj.id} {obj.title}</div>}
      <div style={styles.card}>
        <QuestionMeta q={current} />
        <div style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 600, marginBottom: 14, lineHeight: 1.5, overflowWrap: 'anywhere', wordBreak: 'break-word' }}><RichText text={current.question} /></div>
        {ordering ? (
          <OrderingQuestion items={orderDraft} onChange={setOrderDraft} revealed={revealed} correctOrder={revealed ? current.orderItems : null} />
        ) : (
          <McChoices q={current} selected={selected} revealed={revealed} onSelect={answer} />
        )}
        {revealed && (
          <div className="ccna-quiz-reveal" style={{ marginTop: 8, padding: 12, borderRadius: 10, background: isCorrect ? COLORS.mintDim : COLORS.roseDim, border: `2px solid ${isCorrect ? COLORS.mintBorder : COLORS.rose}` }} {...quizFeedbackA11y}>
            <div style={{ fontWeight: 700, color: isCorrect ? COLORS.mint : COLORS.rose, marginBottom: 4, fontSize: 'var(--ccna-type-sm)' }}>{isCorrect ? 'Correct' : 'Incorrect'}</div>
            <AnswerReview q={current} selected={selected} />
            {obj && (
              <button
                onClick={() => onOpenSection?.(obj)}
                style={{ marginTop: 10, background: 'none', border: 'none', color: COLORS.sky, fontSize: 'var(--ccna-type-xs)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
              >
                Review {obj.id} {obj.title} →
              </button>
            )}
          </div>
        )}
      </div>
      {ordering && !revealed && <button style={{ ...styles.primaryBtn, marginBottom: 10 }} onClick={submitOrder}>Check order</button>}
      {revealed && <button style={styles.primaryBtn} onClick={next}>{queue.length === 0 ? 'Finish' : 'Next'}</button>}
    </div>
  )
}

/* =========================================================================
   ONBOARDING — first-visit diagnostic placement check. Built entirely from
   curated questions (zero API cost). Seeds initial mastery estimates for the
   objectives it samples and recommends a starting point.
   ========================================================================= */
const DIAGNOSTIC_CAP = 18
const DIAGNOSTIC_PER_OBJ = 2
const DIAGNOSTIC_SKILL_MIN = 5 // ordering + troubleshooting in placement check

async function buildDiagnosticSet() {
  const { allSkillQuestions } = await import('./data/ccnaSkillQuestions.js')
  const skillPool = allSkillQuestions().filter(q => isOrderingQuestion(q) || q.type === 'troubleshooting')
  const mcPool = []
  for (const obj of ALL_OBJECTIVES) {
    if (!hasCuratedQuestions(obj.id)) continue
    getCuratedQuestions(obj.id)
      .filter(isMcQuestion)
      .slice(0, DIAGNOSTIC_PER_OBJ)
      .forEach(q => mcPool.push({ ...q, objectiveId: obj.id }))
  }
  const skillPick = randomizeQuestionOrder(skillPool).slice(0, DIAGNOSTIC_SKILL_MIN)
  const seen = new Set(skillPick.map(q => q.id || q.question))
  const mcPick = randomizeQuestionOrder(mcPool.filter(q => !seen.has(q.id || q.question)))
    .slice(0, Math.max(0, DIAGNOSTIC_CAP - skillPick.length))
  return randomizeQuestionOrder([...skillPick, ...mcPick]).slice(0, DIAGNOSTIC_CAP)
}

function Onboarding({ onComplete, onSkip }) {
  const showNavHint = useNavHint()
  const doneHintFired = useRef(false)
  const [phase, setPhase] = useState('intro') // intro | active | done
  const [queue, setQueue] = useState([])
  const [current, setCurrent] = useState(null)
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [orderDraft, setOrderDraft] = useState([])
  const [results, setResults] = useState({})
  const [total, setTotal] = useState(0)
  const [answered, setAnswered] = useState(0)

  useEffect(() => {
    if (current && isOrderingQuestion(current)) {
      setOrderDraft(shuffleArrayCopy(current.orderItems))
    } else {
      setOrderDraft([])
    }
  }, [current])

  useEffect(() => {
    if (phase !== 'done') {
      doneHintFired.current = false
      return
    }
    if (doneHintFired.current) return
    doneHintFired.current = true
    const rows = Object.entries(results)
      .map(([objectiveId, r]) => ({ objectiveId, acc: r.correct / Math.max(r.total, 1) }))
      .sort((a, b) => a.acc - b.acc)
    showNavHint(NAV_HINT_KEYS.PLACEMENT_DONE, { weakestId: rows[0]?.objectiveId })
  }, [phase, results, showNavHint])

  function recordResult(correct) {
    setResults(r => {
      const e = r[current.objectiveId] || { correct: 0, total: 0 }
      return { ...r, [current.objectiveId]: { correct: e.correct + (correct ? 1 : 0), total: e.total + 1 } }
    })
    setAnswered(a => a + 1)
  }

  function start() {
    ;(async () => {
      const set = await buildDiagnosticSet()
      if (set.length === 0) { onComplete({}); return }
      setTotal(set.length)
      setResults({})
      setAnswered(0)
      setCurrent(set[0]); setQueue(set.slice(1)); setSelected(null); setRevealed(false)
      setPhase('active')
    })()
  }

  function answer(idx) {
    if (revealed || !isMcQuestion(current)) return
    const correct = gradeQuestion(current, idx)
    setSelected(idx); setRevealed(true)
    recordResult(correct)
  }

  function submitOrder() {
    if (revealed || !isOrderingQuestion(current)) return
    const correct = gradeQuestion(current, orderDraft)
    setRevealed(true)
    recordResult(correct)
  }

  function next() {
    if (queue.length === 0) { setPhase('done'); return }
    setCurrent(queue[0]); setQueue(q => q.slice(1)); setSelected(null); setRevealed(false)
  }

  if (phase === 'intro') {
    return (
      <div>
        <div style={styles.card}>
          <h1 style={styles.h1}>Welcome 👋🏾</h1>
          <p style={{ fontSize: 'var(--ccna-type-md)', lineHeight: 1.6, color: COLORS.silver, marginBottom: 10 }}>
            Quick placement check, ~5 minutes. A short mixed-domain quiz — including drag-and-drop ordering
            and troubleshooting — to see where you're starting from and seed your progress.
          </p>
          <p style={styles.small}>No AI calls, no scoring pressure — you can retake real quizzes later regardless of how you do here.</p>
          <button style={{ ...styles.primaryBtn, marginTop: 12 }} onClick={start}>Start placement check</button>
          <button style={{ ...styles.secondaryBtn, marginTop: 8 }} onClick={onSkip}>Skip — start studying</button>
        </div>
      </div>
    )
  }

  if (phase === 'active') {
    const ordering = isOrderingQuestion(current)
    const isCorrect = revealed && (ordering ? gradeQuestion(current, orderDraft) : gradeQuestion(current, selected))
    const obj = ALL_OBJECTIVES.find(o => o.id === current.objectiveId)
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
          <h1 style={{ ...styles.h1, margin: 0 }}>Placement Check</h1>
          <span style={styles.small}>{answered} of {total}</span>
        </div>
        {obj && <div style={{ ...styles.small, marginBottom: 8 }}>{obj.id} {obj.title}</div>}
        <div style={styles.card}>
          <QuestionMeta q={current} />
          <div style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 600, marginBottom: 14, lineHeight: 1.5, overflowWrap: 'anywhere', wordBreak: 'break-word' }}><RichText text={current.question} /></div>
          {ordering ? (
            <OrderingQuestion items={orderDraft} onChange={setOrderDraft} revealed={revealed} correctOrder={revealed ? current.orderItems : null} />
          ) : (
            <McChoices q={current} selected={selected} revealed={revealed} onSelect={answer} />
          )}
          {revealed && (
            <div className="ccna-quiz-reveal" style={{ marginTop: 8, padding: 12, borderRadius: 10, background: isCorrect ? COLORS.mintDim : COLORS.roseDim, border: `2px solid ${isCorrect ? COLORS.mintBorder : COLORS.rose}` }} {...quizFeedbackA11y}>
              <div style={{ fontWeight: 700, color: isCorrect ? COLORS.mint : COLORS.rose, marginBottom: 4, fontSize: 'var(--ccna-type-sm)' }}>{isCorrect ? 'Correct' : 'Incorrect'}</div>
              <AnswerReview q={current} selected={selected} />
            </div>
          )}
        </div>
        {ordering && !revealed && <button style={{ ...styles.primaryBtn, marginBottom: 10 }} onClick={submitOrder}>Check order</button>}
        {revealed && <button style={styles.primaryBtn} onClick={next}>{queue.length === 0 ? 'See results' : 'Next'}</button>}
      </div>
    )
  }

  // phase === 'done'
  const rows = Object.entries(results)
    .map(([objectiveId, r]) => ({ objectiveId, obj: ALL_OBJECTIVES.find(o => o.id === objectiveId), acc: r.correct / Math.max(r.total, 1), ...r }))
    .sort((a, b) => a.acc - b.acc)
  const weakest = rows[0]
  const overall = rows.length ? rows.reduce((s, r) => s + r.acc, 0) / rows.length : 0

  return (
    <div>
      <div style={styles.card}>
        <h2 style={styles.h2}>Placement check complete</h2>
        <p style={{ fontSize: 'var(--ccna-type-2xl)', fontWeight: 700, color: COLORS.mint, margin: '4px 0' }}>{fmtPct(overall)}</p>
        <p style={styles.small}>Your progress for these {rows.length} objectives has been seeded. Everything else starts fresh — no penalty either way.</p>
        {weakest && weakest.obj && (
          <div style={{ marginTop: 10, padding: 12, borderRadius: 10, background: COLORS.purpleDim, border: `1px solid ${COLORS.purpleGlow}` }}>
            <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.purpleGlow, fontWeight: 700, marginBottom: 4 }}>RECOMMENDED STARTING POINT</div>
            <div style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 600 }}>{weakest.obj.id} {weakest.obj.title}</div>
            <div style={styles.small}>{fmtPct(weakest.acc)} on the placement check</div>
          </div>
        )}
        <button style={{ ...styles.primaryBtn, marginTop: 12 }} onClick={() => onComplete(results)}>Go to my dashboard</button>
      </div>
    </div>
  )
}


/* =========================================================================
   MISSED QUESTIONS REVIEW
   ========================================================================= */
function MissedReview({ missed, onBack, onRemove }) {
  const [revealedIdx, setRevealedIdx] = useState(null)
  const [trapFilter, setTrapFilter] = useState(null)
  const trapGroups = useMemo(() => groupMissedByTrap(missed), [missed])
  const items = useMemo(() => {
    const pool = trapFilter
      ? (trapGroups.find(g => g.trap === trapFilter)?.items || [])
      : missed
    return randomizeQuestionOrder(pool)
  }, [missed, trapFilter, trapGroups])

  if (missed.length === 0) {
    return (
      <div>
        <button style={styles.backBtn} onClick={onBack}>‹ Back</button>
        <h1 style={styles.h1}>Missed Questions</h1>
        <p style={styles.small}>No missed questions saved. Nice work — they'll show up here whenever you answer a quiz question incorrectly.</p>
      </div>
    )
  }

  return (
    <div>
      <button style={styles.backBtn} onClick={onBack}>‹ Back</button>
      <h1 style={styles.h1}>Missed Questions</h1>
      <p style={{ ...styles.small, marginBottom: 14 }}>{missed.length} question{missed.length === 1 ? '' : 's'} saved for review.</p>
      {trapGroups.length > 1 && (
        <div style={{ ...styles.card, marginBottom: 14, padding: 12 }}>
          <div style={{ ...styles.small, fontWeight: 700, marginBottom: 8 }}>Trap patterns ({trapGroups.length})</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <button
              type="button"
              style={{ ...styles.pill(trapFilter ? 'silver' : 'mint'), fontSize: 'var(--ccna-type-xs)', cursor: 'pointer', border: 'none' }}
              onClick={() => setTrapFilter(null)}
            >
              All ({missed.length})
            </button>
            {trapGroups.slice(0, 8).map(g => (
              <button
                key={g.trap}
                type="button"
                style={{ ...styles.pill(trapFilter === g.trap ? 'mint' : 'silver'), fontSize: 'var(--ccna-type-xs)', cursor: 'pointer', border: 'none', maxWidth: '100%' }}
                onClick={() => setTrapFilter(trapFilter === g.trap ? null : g.trap)}
                title={g.trap}
              >
                <OverflowMarquee text={`${g.trap} (${g.count})`} style={{ fontSize: 'var(--ccna-type-xs)' }} />
              </button>
            ))}
          </div>
        </div>
      )}
      {items.map((m, idx) => (
        <div key={`${m.objectiveId}-${normalizeQuestionText(m.question)}-${idx}`} style={styles.card}>
          <div style={{ ...styles.small, marginBottom: 6 }}>{m.objectiveId}</div>
          <div style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 600, marginBottom: 10, lineHeight: 1.5 }}>{m.question}</div>
          {m.choices.map((c, ci) => {
            const isAnswer = ci === m.correctIndex
            const reveal = revealedIdx === idx
            return (
              <div key={ci} style={{
                padding: '10px 12px', borderRadius: 10, marginBottom: 6, fontSize: 'var(--ccna-type-sm)',
                background: reveal && isAnswer ? COLORS.mintDim : COLORS.surface,
                border: `1px solid ${reveal && isAnswer ? COLORS.mintBorder : COLORS.border}`,
                color: reveal && isAnswer ? COLORS.mint : COLORS.silver,
              }}>
                {c}
              </div>
            )
          })}
          {revealedIdx === idx ? (
            <div style={{ marginTop: 4 }}>
              <div style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.silverMid, marginBottom: 8, lineHeight: 1.5 }}>{m.explanation}</div>
              <button style={{ ...styles.secondaryBtn, marginTop: 8 }} onClick={() => onRemove(missed.indexOf(m))}>Mark as reviewed (remove)</button>
            </div>
          ) : (
            <button style={{ ...styles.secondaryBtn, marginTop: 4 }} onClick={() => setRevealedIdx(idx)}>Show answer</button>
          )}
        </div>
      ))}
    </div>
  )
}


/* =========================================================================
   PROGRESS EXPORT
   ========================================================================= */
/* =========================================================================
   EXPORT / REPORT SYSTEM  (Phase 9)
   A professional learning-report generator. Every report is built locally from
   stored data (progress, missed bank, quiz bank, CLI stats, events, offline
   caches) — no API calls. Each report has a builder that returns plain text.
   ========================================================================= */
const fmtPct = (n) => `${Math.round((n || 0) * 100)}%`
const rule = (t) => `${t}\n${'='.repeat(Math.max(t.length, 4))}`
function reportHeader(title) {
  return [rule(`CCNA 200-301 — ${title}`), `Generated: ${new Date().toLocaleString()}`, ''].join('\n')
}

// Builders receive a ctx assembled once by the modal.
function repStudentProgress(ctx) {
  const { progress, summary } = ctx
  const out = [reportHeader('Student Progress Report')]
  const overall = summary.perObjective.reduce((s, o) => s + o.mastery, 0) / summary.perObjective.length
  const mastered = summary.perObjective.filter(o => o.status === 'mastered').length
  out.push(`Overall mastery: ${fmtPct(overall)} · ${mastered}/${summary.perObjective.length} objectives mastered`, '')
  DOMAINS.forEach(d => {
    const ds = summary.domainStats.find(x => x.id === d.id)
    out.push(`${d.name} (${d.weight}% of exam) — ${fmtPct(ds.avg)} avg, ${ds.mastered}/${ds.total} mastered`)
    d.objectives.forEach(o => {
      const p = progress[o.id]
      const status = p?.status || 'unseen'
      const m = computeMastery(p).score
      let line = `  [${status === 'mastered' ? 'x' : ' '}] ${o.id} ${o.title} — ${status.replace('_', ' ')}`
      if (p?.quizScores?.length) line += ` · mastery ${fmtPct(m)} · ${p.quizScores.length} quiz session(s)`
      out.push(line)
    })
    out.push('')
  })
  return out.join('\n')
}

function repCertReadiness(ctx) {
  const { summary, cliStats } = ctx
  const rows = summary.perObjective
  const readiness = summary.domainStats.reduce((s, d) => s + (d.weight / 100) * d.avg, 0)
  const strong = rows.filter(o => o.mastery >= 0.85 || o.status === 'mastered')
  const needs = rows.filter(o => o.attempts > 0 && o.mastery < 0.7).sort((a, b) => a.mastery - b.mastery)
  const close = rows.filter(o => o.mastery >= 0.7 && o.mastery < 0.85 && o.status !== 'mastered')
  const unseen = rows.filter(o => o.status === 'unseen')
  const cliVals = Object.values(cliStats).map(s => s.bestScore || 0)
  const cliReady = cliVals.length ? Math.round(cliVals.reduce((a, b) => a + b, 0) / cliVals.length) : null

  const out = [reportHeader('Certification Readiness Report')]
  out.push(`Overall Readiness: ${fmtPct(readiness)}`, '')
  out.push('Quiz accuracy by domain:')
  summary.domainStats.forEach(d => out.push(`  - ${d.name}: ${fmtPct(d.avg)} (${d.mastered}/${d.total} mastered)`))
  out.push('', 'CLI readiness: ' + (cliReady != null ? `${cliReady}% across ${cliVals.length} lab(s)` : 'no CLI labs completed yet'))
  out.push('', 'Strong areas:')
  ;(strong.length ? strong : [{ id: '', title: 'none yet' }]).forEach(o => out.push(`  + ${o.id} ${o.title}`.trimEnd()))
  out.push('', 'Needs review (do NOT skip):')
  ;(needs.length ? needs : [{ id: '', title: 'none' }]).forEach(o => out.push(`  ! ${o.id} ${o.title}${o.mastery ? ` (${fmtPct(o.mastery)})` : ''}`.trimEnd()))
  out.push('', 'Close to mastery:')
  ;(close.length ? close : [{ id: '', title: 'none' }]).forEach(o => out.push(`  ~ ${o.id} ${o.title} (${fmtPct(o.mastery)})`.trimEnd()))
  if (unseen.length) { out.push('', `Not started (${unseen.length}):`); unseen.forEach(o => out.push(`  · ${o.id} ${o.title}`)) }
  out.push('', 'Final checklist:',
    `  [${readiness >= 0.85 ? 'x' : ' '}] Overall readiness >= 85%`,
    `  [${needs.length === 0 ? 'x' : ' '}] No topics below 70%`,
    `  [${unseen.length === 0 ? 'x' : ' '}] All objectives started`,
    `  [${cliReady != null && cliReady >= 70 ? 'x' : ' '}] CLI labs >= 70%`)
  return out.join('\n')
}

function repWeakAreas(ctx) {
  const { summary, progress } = ctx
  const rows = summary.perObjective.filter(o => o.attempts > 0)
  const weak = [...rows].filter(o => o.status !== 'mastered').sort((a, b) => a.mastery - b.mastery).slice(0, 12)
  const lowConf = rows.filter(o => o.hardCount >= 2)
  const hidden = rows.filter(o => { const b = masteryBreakdown(progress[o.id]); return b.has && b.acc < 0.7 && b.conf >= 0.6 })
  const missedTop = Object.entries(summary.missedByObj).sort((a, b) => b[1] - a[1])

  const out = [reportHeader('Weak Areas Report')]
  out.push('Lowest mastery (focus here first):')
  ;(weak.length ? weak : [{ id: '', title: 'none — great work' }]).forEach(o => out.push(`  - ${o.id} ${o.title}${o.mastery != null ? ` — ${fmtPct(o.mastery)}` : ''}`.trimEnd()))
  out.push('', 'Most-missed concepts:')
  ;(missedTop.length ? missedTop : [['', 0]]).forEach(([id, n]) => { const o = ALL_OBJECTIVES.find(x => x.id === id); out.push(`  - ${id} ${o ? o.title : ''}${n ? ` (missed ${n}x)` : ' none'}`.trimEnd()) })
  out.push('', 'Low confidence (rated Hard / Need practice):')
  ;(lowConf.length ? lowConf : [{ id: '', title: 'none' }]).forEach(o => out.push(`  - ${o.id} ${o.title}`.trimEnd()))
  out.push('', 'Hidden weakness (confident but inaccurate — priority):')
  ;(hidden.length ? hidden : [{ id: '', title: 'none' }]).forEach(o => out.push(`  - ${o.id} ${o.title}`.trimEnd()))
  return out.join('\n')
}

function repQuizPerformance(ctx) {
  const { progress, quizBank } = ctx
  const out = [reportHeader('Quiz Performance Report')]
  let any = false
  ALL_OBJECTIVES.forEach(o => {
    const p = progress[o.id]
    if (!p?.quizScores?.length) return
    any = true
    const first = p.quizScores[0], last = p.quizScores[p.quizScores.length - 1]
    const bestAcc = Math.max(...p.quizScores.map(s => s.score / Math.max(s.total, 1)))
    const bank = (quizBank[o.id] || []).length
    const ratings = p.confidenceRatings || []
    const conf = ratings.length ? `${ratings.filter(r => r === 'easy' || r === 'medium').length}/${ratings.length} confident` : 'no ratings'
    out.push(`${o.id} ${o.title}`)
    out.push(`  sessions: ${p.quizScores.length} · first ${first.score}/${first.total} -> last ${last.score}/${last.total} · best ${fmtPct(bestAcc)} · bank ${bank}Q · ${conf}`)
  })
  if (!any) out.push('No quizzes taken yet.')
  return out.join('\n')
}

function repCliLab(ctx) {
  const { cliStats } = ctx
  const out = [reportHeader('CLI Lab Report')]
  const entries = Object.entries(cliStats)
  if (entries.length === 0) { out.push('No CLI labs completed yet.'); return out.join('\n') }
  entries.sort((a, b) => (b[1].bestScore || 0) - (a[1].bestScore || 0)).forEach(([id, s]) => {
    const o = ALL_OBJECTIVES.find(x => x.id === id)
    out.push(`${id} ${o ? o.title : ''}`)
    out.push(`  best ${s.bestScore || 0}% · last ${s.lastScore || 0}% · runs ${s.runs || 0} · commands ${s.commandsEntered || 0} · syntax errors ${s.syntaxErrors || 0} · wrong-mode ${s.wrongModeErrors || 0} · hints ${s.hintsUsed || 0}`)
  })
  const tot = entries.reduce((t, [, s]) => ({ syntax: t.syntax + (s.syntaxErrors || 0), mode: t.mode + (s.wrongModeErrors || 0) }), { syntax: 0, mode: 0 })
  out.push('', `Totals: ${tot.syntax} syntax errors, ${tot.mode} wrong-mode errors across ${entries.length} lab(s).`)
  return out.join('\n')
}

function repMissedPacket(ctx) {
  const { missed } = ctx
  const out = [reportHeader('Missed-Question Review Packet')]
  if (!missed.length) { out.push('No missed questions — nothing to cram!'); return out.join('\n') }
  out.push(`${missed.length} question(s) to review. Cover the answers and quiz yourself.`, '')
  missed.forEach((m, i) => {
    const o = ALL_OBJECTIVES.find(x => x.id === m.objectiveId)
    out.push(`Q${i + 1}. [${m.objectiveId} ${o ? o.title : ''}]`)
    out.push(`  ${m.question}`)
    m.choices.forEach((c, ci) => out.push(`    ${String.fromCharCode(65 + ci)}. ${c}`))
    out.push(`  Answer: ${String.fromCharCode(65 + m.correctIndex)}. ${m.choices[m.correctIndex]}`)
    if (m.explanation) out.push(`  Why: ${m.explanation}`)
    out.push('')
  })
  return out.join('\n')
}

function repOfflineSummary(ctx) {
  const { offlineDetail } = ctx
  const out = [reportHeader('Offline Module Summary')]
  const ready = ALL_OBJECTIVES.filter(o => offlineDetail[o.id]?.ready)
  const partial = ALL_OBJECTIVES.filter(o => { const d = offlineDetail[o.id]; return d && d.count > 0 && !d.ready })
  out.push(`Offline-ready modules: ${ready.length}/${ALL_OBJECTIVES.length}`, '')
  out.push('Ready (works fully offline):')
  ;(ready.length ? ready : [{ id: '', title: 'none yet' }]).forEach(o => out.push(`  ⤓ ${o.id} ${o.title}`.trimEnd()))
  out.push('', 'In progress:')
  ;(partial.length ? partial : [{ id: '', title: 'none' }]).forEach(o => { const d = offlineDetail[o.id]; out.push(`  ${o.id} ${o.title} — ${d ? d.count : 0}/4 assets`.trimEnd()) })
  return out.join('\n')
}

function repOfflineStudyPacket(ctx) {
  const { offlineDetail, explainCache, termsCache, visualCache, quizBank } = ctx
  const out = [reportHeader('Offline Study Packet')]
  const ready = ALL_OBJECTIVES.filter(o => offlineDetail[o.id]?.ready)
  if (!ready.length) { out.push('No fully offline-ready modules yet. Master a topic (or tap "Make available offline") to build a packet.'); return out.join('\n') }
  ready.forEach(o => {
    out.push(rule(`${o.id} ${o.title}`))
    const ex = explainCache[o.id]
    if (ex && typeof ex === 'object') {
      if (ex.definition) out.push('', ex.definition)
      if (ex.keyPoints?.length) { out.push('', 'Key points:'); ex.keyPoints.forEach(p => out.push(`  • ${p}`)) }
      if (ex.commonMistakes?.length) { out.push('', 'Common mistakes:'); ex.commonMistakes.forEach(p => out.push(`  • ${p}`)) }
    } else if (ex) {
      out.push('', ex) // legacy prose
    }
    const terms = termsCache[o.id]
    if (terms?.length) { out.push('', 'Key terms:'); terms.forEach(t => out.push(`  • ${t.term}: ${t.detail}`)) }
    const v = visualCache[o.id]
    if (v) { out.push('', `Visual (${v.type}): ${v.title}`); (v.steps || v.layers || []).forEach((s, i) => out.push(`  ${i + 1}. ${typeof s === 'string' ? s : s.label}`)) }
    const bank = quizBank[o.id] || []
    if (bank.length) { out.push('', 'Practice questions:'); bank.forEach((q, i) => { out.push(`  ${i + 1}. ${q.question}`); out.push(`     Answer: ${q.choices[q.correctIndex]}`) }) }
    out.push('')
  })
  return out.join('\n')
}

function repProgressTimeline(ctx) {
  const { progress, streak } = ctx
  const out = [reportHeader('Progress Timeline')]
  out.push(`Current streak: ${streak?.count || 0} day(s)`, '')
  const items = []
  ALL_OBJECTIVES.forEach(o => {
    const p = progress[o.id]
    if (!p?.quizScores?.length) return
    const first = p.quizScores[0], last = p.quizScores[p.quizScores.length - 1]
    items.push({ o, first, last, delta: (last.score / Math.max(last.total, 1)) - (first.score / Math.max(first.total, 1)), date: first.date })
  })
  if (!items.length) { out.push('No timeline yet — take some quizzes to track growth.'); return out.join('\n') }
  items.sort((a, b) => a.date - b.date).forEach(it => {
    const d = new Date(it.first.date).toLocaleDateString()
    const arrow = it.delta > 0.01 ? `▲ +${fmtPct(it.delta)}` : it.delta < -0.01 ? `▼ ${fmtPct(it.delta)}` : '–'
    out.push(`${d}  ${it.o.id} ${it.o.title}: ${it.first.score}/${it.first.total} -> ${it.last.score}/${it.last.total}  ${arrow}`)
  })
  return out.join('\n')
}

function repInstructor(ctx) {
  const { summary, events } = ctx
  const out = [reportHeader('Instructor / Coach Report')]
  const overall = summary.perObjective.reduce((s, o) => s + o.mastery, 0) / summary.perObjective.length
  const mastered = summary.perObjective.filter(o => o.status === 'mastered').length
  const quizDone = events.filter(e => e.type === 'user_completed_quiz').length
  const cliDone = events.filter(e => e.type === 'user_completed_cli_lab').length
  out.push(`Overall mastery: ${fmtPct(overall)} · ${mastered}/${summary.perObjective.length} mastered`)
  out.push(`Engagement: ${quizDone} quiz session(s), ${cliDone} CLI lab(s) completed`, '')
  out.push('Per-domain:')
  summary.domainStats.forEach(d => out.push(`  - ${d.name}: ${fmtPct(d.avg)} (${d.mastered}/${d.total})`))
  const weak = [...summary.perObjective].filter(o => o.status !== 'mastered' && o.attempts > 0).sort((a, b) => a.mastery - b.mastery).slice(0, 6)
  out.push('', 'Recommended focus for next session:')
  ;(weak.length ? weak : [{ id: '', title: 'student is on track' }]).forEach(o => out.push(`  - ${o.id} ${o.title}`.trimEnd()))
  return out.join('\n')
}

function repFullPortfolio(ctx) {
  return [repStudentProgress(ctx), '', repCertReadiness(ctx), '', repWeakAreas(ctx), '', repCliLab(ctx), '', repProgressTimeline(ctx)].join('\n\n')
}

function repRawData(ctx) {
  return JSON.stringify({
    exportedAt: new Date().toISOString(),
    progress: ctx.progress,
    missed: ctx.missed,
    quizBank: ctx.quizBank,
    cliStats: ctx.cliStats,
    streak: ctx.streak,
    events: ctx.events,
  }, null, 2)
}

const REPORTS = [
  { key: 'progress', label: 'Student Progress', desc: 'Per-domain mastery checklist', ext: 'txt', build: repStudentProgress },
  { key: 'cert', label: 'Certification Readiness', desc: 'Are you exam-ready?', ext: 'txt', build: repCertReadiness },
  { key: 'weak', label: 'Weak Areas', desc: 'Focused improvement map', ext: 'txt', build: repWeakAreas },
  { key: 'quiz', label: 'Quiz Performance', desc: 'Accuracy & growth per topic', ext: 'txt', build: repQuizPerformance },
  { key: 'cli', label: 'CLI Lab Report', desc: 'Command skills & error trends', ext: 'txt', build: repCliLab },
  { key: 'missed', label: 'Missed-Question Packet', desc: 'Auto cram sheet', ext: 'txt', build: repMissedPacket },
  { key: 'offlineSum', label: 'Offline Module Summary', desc: 'What works offline', ext: 'txt', build: repOfflineSummary },
  { key: 'offlinePacket', label: 'Offline Study Packet', desc: 'Full self-contained notes', ext: 'txt', build: repOfflineStudyPacket },
  { key: 'timeline', label: 'Progress Timeline', desc: 'Growth over time', ext: 'txt', build: repProgressTimeline },
  { key: 'instructor', label: 'Instructor / Coach', desc: 'Summary for a mentor', ext: 'txt', build: repInstructor },
  { key: 'portfolio', label: 'Full Portfolio', desc: 'Everything combined', ext: 'txt', build: repFullPortfolio },
  { key: 'raw', label: 'Raw Data (JSON)', desc: 'Backup / transfer', ext: 'json', build: repRawData },
]

const MODAL_Z = 300

async function importCcnaJsonFromFile(file, onImport) {
  const parsed = JSON.parse(await file.text())
  if (!parsed || typeof parsed !== 'object' || (!parsed.progress && !parsed.quizBank && !parsed.missed)) {
    return { ok: false, message: 'That file does not look like a CCNA data export.' }
  }
  await onImport(parsed)
  return { ok: true, message: 'Imported and merged ✓' }
}

function ExportModal({ progress, missed, streak, onImport, onClose }) {
  const [ctx, setCtx] = useState(null)
  const [selected, setSelected] = useState('progress')
  const [copied, setCopied] = useState(false)
  const [importMsg, setImportMsg] = useState('')
  const fileRef = useRef(null)
  const dialogRef = useRef(null)
  useFocusTrap(dialogRef)

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const result = await importCcnaJsonFromFile(file, onImport)
      setImportMsg(result.message)
    } catch {
      setImportMsg('Could not read that file (must be a valid JSON export).')
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [summary, quizBank, cliStats, events, offlineDetail, explainCache, termsCache, visualCache] = await Promise.all([
        buildLearnerSummary(progress, missed || []),
        loadQuizBank(),
        loadCliStats(),
        window.storage.getItem(STORAGE_KEYS.events),
        loadOfflineDetail(),
        window.storage.getItem(EXPLAIN_CACHE_KEY),
        window.storage.getItem(TERMS_CACHE_KEY),
        window.storage.getItem(VISUAL_CACHE_KEY),
      ])
      if (!cancelled) setCtx({
        progress, missed: missed || [], streak, summary, quizBank, cliStats,
        events: events || [], offlineDetail,
        explainCache: explainCache || {}, termsCache: termsCache || {}, visualCache: visualCache || {},
      })
    })()
    return () => { cancelled = true }
  }, [progress, missed, streak])

  const report = REPORTS.find(r => r.key === selected)
  const text = useMemo(() => (ctx ? report.build(ctx) : ''), [ctx, report])

  async function copy() {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { setCopied(false) }
  }
  function download() {
    const blob = new Blob([text], { type: report.ext === 'json' ? 'application/json' : 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ccna-${report.key}-${todayStr()}.${report.ext}`
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div ref={dialogRef} className="ccna-overlay" role="dialog" aria-modal="true" aria-labelledby="export-modal-title" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: MODAL_Z, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={onClose}>
      <div className="ccna-sheet" style={{ ...styles.card, marginBottom: 0, paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }} onClick={e => e.stopPropagation()}>
        <h2 id="export-modal-title" style={styles.h2}>Export Reports</h2>
        <p style={{ ...styles.small, marginBottom: 12 }}>All reports are {STATIC_COPY.reports}.</p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          {REPORTS.map(r => {
            const active = r.key === selected
            return (
              <button
                key={r.key}
                onClick={() => setSelected(r.key)}
                title={r.desc}
                style={{
                  flex: '1 1 auto', minHeight: 40, borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
                background: active ? COLORS.brandDim : COLORS.surface,
                border: `1px solid ${active ? COLORS.brandGlow : COLORS.border}`,
                color: active ? COLORS.brandGlow : COLORS.silverMid,
                  fontSize: 'var(--ccna-type-xs)', fontWeight: 600, padding: '8px 10px', whiteSpace: 'nowrap',
                }}
              >{r.label}</button>
            )
          })}
        </div>

        <div style={{ ...styles.small, marginBottom: 6, color: COLORS.silverMid }}>{report.desc}</div>
        {!ctx ? (
          <Spinner label="Building report..." />
        ) : (
          <textarea
            readOnly
            value={text}
            style={{ ...styles.input, height: 260, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 'var(--ccna-type-xs)', resize: 'vertical', whiteSpace: 'pre' }}
          />
        )}
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <button style={styles.primaryBtn} onClick={copy} disabled={!ctx}>{copied ? 'Copied!' : 'Copy'}</button>
          <button style={styles.secondaryBtn} onClick={download} disabled={!ctx}>Download .{report.ext}</button>
        </div>

        <div style={{ borderTop: `1px solid ${COLORS.border}`, marginTop: 14, paddingTop: 12 }}>
          <div style={{ ...styles.small, marginBottom: 6 }}>Restore from a backup — import a “Raw Data (JSON)” export. Your current data is merged in, never overwritten.</div>
          <input ref={fileRef} type="file" accept="application/json,.json" style={{ display: 'none' }} onChange={handleFile} />
          <button style={styles.secondaryBtn} onClick={() => fileRef.current?.click()}>Import data (.json)</button>
          {importMsg && <div style={{ ...styles.small, marginTop: 6, color: importMsg.includes('✓') ? COLORS.mint : COLORS.rose }}>{importMsg}</div>}
        </div>

        <button style={{ ...styles.secondaryBtn, marginTop: 12, background: 'none', border: 'none', color: COLORS.silverMid }} onClick={onClose}>Close</button>
      </div>
    </div>
  )
}

/* =========================================================================
   SYNC MODAL — link devices with a shareable code
   ========================================================================= */
function SyncModal({ syncCode, lastSynced, busy, msg, online, onGenerate, onLink, onSyncNow, onUnlink, onClose }) {
  const [entry, setEntry] = useState('')
  const [copied, setCopied] = useState(false)
  const dialogRef = useRef(null)
  useFocusTrap(dialogRef)

  async function copyCode() {
    try { await navigator.clipboard.writeText(syncCode); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { setCopied(false) }
  }

  return (
    <div ref={dialogRef} className="ccna-overlay" role="dialog" aria-modal="true" aria-labelledby="sync-modal-title" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: MODAL_Z, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={onClose}>
      <div className="ccna-sheet" style={{ ...styles.card, marginBottom: 0, paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }} onClick={e => e.stopPropagation()}>
        <h2 id="sync-modal-title" style={styles.h2}>Cross-Device Sync</h2>
        <p style={{ ...styles.small, marginBottom: 12 }}>
          Sync progress, quiz banks, and CLI stats across your devices with one shared code. Your data merges — nothing is overwritten or lost.
        </p>

        {!online && (
          <div style={{ background: COLORS.roseDim, border: `1px solid ${COLORS.roseBorder}`, color: COLORS.rose, fontSize: 'var(--ccna-type-xs)', borderRadius: 10, padding: 10, marginBottom: 12 }}>
            You appear offline. Sync needs a connection (and only works on the deployed site, not local dev).
          </div>
        )}

        {syncCode ? (
          <>
            <div style={{ ...styles.small, marginBottom: 6 }}>Your sync code</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <div style={{ flex: 1, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 'var(--ccna-type-lg)', letterSpacing: 1, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: '12px 14px', color: COLORS.sky }}>{syncCode}</div>
              <button style={{ ...styles.secondaryBtn, width: 'auto', padding: '0 16px' }} onClick={copyCode}>{copied ? 'Copied!' : 'Copy'}</button>
            </div>
            <p style={{ ...styles.small, marginBottom: 12 }}>On your other device: open Sync → “I have a code” → paste this. Then tap Sync now on both.</p>
            <button style={styles.primaryBtn} onClick={onSyncNow} disabled={busy || !online}>{busy ? 'Syncing…' : 'Sync now'}</button>
            <div style={{ ...styles.small, marginTop: 8, color: msg.includes('✓') ? COLORS.mint : COLORS.silverMid }}>
              {msg || (lastSynced ? `Last synced: ${new Date(lastSynced).toLocaleString()}` : 'Not synced yet.')}
            </div>
            <button style={{ ...styles.secondaryBtn, marginTop: 12, background: 'none', border: `1px solid ${COLORS.border}`, color: COLORS.silverMid }} onClick={onUnlink}>Unlink this device</button>
          </>
        ) : (
          <>
            <button style={styles.primaryBtn} onClick={onGenerate} disabled={!online}>Generate a sync code</button>
            <div style={{ textAlign: 'center', ...styles.small, margin: '12px 0' }}>— or —</div>
            <div style={{ ...styles.small, marginBottom: 6 }}>I have a code from another device</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                style={{ ...styles.input, flex: 1, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', letterSpacing: 1 }}
                value={entry}
                onChange={e => setEntry(e.target.value.toUpperCase())}
                placeholder="ABCD-EFGH-JKLM-NPQR"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
              />
              <button style={{ ...styles.primaryBtn, width: 'auto', padding: '0 16px' }} onClick={() => entry.trim() && onLink(entry.trim())} disabled={!online || !entry.trim()}>Link</button>
            </div>
            {msg && <div style={{ ...styles.small, marginTop: 8, color: COLORS.rose }}>{msg}</div>}
          </>
        )}

        <button style={{ ...styles.secondaryBtn, marginTop: 12, background: 'none', border: 'none', color: COLORS.silverMid }} onClick={onClose}>Close</button>
      </div>
    </div>
  )
}

/* =========================================================================
   OFFLINE BANNER
   ========================================================================= */
function OfflineBanner() {
  return (
    <div style={{ background: COLORS.roseDim, borderBottom: `1px solid ${COLORS.roseBorder}`, color: COLORS.rose, fontSize: 'var(--ccna-type-sm)', textAlign: 'center', padding: '8px 12px' }}>
      Offline or API unreachable — AI explanations, quizzes & tutor chat won't work, but CLI drills and subnetting/VLSM practice still will.
    </div>
  )
}

/* =========================================================================
   AI TUTOR CHAT
   ========================================================================= */
// Builds the tutor's system prompt from the learner's ACTUAL recent behaviour
// (progress, ratings, missed bank, event log) rather than static numbers.
async function buildTutorSystemPrompt(progress, missed) {
  const summary = await buildLearnerSummary(progress, missed || [])
  const behaviour = summarizeForTutor(summary)

  return `You are a friendly, encouraging CCNA 200-301 tutor and study partner. The student originally failed the exam, weakest in Network Access and IP Connectivity, so keep those a priority when relevant.

Here is the student's CURRENT activity, computed from their actual study data:
${behaviour}

Use this to give specific, contextual advice — reference their weak objectives, recurring misses, and what they studied recently by name. When they ask "what should I study?", recommend from the weakest objectives and explain why. Keep answers conversational, encouraging, and focused on CCNA exam content. Ground technical explanations in standard CCNA 200-301 material. Keep responses reasonably concise (a few short paragraphs or a short list) unless the student asks for depth.

When you discuss a specific exam concept, end that part of your answer with the matching CCNA 200-301 exam topic number(s) in parentheses, e.g. "(exam topic 1.1)", so the student can open that objective's Explain tab and verify against the cited cert guide — don't invent numbers, only cite ones you're confident map to the official blueprint.`
}

function TutorChat({ progress, missed, onBack }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [restored, setRestored] = useState(false)
  const [streamingText, setStreamingText] = useState(null)
  const scrollRef = useRef(null)

  // Restore the conversation from a previous session, if any.
  useEffect(() => {
    (async () => {
      const saved = await window.storage.getItem(STORAGE_KEYS.tutorChat)
      if (saved && Array.isArray(saved) && saved.length) setMessages(saved)
      setRestored(true)
    })()
  }, [])

  // Persist after restore so we don't immediately overwrite saved history with [].
  useEffect(() => {
    if (!restored) return
    window.storage.setItem(STORAGE_KEYS.tutorChat, messages)
  }, [messages, restored])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading, streamingText])

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    const newMessages = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    setError(null)
    setStreamingText('')
    try {
      const system = await buildTutorSystemPrompt(progress, missed)
      let acc = ''
      const reply = await askClaudeStream({
        system: cachedSystem(system),
        messages: newMessages,
        max_tokens: 800,
        feature: 'tutor',
        onDelta: chunk => { acc += chunk; setStreamingText(acc) },
      })
      setMessages(m => [...m, { role: 'assistant', content: reply }])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setStreamingText(null)
    }
  }

  function clearChat() {
    setMessages([])
    setError(null)
  }

  return (
    <div className="tutor-shell">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <button style={styles.backBtn} onClick={onBack}>‹ Back</button>
        {messages.length > 0 && (
          <button style={{ ...styles.secondaryBtn, width: 'auto', minHeight: 36, padding: '6px 14px', fontSize: 'var(--ccna-type-xs)' }} onClick={clearChat}>Clear chat</button>
        )}
      </div>
      <h1 style={styles.h1}>AI Tutor Chat</h1>
      <div ref={scrollRef} className="tutor-messages internal-scroll" style={{ marginBottom: 10 }}>
        {messages.length === 0 && (
          <div style={{ ...styles.card, background: COLORS.skyDim, border: `1px solid ${COLORS.skyBorder}` }}>
            <div style={{ fontSize: 'var(--ccna-type-sm)', lineHeight: 1.6 }}>
              Hi! I know your scores and what you've mastered so far. Ask me anything — e.g. "Explain HSRP vs VRRP" or "What should I focus on this week?"
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{
            ...styles.card,
            background: m.role === 'user' ? COLORS.purpleDim : COLORS.skyDim,
            border: `1px solid ${m.role === 'user' ? COLORS.borderGlow : COLORS.skyBorder}`,
            whiteSpace: 'pre-wrap', fontSize: 'var(--ccna-type-md)', lineHeight: 1.5,
          }}>
            <RichText text={m.content} />
          </div>
        ))}
        {loading && (
          streamingText ? (
            <div style={{ ...styles.card, background: COLORS.skyDim, border: `1px solid ${COLORS.skyBorder}`, whiteSpace: 'pre-wrap', fontSize: 'var(--ccna-type-md)', lineHeight: 1.5 }}>
              <RichText text={streamingText} />
              <span className="ccna-pulse" style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: COLORS.sky, marginLeft: 4 }} />
            </div>
          ) : (
            <Spinner label="Tutor is thinking..." />
          )
        )}
        {error && <ErrorBox message={error} onRetry={send} />}
        {messages.length > 0 && !loading && (
          <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, lineHeight: 1.5, padding: '4px 2px' }}>
            Tutor answers are AI-generated study help. Verify exam objectives, command syntax, and key terms against the{' '}
            <a href={EXAM_SOURCES.blueprintUrl} target="_blank" rel="noreferrer" style={{ color: COLORS.sky, textDecoration: 'none' }}>{EXAM_SOURCES.examName} exam topics</a>
            {' '}and {EXAM_SOURCES.references.map(r => r.title).join(', ')} — open the matching objective's Explain tab for cited definitions.
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <input
          style={{ ...styles.input, flex: 1 }}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') send() }}
          placeholder="Ask the tutor..."
        />
        <button style={{ ...styles.primaryBtn, width: 'auto', padding: '12px 18px' }} onClick={send} disabled={loading}>Send</button>
      </div>
    </div>
  )
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
  if (['mock', 'metrics', 'stats', 'review', 'missed', 'labs', 'focus', 'tutor'].includes(simple)) {
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
  const [view, setView] = useState('home') // home | objective | mock | missed | tutor | metrics | stats | focus | examtraps | subnet | routing | extrastudy
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
      const reduceMotion = await loadReduceMotion()
      applyReduceMotionPreference(reduceMotion)
      setSettingsReduceMotion(reduceMotion)
      setSettingsExamMode(await loadExamMode())
      if (!onboardDone) {
        if (Object.keys(p).length === 0) setView('onboarding')
        else await window.storage.setItem(STORAGE_KEYS.onboardDone, true)
      }
      const hashRoute = parseAppHash()
      if (hashRoute?.objective) {
        setSelectedObjective(hashRoute.objective)
        setView('objective')
      } else if (hashRoute?.view) {
        setView(hashRoute.view)
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
        setSelectedObjective(route.objective)
        setView('objective')
      } else if (route?.view) {
        setSelectedObjective(null)
        setView(route.view)
      } else {
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
    bumpSessionStudy('objective', obj.id) // #16: track objective visits for session recap
    setSelectedObjective(obj)
    setView('objective')
  }

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
            onOpenMock={() => setView('mock')}
            onOpenMissed={() => setView('missed')}
            onOpenTutor={() => setView('tutor')}
            premiumUnlocked={premiumUnlocked}
            onPremiumBlocked={handlePremiumBlocked}
            onOpenMetrics={() => setView('metrics')}
            onOpenStats={() => setView('stats')}
            onOpenSettings={() => setShowSettings(true)}
            onOpenLabs={() => setView('labs')}
            onOpenReview={() => setView('review')}
            onOpenFocus={() => setView('focus')}
            onOpenExamTraps={() => setView('examtraps')}
            onOpenSubnet={() => setView('subnet')}
            onOpenRouting={() => setView('routing')}
            onOpenExtraStudy={() => setView('extrastudy')}
            dueCount={dueCount}
            openDomain={openDomain}
            onOpenDomain={setOpenDomain}
            commandDrills={COMMAND_DRILLS}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        )}
        {view === 'objective' && selectedObjective && (
          <ObjectiveScreen
            objective={selectedObjective}
            progress={progress}
            apiOnline={apiOnline}
            offlineReady={offlineReady}
            packagingId={packagingId}
            onPackage={packageObjective}
            onBack={() => setView('home')}
            onUpdateProgress={updateProgress}
            onMissed={handleMissed}
            missed={missed}
            onOpenLab={(id) => openLab(id, 'objective')}
            onSelectObjective={selectObjective}
            onOpenMissed={() => setView('missed')}
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
        {view === 'mock' && <MockExam onExit={() => setView('home')} examMode={settingsExamMode} />}
        {view === 'missed' && <MissedReview missed={missed} onBack={() => setView('home')} onRemove={removeMissed} />}
        {view === 'tutor' && (
          premiumUnlocked
            ? <TutorChat progress={progress} missed={missed} onBack={() => setView('home')} />
            : <PremiumBlockedShell title="AI Tutor" onBack={() => setView('home')} />
        )}
        {view === 'stats' && (
          <StatsPage
            progress={progress}
            streak={streak}
            onBack={() => setView('home')}
            onOpenMetrics={() => setView('metrics')}
          />
        )}
        {view === 'metrics' && <MetricsDashboard progress={progress} missed={missed} dueCount={dueCount} onBack={() => setView('home')} onSelectObjective={selectObjective} onOpenReview={() => setView('review')} onOpenStats={() => setView('stats')} />}
        {view === 'labs' && <LabsHub onBack={() => setView('home')} onOpenLab={(id) => openLab(id, 'labs')} />}
        {view === 'lab' && selectedLab && (
          <LabView
            bundle={getLab(selectedLab)}
            onBack={() => setView(labReturn === 'objective' ? 'objective' : 'labs')}
            celebrate={celebrate}
            haptic={haptic}
          />
        )}
        {view === 'review' && <ReviewSession onBack={() => setView('home')} onMissed={handleMissed} onDone={refreshDue} onOpenSection={selectObjective} />}
        {view === 'focus' && <FocusModeSession progress={progress} onBack={() => setView('home')} onMissed={handleMissed} onDone={refreshDue} />}
        {view === 'examtraps' && <ExamTrapStudyMode styles={styles} onBack={() => setView('home')} />}
        {view === 'subnet' && <SubnetPracticeHome onBack={() => setView('home')} />}
        {view === 'routing' && <RoutingDecoderMode styles={styles} COLORS={COLORS} onBack={() => setView('home')} />}
        {view === 'extrastudy' && (
          <ExtraStudyMode
            styles={styles}
            COLORS={COLORS}
            accentColors={accentColors}
            AnswerReview={AnswerReview}
            QuestionMeta={QuestionMeta}
            McChoices={McChoices}
            onBack={() => setView('home')}
          />
        )}
      </RouteShell>
      {showBottomNav && (
        <div className="app-chrome-bottom app-chrome-bottom--dock site-column">
          <BottomNav
            active={bottomNavActive}
            compact={bottomNavCompact}
            onHome={() => setView('home')}
            onSearch={() => setShowSearch(true)}
            onMore={() => setShowSettings(true)}
          />
        </div>
      )}
      {showExport && <ExportModal progress={progress} missed={missed} streak={streak} onImport={handleImport} onClose={() => setShowExport(false)} />}
      {showSearch && <GlobalSearchModal progress={progress} onSelectObjective={selectObjective} onOpenLab={openLab} onClose={() => setShowSearch(false)} />}
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
