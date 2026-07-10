import React, { createContext, useContext } from 'react'

/**
 * Navigation callbacks consumed by HomeScreen (and potentially other route-level
 * components). Data props (progress, streak, missed, etc.) stay as regular props.
 *
 * The provider is rendered in CoreStudyRoutes, wrapping only the HomeScreen branch,
 * so it never needs to re-render outside the home view.
 */
const AppNavigationContext = createContext(null)

export function AppNavigationProvider({ children, callbacks }) {
  return (
    <AppNavigationContext.Provider value={callbacks}>
      {children}
    </AppNavigationContext.Provider>
  )
}

/**
 * Returns all navigation callbacks for HomeScreen.
 * Must be called inside an AppNavigationProvider.
 */
export function useNavCallbacks() {
  const ctx = useContext(AppNavigationContext)
  if (!ctx) throw new Error('useNavCallbacks must be used inside AppNavigationProvider')
  return ctx
}
