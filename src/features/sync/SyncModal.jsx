import React, { useState, useRef } from 'react'
import { COLORS, styles } from '../../ui/appTheme.js'
import { MODAL_Z } from '../../ui/modalConstants.js'
import { useFocusTrap } from '../../ui/useFocusTrap.js'

export default function SyncModal({ syncCode, lastSynced, busy, msg, online, onGenerate, onLink, onSyncNow, onUnlink, onClose }) {
  const [entry, setEntry] = useState('')
  const [copied, setCopied] = useState(false)
  const dialogRef = useRef(null)
  useFocusTrap(dialogRef)

  async function copyCode() {
    try { await navigator.clipboard.writeText(syncCode); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { setCopied(false) }
  }

  return (
    <div ref={dialogRef} className="ccna-overlay" role="dialog" aria-modal="true" aria-labelledby="sync-modal-title" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: MODAL_Z, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={onClose}>
      <div className="ccna-sheet" style={{ ...styles.card, marginBottom: 0, paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }} onClick={e => e.stopPropagation()}>
        <h2 id="sync-modal-title" style={styles.h2}>Cross-Device Sync</h2>
        <p style={{ ...styles.small, marginBottom: 12 }}>
          Sync progress, quiz banks, and CLI stats across your devices with one shared code. Your data merges — nothing is overwritten or lost.
        </p>

        {!online && (
          <div style={{ background: COLORS.roseDim, border: `1px solid ${COLORS.roseBorder}`, color: COLORS.rose, fontSize: 'var(--ccna-type-xs)', borderRadius: 10, padding: 10, marginBottom: 12 }}>
            You appear offline. Sync needs a connection (and only works on the deployed site, not local dev).
          </div>
        )}

        {syncCode ? (
          <>
            <div style={{ ...styles.small, marginBottom: 6 }}>Your sync code</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <div style={{ flex: 1, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 'var(--ccna-type-lg)', letterSpacing: 1, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: '12px 14px', color: COLORS.sky }}>{syncCode}</div>
              <button style={{ ...styles.secondaryBtn, width: 'auto', padding: '0 16px' }} onClick={copyCode}>{copied ? 'Copied!' : 'Copy'}</button>
            </div>
            <p style={{ ...styles.small, marginBottom: 12 }}>On your other device: open Sync → “I have a code” → paste this. Then tap Sync now on both.</p>
            <button style={styles.primaryBtn} onClick={onSyncNow} disabled={busy || !online}>{busy ? 'Syncing…' : 'Sync now'}</button>
            <div style={{ ...styles.small, marginTop: 8, color: msg.includes('✓') ? COLORS.mint : COLORS.silverMid }}>
              {msg || (lastSynced ? `Last synced: ${new Date(lastSynced).toLocaleString()}` : 'Not synced yet.')}
            </div>
            <button style={{ ...styles.secondaryBtn, marginTop: 12, background: 'none', border: `1px solid ${COLORS.border}`, color: COLORS.silverMid }} onClick={onUnlink}>Unlink this device</button>
          </>
        ) : (
          <>
            <button style={styles.primaryBtn} onClick={onGenerate} disabled={!online}>Generate a sync code</button>
            <div style={{ textAlign: 'center', ...styles.small, margin: '12px 0' }}>— or —</div>
            <div style={{ ...styles.small, marginBottom: 6 }}>I have a code from another device</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                style={{ ...styles.input, flex: 1, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', letterSpacing: 1 }}
                value={entry}
                onChange={e => setEntry(e.target.value.toUpperCase())}
                placeholder="ABCD-EFGH-JKLM-NPQR"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
              />
              <button style={{ ...styles.primaryBtn, width: 'auto', padding: '0 16px' }} onClick={() => entry.trim() && onLink(entry.trim())} disabled={!online || !entry.trim()}>Link</button>
            </div>
            {msg && <div style={{ ...styles.small, marginTop: 8, color: COLORS.rose }}>{msg}</div>}
          </>
        )}

        <button style={{ ...styles.secondaryBtn, marginTop: 12, background: 'none', border: 'none', color: COLORS.silverMid }} onClick={onClose}>Close</button>
      </div>
    </div>
  )
}
