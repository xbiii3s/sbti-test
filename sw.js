// ==================== Service Worker ====================
var CACHE_NAME = 'sbti-v1';

var ASSETS = [
  './',
  './index.html',
  './css/base.css',
  './css/themes.css',
  './css/home.css',
  './css/quiz.css',
  './css/result.css',
  './css/poster.css',
  './css/animations.css',
  './css/responsive.css',
  './js/core/event-bus.js',
  './js/data/dimensions.js',
  './js/data/questions.js',
  './js/data/types.js',
  './js/data/explanations.js',
  './js/core/engine.js',
  './js/core/state.js',
  './js/services/storage.js',
  './js/services/history.js',
  './js/ui/radar.js',
  './js/ui/result-renderer.js',
  './js/ui/app.js',
  './js/features/poster.js',
  './js/features/poster-templates.js',
  './js/features/share.js',
  './js/services/analytics.js',
  './js/services/pwa.js'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(name) { return name !== CACHE_NAME; })
             .map(function(name) { return caches.delete(name); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      return cached || fetch(event.request);
    })
  );
});
