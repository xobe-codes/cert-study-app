// Cloudflare Pages Function — cross-device progress sync, backed by D1.
// GET  /api/sync?code=XXXX  -> returns the stored bundle for that sync code
// POST /api/sync { code, data } -> upserts the bundle for that sync code
//
// The "code" is a long random string the user shares between their own
// devices — whoever holds it can read/write that one row. No accounts.
// Requires a D1 binding named DB (see deploy instructions).
export async function onRequest({ request, env }) {
  const json = (obj, status) =>
    new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json' } })

  if (!env.DB) {
    return json({ error: 'Sync is not configured (missing D1 binding "DB").' }, 500)
  }

  // Make sure the table exists (cheap; runs once effectively).
  await env.DB.prepare(
    'CREATE TABLE IF NOT EXISTS sync (code TEXT PRIMARY KEY, data TEXT, updated_at INTEGER)'
  ).run()

  if (request.method === 'GET') {
    const code = new URL(request.url).searchParams.get('code')
    if (!code) return json({ error: 'Missing code.' }, 400)
    const row = await env.DB.prepare('SELECT data, updated_at FROM sync WHERE code = ?').bind(code).first()
    if (!row) return json({ data: null }, 200)
    let data = null
    try { data = JSON.parse(row.data) } catch { data = null }
    return json({ data, updated_at: row.updated_at }, 200)
  }

  if (request.method === 'POST') {
    let body
    try { body = await request.json() } catch { return json({ error: 'Invalid JSON.' }, 400) }
    const { code, data } = body || {}
    if (!code || !data) return json({ error: 'Missing code or data.' }, 400)
    const now = Date.now()
    await env.DB.prepare(
      'INSERT INTO sync (code, data, updated_at) VALUES (?, ?, ?) ' +
      'ON CONFLICT(code) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at'
    ).bind(code, JSON.stringify(data), now).run()
    return json({ ok: true, updated_at: now }, 200)
  }

  return json({ error: 'Method not allowed.' }, 405)
}
