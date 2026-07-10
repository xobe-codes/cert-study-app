import { describe, it, expect, beforeEach, vi } from 'vitest'
import { parseAppHash, syncAppHash } from '../routing/appHashRouting.js'
import { applyParsedHashRoute } from '../features/navigation/studyModeNavigation.js'
import { STORAGE_KEYS } from '../storageKeys.js'

describe('command hub hash routing', () => {
  beforeEach(() => {
    globalThis.window = {
      location: { hash: '', pathname: '/', search: '' },
      history: { replaceState: vi.fn((...args) => {
        const url = args[2]
        if (typeof url === 'string') {
          const hashIdx = url.indexOf('#')
          window.location.hash = hashIdx >= 0 ? url.slice(hashIdx) : ''
        }
      }) },
      storage: {
        setItem: vi.fn(),
        getItem: vi.fn(),
        removeItem: vi.fn(),
      },
    }
  })

  it('parses #/commandhub/sprint/:packId', () => {
    window.location.hash = '#/commandhub/sprint/sprint-ospf'
    expect(parseAppHash()).toEqual({
      view: 'commandhub',
      commandHubTab: 'sprint',
      commandHubPackId: 'sprint-ospf',
    })
  })

  it('parses #/commandhub/sprint without packId', () => {
    window.location.hash = '#/commandhub/sprint'
    expect(parseAppHash()).toEqual({
      view: 'commandhub',
      commandHubTab: 'sprint',
      commandHubPackId: null,
    })
  })

  it('parses plain #/commandhub as view only', () => {
    window.location.hash = '#/commandhub'
    expect(parseAppHash()).toEqual({ view: 'commandhub' })
  })

  it('does not break labs domain hashes', () => {
    window.location.hash = '#/labs/access'
    expect(parseAppHash()).toEqual({ view: 'labs', labsDomainId: 'access' })
  })

  it('syncAppHash writes sprint pack, sprint tab, and plain hub hashes', () => {
    syncAppHash('commandhub', null, null, 'sprint', 'sprint-vlan-access')
    expect(window.location.hash).toBe('#/commandhub/sprint/sprint-vlan-access')

    syncAppHash('commandhub', null, null, 'sprint', null)
    expect(window.location.hash).toBe('#/commandhub/sprint')

    syncAppHash('commandhub', null, null, null, null)
    expect(window.location.hash).toBe('#/commandhub')
  })

  it('applyParsedHashRoute sets Command Hub launch prefills', () => {
    const api = {
      setView: vi.fn(),
      setReturnToView: vi.fn(),
      setSelectedObjective: vi.fn(),
      setCommandHubTabPrefill: vi.fn(),
      setCommandHubPackPrefill: vi.fn(),
    }
    applyParsedHashRoute({
      view: 'commandhub',
      commandHubTab: 'sprint',
      commandHubPackId: 'sprint-vlan-access',
    }, api)
    expect(api.setCommandHubTabPrefill).toHaveBeenCalledWith('sprint')
    expect(api.setCommandHubPackPrefill).toHaveBeenCalledWith('sprint-vlan-access')
    expect(window.storage.setItem).toHaveBeenCalledWith(
      STORAGE_KEYS.commandHubLaunch,
      { tab: 'sprint', packId: 'sprint-vlan-access' },
    )
    expect(api.setView).toHaveBeenCalledWith('commandhub')
  })
})
