import React from 'react'
import { useStudyBlockOptional } from '../../components/StudyBlockProvider.jsx'

/** Study-block aware layout wrapper — applies app-shell CSS modifier classes. */
export default function AppShell({ view, compactTopChrome, withBottomNav, className: extraClass = '', children }) {
  const studyBlock = useStudyBlockOptional()
  const isActive = studyBlock?.isActive
  const className = [
    'app-shell',
    compactTopChrome ? 'app-shell--compact-top' : '',
    view === 'objective' && isActive ? 'app-shell--deep-work' : '',
    withBottomNav ? 'app-shell--with-bottom-nav' : '',
    extraClass,
  ].filter(Boolean).join(' ')
  return <div className={className}>{children}</div>
}
