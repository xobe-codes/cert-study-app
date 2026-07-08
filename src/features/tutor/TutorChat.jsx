import React, { useState, useEffect, useRef } from 'react'
import { COLORS, styles } from '../../ui/appTheme.js'
import { STORAGE_KEYS } from '../../storageKeys.js'
import { askClaudeStream, cachedSystem } from '../../ai/claudeClient.js'
import { buildTutorSystemPrompt } from './tutorPrompt.js'
import { retrieveTutorContext } from './tutorRagPipeline.js'
import { EXAM_SOURCES } from '../../tabs/studyConstants.js'
import { QuizRichText } from '../../components/QuizQuestionChrome.jsx'
import Spinner from '../../components/Spinner.jsx'
import ErrorBox from '../../components/ErrorBox.jsx'
import StudyModeHeader from '../../components/StudyModeHeader.jsx'
import { isTtsSupported, speak, stopSpeaking } from '../../lib/browserTts.js'

export default function TutorChat({ progress, missed, onBack }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [restored, setRestored] = useState(false)
  const [streamingText, setStreamingText] = useState(null)
  const [ragSources, setRagSources] = useState(null)
  const [ttsEnabled, setTtsEnabled] = useState(false)
  const [ttsReady, setTtsReady] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    (async () => {
      const saved = await window.storage.getItem(STORAGE_KEYS.tutorChat)
      if (saved && Array.isArray(saved) && saved.length) setMessages(saved)
      const tts = await window.storage.getItem(STORAGE_KEYS.tutorTtsEnabled)
      if (tts) setTtsEnabled(true)
      setRestored(true)
      setTtsReady(true)
    })()
  }, [])

  useEffect(() => () => stopSpeaking(), [])

  useEffect(() => {
    if (!ttsReady) return
    window.storage.setItem(STORAGE_KEYS.tutorTtsEnabled, ttsEnabled || null)
  }, [ttsEnabled, ttsReady])

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
      const rag = await retrieveTutorContext(text)
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
      if (ttsEnabled) speak(reply)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setStreamingText(null)
    }
  }

  function clearChat() {
    stopSpeaking()
    setMessages([])
    setError(null)
  }

  function toggleTts() {
    if (ttsEnabled) stopSpeaking()
    setTtsEnabled(v => !v)
  }

  function readMessage(content) {
    speak(content)
  }

  return (
    <div className="tutor-shell">
      <StudyModeHeader title="AI Tutor Chat" onBack={onBack} />
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', flexShrink: 0, gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {isTtsSupported() && (
            <button
              type="button"
              aria-pressed={ttsEnabled}
              style={{ ...styles.secondaryBtn, width: 'auto', minHeight: 36, padding: '6px 14px', fontSize: 'var(--ccna-type-xs)' }}
              onClick={toggleTts}
            >
              {ttsEnabled ? '🔊 Read aloud on' : '🔈 Read aloud off'}
            </button>
          )}
          {messages.length > 0 && (
            <button style={{ ...styles.secondaryBtn, width: 'auto', minHeight: 36, padding: '6px 14px', fontSize: 'var(--ccna-type-xs)' }} onClick={clearChat}>Clear chat</button>
          )}
        </div>
      </div>
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
            {m.role === 'assistant' && isTtsSupported() && (
              <button
                type="button"
                style={{ ...styles.secondaryBtn, width: 'auto', minHeight: 32, padding: '4px 10px', fontSize: 'var(--ccna-type-xs)', marginTop: 8 }}
                onClick={() => readMessage(m.content)}
              >
                Listen
              </button>
            )}
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
