// Cloudflare Pages Function — unified learning state API (D1).
// GET  /api/learning-state?userId=X  -> returns the unified learning state for user X
// POST /api/learning-state            -> updates mastery, performance, activities
//
// Provides read/write access to the learning_states and objective_performance tables
// created by the 001_unified_learning_state migration.
// Requires a D1 binding named DB (see wrangler.toml).

export async function onRequest({ request, env }) {
  const json = (obj, status) =>
    new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json' } })

  if (!env.DB) {
    return json({ error: 'Learning state API not configured (missing D1 binding "DB").' }, 500)
  }

  if (request.method === 'GET') {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')

    if (!userId) {
      return json({ error: 'Missing userId query parameter.' }, 400)
    }

    try {
      // Fetch the learning state for this user
      const learningState = await env.DB
        .prepare('SELECT * FROM learning_states WHERE user_id = ?')
        .bind(userId)
        .first()

      if (!learningState) {
        return json({ data: null, message: 'No learning state found for this user.' }, 200)
      }

      // Fetch all objective performance records for this user
      const objectivePerformances = await env.DB
        .prepare(
          'SELECT performance_id, user_id, domain_id, objective_id, status, last_attempt_score, best_score, attempt_count, average_score, success_rate, mastered_date, next_refresh_date, weak_topics FROM objective_performance WHERE user_id = ? ORDER BY domain_id, objective_id'
        )
        .bind(userId)
        .all()

      // Parse JSON fields if present
      if (learningState.mastered_domains) {
        try {
          learningState.mastered_domains = JSON.parse(learningState.mastered_domains)
        } catch {
          learningState.mastered_domains = []
        }
      }
      if (learningState.certified_domains) {
        try {
          learningState.certified_domains = JSON.parse(learningState.certified_domains)
        } catch {
          learningState.certified_domains = []
        }
      }

      // Parse weak_topics in objective performances
      const performances = (objectivePerformances.results || []).map(perf => {
        if (perf.weak_topics) {
          try {
            perf.weak_topics = JSON.parse(perf.weak_topics)
          } catch {
            perf.weak_topics = []
          }
        }
        return perf
      })

      return json(
        {
          learningState,
          objectivePerformances: performances,
          timestamp: Date.now(),
        },
        200
      )
    } catch (err) {
      return json({ error: 'Database query failed.', details: err.message }, 500)
    }
  }

  if (request.method === 'POST') {
    let body
    try {
      body = await request.json()
    } catch {
      return json({ error: 'Invalid JSON body.' }, 400)
    }

    const {
      userId,
      examReadinessScore,
      examReadinessConfidence,
      masteredDomains,
      certifiedDomains,
      objectiveUpdates,
    } = body || {}

    if (!userId) {
      return json({ error: 'Missing userId in request body.' }, 400)
    }

    try {
      // Ensure learning_states table exists
      await env.DB.prepare(
        `CREATE TABLE IF NOT EXISTS learning_states (
          user_id VARCHAR(255) PRIMARY KEY,
          exam_readiness_score INT DEFAULT 0,
          exam_readiness_confidence DECIMAL(3, 2) DEFAULT 0.0,
          estimated_exam_ready_date DATETIME NULL,
          is_exam_ready BOOLEAN DEFAULT FALSE,
          mastered_domains JSON DEFAULT '[]',
          certified_domains JSON DEFAULT '[]',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          schema_version VARCHAR(20) DEFAULT '1.0.0',
          INDEX idx_user_exam_readiness (user_id, exam_readiness_score),
          INDEX idx_updated_at (updated_at)
        )`
      ).run()

      // Upsert the learning state
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ')

      await env.DB.prepare(
        `INSERT INTO learning_states (
          user_id, exam_readiness_score, exam_readiness_confidence,
          mastered_domains, certified_domains, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
          exam_readiness_score = COALESCE(excluded.exam_readiness_score, learning_states.exam_readiness_score),
          exam_readiness_confidence = COALESCE(excluded.exam_readiness_confidence, learning_states.exam_readiness_confidence),
          mastered_domains = COALESCE(excluded.mastered_domains, learning_states.mastered_domains),
          certified_domains = COALESCE(excluded.certified_domains, learning_states.certified_domains),
          updated_at = excluded.updated_at`
      )
        .bind(
          userId,
          examReadinessScore ?? 0,
          examReadinessConfidence ?? 0.0,
          masteredDomains ? JSON.stringify(masteredDomains) : '[]',
          certifiedDomains ? JSON.stringify(certifiedDomains) : '[]',
          now
        )
        .run()

      // Process objective performance updates if provided
      let objectiveResults = []
      if (Array.isArray(objectiveUpdates) && objectiveUpdates.length > 0) {
        // Ensure objective_performance table exists
        await env.DB.prepare(
          `CREATE TABLE IF NOT EXISTS objective_performance (
            performance_id INT AUTO_INCREMENT PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL,
            domain_id VARCHAR(10) NOT NULL,
            objective_id VARCHAR(20) NOT NULL,
            status ENUM('NOT_STARTED', 'LEARNING', 'COMPETENT', 'PROFICIENT', 'MASTERED', 'REFRESHING', 'STALE') DEFAULT 'NOT_STARTED',
            last_attempt_score INT NULL,
            best_score INT DEFAULT 0,
            attempt_count INT DEFAULT 0,
            average_score DECIMAL(5, 2) DEFAULT 0.0,
            success_rate DECIMAL(5, 2) DEFAULT 0.0,
            mastered_date DATETIME NULL,
            tested_out_date DATETIME NULL,
            certification_date DATETIME NULL,
            next_refresh_date DATETIME NULL,
            last_refresh_date DATETIME NULL,
            refresh_count INT DEFAULT 0,
            weak_topics JSON DEFAULT '[]',
            weak_count INT DEFAULT 0,
            last_attempt_date DATETIME NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY uk_user_objective (user_id, objective_id),
            FOREIGN KEY (user_id) REFERENCES learning_states(user_id) ON DELETE CASCADE,
            INDEX idx_user_status (user_id, status),
            INDEX idx_user_domain (user_id, domain_id),
            INDEX idx_next_refresh (user_id, next_refresh_date),
            INDEX idx_mastered_date (mastered_date)
          )`
        ).run()

        // Upsert each objective performance record
        for (const update of objectiveUpdates) {
          const {
            domainId,
            objectiveId,
            status,
            lastAttemptScore,
            bestScore,
            attemptCount,
            averageScore,
            successRate,
            masteredDate,
            weakTopics,
          } = update

          if (!domainId || !objectiveId) {
            continue // Skip invalid records
          }

          await env.DB.prepare(
            `INSERT INTO objective_performance (
              user_id, domain_id, objective_id, status, last_attempt_score, best_score,
              attempt_count, average_score, success_rate, mastered_date, weak_topics, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id, objective_id) DO UPDATE SET
              status = COALESCE(excluded.status, objective_performance.status),
              last_attempt_score = COALESCE(excluded.last_attempt_score, objective_performance.last_attempt_score),
              best_score = COALESCE(excluded.best_score, objective_performance.best_score),
              attempt_count = COALESCE(excluded.attempt_count, objective_performance.attempt_count),
              average_score = COALESCE(excluded.average_score, objective_performance.average_score),
              success_rate = COALESCE(excluded.success_rate, objective_performance.success_rate),
              mastered_date = COALESCE(excluded.mastered_date, objective_performance.mastered_date),
              weak_topics = COALESCE(excluded.weak_topics, objective_performance.weak_topics),
              updated_at = excluded.updated_at`
          )
            .bind(
              userId,
              domainId,
              objectiveId,
              status || 'NOT_STARTED',
              lastAttemptScore ?? null,
              bestScore ?? 0,
              attemptCount ?? 0,
              averageScore ?? 0.0,
              successRate ?? 0.0,
              masteredDate ?? null,
              weakTopics ? JSON.stringify(weakTopics) : '[]',
              now
            )
            .run()

          objectiveResults.push({ objectiveId, domainId, status: 'updated' })
        }
      }

      return json(
        {
          ok: true,
          userId,
          updated: {
            learningState: true,
            objectivePerformances: objectiveResults.length,
          },
          timestamp: Date.now(),
        },
        200
      )
    } catch (err) {
      return json({ error: 'Database update failed.', details: err.message }, 500)
    }
  }

  return json({ error: 'Method not allowed.' }, 405)
}
