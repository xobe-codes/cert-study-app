import React, { useState, useEffect, useCallback, useRef } from 'react'
import { COLORS, styles } from '../ui/appTheme.js'
import OverflowMarquee from '../components/OverflowMarquee.jsx'
import CiscoTerminal from '../components/CiscoTerminal.jsx'
import { normalizeCmd, processCliLine, cliHostnameForObjective } from './cliEngine.js'
import { COMMAND_DRILLS } from './commandDrills.js'
import { recordCliLabResult } from './cliStatsStorage.js'
import { logEvent } from '../eventLog.js'
import { useMasteryProgress } from '../features/progress/MasteryProgressContext.jsx'
import { ENGAGEMENT_KINDS } from '../features/progress/masteryEngagement.js'

import { useMobileGestureBlock } from '../ui/useMobileGestureBlock.js'

export default function CLIDrillTab({ objective }) {
  const { recordEngagement } = useMasteryProgress()
  const drills = COMMAND_DRILLS[objective.id] || []
  const host = cliHostnameForObjective(objective.id)

  const [mode, setMode] = useState('user')
  const [input, setInput] = useState('')
  const [history, setHistory] = useState([])
  const [statuses, setStatuses] = useState(() => drills.map(() => false))
  const [hintIdx, setHintIdx] = useState(null)
  const [done, setDone] = useState(false)
  const counters = useRef({ commandsEntered: 0, syntaxErrors: 0, wrongModeErrors: 0, hintsUsed: 0 })

  useMobileGestureBlock({ pull: true, edge: true })

  const reset = useCallback(() => {
    setMode('user'); setInput(''); setHistory([]); setStatuses(drills.map(() => false))
    setHintIdx(null); setDone(false)
    counters.current = { commandsEntered: 0, syntaxErrors: 0, wrongModeErrors: 0, hintsUsed: 0 }
  }, [drills])

  useEffect(() => { reset() }, [objective.id, reset])

  if (drills.length === 0) {
    return <p style={styles.small}>No CLI lab is defined for this objective.</p>
  }

  function submit() {
    const raw = input.trim()
    if (!raw) return

    const objectives = drills.map(d => ({ answer: d.answer, label: d.prompt, hint: d.hint }))
    const result = processCliLine({ raw, mode, host, objectives, completed: statuses })

    setInput('')
    counters.current.commandsEntered += 1
    counters.current.syntaxErrors += result.counters.syntaxErrors
    counters.current.wrongModeErrors += result.counters.wrongModeErrors

    if (normalizeCmd(raw) === 'hint') {
      const nextIdx = statuses.findIndex(s => !s)
      if (nextIdx >= 0) { setHintIdx(nextIdx); counters.current.hintsUsed += 1 }
    }

    let lines = [...result.lines]
    let nextStatuses = statuses

    if (result.newlyCompleted.length) {
      nextStatuses = [...statuses]
      result.newlyCompleted.forEach(i => {
        nextStatuses[i] = true
        lines = lines.map(l => (
          l.kind === 'ok' && l.text.startsWith('% OK —')
            ? { text: `% Objective complete: ${drills[i].prompt}`, kind: 'ok' }
            : l
        ))
        logEvent('user_entered_cli_command', { objectiveId: objective.id, ok: true })
      })
      setStatuses(nextStatuses)

      if (nextStatuses.every(Boolean)) {
        const completedCount = nextStatuses.filter(Boolean).length
        const score = Math.round((completedCount / drills.length) * 100)
        lines.push({ text: `% Lab complete — ${completedCount}/${drills.length} objectives. Score: ${score}%`, kind: 'ok' })
        setDone(true)
        recordCliLabResult(objective.id, {
          completed: true, score,
          completedObjectives: completedCount, totalObjectives: drills.length,
          ...counters.current,
        })
        logEvent('user_completed_cli_lab', { objectiveId: objective.id, score })
        recordEngagement?.(objective.id, {
          kind: ENGAGEMENT_KINDS.CLI_DRILL,
          correct: completedCount,
          total: drills.length,
        })
      }
    } else if (result.counters.syntaxErrors) {
      logEvent('user_entered_cli_command', { objectiveId: objective.id, ok: false, reason: 'syntax' })
    } else if (result.counters.wrongModeErrors) {
      logEvent('user_entered_cli_command', { objectiveId: objective.id, ok: false, reason: 'mode' })
    }

    setHistory(h => [...h, ...lines])
    setMode(result.newMode)
  }

  const completed = statuses.filter(Boolean).length

  function getTeachHint(raw) {
    const nextIdx = statuses.findIndex(s => !s)
    if (nextIdx < 0) return null
    const nextCmd = drills[nextIdx].answer
    const trimmed = normalizeCmd(raw)
    if (!trimmed || trimmed.length < 2) return null
    const nextNorm = normalizeCmd(nextCmd)
    if (nextNorm.startsWith(trimmed) && trimmed !== nextNorm) {
      return `Next: ${nextCmd}`
    }
    return null
  }

  return (
    <div>
      <p style={{ ...styles.small, marginBottom: 10 }}>
        Interactive IOS lab. Type real commands — navigate with <code style={{ fontFamily: 'ui-monospace, monospace' }}>enable</code>, <code style={{ fontFamily: 'ui-monospace, monospace' }}>configure terminal</code>, <code style={{ fontFamily: 'ui-monospace, monospace' }}>interface …</code>, <code style={{ fontFamily: 'ui-monospace, monospace' }}>exit</code>. Type <code style={{ fontFamily: 'ui-monospace, monospace' }}>hint</code> anytime.
      </p>

      <div style={{ ...styles.card, padding: 12, marginBottom: 10 }}>
        <div style={{ ...styles.small, fontWeight: 700, marginBottom: 8 }}>Lab objectives · {completed}/{drills.length}</div>
        {drills.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '4px 0', borderBottom: i < drills.length - 1 ? `1px solid ${COLORS.border}` : 'none' }}>
            <span style={{ color: statuses[i] ? COLORS.mint : COLORS.silverDim, fontSize: 'var(--ccna-type-sm)', marginTop: 1 }}>{statuses[i] ? '✓' : '○'}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 'var(--ccna-type-sm)', color: statuses[i] ? COLORS.silverMid : COLORS.silver, lineHeight: 1.4, textDecoration: statuses[i] ? 'line-through' : 'none' }}>
                <OverflowMarquee text={d.prompt} style={{ fontSize: 'var(--ccna-type-sm)' }} />
              </div>
              {hintIdx === i && <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.sky, marginTop: 2 }}>Hint: {d.hint}</div>}
            </div>
            {!statuses[i] && (
              <button
                type="button"
                onClick={() => { setHintIdx(i); counters.current.hintsUsed += 1 }}
                style={{ background: 'none', border: 'none', color: COLORS.silverMid, fontSize: 'var(--ccna-type-xs)', cursor: 'pointer', padding: '2px 4px', minHeight: 28 }}
              >Hint</button>
            )}
          </div>
        ))}
      </div>

      <div style={{ ...styles.card, padding: 0, overflow: 'hidden', border: `1px solid ${COLORS.border}`, marginBottom: 8, display: 'flex', flexDirection: 'column', minHeight: 'min(36dvh, 320px)' }}>
        <CiscoTerminal
          className="cisco-terminal--fluid lab-practice-terminal"
          host={host}
          mode={mode}
          history={history}
          input={input}
          onInputChange={setInput}
          onSubmit={submit}
          teachHint={getTeachHint(input)}
          disabled={done}
          emptyMessage={`${host} terminal ready. Type enable to begin.`}
        />
      </div>

      {done && (
        <button type="button" style={styles.primaryBtn} onClick={reset}>Restart lab</button>
      )}
    </div>
  )
}
