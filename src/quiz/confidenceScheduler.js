/**
 * Confidence → SRS / pick weights.
 * Ratings: easy | medium | hard | practice
 */
export const CONFIDENCE_RATINGS = ['easy', 'medium', 'hard', 'practice']

const DAY_MS = 86400000
export const SRS_LADDER = [2, 7, 14, 30, 60]

/**
 * Relearning step, in days, for a question that was just missed.
 * Sits below SRS_LADDER[0] so a miss is always scheduled sooner than a first
 * correct answer — without it, `Math.max(reps - 1, 0)` floors both to the same
 * ladder rung and a wrong answer returns on the same day as a right one.
 */
export const RELEARN_INTERVAL = 1

/**
 * Ladder ceiling for a question with a lapse history. Repeatedly-missed items
 * stop climbing to the long intervals: 0 lapses → 60d, 1 → 30d, 2+ → 14d.
 */
export function ladderCapForLapses(lapses = 0) {
  return Math.max(0, SRS_LADDER.length - 1 - Math.min(lapses || 0, 2))
}

/** Base SRS step from correctness only. */
export function nextSrsFromCorrect(prev, correct) {
  const s = prev || { reps: 0, lapses: 0 }
  let reps = s.reps || 0
  let lapses = s.lapses || 0
  if (correct) reps += 1
  else { reps = 0; lapses += 1 }
  if (!correct) {
    return {
      interval: RELEARN_INTERVAL,
      reps,
      lapses,
      intervalIndex: 0,
      due: Date.now() + RELEARN_INTERVAL * DAY_MS,
    }
  }
  const intervalIndex = Math.min(Math.max(reps - 1, 0), ladderCapForLapses(lapses))
  const interval = SRS_LADDER[intervalIndex]
  return { interval, reps, lapses, intervalIndex, due: Date.now() + interval * DAY_MS }
}

/**
 * Adjust SRS after a confidence rating (applied when rating is saved,
 * typically after the attempt was already scheduled).
 */
export function applyConfidenceToSrs(srs, rating, lastCorrect, now = Date.now()) {
  if (!srs) return srs
  const r = String(rating || '').toLowerCase()
  let { interval, reps, lapses, intervalIndex, due } = srs

  if (r === 'practice') {
    return {
      interval: 0,
      reps: reps || 0,
      lapses: lapses || 0,
      intervalIndex: 0,
      due: now,
      confidencePin: 'practice',
    }
  }

  if (r === 'easy') {
    if (lastCorrect === false) {
      // Overconfident miss — keep close (lapses already counted on the miss)
      return {
        interval: SRS_LADDER[0],
        reps: 0,
        lapses: Math.max(lapses || 0, 1),
        intervalIndex: 0,
        due: now,
        confidencePin: 'overconfident',
      }
    }
    // Easy + correct — graduate (jump one ladder step, min 7d if already progressing),
    // still bounded by the lapse ceiling so a repeatedly-missed item cannot jump to 60d.
    const nextIdx = Math.min((intervalIndex ?? 0) + 1, ladderCapForLapses(lapses))
    const nextInterval = SRS_LADDER[Math.max(nextIdx, 1)]
    return {
      interval: nextInterval,
      reps: Math.max(reps || 1, nextIdx + 1),
      lapses: lapses || 0,
      intervalIndex: Math.max(nextIdx, 1),
      due: now + nextInterval * DAY_MS,
      confidencePin: 'easy',
    }
  }

  if (r === 'hard') {
    if (lastCorrect === false) {
      return {
        interval: SRS_LADDER[0],
        reps: 0,
        lapses: lapses || 1,
        intervalIndex: 0,
        due: now,
        confidencePin: 'hard',
      }
    }
    // Hard but correct — fragile; shorter than default step
    const softIdx = Math.max(0, Math.min(intervalIndex ?? 0, 1))
    const softInterval = SRS_LADDER[softIdx]
    return {
      interval: softInterval,
      reps: reps || 1,
      lapses: lapses || 0,
      intervalIndex: softIdx,
      due: now + softInterval * DAY_MS,
      confidencePin: 'hard',
    }
  }

  // medium / unknown — leave schedule
  return { ...srs, confidencePin: r || 'medium' }
}

/** Combined schedule helper used by recordQuizResult. */
export function nextSrs(prev, correct, rating = null) {
  let srs = nextSrsFromCorrect(prev, correct)
  if (rating) srs = applyConfidenceToSrs(srs, rating, correct)
  return srs
}

/** Lower score = picked sooner in Practice. */
export function confidencePickScore(q) {
  const lastRating = q.ratings?.length ? q.ratings[q.ratings.length - 1].value : null
  const lastAttempt = q.attempts?.length ? q.attempts[q.attempts.length - 1] : null
  if (!q.attempts?.length) return 0
  if (lastAttempt && !lastAttempt.correct) return 0.5
  if (lastRating === 'practice') return 0.75
  if (lastRating === 'hard') return 1.5
  if (lastRating === 'medium') return 3
  if (lastRating === 'easy' && lastAttempt?.correct) return 5
  if (lastRating === 'easy') return 2
  return 4
}

/** Daily Review sort priority (lower = earlier). */
export function confidenceDuePriority(q, { nearExam = false } = {}) {
  const lastRating = q.ratings?.length ? q.ratings[q.ratings.length - 1].value : null
  const lastAttempt = q.attempts?.length ? q.attempts[q.attempts.length - 1] : null
  const pin = q.srs?.confidencePin

  if (q.type === 'troubleshooting' && (nearExam || (q.srs?.intervalIndex || 0) >= 2)) return 0
  if (lastRating === 'practice' || pin === 'practice') return 1
  if (lastAttempt && !lastAttempt.correct) return 2
  if (lastRating === 'hard' || pin === 'hard') return 3
  if (pin === 'overconfident' || (lastRating === 'easy' && (q.srs?.lapses || 0) > 0)) return 4
  return 5
}

/** Whether a not-yet-due item should still enter Daily Review. */
export function shouldForceReview(q, now = Date.now()) {
  const lastRating = q.ratings?.length ? q.ratings[q.ratings.length - 1].value : null
  const pin = q.srs?.confidencePin
  if (lastRating === 'practice' || pin === 'practice') return true
  if (pin === 'overconfident') return true
  if (lastRating === 'easy' && (q.srs?.lapses || 0) > 0) return true
  if (lastRating === 'hard' && (q.srs?.due ?? 0) > now) {
    // Soft: hard items within 1 day of due
    return (q.srs.due - now) < DAY_MS
  }
  return false
}

export function confidenceFeedbackCopy(rating, wasCorrect) {
  const r = String(rating || '').toLowerCase()
  if (r === 'practice') return 'Pinned for practice — we will show this again soon.'
  if (r === 'easy' && wasCorrect) return 'Marked easy — you will see this less often.'
  if (r === 'easy' && wasCorrect === false) return 'Easy but missed — keeping this close for review.'
  if (r === 'hard') return wasCorrect === false
    ? 'Marked hard — prioritizing this in upcoming practice.'
    : 'Marked hard — keeping this nearby even though you got it.'
  if (r === 'medium') return 'Got it — normal review schedule.'
  return null
}
