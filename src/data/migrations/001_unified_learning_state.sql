/**
 * Migration 001: Unified Learning State Schema
 *
 * Creates the database tables for Phase 0 of the Unified Adaptive Learning System.
 *
 * Tables:
 * - learning_states: Global per-user learning state
 * - objective_performance: Performance history for individual objectives
 * - domain_milestones: Baseline, domain pass, and other domain-level records
 * - spaced_repetition_schedule: Refresh schedules for mastered content
 * - study_activities: Audit log of all learning interactions
 * - mock_exam_results: Mock exam attempts and scores
 *
 * All tables include proper indexes for fast lookups and foreign key constraints
 * for referential integrity.
 */

-- ============================================================================
-- Table: learning_states
--
-- Stores the top-level unified learning state for each user.
-- This is the single source of truth for a user's progress.
-- ============================================================================

CREATE TABLE IF NOT EXISTS learning_states (
  user_id VARCHAR(255) PRIMARY KEY,

  -- Exam readiness metrics
  exam_readiness_score INT DEFAULT 0 CHECK (exam_readiness_score >= 0 AND exam_readiness_score <= 100),
  exam_readiness_confidence DECIMAL(3, 2) DEFAULT 0.0 CHECK (exam_readiness_confidence >= 0 AND exam_readiness_confidence <= 1.0),
  estimated_exam_ready_date DATETIME NULL,
  is_exam_ready BOOLEAN DEFAULT FALSE,

  -- Domain mastery tracking
  mastered_domains JSON DEFAULT '[]',  -- Array of domain IDs like ["D1", "D2", "D3"]
  certified_domains JSON DEFAULT '[]', -- Array of domain IDs that passed domain pass

  -- Metadata
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  schema_version VARCHAR(20) DEFAULT '1.0.0',

  INDEX idx_user_exam_readiness (user_id, exam_readiness_score),
  INDEX idx_updated_at (updated_at)
);

-- ============================================================================
-- Table: objective_performance
--
-- Stores performance metrics for individual learning objectives (e.g., 1.1, 1.2).
-- One row per objective per user.
-- ============================================================================

CREATE TABLE IF NOT EXISTS objective_performance (
  performance_id INT AUTO_INCREMENT PRIMARY KEY,

  user_id VARCHAR(255) NOT NULL,
  domain_id VARCHAR(10) NOT NULL,    -- D1-D6
  objective_id VARCHAR(20) NOT NULL, -- 1.1, 2.3, 3.5a, etc.

  -- Current status and mastery
  status ENUM(
    'NOT_STARTED', 'LEARNING', 'COMPETENT',
    'PROFICIENT', 'MASTERED', 'REFRESHING', 'STALE'
  ) DEFAULT 'NOT_STARTED',

  -- Performance metrics
  last_attempt_score INT NULL CHECK (last_attempt_score IS NULL OR (last_attempt_score >= 0 AND last_attempt_score <= 100)),
  best_score INT DEFAULT 0 CHECK (best_score >= 0 AND best_score <= 100),
  attempt_count INT DEFAULT 0 CHECK (attempt_count >= 0),
  average_score DECIMAL(5, 2) DEFAULT 0.0 CHECK (average_score >= 0 AND average_score <= 100),
  success_rate DECIMAL(5, 2) DEFAULT 0.0 CHECK (success_rate >= 0 AND success_rate <= 100),

  -- Milestone dates
  mastered_date DATETIME NULL,
  tested_out_date DATETIME NULL,
  certification_date DATETIME NULL,

  -- Spaced repetition
  next_refresh_date DATETIME NULL,
  last_refresh_date DATETIME NULL,
  refresh_count INT DEFAULT 0 CHECK (refresh_count >= 0),

  -- Weak areas
  weak_topics JSON DEFAULT '[]',     -- Array of weak topic IDs
  weak_count INT DEFAULT 0 CHECK (weak_count >= 0),

  -- Metadata
  last_attempt_date DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uk_user_objective (user_id, objective_id),
  FOREIGN KEY (user_id) REFERENCES learning_states(user_id) ON DELETE CASCADE,

  INDEX idx_user_status (user_id, status),
  INDEX idx_user_domain (user_id, domain_id),
  INDEX idx_next_refresh (user_id, next_refresh_date),
  INDEX idx_mastered_date (mastered_date)
);

-- ============================================================================
-- Table: domain_milestones
--
-- Tracks domain-level achievements: baselines, domain pass attempts, lab progress.
-- One row per attempt/milestone per user per domain.
-- ============================================================================

CREATE TABLE IF NOT EXISTS domain_milestones (
  milestone_id INT AUTO_INCREMENT PRIMARY KEY,

  user_id VARCHAR(255) NOT NULL,
  domain_id VARCHAR(10) NOT NULL,    -- D1-D6

  -- Milestone type
  type ENUM('baseline', 'domain_pass', 'lab', 'mock_exam_partial') NOT NULL,

  -- Attempt number (for retryable types)
  attempt_number INT NULL,

  -- Score
  score INT CHECK (score >= 0 AND score <= 100),
  total_questions INT NULL,
  questions_correct INT NULL,
  passed BOOLEAN DEFAULT FALSE,
  pass_threshold INT DEFAULT 70,

  -- Details
  time_spent_minutes INT NULL CHECK (time_spent_minutes IS NULL OR time_spent_minutes >= 0),
  weak_areas JSON DEFAULT '[]', -- Array of weak objective IDs
  attempt_date DATETIME NOT NULL,

  -- Metadata
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES learning_states(user_id) ON DELETE CASCADE,

  INDEX idx_user_domain_type (user_id, domain_id, type),
  INDEX idx_attempt_date (attempt_date),
  INDEX idx_passed (user_id, passed),
  INDEX idx_user_latest (user_id, domain_id, attempt_date DESC)
);

-- ============================================================================
-- Table: spaced_repetition_schedule
--
-- Tracks the refresh schedule for mastered objectives and domains.
-- Implements spaced repetition at 7, 30, and 60-day intervals.
-- ============================================================================

CREATE TABLE IF NOT EXISTS spaced_repetition_schedule (
  schedule_id INT AUTO_INCREMENT PRIMARY KEY,

  user_id VARCHAR(255) NOT NULL,
  domain_id VARCHAR(10) NOT NULL,    -- D1-D6
  objective_id VARCHAR(20) NULL,     -- NULL for domain-level, specific ID for objectives

  -- Schedule type
  type ENUM('objective_refresh', 'domain_refresh', 'baseline_refresh') NOT NULL,

  -- Dates
  due_date DATETIME NOT NULL,
  last_refresh_date DATETIME NULL,
  mastered_date DATETIME NOT NULL,

  -- Schedule phase
  schedule_phase ENUM('day7', 'day30', 'day60', 'maintenance') DEFAULT 'day7',
  refresh_count INT DEFAULT 0 CHECK (refresh_count >= 0),
  days_since_mastery INT DEFAULT 0,
  priority INT DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),

  -- Completion
  completed BOOLEAN DEFAULT FALSE,
  completed_date DATETIME NULL,

  -- Metadata
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES learning_states(user_id) ON DELETE CASCADE,

  INDEX idx_user_due_date (user_id, due_date),
  INDEX idx_not_completed (user_id, completed),
  INDEX idx_priority_due (user_id, priority DESC, due_date ASC)
);

-- ============================================================================
-- Table: study_activities
--
-- Audit log of all study interactions (lessons, quizzes, drills, etc.).
-- Provides complete activity history for analytics and debug.
-- ============================================================================

CREATE TABLE IF NOT EXISTS study_activities (
  activity_id INT AUTO_INCREMENT PRIMARY KEY,

  user_id VARCHAR(255) NOT NULL,
  domain_id VARCHAR(10) NOT NULL,
  objective_id VARCHAR(20) NULL,

  -- Activity type
  type ENUM(
    'lesson_completed', 'quiz_attempt', 'bank_burn', 'trap_drill',
    'domain_baseline', 'domain_pass', 'mock_exam', 'lab_completed',
    'test_out_claimed', 'refresh_drill'
  ) NOT NULL,

  -- Performance
  score INT NULL CHECK (score IS NULL OR (score >= 0 AND score <= 100)),
  duration_minutes INT NULL CHECK (duration_minutes IS NULL OR duration_minutes >= 0),
  questions_attempted INT NULL CHECK (questions_attempted IS NULL OR questions_attempted >= 0),
  questions_correct INT NULL CHECK (questions_correct IS NULL OR questions_correct >= 0),

  -- Context
  session_id VARCHAR(255) NULL,
  metadata JSON DEFAULT '{}',  -- Arbitrary activity metadata

  -- Timestamps
  activity_date DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES learning_states(user_id) ON DELETE CASCADE,

  INDEX idx_user_date (user_id, activity_date DESC),
  INDEX idx_user_type (user_id, type),
  INDEX idx_objective (user_id, objective_id, activity_date DESC),
  INDEX idx_session (user_id, session_id)
);

-- ============================================================================
-- Table: mock_exam_results
--
-- Tracks full mock exam attempts with domain-by-domain breakdown.
-- ============================================================================

CREATE TABLE IF NOT EXISTS mock_exam_results (
  exam_id INT AUTO_INCREMENT PRIMARY KEY,

  user_id VARCHAR(255) NOT NULL,
  attempt_date DATETIME NOT NULL,

  -- Score
  score INT NOT NULL CHECK (score >= 0 AND score <= 100),
  total_questions INT NOT NULL CHECK (total_questions > 0),
  questions_correct INT NOT NULL CHECK (questions_correct >= 0 AND questions_correct <= total_questions),
  percentage DECIMAL(5, 2) GENERATED ALWAYS AS (ROUND((questions_correct / total_questions) * 100, 2)) STORED,

  -- Exam type
  type ENUM('full', 'partial', 'adaptive_retake') DEFAULT 'full',
  time_spent_minutes INT NULL CHECK (time_spent_minutes IS NULL OR time_spent_minutes >= 0),

  -- Per-domain breakdown
  domain_scores JSON NOT NULL,  -- {"D1": 95, "D2": 92, "D3": 88, ...}

  -- Analysis
  weak_areas JSON DEFAULT '[]',
  adaptive_retake_available BOOLEAN DEFAULT FALSE,
  next_recommended_retake_date DATETIME NULL,
  session_id VARCHAR(255) NULL,

  -- Metadata
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES learning_states(user_id) ON DELETE CASCADE,

  INDEX idx_user_date (user_id, attempt_date DESC),
  INDEX idx_percentage (user_id, percentage),
  INDEX idx_type (user_id, type)
);

-- ============================================================================
-- Table: migration_status
--
-- Tracks migration execution for data migration from legacy systems.
-- ============================================================================

CREATE TABLE IF NOT EXISTS migration_status (
  migration_id INT AUTO_INCREMENT PRIMARY KEY,

  user_id VARCHAR(255) NOT NULL,
  migration_version VARCHAR(20) NOT NULL,

  -- Migration details
  source_system VARCHAR(50),
  status ENUM('pending', 'in_progress', 'completed', 'failed', 'rolled_back') DEFAULT 'pending',
  error_message TEXT NULL,

  -- Counts
  quizzes_migrated INT DEFAULT 0,
  baselines_migrated INT DEFAULT 0,
  domain_passes_migrated INT DEFAULT 0,
  mock_exams_migrated INT DEFAULT 0,

  -- Timestamps
  started_at DATETIME NOT NULL,
  completed_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY uk_user_version (user_id, migration_version),
  FOREIGN KEY (user_id) REFERENCES learning_states(user_id) ON DELETE CASCADE,

  INDEX idx_status (status),
  INDEX idx_completed_at (completed_at)
);

-- ============================================================================
-- View: vw_user_progress_summary
--
-- Convenience view summarizing user progress across all domains.
-- ============================================================================

CREATE OR REPLACE VIEW vw_user_progress_summary AS
SELECT
  ls.user_id,
  ls.exam_readiness_score,
  ls.exam_readiness_confidence,
  JSON_LENGTH(ls.mastered_domains) as domains_mastered,
  JSON_LENGTH(ls.certified_domains) as domains_certified,
  COUNT(DISTINCT op.domain_id) as objectives_tracked,
  SUM(CASE WHEN op.status = 'MASTERED' THEN 1 ELSE 0 END) as objectives_mastered,
  AVG(op.average_score) as avg_objective_score,
  MAX(op.best_score) as highest_single_score,
  ls.updated_at as last_update
FROM learning_states ls
LEFT JOIN objective_performance op ON ls.user_id = op.user_id
GROUP BY ls.user_id;

-- ============================================================================
-- View: vw_refresh_queue
--
-- Shows all refreshes due for each user, sorted by priority and due date.
-- ============================================================================

CREATE OR REPLACE VIEW vw_refresh_queue AS
SELECT
  srs.user_id,
  srs.domain_id,
  srs.objective_id,
  srs.due_date,
  srs.priority,
  srs.schedule_phase,
  srs.type,
  srs.days_since_mastery,
  DATEDIFF(srs.due_date, NOW()) as days_until_due,
  CASE
    WHEN DATEDIFF(srs.due_date, NOW()) <= 0 THEN 'overdue'
    WHEN DATEDIFF(srs.due_date, NOW()) <= 3 THEN 'due_soon'
    ELSE 'future'
  END as status
FROM spaced_repetition_schedule srs
WHERE srs.completed = FALSE
  AND srs.due_date IS NOT NULL
ORDER BY srs.user_id, srs.due_date ASC;

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

-- Additional performance indexes for high-cardinality queries
CREATE INDEX IF NOT EXISTS idx_objective_performance_user_status ON objective_performance(user_id, status);
CREATE INDEX IF NOT EXISTS idx_domain_milestones_user_domain_date ON domain_milestones(user_id, domain_id, attempt_date DESC);
CREATE INDEX IF NOT EXISTS idx_study_activities_recent ON study_activities(user_id, activity_date DESC);
CREATE INDEX IF NOT EXISTS idx_spaced_rep_user_due ON spaced_repetition_schedule(user_id, due_date);

-- ============================================================================
-- Sample Data Insertion (Comment out in production)
-- ============================================================================

-- INSERT INTO learning_states (user_id, exam_readiness_score, schema_version)
-- VALUES ('demo_user_001', 0, '1.0.0');
