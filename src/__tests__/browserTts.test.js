import { describe, it, expect } from 'vitest'
import { stripMarkdownForSpeech } from '../lib/browserTts.js'

describe('browserTts', () => {
  it('strips markdown for speech', () => {
    const input = '**HSRP** uses `standby` priority. See [Cisco docs](https://example.com).'
    expect(stripMarkdownForSpeech(input)).toBe('HSRP uses standby priority. See Cisco docs.')
  })

  it('removes fenced code blocks', () => {
    const input = 'Before\n```\nshow ip route\n```\nAfter'
    expect(stripMarkdownForSpeech(input)).toBe('Before After')
  })

  it('returns empty for blank input', () => {
    expect(stripMarkdownForSpeech('   ')).toBe('')
  })
})
