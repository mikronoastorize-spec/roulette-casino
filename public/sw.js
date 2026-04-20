/* Casino Games Service Worker — cache-first for all static game assets */
const CACHE = 'casino-v18';
const BUILD_JS_PV = 'pv27';

const CACHE_PATTERNS = [
  /\/game\//,
  /\/games\//,
  /\.(js|mjs|css|wasm|png|jpg|jpeg|webp|svg|mp3|ogg|wav|atlas|bin|json)$/i
];

/* Only block actual API/session calls — NOT static assets under /gs2c/ */
const NEVER_CACHE = [
  /go-.*-game\.html/,        // go-wg-game.html, go-roulette-game.html etc. (with optional ?query)
  /go-game\.html/,
  /casino-game\.html/,
  /html5Game\.html/,         // PP game main frame — cur= param changes every session, never cache
  /\.html(\?|$)/,            // all other .html files in games: may have dynamic query params
  /\/api\//,
  /\/auth\//,
  /messenger\.js$/,
  /sw\.js$/,
  /gameService/,
  /\/gs2c\/.*\.do(\?|$)/,
  /reloadBalance/,
  /saveSettings/,
  /clientLog/,
  /jackpot\/reload/,
  /announcements/,
  /promo\//,
  /stats\.do/,
  /regulation\/process/
];

function shouldCache(url) {
  const path = url.pathname + url.search;
  if (NEVER_CACHE.some(p => p.test(path))) return false;
  return CACHE_PATTERNS.some(p => p.test(path));
}

function isBuildJs(url) {
  return url.pathname.endsWith('build.js');
}

/* Safe fallback — prevents promise rejection when network fails.
 * A rejected respondWith() causes "FetchEvent resulted in a network error"
 * which can freeze game engines that rely on XHR completing. */
function safeFetch(request, opts) {
  return fetch(request, opts).catch(err => {
    console.warn('[SW] fetch failed:', request.url, err.message);
    return new Response(null, { status: 503, statusText: 'SW fetch error' });
  });
}

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ).then(() => self.clients.claim())
));

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (!shouldCache(url)) return;

  if (isBuildJs(url)) {
    /* build.js: cache under versioned key so new patches bypass old cache */
    const versionedCacheKey = event.request.url + '&' + BUILD_JS_PV;
    event.respondWith(
      caches.open(CACHE).then(cache =>
        cache.match(versionedCacheKey).then(cached => {
          if (cached) return cached;
          return safeFetch(event.request, { cache: 'no-store' }).then(response => {
            if (response.ok && response.status === 200) {
              cache.put(versionedCacheKey, response.clone());
            }
            return response;
          });
        })
      )
    );
    return;
  }

  event.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(event.request).then(cached => {
        if (cached) return cached;
        return safeFetch(event.request).then(response => {
          if (response.ok && response.status === 200) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    )
  );
});
