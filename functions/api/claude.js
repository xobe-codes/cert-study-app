// Cloudflare Pages Function — server-side proxy for the Anthropic API.
// Lives at  POST /api/claude  on the same domain as the app.
// The API key is read from the ANTHROPIC_API_KEY secret and never reaches the
// browser. The client sends the normal Messages API body; we forward it.
//
// This is a public, unauthenticated endpoint (no accounts in this app), so it
// needs its own abuse controls rather than relying on auth:
//   - same-origin check (blocks direct/scripted hits that don't set Origin
//     the way a browser fetch() from this app does)
//   - model allowlist (blocks using this as a free proxy to any Anthropic model)
//   - request size cap (input tokens cost money too — the old code only capped
//     max_tokens, i.e. output)
//   - per-IP rate limit, backed by the D1 database already bound for /api/sync
//     (no new infra to provision — reuses the existing `DB` binding)
// None of this is bulletproof (Origin/IP can be spoofed by a determined
// attacker), but it closes the "anyone who finds this URL can spend the
// site's API budget without limit" gap.

// Must match src/ai/claudeClient.js's MODELS — kept as a literal here because
// Pages Functions build independently from the app's src/ tree.
const ALLOWED_MODELS = new Set(['claude-sonnet-4-6', 'claude-haiku-4-5'])
const MAX_TOKENS_CAP = 4096
const MAX_MESSAGES_JSON_LENGTH = 60_000 // generous headroom over real tutor/quiz-gen payloads
const RATE_LIMIT_PER_HOUR = 30

function isSameOrigin(request) {
  const origin = request.headers.get('origin')
  if (!origin) return false // modern browsers send Origin on POST fetch(), even same-origin
  try {
    return new URL(origin).host === new URL(request.url).host
  } catch {
    return false
  }
}

async function checkRateLimit(env, ip) {
  if (!env.DB || !ip) return true // fail open if D1 isn't bound or IP is unknown — origin check still applies
  await env.DB.prepare(
    'CREATE TABLE IF NOT EXISTS claude_rate_limits (ip TEXT NOT NULL, hour_bucket INTEGER NOT NULL, count INTEGER NOT NULL, PRIMARY KEY (ip, hour_bucket))',
  ).run()
  const hourBucket = Math.floor(Date.now() / 3_600_000)
  await env.DB.prepare(
    'INSERT INTO claude_rate_limits (ip, hour_bucket, count) VALUES (?, ?, 1) ' +
    'ON CONFLICT(ip, hour_bucket) DO UPDATE SET count = count + 1',
  ).bind(ip, hourBucket).run()
  const row = await env.DB.prepare(
    'SELECT count FROM claude_rate_limits WHERE ip = ? AND hour_bucket = ?',
  ).bind(ip, hourBucket).first()
  return (row?.count || 0) <= RATE_LIMIT_PER_HOUR
}

export async function onRequestPost({ request, env }) {
  const json = (obj, status) =>
    new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json' } })

  const apiKey = env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return json({ error: { message: 'Server is missing the ANTHROPIC_API_KEY secret.' } }, 500)
  }

  if (!isSameOrigin(request)) {
    return json({ error: { message: 'Requests must originate from the app.' } }, 403)
  }

  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: { message: 'Invalid JSON body.' } }, 400)
  }

  if (!ALLOWED_MODELS.has(body.model)) {
    return json({ error: { message: 'Unsupported model.' } }, 400)
  }

  if (JSON.stringify(body.messages || []).length > MAX_MESSAGES_JSON_LENGTH) {
    return json({ error: { message: 'Request payload too large.' } }, 413)
  }

  if (typeof body.max_tokens === 'number') {
    body.max_tokens = Math.min(body.max_tokens, MAX_TOKENS_CAP)
  }

  const ip = request.headers.get('cf-connecting-ip')
  let withinLimit = true
  try {
    withinLimit = await checkRateLimit(env, ip)
  } catch {
    withinLimit = true // rate-limit bookkeeping failing shouldn't take the feature down
  }
  if (!withinLimit) {
    return json({ error: { message: 'Rate limit exceeded. Try again later.' } }, 429)
  }

  let upstream
  try {
    upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    })
  } catch {
    return json({ error: { message: 'Upstream request to Anthropic failed.' } }, 502)
  }

  // Streaming requests: pipe the SSE body straight through as it arrives.
  if (body.stream) {
    return new Response(upstream.body, {
      status: upstream.status,
      headers: { 'content-type': upstream.headers.get('content-type') || 'text/event-stream' },
    })
  }

  // Pass Anthropic's response (and status code) straight back to the client.
  const text = await upstream.text()
  return new Response(text, {
    status: upstream.status,
    headers: { 'content-type': 'application/json' },
  })
}
