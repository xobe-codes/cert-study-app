// Cloudflare Pages Function — server-side proxy for the Anthropic API.
// Lives at  POST /api/claude  on the same domain as the app.
// The API key is read from the ANTHROPIC_API_KEY secret and never reaches the
// browser. The client sends the normal Messages API body; we forward it.
export async function onRequestPost({ request, env }) {
  const json = (obj, status) =>
    new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json' } })

  const apiKey = env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return json({ error: { message: 'Server is missing the ANTHROPIC_API_KEY secret.' } }, 500)
  }

  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: { message: 'Invalid JSON body.' } }, 400)
  }

  // Light safeguard against abuse of a public endpoint: cap the output size.
  if (typeof body.max_tokens === 'number') {
    body.max_tokens = Math.min(body.max_tokens, 4096)
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
