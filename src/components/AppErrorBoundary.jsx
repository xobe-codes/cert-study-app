import React from 'react'
import { COLORS, styles } from '../ui/appTheme.js'

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[AppErrorBoundary]', error, info?.componentStack)
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    this.props.onReset?.()
    window.location.hash = ''
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    const message = this.state.error?.message || 'An unexpected error occurred'

    return (
      <div style={{
        ...styles.page,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        boxSizing: 'border-box',
        background: COLORS.bg,
        minHeight: '100dvh',
      }}>
        <div style={{ ...styles.card, maxWidth: 420, width: '100%' }}>
          <h1 style={styles.h1}>Something went wrong</h1>
          <p style={{ ...styles.small, marginBottom: 16 }}>
            The app hit an unexpected problem. Try reloading, or go back to the home screen.
          </p>
          <div style={{
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 10,
            padding: '10px 12px',
            marginBottom: 16,
            fontSize: 'var(--ccna-type-sm)',
            color: COLORS.silverMid,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            wordBreak: 'break-word',
            lineHeight: 1.45,
          }}>
            {message}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button type="button" style={styles.primaryBtn} onClick={this.handleReload}>
              Reload app
            </button>
            <button type="button" style={styles.secondaryBtn} onClick={this.handleGoHome}>
              Go home
            </button>
          </div>
        </div>
      </div>
    )
  }
}
