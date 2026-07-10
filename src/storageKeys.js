export const STORAGE_KEYS = {
  progress: 'ccna_progress_v1',
  missed: 'ccna_missed_v1',
  streak: 'ccna_streak_v1',
  quizBank: 'ccna_quiz_bank_v1',
  visualCache: 'ccna_visual_cache_v1',
  events: 'ccna_events_v1',
  cliStats: 'ccna_cli_stats_v1',
  syncCode: 'ccna_sync_code_v1',
  syncLast: 'ccna_sync_last_v1',
  usage: 'ccna_usage_v1',
  tutorChat: 'ccna_tutor_chat_v1',
  mockInterviewChat: 'ccna_mock_interview_chat_v1',
  labDone: 'ccna_lab_done_v1',
  theme: 'ccna_theme_v1',
  onboardDone: 'ccna_onboard_done_v1',
  tourDone: 'ccna_tour_done_v1',
  examDate: 'ccna_exam_date_v1',
  reduceMotion: 'ccna_reduce_motion_v1',
  mockHistory: 'ccna_mock_history_v1',
  examMode: 'ccna_exam_mode_v1',
  nudgeDismissed: 'ccna_nudge_dismissed_v1',
  /** Per-objective Study-first / Refresh-Study soft-gate dismiss date (YYYY-MM-DD). */
  studyCoachDismissed: 'ccna_study_coach_dismissed_v1',
  quizSessionSize: 'ccna_quiz_session_size_v1',
  studyBlock: 'ccna_study_block_v1',
  premiumUnlocked: 'ccna_premium_unlocked_v1',
  tutorTtsEnabled: 'ccna_tutor_tts_v1',
  readingTtsEnabled: 'ccna_reading_tts_v1',
  labsDomainFilter: 'ccna_labs_domain_filter_v1',
  commandHubDomainFilter: 'ccna_command_hub_domain_filter_v1',
  commandHubLaunch: 'ccna_command_hub_launch_v1',
  topicFocusSets: 'ccna_topic_focus_sets_v1',
  topicFocusPins: 'ccna_topic_focus_pins_v1',
  questionHealthFlags: 'ccna_question_health_flags_v1',
  questionHealthSignals: 'ccna_question_health_signals_v1',
  contentHealthAiEnabled: 'ccna_content_health_ai_v1',
  contentHealthLastProcess: 'ccna_content_health_last_process_v1',
  contentHealthLocalQuarantine: 'ccna_content_health_local_quarantine_v1',
  settingsFocusSection: 'ccna_settings_focus_section_v1',
  trapDrillPrefill: 'ccna_trap_drill_prefill_v1',
  domainPass: 'ccna_domain_pass_v1',
  domainQuestionExposure: 'ccna_domain_question_exposure_v1',
  domainPassCelebrated: 'ccna_domain_pass_celebrated_v1',
  domainPlacement: 'ccna_domain_placement_v1',
  baselineHandoff: 'ccna_baseline_handoff_v1',
}

/** CustomEvent name for dev/e2e trap-drill prefill handoff. */
export const TRAP_DRILL_PREFILL_EVENT = 'ccna-trap-drill-prefill'

/** Fired after a domain placement attempt is saved — refresh home baseline count. */
export const PLACEMENT_BASELINE_REFRESH_EVENT = 'ccna-placement-baseline-refresh'

/** Fired after pull-to-refresh reloads persisted study data. */
export const APP_REFRESH_EVENT = 'ccna-app-refresh'
