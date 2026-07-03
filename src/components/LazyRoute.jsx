import React, { Suspense } from 'react'
import Spinner from './Spinner.jsx'

export default function LazyRoute({ children, label = 'Loading…' }) {
  return <Suspense fallback={<Spinner label={label} />}>{children}</Suspense>
}
