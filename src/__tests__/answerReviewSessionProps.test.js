import { describe, expect, it } from 'vitest'
import { answerReviewSessionProps, enrichQuestionForReview } from '../components/answerReviewSessionProps.js'

describe('answerReviewSessionProps', () => {
  it('enriches MC questions with answerReview and passes remediation handlers', () => {
    const q = {
      id: 'polish-q1',
      objectiveId: '1.1',
      question: 'Which device forwards between subnets?',
      explanation: 'Routers forward between IP subnets.',
      choices: ['Router', 'Hub', 'Access point', 'Repeater'],
      correctIndex: 0,
    }
    const onOpenTrapDrill = () => {}
    const props = answerReviewSessionProps({
      q,
      selected: 1,
      onOpenTrapDrill,
      objectiveId: '1.1',
    })
    expect(props.q.answerReview?.incorrect?.length).toBeGreaterThan(0)
    expect(props.onOpenTrapDrill).toBe(onOpenTrapDrill)
    expect(props.objectiveId).toBe('1.1')
    expect(props.showQuestionFlag).toBe(true)
    expect(enrichQuestionForReview(q).answerReview).toBeTruthy()
  })
})
