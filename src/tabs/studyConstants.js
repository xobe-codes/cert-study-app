export const EXPLAIN_CACHE_KEY = 'ccna_explain_cache_v2' // v2: structured sections (was prose)
export const EXPLAIN_PROMPT_SYSTEM = `You are a CCNA 200-301 tutor. Use the provided reference notes as your primary source. If the notes don't fully cover something a CCNA candidate needs, fill the gap with accurate, exam-relevant CCNA 200-301 knowledge — but never contradict the reference notes. Produce a clear, layered explanation in the requested structured fields. Keep each field tight and scannable: short sentences, plain language. The "advanced" field holds deeper detail a learner can skip on first pass.${''}
- definition: 2-4 short plain-English sentences — what it is and why it matters. No commands, formulas, exam traps, or citations here.
- bigTakeaway: one sentence the learner must remember (max ~25 words).
- keyPoints: 3-5 of the most testable core facts (short phrases) — formulas and commands belong here.
- realWorld: 1-2 sentences of practical/exam/lab context
- commonMistakes: 2-3 things students typically confuse or get wrong
- related: 2-4 prerequisite or follow-on topics (short labels)
- advanced: optional deeper detail (1-3 sentences), or omit if not needed`
export const EXPLAIN_SCHEMA = {
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
export const EXAM_SOURCES = {
  examName: 'CCNA 200-301',
  blueprintUrl: 'https://learningnetwork.cisco.com/s/ccna-exam-topics',
  references: [
    { title: 'CCNA 200-301 Official Cert Guide (Vol 1 & 2)', author: 'Wendell Odom', publisher: 'Cisco Press' },
  ],
}

/* =========================================================================
   PRE-ASSESSMENT — test out of a section before studying it.
   ========================================================================= */
export const PREASSESS_CACHE_KEY = 'ccna_preassess_v1'
export const PREASSESS_PROMPT_SYSTEM = `You are a CCNA 200-301 assessment writer. Using the reference notes as your primary source (supplement with accurate CCNA knowledge consistent with them), write 6 multiple-choice questions that test whether a learner already knows this section's core concepts. Cover distinct sub-concepts so a wrong answer pinpoints a specific gap. Tag each question with the short sub-concept it tests.`
export const PREASSESS_SCHEMA = {
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