const CACHE_PREFIX = 'hsnv-pos-';
const CACHE_NAME = `${CACHE_PREFIX}shell-v2`;
const FONT_ASSETS = [
  '/fonts/be-vietnam-pro-400.ttf',
  '/fonts/be-vietnam-pro-500.ttf',
  '/fonts/be-vietnam-pro-600.ttf',
  '/fonts/be-vietnam-pro-700.ttf',
  '/fonts/be-vietnam-pro-800.ttf',
];
const MENU_IMAGES = [
  '/images/pho.jpg',
  '/images/bun.jpg',
  '/images/comga.jpg',
  '/images/comtam.jpg',
  '/images/goicuon.jpg',
  '/images/chagio.jpg',
  '/images/cafe.jpg',
  '/images/tradao.jpg',
  '/images/cam.jpg',
  '/images/bo.jpg',
  '/images/che.jpg',
  '/images/flan.jpg',
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      const response = await fetch('/', { cache: 'no-store' });
      if (!response.ok) throw new Error(`App shell returned ${response.status}`);

      const html = await response.clone().text();
      const appAssets = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)]
        .map((match) => new URL(match[1], self.location.origin))
        .filter((url) => url.origin === self.location.origin && url.pathname.startsWith('/assets/'))
        .map((url) => `${url.pathname}${url.search}`);

      await cache.put('/', response);
      await cache.addAll([...new Set([...appAssets, ...MENU_IMAGES, ...FONT_ASSETS])]);
    } catch (error) {
      await caches.delete(CACHE_NAME);
      throw error;
    }

    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames
      .filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
      .map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname === '/api' || url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(async () => (await caches.match('/')) || Response.error()));
    return;
  }

  const isAppAsset = url.pathname.startsWith('/assets/')
    || MENU_IMAGES.includes(url.pathname)
    || FONT_ASSETS.includes(url.pathname);
  if (!isAppAsset) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    if (cached) return cached;

    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  })());
});
