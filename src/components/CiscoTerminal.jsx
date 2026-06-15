import React, { useEffect, useRef } from 'react'
import { COLORS, styles } from '../ui/appTheme.js'
import { CLI_MODE_PROMPT } from '../lab/cliEngine.js'

const LINE_COLOR = { cmd: '#d9d9d9', ok: '#d4f7d4', warn: '#e0a0a0', out: '#baf0fa', info: '#8a8fa8' }

export default function CiscoTerminal({
  host,
  mode,
  history = [],
  input,
  onInputChange,
  onSubmit,
  disabled = false,
  placeholder = 'command…',
  emptyMessage,
  height,
  showRunButton = false,
  className = '',
}) {
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [history])

  return (
    <div className={`cisco-terminal ${className}`.trim()} style={{ borderTop: `1px solid ${COLORS.border}` }}>
      <div
        ref={scrollRef}
        className="cisco-terminal-scroll"
        style={height != null ? { height } : undefined}
      >
        {history.length === 0 && emptyMessage && (
          <div style={{ color: '#6b7088' }}>{emptyMessage}</div>
        )}
        {history.map((l, i) => (
          <div key={i} style={{ color: LINE_COLOR[l.kind] || '#d9d9d9', whiteSpace: 'pre-wrap' }}>{l.text}</div>
        ))}
      </div>
      {!disabled && (
        <div className="cisco-terminal-input-row">
          <span className="cisco-terminal-prompt">
            {host}{CLI_MODE_PROMPT[mode]}
          </span>
          <input
            style={{ ...styles.input, fontFamily: 'ui-monospace, Menlo, monospace', background: '#0a0c12', border: `1px solid ${COLORS.border}`, color: '#d9d9d9' }}
            value={input}
            onChange={e => onInputChange(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') onSubmit?.() }}
            placeholder={placeholder}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
          />
          {showRunButton && (
            <button type="button" style={{ ...styles.primaryBtn, width: 'auto', padding: '10px 16px', marginTop: 0, flexShrink: 0 }} onClick={onSubmit}>
              Run
            </button>
          )}
        </div>
      )}
    </div>
  )
}
