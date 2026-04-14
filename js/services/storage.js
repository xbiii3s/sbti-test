// ==================== localStorage 封装 ====================
var SBTI = window.SBTI || {};

SBTI.Storage = {
  _prefix: 'sbti_',

  set: function(key, val) {
    try {
      localStorage.setItem(this._prefix + key, JSON.stringify(val));
    } catch (e) {
      console.error('[Storage] set failed:', e);
    }
  },

  get: function(key) {
    try {
      var raw = localStorage.getItem(this._prefix + key);
      return raw === null ? null : JSON.parse(raw);
    } catch (e) {
      console.error('[Storage] get failed:', e);
      return null;
    }
  },

  remove: function(key) {
    try {
      localStorage.removeItem(this._prefix + key);
    } catch (e) {
      console.error('[Storage] remove failed:', e);
    }
  }
};

window.SBTI = SBTI;
