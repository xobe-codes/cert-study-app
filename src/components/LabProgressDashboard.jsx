/**
 * Lab Progress Dashboard (Phase 4D)
 *
 * React component displaying gamification metrics:
 * - Completed labs with earned badges
 * - Time tracking per lab
 * - Mistake patterns analysis
 * - Skills progression visualization
 * - Next lab recommendations
 * - Peer leaderboard integration
 */

import React, { useState, useEffect } from 'react'
import './LabProgressDashboard.css'

/**
 * LabProgressDashboard Component
 *
 * @param {Object} props
 * @param {string} props.userId - User ID
 * @param {Array} props.completedLabs - Array of completed lab records
 * @param {Array} props.userBadges - Array of earned badges
 * @param {Object} props.leaderboardData - Leaderboard rankings
 * @param {Function} props.onLabSelect - Callback when lab is selected
 * @param {boolean} props.showLeaderboard - Whether to show leaderboard
 * @returns {React.ReactElement}
 */
export default function LabProgressDashboard({
  userId = 'user1',
  completedLabs = [],
  userBadges = [],
  leaderboardData = {},
  onLabSelect = () => {},
  showLeaderboard = true,
}) {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedLabId, setSelectedLabId] = useState(null)
  const [mistakeStats, setMistakeStats] = useState({})
  const [skillsData, setSkillsData] = useState({})

  useEffect(() => {
    // Calculate mistake statistics
    if (completedLabs.length > 0) {
      const mistakes = {}
      completedLabs.forEach((lab) => {
        if (lab.mistakesSummary) {
          Object.entries(lab.mistakesSummary.byCheckpoint || {}).forEach(([checkpoint, count]) => {
            mistakes[checkpoint] = (mistakes[checkpoint] || 0) + count
          })
        }
      })
      setMistakeStats(mistakes)
    }

    // Calculate skills progression
    if (completedLabs.length > 0) {
      const skills = {}
      completedLabs.forEach((lab) => {
        const domain = lab.domainId || 'General'
        if (!skills[domain]) {
          skills[domain] = { completed: 0, total: 0 }
        }
        skills[domain].completed++
        skills[domain].total = Math.max(skills[domain].total, skills[domain].completed)
      })
      setSkillsData(skills)
    }
  }, [completedLabs])

  const stats = calculateDashboardStats(completedLabs, userBadges)
  const nextLabRecommendation = getNextLabRecommendation(completedLabs)

  return (
    <div className="lab-progress-dashboard">
      <div className="dashboard-header">
        <h1>Lab Progress Dashboard</h1>
        <div className="header-stats">
          <div className="stat-card">
            <div className="stat-value">{stats.labsCompleted}</div>
            <div className="stat-label">Labs Completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalBadges}</div>
            <div className="stat-label">Badges Earned</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{formatTime(stats.totalTimeSeconds)}</div>
            <div className="stat-label">Time Invested</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.averageScore.toFixed(0)}%</div>
            <div className="stat-label">Avg Score</div>
          </div>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'analysis' ? 'active' : ''}`}
          onClick={() => setActiveTab('analysis')}
        >
          Analysis
        </button>
        <button
          className={`tab-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          Leaderboard
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="tab-content">
          <div className="overview-grid">
            {/* Completed Labs */}
            <div className="section">
              <h2>Completed Labs</h2>
              <div className="labs-grid">
                {completedLabs.length > 0 ? (
                  completedLabs.map((lab) => (
                    <LabCard
                      key={lab.labId}
                      lab={lab}
                      badges={userBadges.filter((b) => b.labId === lab.labId)}
                      onSelect={onLabSelect}
                    />
                  ))
                ) : (
                  <div className="empty-state">
                    <p>No labs completed yet. Start your first lab! 🚀</p>
                  </div>
                )}
              </div>
            </div>

            {/* Next Recommendation */}
            {nextLabRecommendation && (
              <div className="section">
                <h2>Recommended Next Lab</h2>
                <div className="recommendation-card">
                  <div className="recommendation-title">{nextLabRecommendation.title}</div>
                  <div className="recommendation-description">{nextLabRecommendation.description}</div>
                  <div className="recommendation-reason">
                    💡 {nextLabRecommendation.reason}
                  </div>
                  <button className="btn-primary" onClick={() => onLabSelect(nextLabRecommendation.labId)}>
                    Start Lab →
                  </button>
                </div>
              </div>
            )}

            {/* Skills Progression */}
            <div className="section">
              <h2>Skills Progression</h2>
              <div className="skills-chart">
                {Object.entries(skillsData).length > 0 ? (
                  Object.entries(skillsData).map(([domain, data]) => (
                    <div key={domain} className="skill-bar">
                      <div className="skill-label">{domain}</div>
                      <div className="skill-progress">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${(data.completed / Math.max(data.total, 1)) * 100}%`,
                          }}
                        />
                      </div>
                      <div className="skill-count">
                        {data.completed}/{data.total}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-data">Complete labs to see skills progression</p>
                )}
              </div>
            </div>

            {/* Badges Collection */}
            <div className="section">
              <h2>Badges Collection</h2>
              <div className="badges-display">
                {userBadges.length > 0 ? (
                  userBadges.map((badge) => (
                    <div key={badge.id} className="badge-item">
                      <div className="badge-emoji">{getBadgeEmoji(badge.type)}</div>
                      <div className="badge-title">{getBadgeTitle(badge.type)}</div>
                    </div>
                  ))
                ) : (
                  <p className="no-data">Badges will appear as you complete labs with high achievements</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analysis' && (
        <div className="tab-content">
          <div className="analysis-grid">
            <div className="section">
              <h2>Time per Lab</h2>
              <div className="time-chart">
                {completedLabs.length > 0 ? (
                  completedLabs.slice(0, 5).map((lab) => (
                    <div key={lab.labId} className="time-entry">
                      <div className="time-label">{lab.labTitle || 'Lab'}</div>
                      <div className="time-value">{formatTime(lab.timeSpentSeconds || 0)}</div>
                    </div>
                  ))
                ) : (
                  <p className="no-data">No time data</p>
                )}
              </div>
            </div>

            <div className="section">
              <h2>Attempt Statistics</h2>
              <div className="stats-list">
                <div className="stat-item">
                  <div className="stat-label">First-Try Success</div>
                  <div className="stat-highlight">
                    {completedLabs.length > 0
                      ? Math.round(
                          (completedLabs.filter((l) => l.attempts === 1).length / completedLabs.length) *
                            100
                        )
                      : 0}
                    %
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Avg Attempts</div>
                  <div className="stat-highlight">
                    {completedLabs.length > 0
                      ? (completedLabs.reduce((sum, l) => sum + l.attempts, 0) / completedLabs.length).toFixed(
                          1
                        )
                      : 0}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'leaderboard' && showLeaderboard && (
        <div className="tab-content">
          <div className="section">
            <h2>Leaderboard</h2>
            <p className="no-data">Leaderboard data coming soon</p>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Lab Card Component
 */
function LabCard({ lab, badges, onSelect }) {
  return (
    <div className="lab-card" onClick={() => onSelect(lab.labId)}>
      <div className="lab-card-header">
        <h3>{lab.labTitle || 'Lab'}</h3>
        <div className="lab-score">{lab.score || 0}%</div>
      </div>

      <div className="lab-card-stats">
        <div className="stat">
          <span className="value">{lab.attempts} attempts</span>
        </div>
        <div className="stat">
          <span className="value">{formatTime(lab.timeSpentSeconds || 0)}</span>
        </div>
      </div>

      {badges.length > 0 && (
        <div className="lab-badges">
          {badges.map((badge) => (
            <div key={badge.id} className="badge-mini" title={getBadgeTitle(badge.type)}>
              {getBadgeEmoji(badge.type)}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ==================== Helper Functions ====================

function calculateDashboardStats(completedLabs, userBadges) {
  return {
    labsCompleted: completedLabs.length,
    totalBadges: userBadges.length,
    totalTimeSeconds: completedLabs.reduce((sum, lab) => sum + (lab.timeSpentSeconds || 0), 0),
    averageScore: completedLabs.length > 0
      ? completedLabs.reduce((sum, lab) => sum + (lab.score || 0), 0) / completedLabs.length
      : 0,
  }
}

function getNextLabRecommendation(completedLabs) {
  if (completedLabs.length === 0) {
    return {
      labId: 'vlan-trunk-lab',
      title: 'VLAN Trunk Configuration',
      description: 'Learn how to configure trunk ports for VLAN traffic',
      reason: 'This is a foundational networking skill for CCNA',
    }
  }
  return null
}

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`
  }
  return `${secs}s`
}

function getBadgeEmoji(type) {
  const emojis = {
    master: '👑',
    speedRunner: '⚡',
    learningMode: '📚',
    perfectFirst: '💯',
    problemSolver: '🧩',
    mistakeHunter: '🔍',
  }
  return emojis[type] || '⭐'
}

function getBadgeTitle(type) {
  const titles = {
    master: 'Master',
    speedRunner: 'Speed Runner',
    learningMode: 'Learning Mode',
    perfectFirst: 'Perfect First',
    problemSolver: 'Problem Solver',
    mistakeHunter: 'Mistake Hunter',
  }
  return titles[type] || 'Badge'
}
