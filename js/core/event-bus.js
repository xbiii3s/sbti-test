// ==================== SBTI EventBus ====================
// 发布订阅系统，用于模块间解耦通信
var SBTI = window.SBTI || {};

SBTI.EventBus = {
  _listeners: {},

  on: function(event, callback) {
    if (!this._listeners[event]) {
      this._listeners[event] = [];
    }
    this._listeners[event].push(callback);
    return this;
  },

  off: function(event, callback) {
    if (!this._listeners[event]) return this;
    if (callback) {
      this._listeners[event] = this._listeners[event].filter(function(cb) { return cb !== callback; });
    } else {
      delete this._listeners[event];
    }
    return this;
  },

  emit: function(event, data) {
    if (!this._listeners[event]) return this;
    this._listeners[event].forEach(function(cb) {
      try { cb(data); } catch(e) { console.error('[EventBus] Error in ' + event + ':', e); }
    });
    return this;
  }
};

window.SBTI = SBTI;
