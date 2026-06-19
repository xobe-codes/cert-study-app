import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { DOMAINS } from '../data/ccnaDomains.js'
import { COLORS, accentColors, styles } from '../ui/appTheme.js'
import { computeCkuWeakness } from '../weaknessUtils.js'
import {
  getTopicIndex, TOPIC_PRESETS, CONCEPT_KIND_LABEL,
} from './topicIndex.js'
import { estimateTopicFocusQuestions } from './topicFocusQuiz.js'
import { preloadCleanBank } from '../data/cleanQuestionAdapter.js'
import {
  loadFocusSets, saveFocusSet, deleteFocusSet, loadPinnedConcepts, togglePinnedConcept,
} from './topicFocusStorage.js'

const SORT_OPTIONS = [
  { id: 'domain', label: 'Domain' },
  { id: 'alpha', label: 'A–Z' },
  { id: 'objective', label: 'Objective #' },
]

function kindAccent(kind) {
  if (kind === 'trap') return 'rose'
  if (kind === 'glossary') return 'sky'
  if (kind === 'flashcard') return 'mint'
  return 'purple'
}

export default function TopicFocusStudio({ onBack, onStart, missed = [] }) {
  const index = useMemo(() => getTopicIndex(), [])
  const weakCkUs = useMemo(() => new Set(computeCkuWeakness(missed).map(w => w.id)), [missed])

  const [tab, setTab] = useState('objectives')
  const [search, setSearch] = useState('')
  const [domainFilter, setDomainFilter] = useState('all')
  const [sort, setSort] = useState('domain')
  const [expandedObj, setExpandedObj] = useState(() => new Set())
  const [selectedObjectives, setSelectedObjectives] = useState(() => new Set())
  const [selectedConcepts, setSelectedConcepts] = useState(() => new Set())
  const [pinned, setPinned] = useState([])
  const [savedSets, setSavedSets] = useState([])
  const [saveName, setSaveName] = useState('')
  const [showSave, setShowSave] = useState(false)

  useEffect(() => {
    preloadCleanBank()
    loadPinnedConcepts().then(setPinned)
    loadFocusSets().then(setSavedSets)
  }, [])

  const objectiveIds = useMemo(() => [...selectedObjectives], [selectedObjectives])
  const conceptIds = useMemo(() => [...selectedConcepts], [selectedConcepts])
  const questionEstimate = useMemo(
    () => estimateTopicFocusQuestions(objectiveIds, conceptIds, index),
    [objectiveIds, conceptIds, index],
  )

  const q = search.trim().toLowerCase()

  const filteredObjectives = useMemo(() => {
    let list = index.objectives.filter(o => {
      if (domainFilter !== 'all' && o.domainId !== domainFilter) return false
      if (!q) return true
      return o.id.includes(q) || o.title.toLowerCase().includes(q)
    })
    if (sort === 'alpha') list = [...list].sort((a, b) => a.title.localeCompare(b.title))
    else if (sort === 'objective') list = [...list].sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))
    return list
  }, [index.objectives, domainFilter, q, sort])

  const filteredConcepts = useMemo(() => {
    let list = index.concepts.filter(c => {
      if (domainFilter !== 'all') {
        const o = index.objectives.find(x => x.id === c.objectiveId)
        if (o?.domainId !== domainFilter) return false
      }
      if (!q) return true
      return c.searchText.includes(q) || c.label.toLowerCase().includes(q)
    })
    if (sort === 'alpha') list = [...list].sort((a, b) => a.label.localeCompare(b.label))
    else if (sort === 'objective') list = [...list].sort((a, b) => a.objectiveId.localeCompare(b.objectiveId, undefined, { numeric: true }))
    else list = [...list].sort((a, b) => {
      const da = index.objectives.find(x => x.id === a.objectiveId)?.domainId || ''
      const db = index.objectives.find(x => x.id === b.objectiveId)?.domainId || ''
      return da.localeCompare(db) || a.label.localeCompare(b.label)
    })
    return list
  }, [index, domainFilter, q, sort])

  const toggleObjective = useCallback((id) => {
    setSelectedObjectives(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleConcept = useCallback((id) => {
    setSelectedConcepts(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleExpand = useCallback((id) => {
    setExpandedObj(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const applyPreset = useCallback((preset) => {
    setSelectedObjectives(new Set(preset.objectiveIds))
    setSelectedConcepts(new Set())
    setTab('objectives')
  }, [])

  const loadSet = useCallback((set) => {
    setSelectedObjectives(new Set(set.objectiveIds || []))
    setSelectedConcepts(new Set(set.conceptIds || []))
    setTab('objectives')
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedObjectives(new Set())
    setSelectedConcepts(new Set())
  }, [])

  async function handleSaveSet() {
    const entry = await saveFocusSet({
      name: saveName,
      objectiveIds,
      conceptIds,
    })
    setSavedSets(await loadFocusSets())
    setSaveName('')
    setShowSave(false)
    return entry
  }

  async function handlePin(conceptId) {
    const next = await togglePinnedConcept(conceptId)
    setPinned(next)
  }

  function startQuiz() {
    if (!objectiveIds.length && !conceptIds.length) return
    onStart?.({
      objectiveIds,
      conceptIds,
      label: 'Topic Focus',
    })
  }

  const selectionCount = selectedObjectives.size + selectedConcepts.size
  const canStart = selectionCount > 0 && questionEstimate > 0

  return (
    <div className="topic-focus-studio">
      <button type="button" style={styles.backBtn} onClick={onBack}>‹ Back</button>
      <h1 style={styles.h1}>Topic Focus</h1>
      <p style={{ ...styles.small, marginBottom: 12, lineHeight: 1.5 }}>
        Pick exam objectives and specific terms — then drill only those questions. Ideal after an external practice test.
      </p>

      <div className="topic-focus-presets ccna-h-scroll" style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 12, paddingBottom: 4 }}>
        {TOPIC_PRESETS.map(p => (
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
        placeholder="Search terms, traps, objectives…"
        className="topic-focus-search"
        style={{
          width: '100%', boxSizing: 'border-box', marginBottom: 10, padding: '10px 12px',
          borderRadius: 10, border: `1px solid ${COLORS.border}`, background: COLORS.surface,
          color: COLORS.silver, fontSize: 'var(--ccna-type-md)', fontFamily: 'inherit',
        }}
      />

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        <button type="button" onClick={() => setDomainFilter('all')}
          style={{ ...styles.pill(domainFilter === 'all' ? 'sky' : 'silver'), border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>All</button>
        {DOMAINS.map(d => (
          <button key={d.id} type="button" onClick={() => setDomainFilter(d.id)}
            style={{ ...styles.pill(domainFilter === d.id ? d.accent : 'silver'), border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            {d.weight}%
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {['objectives', 'concepts', 'saved'].map(t => (
          <button key={t} type="button" onClick={() => setTab(t)}
            style={{ ...styles.pill(tab === t ? 'purple' : 'silver'), border: 'none', cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize' }}>
            {t === 'saved' ? 'Saved sets' : t === 'objectives' ? 'By objective' : 'All concepts'}
          </button>
        ))}
        {SORT_OPTIONS.map(s => (
          <button key={s.id} type="button" onClick={() => setSort(s.id)}
            style={{ ...styles.pill(sort === s.id ? 'mint' : 'silver'), border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'var(--ccna-type-xs)' }}>
            {s.label}
          </button>
        ))}
      </div>

      <div className="topic-focus-list" style={{ paddingBottom: 88 }}>
        {tab === 'objectives' && filteredObjectives.map(o => {
          const isOpen = expandedObj.has(o.id)
          const checked = selectedObjectives.has(o.id)
          const concepts = o.conceptIds.map(id => index.conceptById.get(id)).filter(Boolean)
          const c = accentColors(o.accent)
          return (
            <div key={o.id} style={{ ...styles.card, marginBottom: 8, padding: 0, overflow: 'hidden', border: checked ? `1px solid ${c.border}` : `1px solid ${COLORS.border}` }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 12px' }}>
                <input type="checkbox" checked={checked} onChange={() => toggleObjective(o.id)} aria-label={`Select ${o.id}`} style={{ marginTop: 4, width: 18, height: 18, flexShrink: 0 }} />
                <button type="button" onClick={() => toggleExpand(o.id)} style={{ flex: 1, minWidth: 0, background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', color: COLORS.silver, fontFamily: 'inherit' }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
                    <span style={{ ...styles.pill(o.accent), fontSize: 'var(--ccna-type-micro)' }}>{o.id}</span>
                    <span style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid }}>{concepts.length} concepts</span>
                  </div>
                  <div style={{ fontSize: 'var(--ccna-type-sm)', fontWeight: 600, lineHeight: 1.4 }}>{o.title}</div>
                </button>
                <span style={{ color: COLORS.silverMid, fontSize: 'var(--ccna-type-sm)' }}>{isOpen ? '−' : '+'}</span>
              </div>
              {isOpen && concepts.length > 0 && (
                <div style={{ borderTop: `1px solid ${COLORS.border}`, padding: '8px 12px 10px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {concepts.map(con => {
                    const sel = selectedConcepts.has(con.id)
                    const isWeak = con.ckuIds?.some(k => weakCkUs.has(k))
                    const isPin = pinned.includes(con.id)
                    return (
                      <button
                        key={con.id}
                        type="button"
                        onClick={() => toggleConcept(con.id)}
                        style={{
                          ...styles.pill(sel ? kindAccent(con.kind) : 'silver'),
                          border: sel ? 'none' : `1px solid ${COLORS.border}`,
                          cursor: 'pointer', fontFamily: 'inherit', maxWidth: '100%',
                          textAlign: 'left', lineHeight: 1.3, padding: '6px 10px',
                        }}
                      >
                        <span style={{ fontSize: 'var(--ccna-type-micro)', opacity: 0.85 }}>{CONCEPT_KIND_LABEL[con.kind]} · {con.objectiveId}</span>
                        <div style={{ fontSize: 'var(--ccna-type-xs)' }}>{con.label}{isWeak ? ' · weak' : ''}{isPin ? ' · 📌' : ''}</div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {tab === 'concepts' && filteredConcepts.map(con => {
          const sel = selectedConcepts.has(con.id)
          const isWeak = con.ckuIds?.some(k => weakCkUs.has(k))
          return (
            <div key={con.id} style={{ ...styles.card, marginBottom: 8, padding: '10px 12px', display: 'flex', gap: 10, alignItems: 'flex-start', border: sel ? `1px solid ${COLORS.skyBorder}` : undefined }}>
              <input type="checkbox" checked={sel} onChange={() => toggleConcept(con.id)} aria-label={`Select ${con.label}`} style={{ marginTop: 4, width: 18, height: 18, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
                  <span style={{ ...styles.pill(kindAccent(con.kind)), fontSize: 'var(--ccna-type-micro)' }}>{CONCEPT_KIND_LABEL[con.kind]}</span>
                  <span style={{ ...styles.pill('silver'), fontSize: 'var(--ccna-type-micro)' }}>{con.objectiveId}</span>
                  {isWeak && <span style={{ ...styles.pill('rose'), fontSize: 'var(--ccna-type-micro)' }}>weak area</span>}
                </div>
                <div style={{ fontSize: 'var(--ccna-type-sm)', fontWeight: 600, marginBottom: 4 }}>{con.label}</div>
                {con.detail && <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, lineHeight: 1.45 }}>{con.detail}</div>}
              </div>
              <button type="button" onClick={() => handlePin(con.id)} aria-label="Pin concept" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 'var(--ccna-type-md)', padding: 4 }}>
                {pinned.includes(con.id) ? '📌' : '○'}
              </button>
            </div>
          )
        })}

        {tab === 'saved' && (
          savedSets.length === 0 ? (
            <div style={{ ...styles.card, fontSize: 'var(--ccna-type-sm)', color: COLORS.silverMid }}>No saved sets yet. Select topics and tap Save set.</div>
          ) : savedSets.map(set => (
            <div key={set.id} style={{ ...styles.card, marginBottom: 8, padding: '10px 12px' }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{set.name}</div>
              <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 8 }}>
                {set.objectiveIds?.length || 0} objectives · {set.conceptIds?.length || 0} concepts
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" style={{ ...styles.secondaryBtn, flex: 1, fontSize: 'var(--ccna-type-sm)' }} onClick={() => loadSet(set)}>Load</button>
                <button type="button" style={{ ...styles.secondaryBtn, fontSize: 'var(--ccna-type-sm)', color: COLORS.rose }} onClick={async () => setSavedSets(await deleteFocusSet(set.id))}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="topic-focus-bar">
        <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 6 }}>
          {selectedObjectives.size} objective{selectedObjectives.size === 1 ? '' : 's'} · {selectedConcepts.size} concept{selectedConcepts.size === 1 ? '' : 's'} · ~{questionEstimate} Q
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" style={{ ...styles.secondaryBtn, flex: '1 1 80px', fontSize: 'var(--ccna-type-sm)' }} onClick={clearSelection} disabled={!selectionCount}>Clear</button>
          <button type="button" style={{ ...styles.secondaryBtn, flex: '1 1 80px', fontSize: 'var(--ccna-type-sm)' }} onClick={() => setShowSave(v => !v)} disabled={!selectionCount}>Save set</button>
          <button type="button" style={{ ...styles.primaryBtn, flex: '2 1 140px' }} onClick={startQuiz} disabled={!canStart}>
            Start quiz
          </button>
        </div>
        {showSave && (
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <input value={saveName} onChange={e => setSaveName(e.target.value)} placeholder="e.g. Boson test 2 — routing"
              style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: `1px solid ${COLORS.border}`, background: COLORS.surface, color: COLORS.silver, fontFamily: 'inherit' }} />
            <button type="button" style={styles.primaryBtn} onClick={handleSaveSet}>Save</button>
          </div>
        )}
      </div>
    </div>
  )
}
