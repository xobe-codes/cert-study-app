import { describe, expect, it } from 'vitest'
import { lessonCkuAnchor, lessonSectionAnchor, primaryLessonAnchor } from '../lesson/lessonAnchors.js'

describe('stable lesson anchors', () => {
  it('builds deterministic objective and section anchors', () => {
    expect(lessonSectionAnchor('3.1', 'How It Works')).toBe('lesson-3-1-how-it-works')
  })

  it('builds exact CKU remediation anchors', () => {
    expect(lessonCkuAnchor('3.1', 'CKU-ROUTING-TABLE-ENTRY')).toBe('lesson-3-1-concept-cku-routing-table-entry')
    expect(primaryLessonAnchor('3.1', ['CKU-ROUTING-TABLE-ENTRY'])).toBe('lesson-3-1-concept-cku-routing-table-entry')
  })

  it('falls back to the plain lesson section without CKU metadata', () => {
    expect(primaryLessonAnchor('3.1')).toBe('lesson-3-1-plain')
  })
})
