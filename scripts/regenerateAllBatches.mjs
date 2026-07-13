#!/usr/bin/env node
/**
 * 99-Spec Explanation Regeneration — All Three Daily Batches
 * Runs morning, afternoon, and evening batches (100 questions total)
 * Usage: node scripts/regenerateAllBatches.mjs
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import Anthropic from '@anthropic-ai/sdk'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')

const PATTERN_PATH = path.join(projectRoot, 'src/answerReview/explanationPattern99.md')
const REGEN_PATH = path.join(projectRoot, 'src/answerReview/regeneratedExplanations.json')
const QUIZ_BANK_PATH = path.join(projectRoot, 'src/data/ccnaQuestionBank.js')

// Read pattern library
const pattern = fs.readFileSync(PATTERN_PATH, 'utf-8')

// Read quiz bank to get all questions
let quizBank = {}
try {
  const code = fs.readFileSync(QUIZ_BANK_PATH, 'utf-8')
  // Extract the QUIZ_BANK object from the file
  const match = code.match(/export const QUIZ_BANK = ({[\s\S]*});/)
  if (match) {
    quizBank = eval('(' + match[1] + ')')
  }
} catch (e) {
  console.error('Could not load quiz bank:', e.message)
  process.exit(1)
}

// Load existing regenerated explanations
let regenerated = {}
if (fs.existsSync(REGEN_PATH)) {
  regenerated = JSON.parse(fs.readFileSync(REGEN_PATH, 'utf-8'))
}

// Get all questions needing regeneration
const allQuestions = Object.entries(quizBank).flatMap(([objId, questions]) =>
  (questions || []).map((q, idx) => ({ objId, idx, q, qid: `${objId}-q${idx + 1}` }))
)

// Split into 3 batches
const batchSize = Math.ceil(allQuestions.length / 3)
const batches = [
  allQuestions.slice(0, batchSize),
  allQuestions.slice(batchSize, batchSize * 2),
  allQuestions.slice(batchSize * 2),
]

const batchNames = ['morning', 'afternoon', 'evening']

const client = new Anthropic()

async function regenerateBatch(batchNum, questions) {
  console.log(`\n🔄 Running ${batchNames[batchNum]} batch (${questions.length} questions)...`)

  let count = 0
  for (const { qid, q } of questions) {
    if (regenerated[qid]) {
      console.log(`  ✓ ${qid} (already done)`)
      continue
    }

    // Get incorrect choices for this question
    const incorrect = (q.choices || []).map((choice, idx) => ({
      choiceIndex: idx,
      choiceText: choice,
    }))

    if (incorrect.length === 0) continue

    const prompt = `You are a CCNA exam expert. For this question, regenerate the wrong-answer explanations using the 99-spec pattern.

QUESTION: ${q.question}
CORRECT ANSWER: ${q.choices[q.correctIndex]} (choice ${q.correctIndex})

PATTERN LIBRARY (MUST follow this structure):
${pattern}

For EACH INCORRECT CHOICE, output a JSON array with one object per wrong choice, in this exact structure:
{
  "choiceIndex": <number>,
  "misconceptionReason": "<1-2 sentences naming the specific false belief>",
  "whyItSeems": "<1-2 sentences explaining the intuitive trap>",
  "whyWrongHere": "<2-3 sentences directly addressing misconception with correct principle>",
  "memoryAnchor": "<1 sentence sticky rule>",
  "contrast": "<1-2 sentences side-by-side comparison>"
}

Output ONLY the JSON array, nothing else. No markdown, no explanation.`

    try {
      const response = await client.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      })

      const text = response.content[0].type === 'text' ? response.content[0].text : ''
      const explanations = JSON.parse(text)

      regenerated[qid] = { incorrect: explanations }
      count++
      console.log(`  ✓ ${qid} (${count}/${questions.length})`)

      // Rate limit: 1 request per second
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (e) {
      console.error(`  ✗ ${qid}: ${e.message}`)
    }
  }

  console.log(`✅ ${batchNames[batchNum]} batch complete: ${count} questions regenerated`)
  return count
}

async function run() {
  console.log('🚀 99-Spec Explanation Regeneration — All Three Batches')
  console.log(`Total questions: ${allQuestions.length}`)
  console.log(`Already done: ${Object.keys(regenerated).length}`)

  let totalRegenerated = 0
  for (let i = 0; i < 3; i++) {
    const count = await regenerateBatch(i, batches[i])
    totalRegenerated += count
  }

  // Save results
  fs.writeFileSync(REGEN_PATH, JSON.stringify(regenerated, null, 2))

  console.log(`\n📊 Summary`)
  console.log(`Total regenerated this run: ${totalRegenerated}`)
  console.log(`Total in regeneratedExplanations.json: ${Object.keys(regenerated).length}`)
  console.log(`✅ Saved to ${REGEN_PATH}`)
  console.log(`\n📝 Next: Review changes with: git diff src/answerReview/regeneratedExplanations.json`)
  console.log(`📤 Then commit and deploy: git add -A && git commit -m "Regenerate 99-spec explanations" && git push`)
}

run().catch(e => {
  console.error('Fatal error:', e)
  process.exit(1)
})
