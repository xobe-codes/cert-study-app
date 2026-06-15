#!/usr/bin/env node
/** One-shot helper: extracts ExplainTab/QuizTab line ranges from App.jsx into src/tabs/. */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const APP = join(ROOT, 'src', 'App.jsx')
const lines = readFileSync(APP, 'utf8').split('\n')

const slice = (start, end) => lines.slice(start - 1, end).join('\n')

const LESSON_IMPORTS = `import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { getCurated, hasCuratedReading, hasCuratedQuestions, getCuratedQuestions } from '../data/ccnaCurated.js'
import {
  TYPE_LABEL, SKILL_LABEL, isOrderingQuestion, isMcQuestion, gradeQuestion,
  shuffleArrayCopy, randomizeQuestionOrder,
} from '../questionUtils.js'
import { getLessonReference, hasLessonReference } from '../lesson/knowledgeReference.js'
import { buildConceptDetail } from '../lesson/conceptDetail.js'
import { pickReviewSet, computeCkuCoverage, getObjectiveCkuIds } from '../lesson/quizCoverage.js'
import {
  READING_TIERS, computeDefaultReadingTier, getReadingTier, readingTierHint,
  studyMetaToProgress, READING_TIER_KEYS,
} from '../lesson/readingTier.js'
import {
  explanationBodyFromReading, resolveBigTakeaway,
} from '../lesson/explanationFormat.js'
import { parseRichTextSegments } from '../lesson/richTextParse.js'
import CuratedDiagram from '../components/CuratedDiagram.jsx'
import CuratedStaticBadge from '../components/CuratedStaticBadge.jsx'
import OverflowMarquee from '../components/OverflowMarquee.jsx'
import { formatCuratedAttribution } from '../curatedDisplay.js'
import McChoices from '../components/McChoices.jsx'
import AnswerReview from '../components/AnswerReview.jsx'
import ErrorBox from '../components/ErrorBox.jsx'
import SvgConfetti from '../components/SvgConfetti.jsx'
import EngineerViewSection from '../components/EngineerViewSection.jsx'
import { getEngineerView } from '../lesson/engineerView.js'
import { COLORS, accentColors, styles } from '../ui/appTheme.js'
import { STATIC_COPY } from '../ui/staticContentCopy.js'
import { useNavHint } from '../components/NavHintProvider.jsx'
import { NAV_HINT_KEYS } from '../ui/navHintConfig.js'
import { BOOK_REF } from '../data/bookRefFull.js'
import {
  askClaudeJSON, MODEL, MODELS, AiBudgetWarning, EXPLAIN_CACHE_KEY,
  EXPLAIN_PROMPT_SYSTEM, EXPLAIN_SCHEMA, PREASSESS_CACHE_KEY,
  PREASSESS_PROMPT_SYSTEM, PREASSESS_SCHEMA, seedTestedOutReview, logEvent,
} from './tabAiDeps.js'
`

const QUIZ_IMPORTS = `import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { getCurated, hasCuratedQuestions, getCuratedQuestions } from '../data/ccnaCurated.js'
import {
  TYPE_LABEL, SKILL_LABEL, isOrderingQuestion, isMcQuestion, gradeQuestion, correctAnswerLabel,
  shuffleArrayCopy, randomizeQuestionOrder, computeBankMix, buildMissedEntry,
} from '../questionUtils.js'
import { pickReviewSet } from '../lesson/quizCoverage.js'
import { applyAnswerReviewToQuestion } from '../answerReviewLogic.js'
import { getMasteryChecklist } from '../lesson/masteryCriteria.js'
import McChoices from '../components/McChoices.jsx'
import AnswerReview from '../components/AnswerReview.jsx'
import ErrorBox from '../components/ErrorBox.jsx'
import Spinner from '../components/Spinner.jsx'
import DeferredExamTips from '../components/DeferredExamTips.jsx'
import MasteryChecklist from '../components/MasteryChecklist.jsx'
import { COLORS, styles } from '../ui/appTheme.js'
import { STATIC_COPY } from '../ui/staticContentCopy.js'
import { useNavHint } from '../components/NavHintProvider.jsx'
import { NAV_HINT_KEYS } from '../ui/navHintConfig.js'
import { DEFAULT_QUIZ_SESSION_SIZE, clampQuizSessionSize } from '../quizSessionConfig.js'
import { BOOK_REF } from '../data/bookRefFull.js'
import {
  askClaudeJSON, MODEL, MODELS, QUIZ_PROMPT_SYSTEM, QUIZ_SCHEMA,
  loadQuizBank, saveQuizBank, mergeIntoBank, recordQuizResult, enableSectionReview,
  loadDueQuestions, QUIZ_BANK_MIN, logEvent, haptic, celebrate, Skeleton,
} from './tabAiDeps.js'
import { objectiveTabId, objectivePanelId } from './tabIds.js'
`

mkdirSync(join(ROOT, 'src', 'tabs'), { recursive: true })

// lesson panels: PreAssessment through SubnetPracticeHome (1777-2346)
writeFileSync(join(ROOT, 'src', 'tabs', 'lessonPanels.jsx'), `${LESSON_IMPORTS}\n${slice(1777, 2346)}\n`)

// ExplainTab
writeFileSync(join(ROOT, 'src', 'tabs', 'ExplainTab.jsx'), `${LESSON_IMPORTS}
import {
  PreAssessment, ExplainBlock, RichText, Bullets, ExplanationSection, StructuredExplanation,
  CuratedReading, CuratedSources, SourcesPanel, BookRefPanel, LessonReferencePanel,
  LessonViewTabs, CkuCoverageChip, KeyTermsCarousel, CuratedPacketFlow, Skeleton,
} from './lessonPanels.jsx'

${slice(2348, 2564).replace('function ExplainTab', 'export function ExplainTab')}
`)

// quiz panels + constants block
writeFileSync(join(ROOT, 'src', 'tabs', 'quizPanels.jsx'), `${QUIZ_IMPORTS}\n${slice(2566, 2823)}\n`)

writeFileSync(join(ROOT, 'src', 'tabs', 'QuizTab.jsx'), `${QUIZ_IMPORTS}
import {
  BankMixDisplay, OrderingQuestion, QuestionMeta, QuizCompleteCard,
} from './quizPanels.jsx'

${slice(2824, 3295).replace('function QuizTab', 'export function QuizTab')}
`)

console.log('Extracted tab files — wire tabAiDeps.js, bookRefFull.js, tabIds.js, then update App.jsx imports')
