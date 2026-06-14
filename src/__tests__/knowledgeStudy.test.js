import { describe, it, expect } from 'vitest'
import {
  getAllDomain1ExamTraps,
  getAllDomain2ExamTraps,
  getAllDomain6ExamTraps,
  getAllExamTraps,
} from '../data/knowledgeStudy.js'

describe('knowledgeStudy exam traps', () => {
  it('domain 1 has KB exam traps', () => {
    expect(getAllDomain1ExamTraps().length).toBeGreaterThan(0)
  })

  it('domain 2 has KB exam traps', () => {
    expect(getAllDomain2ExamTraps().length).toBeGreaterThan(0)
  })

  it('all six domain getters are wired (D6 may be empty)', () => {
    expect(getAllExamTraps().length).toBeGreaterThan(50)
    expect(getAllDomain6ExamTraps()).toEqual([])
  })
})
