import React, { useState, useEffect } from 'react'
import { COLORS } from '../ui/appTheme.js'
import { STORAGE_KEYS } from '../storageKeys.js'

const API_URL = 'https://api.anthropic.com/v1/messages'
const PROXY_URL = '/api/claude'
// Model tiers: cheap/mechanical generation runs on Haiku, reasoning-heavy work
// (explanations, quizzes, tutor) on Sonnet. Routing per task keeps cost down.
export const MODELS = { smart: 'claude-sonnet-4-6', fast: 'claude-haiku-4-5' }
export const MODEL = MODELS.smart

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
export function AiBudgetWarning() {
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
export async function callClaude(body, retries = 2, feature = 'other') {
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
export async function askClaudeJSON({ system, messages, max_tokens = 1500, model = MODEL, schema, toolName = 'emit_result', feature = 'other', retries = 2 }) {
  const tool = { name: toolName, description: 'Return the result as structured data.', input_schema: schema }
  const data = await callClaude({
    model, max_tokens, system, messages,
    tools: [tool], tool_choice: { type: 'tool', name: toolName },
  }, retries, feature)
  const block = data?.content?.find(b => b.type === 'tool_use')
  if (!block || !block.input) throw new Error('Claude returned no structured result. Please try again.')
  return block.input
}
