// ==================== PWA 支持 ====================
// [Session 4] Service Worker 注册和离线支持

(function() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('./sw.js').then(function(reg) {
        console.log('[PWA] Service Worker registered, scope:', reg.scope);
      }).catch(function(err) {
        console.warn('[PWA] Service Worker registration failed:', err);
      });
    });
  }
})();
