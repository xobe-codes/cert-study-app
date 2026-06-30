// Cloudflare Pages Function — learner question flags for backend health registry (D1).
// POST /api/question-health { questionId, objectiveId, reason, choiceIndex?, trapId?, source? }
// GET  /api/question-health?summary=1 → aggregated flag counts for registry export
export async function onRequest({ request, env }) {
  const json = (obj, status) =>
    new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json' } })

  if (!env.DB) {
    return json({ error: 'Question health API not configured (missing D1 binding "DB").' }, 500)
  }

  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS question_health_flags (
      question_id TEXT NOT NULL,
      reason TEXT NOT NULL,
      objective_id TEXT,
      choice_index INTEGER,
      trap_id TEXT,
      source TEXT DEFAULT 'learner',
      count INTEGER DEFAULT 1,
      last_at INTEGER NOT NULL,
      PRIMARY KEY (question_id, reason, source)
    )`
  ).run()

  if (request.method === 'GET') {
    const url = new URL(request.url)
    if (url.searchParams.get('summary') !== '1') {
      return json({ error: 'Use ?summary=1 for aggregated counts.' }, 400)
    }
    const rows = await env.DB.prepare(
      'SELECT question_id, SUM(count) AS total FROM question_health_flags GROUP BY question_id ORDER BY total DESC'
    ).all()
    const counts = {}
    for (const row of rows.results || []) {
      counts[row.question_id] = row.total
    }
    return json({ counts, generatedAt: Date.now() }, 200)
  }

  if (request.method === 'POST') {
    let body
    try { body = await request.json() } catch { return json({ error: 'Invalid JSON.' }, 400) }
    const {
      questionId, objectiveId, reason, choiceIndex = null, trapId = null, source = 'learner',
    } = body || {}
    if (!questionId || !objectiveId || !reason) {
      return json({ error: 'Missing questionId, objectiveId, or reason.' }, 400)
    }
    const now = Date.now()
    await env.DB.prepare(
      `INSERT INTO question_health_flags (question_id, reason, objective_id, choice_index, trap_id, source, count, last_at)
       VALUES (?, ?, ?, ?, ?, ?, 1, ?)
       ON CONFLICT(question_id, reason, source) DO UPDATE SET
         count = count + 1,
         last_at = excluded.last_at,
         objective_id = excluded.objective_id,
         choice_index = COALESCE(excluded.choice_index, question_health_flags.choice_index),
         trap_id = COALESCE(excluded.trap_id, question_health_flags.trap_id)`
    ).bind(questionId, reason, objectiveId, choiceIndex, trapId, source, now).run()
    return json({ ok: true, questionId, reason }, 200)
  }

  return json({ error: 'Method not allowed.' }, 405)
}
