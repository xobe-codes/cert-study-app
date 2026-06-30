import { useState, useEffect } from 'react'
import { STORAGE_KEYS } from '../storageKeys.js'

const API_URL = 'https://api.anthropic.com/v1/messages'
const PROXY_URL = '/api/claude'
export const MODELS = { smart: 'claude-sonnet-4-6', fast: 'claude-haiku-4-5' }
export const MODEL = MODELS.smart

export function cachedSystem(text) {
  return [{ type: 'text', text, cache_control: { type: 'ephemeral' } }]
}

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

let _sessionAiCalls = 0
const _aiCallListeners = new Set()
function bumpSessionAiCalls() {
  _sessionAiCalls += 1
  _aiCallListeners.forEach(fn => fn(_sessionAiCalls))
}
function getSessionAiCalls() { return _sessionAiCalls }
function subscribeAiCalls(fn) { _aiCallListeners.add(fn); return () => _aiCallListeners.delete(fn) }

export function useAiCallCount() {
  const [count, setCount] = useState(() => getSessionAiCalls())
  useEffect(() => subscribeAiCalls(setCount), [])
  return count
}

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

export async function askClaude({ system, messages, max_tokens = 1000, model = MODEL, feature = 'other', retries = 2 }) {
  const data = await callClaude({ model, max_tokens, system, messages }, retries, feature)
  const text = data?.content?.find(b => b.type === 'text')?.text
  if (!text) throw new Error('Claude API returned an empty response.')
  return text
}

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

export async function askClaudeStream({ system, messages, max_tokens = 1000, model = MODEL, feature = 'other', onDelta }) {
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
    buffer = lines.pop()
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

export const QUIZ_SCHEMA = {
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

export const MOCK_SCHEMA = {
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

export const TERMS_SCHEMA = {
  type: 'object', required: ['cards'],
  properties: { cards: { type: 'array', items: {
    type: 'object', required: ['term', 'detail'],
    properties: { term: { type: 'string' }, detail: { type: 'string' } },
  } } },
}

export const VISUAL_SCHEMA = {
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

export async function checkApiReachable() {
  try {
    const res = await claudeFetch({ model: MODELS.fast, max_tokens: 1, messages: [{ role: 'user', content: 'hi' }] })
    return res.status !== 0
  } catch {
    return false
  }
}

export { AiBudgetWarning, AiCallsIndicator } from './claudeClientIndicators.jsx'
