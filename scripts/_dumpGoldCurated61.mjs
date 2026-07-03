import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs'
import { join } from 'path'

const missing = []
function walk(d) {
  for (const n of readdirSync(d)) {
    const p = join(d, n)
    if (statSync(p).isDirectory()) walk(p)
    else if (n.endsWith('.json')) {
      const data = JSON.parse(readFileSync(p, 'utf8'))
      for (const q of data.questions || []) {
        missing.push({ id: q.id, obj: data.objectiveId, q })
      }
    }
  }
}
walk('data/clean-question-bank')

import { GOLD_ANSWER_REVIEWS } from '../src/answerReview/goldAnswerReviews.js'
const gold = new Set(Object.keys(GOLD_ANSWER_REVIEWS))
const need = missing.filter((x) => !gold.has(x.id)).sort((a, b) => a.id.localeCompare(b.id))
writeFileSync('scripts/_goldCurated61Ids.json', JSON.stringify(need.map((x) => x.id), null, 2))
console.log('need gold:', need.length)
for (const x of need) {
  console.log('===', x.id, '===')
  console.log('Q:', x.q.question)
  x.q.choices.forEach((c, i) => console.log(i, c))
  console.log('correct:', x.q.correctIndex)
}
