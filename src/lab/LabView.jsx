import React, { useState, useEffect, useRef, useCallback } from 'react'
import { COLORS, styles } from '../ui/appTheme.js'
import { labProgress, normalizeCliLine } from '../data/ccnaLabs.js'
import { useNavHint } from '../components/NavHintProvider.jsx'
import { NAV_HINT_KEYS } from '../ui/navHintConfig.js'
import CiscoTerminal from '../components/CiscoTerminal.jsx'
import {
  deviceHostname, normalizeCmd, commandMatches,
  cliNavTarget, cliExitTarget, cliRequiredMode,
  CLI_MODE_PROMPT, CLI_MODE_HINT, CLI_SHOW_OUTPUT,
} from './cliEngine.js'
import {
  createDeviceState, applyConfigCommand, renderShow, simulatePing,
  resolveDhcpClient, canonIface, displayIface,
} from './iosSim.js'
import { markLabDone } from './labStorage.js'
import LabLearnPanel from './LabLearnPanel.jsx'

function defaultSession(host) {
  return {
    mode: 'user',
    ctxName: null,
    history: [{ text: `% Connected to ${host}. Navigate: enable → configure terminal → task commands.`, kind: 'info' }],
  }
}

const LAB_DIFF_ACCENT = { beginner: 'mint', intermediate: 'sky', advanced: 'amber' }

function LabSection({ icon, title, accent, items }) {
  const c = accent === 'mint' ? COLORS.mint : accent === 'rose' ? COLORS.rose : COLORS.silver
  const bg = accent === 'mint' ? COLORS.mintDim : accent === 'rose' ? COLORS.roseDim : COLORS.card
  const border = accent === 'mint' ? COLORS.mintBorder : accent === 'rose' ? COLORS.roseBorder : COLORS.border
  return (
    <div style={{ ...styles.card, background: bg, border: `1px solid ${border}`, marginBottom: 10 }}>
      <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 700, color: c, marginBottom: 8 }}>{icon} {title}</div>
      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 'var(--ccna-type-sm)', color: COLORS.silver, lineHeight: 1.5 }}>
        {(items || []).map((t, i) => <li key={i} style={{ marginBottom: 4 }}>{t}</li>)}
      </ul>
    </div>
  )
}

export default function LabView({ bundle, onBack, onDone, celebrate, haptic }) {
  const { lab, topology, validator, diagram, packetFlows } = bundle
  const showNavHint = useNavHint()

  const [phase, setPhase] = useState('learn')
  const [deviceSessions, setDeviceSessions] = useState({})
  const [entered, setEntered] = useState([])
  const [input, setInput] = useState('')
  const [taskCmdDone, setTaskCmdDone] = useState(() =>
    Object.fromEntries(lab.tasks.map(t => [t.id, (t.expectedCommands || []).map(() => false)])),
  )
  const [activeTaskIdx, setActiveTaskIdx] = useState(0)
  const [revealVerify, setRevealVerify] = useState(false)
  const taskScrollRef = useRef(null)
  const justCompleted = useRef(false)
  const iosStatesRef = useRef({})

  const prog = labProgress(lab.id, entered)
  const activeTask = lab.tasks[activeTaskIdx]
  const host = deviceHostname(activeTask?.device || 'R1')
  const session = deviceSessions[host] || defaultSession(host)
  const mode = session.mode
  const history = session.history

  function getIosState(h) {
    if (!iosStatesRef.current[h]) iosStatesRef.current[h] = createDeviceState(h)
    return iosStatesRef.current[h]
  }

  function updateSession(h, patch) {
    setDeviceSessions(prev => ({ ...prev, [h]: { ...(prev[h] || defaultSession(h)), ...patch } }))
  }

  useEffect(() => {
    if (prog.complete && !justCompleted.current) {
      justCompleted.current = true
      markLabDone(lab.id)
      onDone?.()
      celebrate?.()
      haptic?.([12, 40, 12])
      showNavHint(NAV_HINT_KEYS.LAB_DONE)
    }
  }, [prog.complete, lab.id, onDone, celebrate, haptic, showNavHint])

  const taskComplete = useCallback((t) => {
    const flags = taskCmdDone[t.id] || []
    return flags.length > 0 && flags.every(Boolean)
  }, [taskCmdDone])

  const scrollToTask = useCallback((idx) => {
    const el = taskScrollRef.current
    if (!el) return
    el.scrollTo({ left: el.offsetWidth * idx, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    const first = lab.tasks.findIndex(t => !taskComplete(t))
    const idx = first >= 0 ? first : 0
    setActiveTaskIdx(idx)
    requestAnimationFrame(() => scrollToTask(idx))
  }, [lab.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    lab.tasks.forEach((t, i) => {
      if (taskComplete(t)) {
        const next = lab.tasks.findIndex((tt, j) => j > i && !taskComplete(tt))
        if (next >= 0 && activeTaskIdx === i) {
          setActiveTaskIdx(next)
          scrollToTask(next)
        }
      }
    })
  }, [taskCmdDone, lab.tasks, taskComplete, activeTaskIdx, scrollToTask])

  function onTaskScroll() {
    const el = taskScrollRef.current
    if (!el?.offsetWidth) return
    const idx = Math.round(el.scrollLeft / el.offsetWidth)
    if (idx !== activeTaskIdx && idx >= 0 && idx < lab.tasks.length) setActiveTaskIdx(idx)
  }

  function submit() {
    const raw = input.trim()
    if (!raw || !activeTask) return

    const norm = normalizeCmd(raw)
    const expected = activeTask.expectedCommands || []
    const doneFlags = taskCmdDone[activeTask.id] || []
    const iosState = getIosState(host)
    const lines = [{ text: `${host}${CLI_MODE_PROMPT[mode]} ${raw}`, kind: 'cmd' }]
    const newlyCompleted = []
    let newMode = mode
    let newCtxName = session.ctxName

    // Task objectives are tracked independently of the realistic IOS engine
    // output below — a command only "counts" toward the task if it's also
    // valid from the current mode, mirroring real IOS gating.
    function checkObjectives() {
      const req = cliRequiredMode(norm)
      const nav = cliNavTarget(norm)
      const modeOk = nav ? nav.from.includes(mode) : mode === req
      if (!modeOk) return
      expected.forEach((cmd, i) => {
        if (!doneFlags[i] && commandMatches(norm, cmd)) newlyCompleted.push(i)
      })
    }

    if (norm === 'hint') {
      const nextIdx = doneFlags.findIndex(d => !d)
      lines.push({ text: nextIdx >= 0 ? `Hint: Enter — ${expected[nextIdx]}` : 'All commands for this task are complete.', kind: 'out' })
    } else if (norm === '?') {
      lines.push({ text: 'IOS help — navigate: enable → configure terminal → interface/vlan/router. Type exit/end to leave config. Type hint for task help.', kind: 'out' })
    } else if (norm === 'exit' || norm === 'end') {
      const exitTo = cliExitTarget(norm, mode)
      if (exitTo !== null) { newMode = exitTo; newCtxName = null }
    } else {
      const nav = cliNavTarget(norm)
      if (nav) {
        if (nav.from.includes(mode)) {
          newMode = nav.to
          newCtxName = nav.to === 'config-if' ? canonIface(nav.arg) : (nav.arg ?? null)
          checkObjectives()
        } else {
          lines.push({ text: `% "${raw}" is not available from ${CLI_MODE_PROMPT[mode]}. ${CLI_MODE_HINT[nav.from[0]] || ''}`, kind: 'warn' })
        }
      } else if (/^show /.test(norm)) {
        if (mode !== 'priv' && !mode.startsWith('config')) {
          lines.push({ text: "% show commands run from privileged EXEC — type 'enable' first.", kind: 'warn' })
        } else {
          const dyn = renderShow(norm, { state: iosState })
          if (dyn) dyn.forEach(row => lines.push({ text: row, kind: 'out' }))
          else if (CLI_SHOW_OUTPUT[norm]) CLI_SHOW_OUTPUT[norm].split('\n').forEach(row => lines.push({ text: row, kind: 'out' }))
          else lines.push({ text: '% Output not simulated for this show command in this lab.', kind: 'info' })
          checkObjectives()
        }
      } else if (/^ping (\S+)/.test(norm)) {
        if (mode !== 'priv' && !mode.startsWith('config')) {
          lines.push({ text: "% ping runs from privileged EXEC — type 'enable' first.", kind: 'warn' })
        } else {
          const target = norm.match(/^ping (\S+)/)[1]
          simulatePing({ target, deviceKey: host, allStates: iosStatesRef.current, labId: lab.id })
            .forEach(row => lines.push({ text: row, kind: 'out' }))
          checkObjectives()
        }
      } else {
        const result = applyConfigCommand({ state: iosState, norm, mode, target: { name: newCtxName } })
        if (result.matched && result.modeOk) {
          let out = result.lines
          if (/^ip address dhcp$/.test(norm) && newCtxName) {
            const leased = resolveDhcpClient(iosStatesRef.current, host, newCtxName)
            if (leased) out = [...out, `Interface ${displayIface(newCtxName)} assigned DHCP address ${leased}`]
          }
          out.forEach(row => lines.push({ text: row, kind: 'out' }))
          checkObjectives()
        } else if (result.matched && !result.modeOk) {
          lines.push({ text: `% Wrong mode. That command belongs in ${result.label}.`, kind: 'warn' })
        } else {
          checkObjectives()
          if (newlyCompleted.length) {
            lines.push({ text: '% OK', kind: 'ok' })
          } else {
            const firstWord = norm.split(' ')[0]
            const near = expected.find((cmd, i) => !doneFlags[i] && normalizeCmd(cmd).split(' ')[0] === firstWord)
            if (near) lines.push({ text: `% Incomplete or incorrect syntax. Expected: ${near}`, kind: 'warn' })
            else lines.push({ text: '% Invalid input. Type "hint" for help or "?" for navigation tips.', kind: 'warn' })
          }
        }
      }
    }

    updateSession(host, { mode: newMode, ctxName: newCtxName, history: [...session.history, ...lines] })
    setInput('')

    if (newlyCompleted.length) {
      const nextFlags = [...doneFlags]
      newlyCompleted.forEach(i => { nextFlags[i] = true })
      setTaskCmdDone(prev => ({ ...prev, [activeTask.id]: nextFlags }))
      setEntered(e => [...e, normalizeCliLine(raw), normalizeCmd(raw)])
    }
  }

  function startLab() {
    setPhase('practice')
  }

  return (
    <div>
      <button type="button" style={styles.backBtn} onClick={onBack}>‹ Back</button>
      <h1 style={styles.h1}>{lab.title}</h1>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        <span style={{ ...styles.pill(LAB_DIFF_ACCENT[lab.difficulty] || 'sky'), fontSize: 'var(--ccna-type-micro)' }}>{lab.difficulty.toUpperCase()}</span>
        {lab.labType === 'troubleshooting' && <span style={{ ...styles.pill('amber'), fontSize: 'var(--ccna-type-micro)' }}>TROUBLESHOOT</span>}
        <span style={{ ...styles.pill('silver'), fontSize: 'var(--ccna-type-micro)' }}>~{lab.estimatedTimeMinutes} MIN</span>
        <span style={{ ...styles.pill('silver'), fontSize: 'var(--ccna-type-micro)' }}>{lab.objectiveId}</span>
        {prog.complete && <span style={{ ...styles.pill('mint'), fontSize: 'var(--ccna-type-micro)' }}>✓ COMPLETE</span>}
      </div>

      {phase === 'learn' && (
        <LabLearnPanel
          lab={lab}
          topology={topology}
          diagram={diagram}
          packetFlows={packetFlows}
          onStart={startLab}
        />
      )}

      {phase === 'practice' && (
        <>
          <div style={{ ...styles.card, padding: 0, overflow: 'hidden', border: `1px solid ${COLORS.border}` }}>
            <div className="lab-practice-layout">
              <div className="lab-practice-tasks">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px 6px' }}>
                  <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 700, color: COLORS.silverMid, letterSpacing: 0.4 }}>
                    TASK {activeTaskIdx + 1} OF {lab.tasks.length}
                  </div>
                  <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid }}>
                    {prog.done.length}/{prog.total} lab commands
                  </div>
                </div>

                <div
                  ref={taskScrollRef}
                  onScroll={onTaskScroll}
                  className="ccna-h-scroll"
                  style={{
                    display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory',
                    scrollbarWidth: 'none',
                    width: '100%', maxWidth: '100%', overscrollBehaviorX: 'contain',
                  }}
                >
                  {lab.tasks.map(t => {
                    const allIn = taskComplete(t)
                    const flags = taskCmdDone[t.id] || []
                    return (
                      <div key={t.id} style={{ flex: '0 0 100%', scrollSnapAlign: 'start', boxSizing: 'border-box', padding: '4px 12px 10px', minHeight: 120 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <span style={{ color: allIn ? COLORS.mint : COLORS.silverMid, fontSize: 'var(--ccna-type-md)' }}>{allIn ? '✓' : t.order}</span>
                          <span style={{ fontSize: 'var(--ccna-type-sm)', fontWeight: 600, flex: 1, lineHeight: 1.3 }}>{t.title}</span>
                          <span style={{ ...styles.pill('purple'), fontSize: 'var(--ccna-type-micro)' }}>{t.device}</span>
                        </div>
                        <div style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.silverMid, lineHeight: 1.5, marginBottom: 8 }}>{t.instruction}</div>
                        <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 600, color: COLORS.sky, marginBottom: 4 }}>Commands for this step</div>
                        {(t.expectedCommands || []).map((c, i) => (
                          <div key={i} style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 'var(--ccna-type-xs)', color: flags[i] ? COLORS.mint : COLORS.silver, padding: '2px 0' }}>
                            {flags[i] ? '✓' : '›'} {c}
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '0 12px 8px' }}>
                  {lab.tasks.map((t, i) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => { setActiveTaskIdx(i); scrollToTask(i) }}
                      aria-label={`Task ${i + 1}: ${t.title}`}
                      style={{
                        width: i === activeTaskIdx ? 18 : 7, height: 7, borderRadius: 4, border: 'none', padding: 0,
                        background: taskComplete(t) ? COLORS.mint : i === activeTaskIdx ? COLORS.sky : COLORS.border,
                        cursor: 'pointer', transition: 'width 0.2s, background 0.2s',
                      }}
                    />
                  ))}
                </div>
              </div>

              <CiscoTerminal
                className="lab-practice-terminal"
                host={host}
                mode={mode}
                history={history}
                input={input}
                onInputChange={setInput}
                onSubmit={submit}
                emptyMessage={`${host} ready — type enable, then configure terminal.`}
              />
            </div>
          </div>

          <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverDim, textAlign: 'center', margin: '6px 0 12px' }}>
            Swipe tasks · IOS modes: &gt; → # → (config)# · Type hint or ?
          </div>
        </>
      )}

      {prog.complete && (
        <div style={{ ...styles.card, background: COLORS.mintDim, border: `1px solid ${COLORS.mintBorder}`, marginBottom: 12 }}>
          <div style={{ fontWeight: 700, color: COLORS.mint, fontSize: 'var(--ccna-type-md)' }}>✓ Lab complete</div>
          <div style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.silver, marginTop: 4 }}>
            All required commands entered with IOS-style validation. Try the verify commands below in the terminal with show.
          </div>
        </div>
      )}

      <div style={{ ...styles.card, marginBottom: 10 }}>
        <button type="button" onClick={() => setRevealVerify(v => !v)} style={{ display: 'flex', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: COLORS.silver }}>
          <span style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 700, color: COLORS.silverMid }}>🔍 VERIFY (show commands)</span>
          <span style={{ color: COLORS.silverMid }}>{revealVerify ? '−' : '+'}</span>
        </button>
        {revealVerify && (
          <div style={{ marginTop: 8 }}>
            {validator.verificationChecks.map(v => (
              <div key={v.id} style={{ marginBottom: 8 }}>
                <div style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 'var(--ccna-type-xs)', color: COLORS.sky }}>{v.device}# {v.command}</div>
                <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, lineHeight: 1.5 }}>→ {v.expectedResult}</div>
              </div>
            ))}
            {(validator.failureChecks || []).map(f => (
              <div key={f.id} style={{ marginBottom: 8 }}>
                <div style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 'var(--ccna-type-xs)', color: COLORS.rose }}>{f.device}# {f.command}</div>
                <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, lineHeight: 1.5 }}>→ {f.expectedFailure}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <LabSection icon="✅" title="SUCCESS CRITERIA" accent="mint" items={lab.successCriteria} />
      <LabSection icon="⚠️" title="COMMON MISTAKES" accent="rose" items={lab.commonMistakes} />
    </div>
  )
}
