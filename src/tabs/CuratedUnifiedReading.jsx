import React, { useEffect, useMemo, useRef, useState } from 'react'
import { labsForObjective } from '../data/ccnaLabs.js'
import { READING_TIER_KEYS, readingTierHint } from '../lesson/readingTier.js'
import { shouldDefaultOpenRealWorld } from '../lesson/readingEnrichment.js'
import { buildUnifiedLesson } from '../lesson/unifiedLessonDoc.js'
import { createSectionTtsPlaylist } from '../lib/sectionTtsPlaylist.js'
import { bulletsToSpeech } from '../lib/readingTts.js'
import { formatCuratedAttribution } from '../curatedDisplay.js'
import CuratedVisualBundle from '../components/CuratedVisualBundle.jsx'
import CuratedStaticBadge from '../components/CuratedStaticBadge.jsx'
import OverflowMarquee from '../components/OverflowMarquee.jsx'
import EngineerViewSection from '../components/EngineerViewSection.jsx'
import QuestionHealthAdminSection from '../components/QuestionHealthAdminSection.jsx'
import { ReadingTtsControls } from '../components/ReadingTtsControls.jsx'
import { COLORS, styles } from '../ui/appTheme.js'
import { STATIC_COPY } from '../ui/staticContentCopy.js'
import { EXAM_SOURCES } from './studyConstants.js'
import { RichText, Bullets } from './studyQuizShared.jsx'
import ObjectiveLabCTA from './ObjectiveLabCTA.jsx'

/** Spec 9+15 curated unified lesson spine (extracted from ExplainTab for size). */
export default function CuratedUnifiedReading({
  data,
  progressEntry,
  onTierChange,
  onOpenReference,
  onOpenLab,
  showDiagram = true,
  ExplainBlock,
  CoreConceptsBlock,
}) {
  const lesson = useMemo(() => buildUnifiedLesson(data, { id: data.objectiveId, title: data.title }), [data])
  const [activeSection, setActiveSection] = useState(null)
  const playlistRef = useRef(null)

  useEffect(() => {
    onTierChange?.(READING_TIER_KEYS.unified)
  }, [data.objectiveId, onTierChange])

  useEffect(() => {
    const sections = [
      { id: 'plain', text: lesson.plainEnglish },
      { id: 'how', text: lesson.howItWorks },
      { id: 'exam', text: lesson.examEngineer },
      { id: 'remember', text: bulletsToSpeech(lesson.rememberThis) },
      { id: 'confuse', text: bulletsToSpeech(lesson.dontConfuse) },
    ].filter(s => String(s.text || '').trim())
    playlistRef.current = createSectionTtsPlaylist(sections, {
      autoAdvance: true,
      onActiveSectionChange: setActiveSection,
    })
    return () => playlistRef.current?.stop?.()
  }, [lesson])

  const r = data.reading
  const openRealWorld = shouldDefaultOpenRealWorld(data)
  const attribution = formatCuratedAttribution(r.sourceRefs, data.objectiveId)
  const hint = useMemo(() => readingTierHint(progressEntry, READING_TIER_KEYS.unified), [progressEntry])
  const lessonSpeech = useMemo(() => [
    lesson.hook,
    lesson.plainEnglish,
    lesson.howItWorks,
    lesson.examEngineer,
    lesson.rememberThis.length ? `Remember this. ${bulletsToSpeech(lesson.rememberThis)}` : '',
    lesson.dontConfuse.length ? `Don't confuse. ${bulletsToSpeech(lesson.dontConfuse)}` : '',
  ].filter(Boolean).join(' '), [lesson])

  function sectionStyle(id) {
    return activeSection === id
      ? { outline: `2px solid ${COLORS.skyBorder}`, borderRadius: 10, background: COLORS.skyDim }
      : undefined
  }

  return (
    <div className="ccna-stagger objective-reading-prose lesson-prose">
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, flexWrap: 'nowrap' }}>
        <CuratedStaticBadge objectiveId={data.objectiveId} fontSize={10} />
        <OverflowMarquee text={attribution} style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid }} />
      </div>
      <ReadingTtsControls speechText={lessonSpeech} />
      {hint && (
        <div style={{
          ...styles.card, marginBottom: 10, padding: '10px 12px',
          borderColor: hint.type === 'testedOut' ? COLORS.mintBorder : COLORS.skyBorder,
          background: hint.type === 'testedOut' ? COLORS.mintDim : COLORS.skyDim,
        }}>
          <div style={{ fontSize: 'var(--ccna-type-sm)', lineHeight: 1.45, color: COLORS.silver, marginBottom: hint.showReferenceLink ? 8 : 0 }}>
            {hint.message}
          </div>
          {hint.showReferenceLink && onOpenReference && (
            <button type="button" style={styles.secondaryBtn} onClick={onOpenReference}>Traps & commands →</button>
          )}
        </div>
      )}
      {lesson.hook && (
        <div style={{ ...styles.card, marginBottom: 10, borderColor: COLORS.purpleBorder, background: COLORS.purpleDim }}>
          <div style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 700, color: COLORS.purple, marginBottom: 4 }}>WHY IT MATTERS</div>
          <div style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.silver, lineHeight: 1.45 }}>{lesson.hook}</div>
        </div>
      )}
      {showDiagram && data.diagram && (
        <div className="study-visual-section" style={{ marginTop: 4, marginBottom: 10 }}>
          <CuratedVisualBundle data={data} />
        </div>
      )}
      <div style={sectionStyle('plain')}>
        <ExplainBlock icon="📖" title="IN PLAIN ENGLISH" accent="sky" speechText={lesson.plainEnglish} onListen={() => playlistRef.current?.toggle('plain')}>
          <RichText text={lesson.plainEnglish} />
        </ExplainBlock>
      </div>
      <div style={sectionStyle('how')}>
        <ExplainBlock icon="⚙️" title="HOW IT WORKS" accent="amber" collapsible defaultOpen speechText={lesson.howItWorks} onListen={() => playlistRef.current?.toggle('how')}>
          <RichText text={lesson.howItWorks} />
        </ExplainBlock>
      </div>
      <div style={sectionStyle('exam')}>
        <ExplainBlock icon="🎯" title="EXAM / ENGINEER" accent="mint" collapsible defaultOpen speechText={lesson.examEngineer} onListen={() => playlistRef.current?.toggle('exam')}>
          <RichText text={lesson.examEngineer} />
        </ExplainBlock>
      </div>
      {lesson.rememberThis.length > 0 && (
        <div style={sectionStyle('remember')}>
          <ExplainBlock icon="📌" title="REMEMBER THIS" accent="amber" speechText={bulletsToSpeech(lesson.rememberThis)} onListen={() => playlistRef.current?.toggle('remember')}>
            <Bullets items={lesson.rememberThis} />
          </ExplainBlock>
        </div>
      )}
      {lesson.dontConfuse.length > 0 && (
        <div style={sectionStyle('confuse')}>
          <ExplainBlock icon="⚠️" title="DON'T CONFUSE" accent="rose" speechText={bulletsToSpeech(lesson.dontConfuse)} onListen={() => playlistRef.current?.toggle('confuse')}>
            <Bullets items={lesson.dontConfuse} />
          </ExplainBlock>
        </div>
      )}
      {lesson.terms.length > 0 && (
        <ExplainBlock icon="🔤" title="TERMS IN THIS LESSON" accent="purple" collapsible defaultOpen>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {lesson.terms.map(t => (
              <span key={t.id || t.term} style={{ ...styles.pill('purple'), fontSize: 'var(--ccna-type-micro)' }} title={t.detail}>{t.term}</span>
            ))}
          </div>
        </ExplainBlock>
      )}
      <CoreConceptsBlock ckus={data.ckus} />
      {lesson.realWorld && <ExplainBlock icon="🔧" title="REAL-WORLD APPLICATION" accent="purple" collapsible defaultOpen={openRealWorld} speechText={lesson.realWorld}><RichText text={lesson.realWorld} /></ExplainBlock>}
      {lesson.related?.length > 0 && <ExplainBlock icon="🔗" title="RELATED CONCEPTS" accent="sky" collapsible defaultOpen={false} speechText={bulletsToSpeech(lesson.related)}><Bullets items={lesson.related} /></ExplainBlock>}
      {data.engineerView && <EngineerViewSection data={data.engineerView} defaultOpen={openRealWorld} />}
      <QuestionHealthAdminSection objectiveId={data.objectiveId} />
      {labsForObjective(data.objectiveId).length > 0 && <ObjectiveLabCTA objectiveId={data.objectiveId} onOpenLab={onOpenLab} />}
      <CuratedSources data={data} />
    </div>
  )
}

function CuratedSources({ data }) {
  const [open, setOpen] = useState(false)
  const refs = data.reading.sourceRefs
  return (
    <div style={{ ...styles.card, padding: 12, marginTop: 4 }}>
      <button onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: COLORS.silver }}>
        <span style={{ fontSize: 'var(--ccna-type-xs)', fontWeight: 700, color: COLORS.silverMid }}>📚 SOURCES (verifiable)</span>
        <span style={{ fontSize: 'var(--ccna-type-sm)', color: COLORS.silverMid }}>{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div style={{ marginTop: 10, fontSize: 'var(--ccna-type-xs)', lineHeight: 1.5, color: COLORS.silverMid }}>
          <div style={{ marginBottom: 8 }}>
            <a href={EXAM_SOURCES.blueprintUrl} target="_blank" rel="noreferrer" style={{ color: COLORS.sky, textDecoration: 'none' }}>{EXAM_SOURCES.examName} exam topic {data.objectiveId}</a> — official blueprint (authoritative).
          </div>
          {refs.map((s, i) => (
            <div key={i} style={{ marginBottom: 6 }}>
              <span style={{ color: COLORS.silver }}>{s.sourceName}</span>{s.chapter ? ` — ${s.chapter}` : ''}.
              <span style={{ color: COLORS.silverDim }}> confidence {Math.round(s.confidence * 100)}%</span>
            </div>
          ))}
          <div style={{ marginTop: 6, fontSize: 'var(--ccna-type-xs)', color: COLORS.silverDim }}>{STATIC_COPY.sources}</div>
        </div>
      )}
    </div>
  )
}
