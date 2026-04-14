// ==================== 测试历史记录 ====================
var SBTI = window.SBTI || {};

SBTI.History = {
  _key: 'history',

  /**
   * 监听 result:computed 事件，自动保存测试结果
   */
  init: function() {
    var self = this;
    SBTI.EventBus.on('result:computed', function(data) {
      self._save(data.result);
    });
  },

  _save: function(result) {
    var records = this.getAll();
    records.push({
      timestamp: Date.now(),
      typeCode: result.type.code,
      typeCn: result.type.cn,
      similarity: result.similarity,
      exact: result.exact,
      levels: result.levels,
      rawScores: result.rawScores,
      secondMatch: result.secondMatch || null
    });
    SBTI.Storage.set(this._key, records);
  },

  /**
   * 获取所有历史记录
   * @returns {Array} 按时间倒序排列的记录
   */
  getAll: function() {
    return SBTI.Storage.get(this._key) || [];
  },

  /**
   * 清空历史
   */
  clear: function() {
    SBTI.Storage.remove(this._key);
  }
};

// 自动初始化
SBTI.History.init();

window.SBTI = SBTI;
