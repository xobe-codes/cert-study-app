const CACHE = 'ccna-shell-v2'
const SHELL = ['/manifest.webmanifest', '/icon-192.svg']

function isAppShell(url) {
  return url.pathname === '/' || url.pathname === '/index.html' || url.pathname.startsWith('/assets/')
}

function isShellAsset(url) {
  return SHELL.includes(url.pathname)
}

async function networkFirst(request) {
  try {
    const res = await fetch(request)
    if (res && res.status === 200 && res.type === 'basic') {
      const copy = res.clone()
      caches.open(CACHE).then(cache => cache.put(request, copy))
    }
    return res
  } catch {
    const cached = await caches.match(request)
    if (cached) return cached
    throw new Error('offline')
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached
  const res = await fetch(request)
  if (res && res.status === 200 && res.type === 'basic') {
    const copy = res.clone()
    caches.open(CACHE).then(cache => cache.put(request, copy))
  }
  return res
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  const url = new URL(event.request.url)
  if (url.origin !== self.location.origin) return
  if (!url.pathname.startsWith('/') || url.pathname.includes('/api')) return

  if (isAppShell(url)) {
    event.respondWith(networkFirst(event.request))
    return
  }
  if (isShellAsset(url)) {
    event.respondWith(cacheFirst(event.request))
  }
})
