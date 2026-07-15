/**
 * Lab Terminal Component (Phase 1 Complete)
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { COLORS, styles } from '../ui/appTheme.js'

export default function LabTerminal({
  checkpoint,
  prompt = 'Router#',
  onSubmitCommand,
  isLoading = false,
  validationFeedback = null,
  previousCommands = [],
  onCommandSelect,
}) {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const inputRef = useRef(null)
  const outputRef = useRef(null)

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [output])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = useCallback(() => {
    if (!input.trim() || isLoading) return

    const trimmed = input.trim()
    setOutput((prev) => [
      ...prev,
      {
        type: 'command',
        text: trimmed,
        timestamp: Date.now(),
      },
    ])

    onSubmitCommand?.(trimmed)
    setInput('')
    setHistoryIndex(-1)
  }, [input, isLoading, onSubmitCommand])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (previousCommands.length === 0) return
      const newIndex = historyIndex === -1
        ? previousCommands.length - 1
        : Math.max(0, historyIndex - 1)
      setHistoryIndex(newIndex)
      setInput(previousCommands[newIndex])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex === -1) return
      const newIndex = historyIndex + 1
      if (newIndex >= previousCommands.length) {
        setHistoryIndex(-1)
        setInput('')
      } else {
        setHistoryIndex(newIndex)
        setInput(previousCommands[newIndex])
      }
    }
  }

  useEffect(() => {
    if (validationFeedback) {
      setOutput((prev) => [
        ...prev,
        {
          type: validationFeedback.success ? 'success' : 'error',
          text: validationFeedback.message,
          timestamp: Date.now(),
        },
      ])
    }
  }, [validationFeedback])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRadius: 'var(--ccna-radius)',
        border: `1px solid ${COLORS.border}`,
        backgroundColor: COLORS.dark,
        overflow: 'hidden',
        fontFamily: 'Monaco, Courier New, monospace',
        fontSize: 'var(--ccna-type-sm)',
      }}
    >
      <div
        ref={outputRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px',
          color: COLORS.silver,
          backgroundColor: COLORS.dark,
          lineHeight: 1.6,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {checkpoint && (
          <div style={{ marginBottom: 12, color: COLORS.mint, fontSize: 'var(--ccna-type-xs)' }}>
            {checkpoint.title}
            <div style={{ color: COLORS.silver, fontSize: '11px', marginTop: 4 }}>
              Command: {checkpoint.requiredCommand}
            </div>
          </div>
        )}

        {output.length === 0 ? (
          <div style={{ color: COLORS.silver, opacity: 0.6 }}>Connected. Type commands below...</div>
        ) : (
          output.map((line, idx) => (
            <div
              key={idx}
              style={{
                color:
                  line.type === 'error' ? COLORS.rose :
                  line.type === 'success' ? COLORS.mint :
                  COLORS.silver,
                marginBottom: 4,
              }}
            >
              {line.type === 'command' && (
                <span style={{ color: COLORS.sky }}>
                  {prompt}
                  {' '}
                </span>
              )}
              {line.type === 'success' && <span>✓ </span>}
              {line.type === 'error' && <span>✗ </span>}
              {line.text}
            </div>
          ))
        )}

        {isLoading && (
          <div style={{ color: COLORS.amber, marginTop: 8 }}>Processing...</div>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          borderTop: `1px solid ${COLORS.border}`,
          padding: '8px 12px',
          backgroundColor: COLORS.card,
        }}
      >
        <span style={{ color: COLORS.sky, marginRight: 8 }}>{prompt}</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          placeholder="Type command..."
          style={{
            flex: 1,
            border: 'none',
            backgroundColor: 'transparent',
            color: COLORS.white,
            fontFamily: 'Monaco, Courier New, monospace',
            fontSize: 'var(--ccna-type-sm)',
            outline: 'none',
            padding: 0,
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={isLoading || !input.trim()}
          style={{
            marginLeft: 8,
            padding: '4px 8px',
            backgroundColor: isLoading || !input.trim() ? COLORS.silver : COLORS.mint,
            color: COLORS.dark,
            border: 'none',
            borderRadius: 'var(--ccna-radius)',
            cursor: isLoading || !input.trim() ? 'default' : 'pointer',
            fontSize: '11px',
            fontWeight: 600,
            opacity: isLoading || !input.trim() ? 0.5 : 1,
          }}
        >
          Send
        </button>
      </div>
    </div>
  )
}
