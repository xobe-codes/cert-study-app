import React, { useState, useEffect, useRef } from 'react'
import { COLORS, styles } from '../../ui/appTheme.js'
import { askClaudeStream, cachedSystem } from '../../ai/claudeClient.js'
import { buildMockInterviewSystemPrompt } from './mockInterviewPrompt.js'
import { buildMockInterviewCards } from './mockInterviewCards.js'
import { QuizRichText } from '../../components/QuizQuestionChrome.jsx'
import Spinner from '../../components/Spinner.jsx'
import ErrorBox from '../../components/ErrorBox.jsx'
import { PREMIUM_FEATURES } from '../../premium/premiumFeatures.js'

export default function MockInterview({
  progress,
  missed,
  premiumUnlocked,
  onBack,
  onPremiumBlocked,
}) {
  const [cards, setCards] = useState([])
  const [cardsLoading, setCardsLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [streamingText, setStreamingText] = useState(null)
  const scrollRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setCardsLoading(true)
      const built = await buildMockInterviewCards(progress, missed)
      if (!cancelled) {
        setCards(built)
        setCardsLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [progress, missed])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading, streamingText, expandedId])

  function useCardPrompt(card) {
    setExpandedId(card.id)
    if (!premiumUnlocked) return
    setInput(card.prompt)
  }

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    if (!premiumUnlocked) {
      onPremiumBlocked?.(PREMIUM_FEATURES.mock_interview, 'mock_interview_send')
      return
    }
    const newMessages = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    setError(null)
    setStreamingText('')
    try {
      const system = await buildMockInterviewSystemPrompt(progress, missed)
      let acc = ''
      const reply = await askClaudeStream({
        system: cachedSystem(system),
        messages: newMessages,
        max_tokens: 700,
        feature: 'mock_interview',
        onDelta: chunk => { acc += chunk; setStreamingText(acc) },
      })
      setMessages(m => [...m, { role: 'assistant', content: reply }])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setStreamingText(null)
    }
  }

  return (
    <div className="tutor-shell">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, gap: 8, flexWrap: 'wrap' }}>
        <button type="button" style={styles.backBtn} onClick={onBack}>‹ Back</button>
        {!premiumUnlocked && (
          <span style={{ ...styles.pill('amber'), fontSize: 'var(--ccna-type-micro)' }}>Curated prompts — AI chat with supporter access</span>
        )}
      </div>
      <h1 style={styles.h1}>Exam day interview</h1>
      <p style={{ ...styles.small, color: COLORS.silverMid, marginTop: -8, marginBottom: 12, lineHeight: 1.5 }}>
        Verbal warm-up from your weak objectives. Tap a prompt for coaching points; supporters can practice live follow-up with an AI examiner.
      </p>

      <div ref={scrollRef} className="tutor-messages internal-scroll" style={{ marginBottom: 10 }}>
        {cardsLoading ? (
          <Spinner label="Building prompts from your progress…" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {cards.map(card => {
              const open = expandedId === card.id
              return (
                <div key={card.id} style={{ ...styles.card, border: `1px solid ${open ? COLORS.skyBorder : COLORS.border}` }}>
                  <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 6 }}>
                    {card.objectiveId} · {card.objectiveTitle}
                  </div>
                  <button
                    type="button"
                    onClick={() => useCardPrompt(card)}
                    style={{
                      ...styles.secondaryBtn,
                      width: '100%',
                      textAlign: 'left',
                      whiteSpace: 'normal',
                      lineHeight: 1.5,
                      marginBottom: open ? 10 : 0,
                    }}
                  >
                    {card.prompt}
                  </button>
                  {open && (
                    <div style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.silver, lineHeight: 1.55 }}>
                      <div style={{ fontWeight: 600, color: COLORS.mint, marginBottom: 6 }}>Coaching points</div>
                      <ul style={{ margin: 0, paddingLeft: 18 }}>
                        {card.coachingPoints.map((pt, i) => (
                          <li key={i} style={{ marginBottom: 4 }}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {premiumUnlocked && messages.map((m, i) => (
          <div
            key={i}
            style={{
              ...styles.card,
              marginTop: 10,
              background: m.role === 'user' ? COLORS.purpleDim : COLORS.skyDim,
              border: `1px solid ${m.role === 'user' ? COLORS.borderGlow : COLORS.skyBorder}`,
              whiteSpace: 'pre-wrap',
              fontSize: 'var(--ccna-type-md)',
              lineHeight: 1.5,
            }}
          >
            <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 6 }}>
              {m.role === 'user' ? 'You' : 'Examiner'}
            </div>
            <QuizRichText text={m.content} />
          </div>
        ))}

        {premiumUnlocked && loading && (
          streamingText ? (
            <div style={{ ...styles.card, marginTop: 10, background: COLORS.skyDim, border: `1px solid ${COLORS.skyBorder}`, whiteSpace: 'pre-wrap', fontSize: 'var(--ccna-type-md)', lineHeight: 1.5 }}>
              <QuizRichText text={streamingText} />
            </div>
          ) : (
            <div style={{ marginTop: 10 }}>
              <Spinner label="Examiner is thinking…" />
            </div>
          )
        )}

        {error && <ErrorBox message={error} onRetry={send} />}
      </div>

      <div className="tutor-input-bar">
        <input
          style={{ ...styles.input, flex: 1 }}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') send() }}
          placeholder={premiumUnlocked ? 'Answer or ask a follow-up…' : 'Unlock supporter access for live AI interview'}
          disabled={!premiumUnlocked || loading}
        />
        <button
          type="button"
          style={{ ...styles.primaryBtn, width: 'auto', padding: '12px 18px' }}
          onClick={send}
          disabled={!premiumUnlocked || loading || !input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  )
}
