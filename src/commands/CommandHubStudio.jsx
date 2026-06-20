import React, { useCallback, useMemo, useState } from 'react'
import { DOMAINS } from '../data/ccnaDomains.js'
import { COLORS, styles } from '../ui/appTheme.js'
import { getCommandIndex } from './commandIndex.js'
import { searchCommandsGlobal, filterCommands } from './commandSearch.js'
import {
  COMMAND_PRESETS, CATEGORY_LABEL, MODE_LABEL, DEVICE_LABEL,
} from './commandWorkflows.js'
import CommandDetailPanel from './CommandDetailPanel.jsx'
import StudyModeHeader from '../components/StudyModeHeader.jsx'

const CATEGORY_FILTERS = [
  { id: 'all', label: 'All types' },
  { id: 'verify', label: 'Show / verify' },
  { id: 'config', label: 'Configure' },
  { id: 'host', label: 'Host tools' },
]

const DEVICE_FILTERS = [
  { id: 'all', label: 'All devices' },
  { id: 'router', label: 'Router' },
  { id: 'switch', label: 'Switch' },
  { id: 'any', label: 'Any IOS' },
  { id: 'host', label: 'Host PC' },
]

function categoryAccent(cat) {
  if (cat === 'verify') return 'sky'
  if (cat === 'config') return 'mint'
  if (cat === 'host') return 'amber'
  return 'silver'
}

export default function CommandHubStudio({ onBack, onSelectObjective }) {
  const index = useMemo(() => getCommandIndex(), [])

  const [tab, setTab] = useState('commands')
  const [search, setSearch] = useState('')
  const [domainFilter, setDomainFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [deviceFilter, setDeviceFilter] = useState('all')
  const [tagFilter, setTagFilter] = useState(null)
  const [detailCommand, setDetailCommand] = useState(null)
  const [expandedWorkflow, setExpandedWorkflow] = useState(null)

  const q = search.trim()

  const globalResults = useMemo(
    () => (q ? searchCommandsGlobal(index, q, { domainFilter, categoryFilter, deviceFilter }) : null),
    [index, q, domainFilter, categoryFilter, deviceFilter],
  )

  const commandList = useMemo(() => {
    if (q && globalResults) {
      const ids = new Set(globalResults.commands.map(x => x.command.id))
      return filterCommands(index, { domainFilter, categoryFilter, deviceFilter, tagFilter })
        .filter(c => ids.has(c.id))
    }
    return filterCommands(index, { domainFilter, categoryFilter, deviceFilter, tagFilter })
  }, [index, q, globalResults, domainFilter, categoryFilter, deviceFilter, tagFilter])

  const applyPreset = useCallback((preset) => {
    setTagFilter(preset.tags?.[0] || null)
    setCategoryFilter(preset.category || 'all')
    setSearch('')
    setDetailCommand(null)
    setTab('commands')
  }, [])

  const openObjective = useCallback((objectiveId) => {
    onSelectObjective?.(objectiveId)
  }, [onSelectObjective])

  const hasSearchResults = q && globalResults && (
    globalResults.commands.length + globalResults.workflows.length + globalResults.clusters.length
  ) > 0

  return (
    <div className="command-hub-studio">
      <StudyModeHeader
        title="Command Hub"
        onBack={onBack}
        subtitle="CCNA IOS reference — search commands, read what they do, see sample output, and follow config workflows."
      />

      <div className="command-hub-presets ccna-h-scroll" style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 12, paddingBottom: 4 }}>
        {COMMAND_PRESETS.map(p => (
          <button
            key={p.id}
            type="button"
            onClick={() => applyPreset(p)}
            style={{ ...styles.pill('sky'), border: 'none', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <input
        type="search"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search show ip route, conf t, vlan, OSPF…"
        className="command-hub-search"
        style={{
          width: '100%', boxSizing: 'border-box', marginBottom: 10, padding: '10px 12px',
          borderRadius: 10, border: `1px solid ${COLORS.border}`, background: COLORS.surface,
          color: COLORS.silver, fontSize: 'var(--ccna-type-md)', fontFamily: 'inherit',
        }}
      />

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
        <button type="button" onClick={() => setDomainFilter('all')}
          style={{ ...styles.pill(domainFilter === 'all' ? 'sky' : 'silver'), border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>All</button>
        {DOMAINS.map(d => (
          <button key={d.id} type="button" onClick={() => setDomainFilter(d.id)}
            style={{ ...styles.pill(domainFilter === d.id ? d.accent : 'silver'), border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            {d.weight}%
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
        {CATEGORY_FILTERS.map(f => (
          <button key={f.id} type="button" onClick={() => setCategoryFilter(f.id)}
            style={{ ...styles.pill(categoryFilter === f.id ? 'mint' : 'silver'), border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'var(--ccna-type-xs)' }}>
            {f.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {[
          { id: 'commands', label: `Commands (${index.commands.length})` },
          { id: 'workflows', label: `Workflows (${index.workflows.length})` },
        ].map(t => (
          <button key={t.id} type="button" onClick={() => { setTab(t.id); setDetailCommand(null) }}
            style={{ ...styles.pill(tab === t.id ? 'purple' : 'silver'), border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            {t.label}
          </button>
        ))}
        {DEVICE_FILTERS.map(f => (
          <button key={f.id} type="button" onClick={() => setDeviceFilter(f.id)}
            style={{ ...styles.pill(deviceFilter === f.id ? 'sky' : 'silver'), border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'var(--ccna-type-xs)' }}>
            {f.label}
          </button>
        ))}
      </div>

      {detailCommand && (
        <div style={{ marginBottom: 12 }}>
          <CommandDetailPanel
            command={detailCommand}
            index={index}
            onClose={() => setDetailCommand(null)}
            onOpenCommand={setDetailCommand}
            onOpenObjective={openObjective}
          />
        </div>
      )}

      <div className="command-hub-list" style={{ paddingBottom: 24 }}>
        {q && hasSearchResults && !detailCommand && globalResults.workflows.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 8, fontWeight: 600 }}>Matching workflows</div>
            {globalResults.workflows.map(({ workflow }) => (
              <div key={workflow.id} style={{ ...styles.card, marginBottom: 8, padding: '10px 12px' }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{workflow.title}</div>
                <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 8 }}>{workflow.description}</div>
                <button type="button" style={{ ...styles.secondaryBtn, fontSize: 'var(--ccna-type-xs)' }} onClick={() => { setTab('workflows'); setExpandedWorkflow(workflow.id); setSearch('') }}>
                  View steps
                </button>
              </div>
            ))}
          </div>
        )}

        {q && !hasSearchResults && !detailCommand && (
          <div style={{ ...styles.card, marginBottom: 12, fontSize: 'var(--ccna-type-sm)', color: COLORS.silverMid }}>
            No commands for “{q}”. Try show ip route, vlan, router ospf, or sh ip int brief.
          </div>
        )}

        {tab === 'commands' && commandList.map(cmd => {
          const isOpen = detailCommand?.id === cmd.id
          return (
            <div
              key={cmd.id}
              style={{
                ...styles.card,
                marginBottom: 8,
                padding: '10px 12px',
                border: isOpen ? `1px solid ${COLORS.purpleBorder}` : undefined,
              }}
            >
              <button
                type="button"
                onClick={() => setDetailCommand(isOpen ? null : cmd)}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', color: COLORS.silver, fontFamily: 'inherit', width: '100%' }}
              >
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                  <span style={{ ...styles.pill(categoryAccent(cmd.category)), fontSize: 'var(--ccna-type-micro)' }}>
                    {CATEGORY_LABEL[cmd.category]}
                  </span>
                  <span style={{ ...styles.pill('silver'), fontSize: 'var(--ccna-type-micro)' }}>
                    {MODE_LABEL[cmd.mode]?.split('(')[0]?.trim() || cmd.mode}
                  </span>
                  {cmd.objectiveIds.slice(0, 2).map(oid => (
                    <span key={oid} style={{ ...styles.pill('silver'), fontSize: 'var(--ccna-type-micro)' }}>{oid}</span>
                  ))}
                  {cmd.sampleOutput && <span style={{ ...styles.pill('purple'), fontSize: 'var(--ccna-type-micro)' }}>sample output</span>}
                </div>
                <code style={{ display: 'block', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 'var(--ccna-type-sm)', fontWeight: 600, color: COLORS.sky, marginBottom: 6, wordBreak: 'break-word' }}>
                  {cmd.command}
                </code>
                <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, lineHeight: 1.5 }}>
                  {cmd.purpose}
                </div>
              </button>
            </div>
          )
        })}

        {tab === 'workflows' && index.workflows.map(wf => {
          const isOpen = expandedWorkflow === wf.id
          return (
            <div key={wf.id} style={{ ...styles.card, marginBottom: 8, padding: 0, overflow: 'hidden' }}>
              <button
                type="button"
                onClick={() => setExpandedWorkflow(isOpen ? null : wf.id)}
                style={{ width: '100%', background: 'none', border: 'none', padding: '10px 12px', cursor: 'pointer', textAlign: 'left', color: COLORS.silver, fontFamily: 'inherit' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{wf.title}</div>
                    <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, lineHeight: 1.45 }}>{wf.description}</div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                      {wf.objectiveIds.map(oid => (
                        <span key={oid} style={{ ...styles.pill('sky'), fontSize: 'var(--ccna-type-micro)' }}>{oid}</span>
                      ))}
                      <span style={{ ...styles.pill('silver'), fontSize: 'var(--ccna-type-micro)' }}>{wf.steps.length} steps</span>
                    </div>
                  </div>
                  <span style={{ color: COLORS.silverMid }}>{isOpen ? '−' : '+'}</span>
                </div>
              </button>
              {isOpen && (
                <div style={{ borderTop: `1px solid ${COLORS.border}`, padding: '8px 12px 12px' }}>
                  {wf.steps.map(step => {
                    const linked = index.commands.find(c =>
                      c.command.toLowerCase().includes((step.commandMatch || step.commandText).toLowerCase().split(' ')[0])
                      && (step.commandMatch ? c.command.toLowerCase().includes(step.commandMatch.toLowerCase().split(' ')[0]) : true),
                    )
                    return (
                      <div key={step.order} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                        <span style={{ ...styles.pill('purple'), fontSize: 'var(--ccna-type-micro)', flexShrink: 0, marginTop: 2 }}>{step.order}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 600, marginBottom: 4 }}>{step.label}</div>
                          <code style={{ display: 'block', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 'var(--ccna-type-xs)', color: COLORS.mint, marginBottom: 4, wordBreak: 'break-word' }}>
                            {step.commandText}
                          </code>
                          <span style={{ fontSize: 'var(--ccna-type-micro)', color: COLORS.silverMid }}>{MODE_LABEL[step.mode] || step.mode}</span>
                          {linked && (
                            <button type="button" style={{ ...styles.secondaryBtn, display: 'block', marginTop: 6, fontSize: 'var(--ccna-type-micro)', padding: '4px 8px' }} onClick={() => { setTab('commands'); setDetailCommand(linked) }}>
                              Open reference
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {tab === 'commands' && commandList.length === 0 && !q && (
          <div style={{ ...styles.card, fontSize: 'var(--ccna-type-sm)', color: COLORS.silverMid }}>
            No commands match these filters. Try All domains or clear category filters.
          </div>
        )}
      </div>

      <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, textAlign: 'center', paddingBottom: 8 }}>
        {index.commands.length} commands · {index.workflows.length} workflows
      </div>
    </div>
  )
}
