import { GOLD_ANSWER_REVIEWS } from '../src/answerReview/goldAnswerReviews.js'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

const gold = new Set(Object.keys(GOLD_ANSWER_REVIEWS))
const pick = []
function walk(d) {
  for (const n of readdirSync(d)) {
    const p = join(d, n)
    if (statSync(p).isDirectory()) walk(p)
    else if (n.endsWith('.json')) {
      const data = JSON.parse(readFileSync(p, 'utf8'))
      for (const q of data.questions || []) {
        if (!gold.has(q.id) && q.id.includes('source')) {
          const obj = data.objectiveId || ''
          if (obj.startsWith('4.') || obj.startsWith('5.')) pick.push({ id: q.id, obj, q })
        }
      }
    }
  }
}
walk('data/clean-question-bank')
pick.sort((a, b) => a.id.localeCompare(b.id))
const batch = pick.slice(0, 50)
console.log('count', batch.length)
for (const x of batch) {
  console.log('===', x.id, '===')
  console.log('Q:', x.q.question)
  x.q.choices.forEach((c, i) => console.log(i, c))
  console.log('correct:', x.q.correctIndex)
}
