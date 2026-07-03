import { GOLD_ANSWER_REVIEWS } from '../src/answerReview/goldAnswerReviews.js'
import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs'
import { join } from 'path'

const gold = new Set(Object.keys(GOLD_ANSWER_REVIEWS))
const all = []
function walk(d) {
  for (const n of readdirSync(d)) {
    const p = join(d, n)
    if (statSync(p).isDirectory()) walk(p)
    else if (n.endsWith('.json')) {
      const data = JSON.parse(readFileSync(p, 'utf8'))
      for (const q of data.questions || []) {
        if (!gold.has(q.id) && q.id.includes('source')) {
          all.push({ id: q.id, obj: data.objectiveId, q })
        }
      }
    }
  }
}
walk('data/clean-question-bank')
all.sort((a, b) => a.id.localeCompare(b.id))

const fiveX = all.filter((x) => x.obj?.startsWith('5.'))
const batch29 = fiveX.slice(0, 50)
const batch30 = all.filter((x) => !batch29.some((b) => b.id === x.id))

writeFileSync('scripts/_goldBatch29Ids.json', JSON.stringify(batch29.map((x) => x.id), null, 2))
writeFileSync('scripts/_goldBatch30Ids.json', JSON.stringify(batch30.map((x) => x.id), null, 2))

console.log('batch29', batch29.length, 'batch30', batch30.length)
for (const x of batch29) {
  console.log('===', x.id, x.obj, '===')
  console.log('Q:', x.q.question)
  x.q.choices.forEach((c, i) => console.log(i, c))
  console.log('correct:', x.q.correctIndex)
}
