import React, { useState, useEffect, useRef } from 'react'
import { COLORS, styles } from '../../ui/appTheme.js'
import { STORAGE_KEYS } from '../../storageKeys.js'
import { askClaudeStream, cachedSystem } from '../../ai/claudeClient.js'
import { buildTutorSystemPrompt } from './tutorPrompt.js'
import { retrieveTutorRag } from './tutorRag.js'
import { EXAM_SOURCES } from '../../tabs/studyConstants.js'
import { QuizRichText } from '../../components/QuizQuestionChrome.jsx'
import Spinner from '../../components/Spinner.jsx'
import ErrorBox from '../../components/ErrorBox.jsx'

export default function TutorChat({ progress, missed, onBack }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [restored, setRestored] = useState(false)
  const [streamingText, setStreamingText] = useState(null)
  const [ragSources, setRagSources] = useState(null)
  const scrollRef = useRef(null)

  useEffect(() => {
    (async () => {
      const saved = await window.storage.getItem(STORAGE_KEYS.tutorChat)
      if (saved && Array.isArray(saved) && saved.length) setMessages(saved)
      setRestored(true)
    })()
  }, [])

  useEffect(() => {
    if (!restored) return
    window.storage.setItem(STORAGE_KEYS.tutorChat, messages)
  }, [messages, restored])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading, streamingText])

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    const newMessages = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    setError(null)
    setStreamingText('')
    setRagSources(null)
    try {
      const rag = retrieveTutorRag(text)
      setRagSources(rag.selected)
      const system = await buildTutorSystemPrompt(progress, missed, rag.contextBlock)
      let acc = ''
      const reply = await askClaudeStream({
        system: cachedSystem(system),
        messages: newMessages,
        max_tokens: 800,
        feature: 'tutor',
        onDelta: chunk => { acc += chunk; setStreamingText(acc) },
      })
      setMessages(m => [...m, {
        role: 'assistant',
        content: reply,
        ragSources: rag.selected?.map(h => ({ id: h.id, title: h.title, objectiveId: h.objectiveIds?.[0] })),
      }])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setStreamingText(null)
    }
  }

  function clearChat() {
    setMessages([])
    setError(null)
  }

  return (
    <div className="tutor-shell">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <button style={styles.backBtn} onClick={onBack}>‹ Back</button>
        {messages.length > 0 && (
          <button style={{ ...styles.secondaryBtn, width: 'auto', minHeight: 36, padding: '6px 14px', fontSize: 'var(--ccna-type-xs)' }} onClick={clearChat}>Clear chat</button>
        )}
      </div>
      <h1 style={styles.h1}>AI Tutor Chat</h1>
      <div ref={scrollRef} className="tutor-messages internal-scroll" style={{ marginBottom: 10 }}>
        {messages.length === 0 && (
          <div style={{ ...styles.card, background: COLORS.skyDim, border: `1px solid ${COLORS.skyBorder}` }}>
            <div style={{ fontSize: 'var(--ccna-type-sm)', lineHeight: 1.6 }}>
              Hi! I know your scores and what you've mastered so far. Ask me anything — answers are grounded in your bundled study library (terms, reading, traps, commands) plus your progress. Try "Explain HSRP vs VRRP" or "What should I focus on this week?"
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{
            ...styles.card,
            background: m.role === 'user' ? COLORS.purpleDim : COLORS.skyDim,
            border: `1px solid ${m.role === 'user' ? COLORS.borderGlow : COLORS.skyBorder}`,
            whiteSpace: 'pre-wrap', fontSize: 'var(--ccna-type-md)', lineHeight: 1.5,
          }}>
            <QuizRichText text={m.content} />
            {m.role === 'assistant' && m.ragSources?.length > 0 && (
              <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginTop: 8, lineHeight: 1.4 }}>
                Library-backed ({m.ragSources.length}): {m.ragSources.slice(0, 3).map(s => s.title).join(' · ')}
                {m.ragSources.length > 3 ? ' …' : ''}
              </div>
            )}
          </div>
        ))}
        {loading && (
          streamingText ? (
            <div style={{ ...styles.card, background: COLORS.skyDim, border: `1px solid ${COLORS.skyBorder}`, whiteSpace: 'pre-wrap', fontSize: 'var(--ccna-type-md)', lineHeight: 1.5 }}>
              <QuizRichText text={streamingText} />
              <span className="ccna-pulse" style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: COLORS.sky, marginLeft: 4 }} />
            </div>
          ) : (
            <>
              {ragSources?.length > 0 && (
                <div style={{ ...styles.small, color: COLORS.mint, marginBottom: 8 }}>
                  Retrieved {ragSources.length} library source{ragSources.length === 1 ? '' : 's'}…
                </div>
              )}
              <Spinner label="Tutor is thinking..." />
            </>
          )
        )}
        {error && <ErrorBox message={error} onRetry={send} />}
        {messages.length > 0 && !loading && (
          <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, lineHeight: 1.5, padding: '4px 2px' }}>
            Tutor answers are AI-generated study help. Verify exam objectives, command syntax, and key terms against the{' '}
            <a href={EXAM_SOURCES.blueprintUrl} target="_blank" rel="noreferrer" style={{ color: COLORS.sky, textDecoration: 'none' }}>{EXAM_SOURCES.examName} exam topics</a>
            {' '}and {EXAM_SOURCES.references.map(r => r.title).join(', ')} — open the matching objective's Explain tab for cited definitions.
          </div>
        )}
      </div>
      <div className="tutor-input-bar">
        <input
          style={{ ...styles.input, flex: 1 }}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') send() }}
          placeholder="Ask the tutor..."
        />
        <button style={{ ...styles.primaryBtn, width: 'auto', padding: '12px 18px' }} onClick={send} disabled={loading}>Send</button>
      </div>
    </div>
  )
}
