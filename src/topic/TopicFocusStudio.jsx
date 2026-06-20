import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { DOMAINS } from '../data/ccnaDomains.js'
import { COLORS, accentColors, styles } from '../ui/appTheme.js'
import { computeCkuWeakness } from '../weaknessUtils.js'
import {
  getTopicIndex, TOPIC_PRESETS, CONCEPT_KIND_LABEL,
} from './topicIndex.js'
import { searchTopicsGlobal, dictionaryEntriesForDomain } from './topicSearch.js'
import { estimateTopicFocusQuestions } from './topicFocusQuiz.js'
import { preloadCleanBank } from '../data/cleanQuestionAdapter.js'
import {
  loadFocusSets, saveFocusSet, deleteFocusSet, loadPinnedConcepts, togglePinnedConcept,
} from './topicFocusStorage.js'
import TopicTermDetail from './TopicTermDetail.jsx'

const SORT_OPTIONS = [
  { id: 'domain', label: 'Domain' },
  { id: 'alpha', label: 'A–Z' },
  { id: 'objective', label: 'Objective #' },
]

function kindAccent(kind) {
  if (kind === 'trap') return 'rose'
  if (kind === 'glossary') return 'sky'
  if (kind === 'flashcard') return 'mint'
  if (kind === 'mnemonic') return 'amber'
  return 'purple'
}

function selectEntryForQuiz(entry, index, setSelectedConcepts, setSelectedObjectives) {
  setSelectedConcepts(prev => {
    const next = new Set(prev)
    for (const id of entry.conceptIds || []) next.add(id)
    return next
  })
  setSelectedObjectives(prev => {
    const next = new Set(prev)
    for (const id of entry.objectiveIds || []) next.add(id)
    return next
  })
}

export default function TopicFocusStudio({ onBack, onStart, missed = [] }) {
  const index = useMemo(() => getTopicIndex(), [])
  const weakCkUs = useMemo(() => new Set(computeCkuWeakness(missed).map(w => w.id)), [missed])

  const [tab, setTab] = useState('dictionary')
  const [search, setSearch] = useState('')
  const [domainFilter, setDomainFilter] = useState('all')
  const [sort, setSort] = useState('alpha')
  const [expandedObj, setExpandedObj] = useState(() => new Set())
  const [selectedObjectives, setSelectedObjectives] = useState(() => new Set())
  const [selectedConcepts, setSelectedConcepts] = useState(() => new Set())
  const [pinned, setPinned] = useState([])
  const [savedSets, setSavedSets] = useState([])
  const [saveName, setSaveName] = useState('')
  const [showSave, setShowSave] = useState(false)
  const [detailEntry, setDetailEntry] = useState(null)

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

  const q = search.trim()
  const globalResults = useMemo(
    () => (q ? searchTopicsGlobal(index, q, { domainFilter }) : null),
    [index, q, domainFilter],
  )

  const dictionaryList = useMemo(() => {
    let list = dictionaryEntriesForDomain(index, domainFilter)
    if (q) {
      const dictIds = new Set((globalResults?.dictionary || []).map(d => d.entry.id))
      list = list.filter(e => dictIds.has(e.id))
    }
    if (sort === 'alpha') return list
    if (sort === 'objective') {
      return [...list].sort((a, b) => (a.objectiveIds[0] || '').localeCompare(b.objectiveIds[0] || '', undefined, { numeric: true }))
    }
    return [...list].sort((a, b) => {
      const da = index.objectives.find(x => x.id === a.objectiveIds[0])?.domainId || ''
      const db = index.objectives.find(x => x.id === b.objectiveIds[0])?.domainId || ''
      return da.localeCompare(db) || a.term.localeCompare(b.term)
    })
  }, [index, domainFilter, q, globalResults, sort])

  const filteredObjectives = useMemo(() => {
    let list = index.objectives.filter(o => {
      if (domainFilter !== 'all' && o.domainId !== domainFilter) return false
      if (!q) return true
      return o.id.includes(q.toLowerCase()) || o.title.toLowerCase().includes(q.toLowerCase())
        || (globalResults?.objectives || []).some(x => x.objective.id === o.id)
    })
    if (sort === 'alpha') list = [...list].sort((a, b) => a.title.localeCompare(b.title))
    else if (sort === 'objective') list = [...list].sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))
    return list
  }, [index.objectives, domainFilter, q, sort, globalResults])

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
    setDetailEntry(null)
  }, [])

  const loadSet = useCallback((set) => {
    setSelectedObjectives(new Set(set.objectiveIds || []))
    setSelectedConcepts(new Set(set.conceptIds || []))
    setTab('objectives')
    setDetailEntry(null)
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedObjectives(new Set())
    setSelectedConcepts(new Set())
  }, [])

  const handleSelectAllFromEntry = useCallback((entry) => {
    selectEntryForQuiz(entry, index, setSelectedConcepts, setSelectedObjectives)
  }, [index])

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

  function openCluster(term) {
    const entry = index.dictionary.find(d => d.registryId === term.id)
    if (entry) setDetailEntry(entry)
    else setDetailEntry({
      id: `dict:${term.id}`,
      term: term.term,
      definition: term.definition,
      aliases: term.aliases,
      tags: term.tags,
      objectiveIds: term.objectiveIds,
      conceptIds: term.relatedConceptIds || [],
      source: 'registry',
      note: term.note || '',
      registryId: term.id,
    })
  }

  const selectionCount = selectedObjectives.size + selectedConcepts.size
  const canStart = selectionCount > 0 && questionEstimate > 0
  const hasSearchResults = q && globalResults && (
    globalResults.clusters.length + globalResults.dictionary.length
    + globalResults.objectives.length + globalResults.concepts.length
  ) > 0

  return (
    <div className="topic-focus-studio">
      <button type="button" style={styles.backBtn} onClick={onBack}>‹ Back</button>
      <h1 style={styles.h1}>Topic Focus</h1>
      <p style={{ ...styles.small, marginBottom: 12, lineHeight: 1.5 }}>
        CCNA Term Hub — search vocabulary, read full definitions, pick objectives and linked concepts, then drill quiz questions.
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
        placeholder="Search EIGRP, VLAN, NAT, traps, objectives…"
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
        {[
          { id: 'dictionary', label: 'Dictionary' },
          { id: 'objectives', label: 'By objective' },
          { id: 'saved', label: 'Saved sets' },
        ].map(t => (
          <button key={t.id} type="button" onClick={() => { setTab(t.id); setDetailEntry(null) }}
            style={{ ...styles.pill(tab === t.id ? 'purple' : 'silver'), border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            {t.label}
          </button>
        ))}
        {SORT_OPTIONS.map(s => (
          <button key={s.id} type="button" onClick={() => setSort(s.id)}
            style={{ ...styles.pill(sort === s.id ? 'mint' : 'silver'), border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'var(--ccna-type-xs)' }}>
            {s.label}
          </button>
        ))}
      </div>

      {detailEntry && (
        <div style={{ marginBottom: 12 }}>
          <TopicTermDetail
            entry={detailEntry}
            index={index}
            selectedConcepts={selectedConcepts}
            selectedObjectives={selectedObjectives}
            onClose={() => setDetailEntry(null)}
            onToggleConcept={toggleConcept}
            onToggleObjective={toggleObjective}
            onSelectAll={handleSelectAllFromEntry}
          />
        </div>
      )}

      <div className="topic-focus-list" style={{ paddingBottom: 88 }}>
        {q && hasSearchResults && !detailEntry && (
          <div className="topic-focus-search-results" style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, marginBottom: 8, fontWeight: 600 }}>
              Search results for “{q}”
            </div>

            {globalResults.clusters.map(({ term }) => {
              const qEst = estimateTopicFocusQuestions(term.objectiveIds || [], term.relatedConceptIds || [], index)
              return (
                <div key={term.id} className="topic-focus-cluster" style={{ ...styles.card, marginBottom: 8, padding: '12px 14px', border: `1px solid ${COLORS.purpleBorder}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                    <span style={{ ...styles.pill('purple'), fontSize: 'var(--ccna-type-micro)' }}>Topic cluster</span>
                    <span style={{ fontSize: 'var(--ccna-type-micro)', color: COLORS.silverMid }}>~{qEst} Q</span>
                  </div>
                  <button type="button" onClick={() => openCluster(term)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', color: COLORS.silver, fontFamily: 'inherit', width: '100%' }}>
                    <div style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 700, marginBottom: 6 }}>{term.term}</div>
                    <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, lineHeight: 1.45, marginBottom: 8 }}>
                      {term.definition.slice(0, 160)}{term.definition.length > 160 ? '…' : ''}
                    </div>
                  </button>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {(term.objectiveIds || []).map(oid => (
                      <span key={oid} style={{ ...styles.pill('sky'), fontSize: 'var(--ccna-type-micro)' }}>{oid}</span>
                    ))}
                    <span style={{ ...styles.pill('silver'), fontSize: 'var(--ccna-type-micro)' }}>
                      {term.relatedConceptIds?.length || 0} linked items
                    </span>
                  </div>
                  <button
                    type="button"
                    style={{ ...styles.secondaryBtn, width: '100%', marginTop: 10, fontSize: 'var(--ccna-type-sm)' }}
                    onClick={() => {
                      selectEntryForQuiz({
                        conceptIds: term.relatedConceptIds,
                        objectiveIds: term.objectiveIds,
                      }, index, setSelectedConcepts, setSelectedObjectives)
                    }}
                  >
                    Select cluster for quiz
                  </button>
                </div>
              )
            })}

            {globalResults.concepts.slice(0, 6).map(({ concept }) => {
              const sel = selectedConcepts.has(concept.id)
              return (
                <div key={concept.id} style={{ ...styles.card, marginBottom: 6, padding: '8px 12px', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <input type="checkbox" checked={sel} onChange={() => toggleConcept(concept.id)} style={{ marginTop: 4, width: 18, height: 18, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ ...styles.pill(kindAccent(concept.kind)), fontSize: 'var(--ccna-type-micro)' }}>{CONCEPT_KIND_LABEL[concept.kind]}</span>
                    <div style={{ fontSize: 'var(--ccna-type-sm)', fontWeight: 600, marginTop: 4 }}>{concept.label}</div>
                    {concept.definition && (
                      <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, lineHeight: 1.45, marginTop: 4 }}>
                        {concept.definition.slice(0, 120)}{concept.definition.length > 120 ? '…' : ''}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {q && !hasSearchResults && !detailEntry && (
          <div style={{ ...styles.card, marginBottom: 12, fontSize: 'var(--ccna-type-sm)', color: COLORS.silverMid }}>
            No matches for “{q}”. Try a protocol name (EIGRP, OSPF), acronym (VLAN, NAT), or objective number.
          </div>
        )}

        {tab === 'dictionary' && dictionaryList.map(entry => {
          const sel = (entry.conceptIds || []).some(id => selectedConcepts.has(id))
            || (entry.objectiveIds || []).some(id => selectedObjectives.has(id))
          const isOpen = detailEntry?.id === entry.id
          return (
            <div
              key={entry.id}
              style={{
                ...styles.card,
                marginBottom: 8,
                padding: '10px 12px',
                border: isOpen ? `1px solid ${COLORS.purpleBorder}` : sel ? `1px solid ${COLORS.skyBorder}` : undefined,
              }}
            >
              <button
                type="button"
                onClick={() => setDetailEntry(isOpen ? null : entry)}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', color: COLORS.silver, fontFamily: 'inherit', width: '100%' }}
              >
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
                  <span style={{ ...styles.pill(entry.source === 'registry' ? 'purple' : 'sky'), fontSize: 'var(--ccna-type-micro)' }}>
                    {entry.source === 'registry' ? 'CCNA term' : 'Glossary'}
                  </span>
                  {entry.objectiveIds.slice(0, 3).map(oid => (
                    <span key={oid} style={{ ...styles.pill('silver'), fontSize: 'var(--ccna-type-micro)' }}>{oid}</span>
                  ))}
                </div>
                <div style={{ fontSize: 'var(--ccna-type-sm)', fontWeight: 600, marginBottom: 6 }}>{entry.term}</div>
                <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, lineHeight: 1.5 }}>
                  {entry.definition}
                </div>
              </button>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button type="button" style={{ ...styles.secondaryBtn, flex: 1, fontSize: 'var(--ccna-type-xs)' }} onClick={() => setDetailEntry(entry)}>
                  Details
                </button>
                <button type="button" style={{ ...styles.secondaryBtn, flex: 1, fontSize: 'var(--ccna-type-xs)' }} onClick={() => handleSelectAllFromEntry(entry)}>
                  Add to quiz
                </button>
              </div>
            </div>
          )
        })}

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

        {tab === 'dictionary' && dictionaryList.length === 0 && !q && (
          <div style={{ ...styles.card, fontSize: 'var(--ccna-type-sm)', color: COLORS.silverMid }}>
            {index.dictionary?.length || 0} CCNA terms loaded. Use search to find EIGRP, OSPF, VLAN, and more.
          </div>
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
