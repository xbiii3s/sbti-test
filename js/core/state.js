// ==================== 集中状态管理 ====================
var SBTI = window.SBTI || {};

SBTI.State = {
  _key: 'quiz_progress',

  _state: {
    answers: {},         // { q1: 2, q3: 1, ... }
    specialAnswers: {},  // { drink_gate_q1: 3, ... }
    currentIndex: 0,     // 当前题目索引
    started: false       // 是否已开始答题
  },

  /**
   * 初始化：监听事件 + 恢复断点
   */
  init: function() {
    var self = this;

    // 监听答题事件，自动记录答案
    SBTI.EventBus.on('quiz:answer', function(data) {
      var qid = data.questionId;
      if (qid && qid.indexOf('drink_gate') === 0) {
        self._state.specialAnswers[qid] = data.value;
      } else {
        self._state.answers[qid] = data.value;
      }
      self._state.currentIndex = data.currentIndex !== undefined
        ? data.currentIndex
        : Object.keys(self._state.answers).length;
      self._persist();
    });

    // 监听开始答题
    SBTI.EventBus.on('quiz:started', function() {
      self.reset();
      self._state.started = true;
      self._persist();
    });

    // 监听结果计算完成，清除进度存档
    SBTI.EventBus.on('result:computed', function() {
      self.clearProgress();
    });
  },

  /**
   * 获取当前全部答案
   */
  getAnswers: function() {
    return this._state.answers;
  },

  getSpecialAnswers: function() {
    return this._state.specialAnswers;
  },

  getCurrentIndex: function() {
    return this._state.currentIndex;
  },

  isStarted: function() {
    return this._state.started;
  },

  /**
   * 检查是否有可恢复的进度
   */
  hasSavedProgress: function() {
    var saved = SBTI.Storage.get(this._key);
    return saved !== null && saved.started && Object.keys(saved.answers).length > 0;
  },

  /**
   * 恢复存档进度
   * @returns {Object|null} 恢复的状态，或 null
   */
  restore: function() {
    var saved = SBTI.Storage.get(this._key);
    if (saved && saved.started && Object.keys(saved.answers).length > 0) {
      this._state = saved;
      SBTI.EventBus.emit('state:restored', {
        answers: this._state.answers,
        specialAnswers: this._state.specialAnswers,
        currentIndex: this._state.currentIndex
      });
      return this._state;
    }
    return null;
  },

  /**
   * 重置状态
   */
  reset: function() {
    this._state = {
      answers: {},
      specialAnswers: {},
      currentIndex: 0,
      started: false
    };
  },

  /**
   * 清除 localStorage 中的进度
   */
  clearProgress: function() {
    this.reset();
    SBTI.Storage.remove(this._key);
  },

  _persist: function() {
    SBTI.Storage.set(this._key, this._state);
  }
};

// 自动初始化
SBTI.State.init();

window.SBTI = SBTI;
