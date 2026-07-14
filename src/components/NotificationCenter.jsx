import React, { useState, useMemo } from 'react'
import PropTypes from 'prop-types'
import { COLORS, styles } from '../ui/appTheme.js'

export default function NotificationCenter({
  notifications = [],
  unreadCount = 0,
  onNotificationClick = () => {},
  onMarkAsRead = () => {},
  onDismissNotification = () => {},
  onOpenSettings = () => {},
}) {
  const [activeTab, setActiveTab] = useState('today')
  const [expandedNotification, setExpandedNotification] = useState(null)

  const categorizedNotifications = useMemo(() => {
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())

    const today = []
    const week = []
    const archive = []

    notifications.forEach(notif => {
      const notifDate = new Date(notif.createdAt || now)
      const notifStartDate = new Date(notifDate.getFullYear(), notifDate.getMonth(), notifDate.getDate())

      if (notifStartDate >= startOfToday) {
        today.push(notif)
      } else if (notifDate >= startOfWeek) {
        week.push(notif)
      } else {
        archive.push(notif)
      }
    })

    return { today, week, archive }
  }, [notifications])

  const getTabNotifications = () => {
    switch (activeTab) {
      case 'week':
        return categorizedNotifications.week
      case 'archive':
        return categorizedNotifications.archive
      case 'today':
      default:
        return categorizedNotifications.today
    }
  }

  const getNotificationIcon = (type) => {
    const icons = {
      priority: '🎯',
      achievement: '🏆',
      reminder: '⏰',
      warning: '⚠️',
      maintenance: '🔄',
      suggestion: '💡',
      milestone: '🎉',
    }
    return icons[type] || '📬'
  }

  const displayNotifications = getTabNotifications()

  return (
    <div style={{ width: '100%', padding: '16px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingX: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 'var(--ccna-type-md)', fontWeight: 600, color: COLORS.silver }}>
            🔔 Notifications
          </div>
          {unreadCount > 0 && (
            <div style={{ background: COLORS.brand, color: 'white', borderRadius: 999, width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--ccna-type-xs)', fontWeight: 700 }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </div>
          )}
        </div>
        <button onClick={onOpenSettings} style={{ background: 'none', border: 'none', color: COLORS.silverMid, fontSize: '18px', cursor: 'pointer', padding: '4px', minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          ⚙️
        </button>
      </div>

      <div style={{ ...styles.tabBar, marginBottom: 16, paddingX: 16 }}>
        {['today', 'week', 'archive'].map(tab => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setExpandedNotification(null) }}
            style={{ ...styles.tabBtn(activeTab === tab), textTransform: 'capitalize', fontSize: 'var(--ccna-type-xs)' }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ width: '100%' }}>
        {displayNotifications.length === 0 ? (
          <div style={{ padding: '40px 16px', textAlign: 'center', color: COLORS.silverMid }}>
            <div style={{ fontSize: 'var(--ccna-type-xs)' }}>No notifications{activeTab === 'today' ? ' today' : activeTab === 'week' ? ' this week' : ' archived'}</div>
          </div>
        ) : (
          displayNotifications.map((notif, idx) => {
            const isExpanded = expandedNotification === notif.id
            const isUnread = !notif.isRead

            return (
              <div
                key={notif.id || idx}
                style={{
                  background: isUnread ? COLORS.skyDim : COLORS.card,
                  border: `1px solid ${isUnread ? COLORS.skyBorder : COLORS.border}`,
                  borderRadius: 12,
                  marginBottom: 8,
                  marginLeft: 16,
                  marginRight: 16,
                  padding: 12,
                  cursor: 'pointer',
                }}
                onClick={() => {
                  setExpandedNotification(isExpanded ? null : notif.id)
                  if (isUnread) onMarkAsRead(notif.id)
                }}
              >
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '18px', marginTop: 2, flexShrink: 0 }}>
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 'var(--ccna-type-sm)', fontWeight: 600, color: COLORS.silver, marginBottom: 4 }}>
                      {notif.title}
                    </div>
                    {notif.message && (
                      <div style={{ fontSize: 'var(--ccna-type-xs)', color: COLORS.silverMid, lineHeight: 1.5 }}>
                        {isExpanded || notif.message.length < 80 ? notif.message : `${notif.message.substring(0, 80)}...`}
                      </div>
                    )}
                  </div>
                </div>
                {isExpanded && notif.actionLabel && (
                  <button onClick={(e) => { e.stopPropagation(); onNotificationClick(notif.id, notif) }} style={{ ...styles.secondaryBtn, marginTop: 12, padding: '8px 12px', minHeight: 36, fontSize: 'var(--ccna-type-xs)' }}>
                    {notif.actionLabel}
                  </button>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

NotificationCenter.propTypes = {
  notifications: PropTypes.array,
  unreadCount: PropTypes.number,
  onNotificationClick: PropTypes.func,
  onMarkAsRead: PropTypes.func,
  onDismissNotification: PropTypes.func,
  onOpenSettings: PropTypes.func,
}
