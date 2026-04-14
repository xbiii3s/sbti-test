// ==================== 应用主逻辑 ====================
// [Session 1] 页面切换、答题流程、事件发射

var App = {
  state: 'home',
  answers: {},
  specialAnswers: {},
  currentIndex: 0,
  shuffledQuestions: [],
  showDrinkFollow: false,
  result: null,
  slideDirection: 'forward', // 'forward' or 'backward'

  // 触摸滑动相关
  _touchStartX: 0,
  _touchStartY: 0,
  _touchDelta: 0,
  _isSwiping: false,

  $home: null,
  $quiz: null,
  $result: null,

  init: function() {
    this.$home = document.getElementById('page-home');
    this.$quiz = document.getElementById('page-quiz');
    this.$result = document.getElementById('page-result');

    document.getElementById('btn-start').addEventListener('click', function() { App.startQuiz(); });
    document.getElementById('btn-restart').addEventListener('click', function() { App.restart(); });
    document.getElementById('btn-poster').addEventListener('click', function() { App.generatePoster(); });

    this._initThemeToggle();
    this._initSwipeGesture();
  },

  _initThemeToggle: function() {
    var toggleBtn = document.getElementById('theme-toggle');
    // 读取本地存储的主题偏好
    var saved = localStorage.getItem('sbti-theme');
    if (saved === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    }
    toggleBtn.addEventListener('click', function() {
      var current = document.documentElement.getAttribute('data-theme');
      var next = current === 'light' ? 'dark' : 'light';
      if (next === 'dark') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
      }
      localStorage.setItem('sbti-theme', next);
    });
  },

  _initSwipeGesture: function() {
    var quizContainer = document.getElementById('page-quiz');
    var self = this;

    quizContainer.addEventListener('touchstart', function(e) {
      if (self.state !== 'quiz') return;
      self._touchStartX = e.touches[0].clientX;
      self._touchStartY = e.touches[0].clientY;
      self._isSwiping = false;
    }, { passive: true });

    quizContainer.addEventListener('touchmove', function(e) {
      if (self.state !== 'quiz') return;
      var dx = e.touches[0].clientX - self._touchStartX;
      var dy = e.touches[0].clientY - self._touchStartY;
      // 水平滑动距离大于垂直时，判定为左右滑动
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
        self._isSwiping = true;
        self._touchDelta = dx;
      }
    }, { passive: true });

    quizContainer.addEventListener('touchend', function() {
      if (!self._isSwiping || self.state !== 'quiz') return;
      var threshold = 80;
      // 右滑 = 返回上一题（仅当不是第一题时）
      if (self._touchDelta > threshold && self.currentIndex > 0) {
        self.goBack();
      }
      self._isSwiping = false;
      self._touchDelta = 0;
    }, { passive: true });
  },

  goBack: function() {
    if (this.currentIndex <= 0) return;
    this.slideDirection = 'backward';
    this.currentIndex--;
    this.renderQuestion();
  },

  startQuiz: function() {
    this.answers = {};
    this.specialAnswers = {};
    this.currentIndex = 0;
    this.showDrinkFollow = false;
    this.result = null;

    this.shuffledQuestions = questions.slice().sort(function() { return Math.random() - 0.5; });

    this.switchPage('quiz');
    this.renderQuestion();
    SBTI.EventBus.emit('quiz:started', {});
  },

  renderQuestion: function() {
    var totalNormal = this.shuffledQuestions.length;
    var totalWithSpecial = totalNormal + 1;
    var currentQ, displayIndex, totalDisplay;

    if (this.currentIndex < totalNormal) {
      currentQ = this.shuffledQuestions[this.currentIndex];
      displayIndex = this.currentIndex + 1;
      totalDisplay = totalWithSpecial;
    } else if (this.currentIndex === totalNormal) {
      currentQ = specialQuestions[0];
      displayIndex = totalNormal + 1;
      totalDisplay = totalWithSpecial;
    } else {
      currentQ = specialQuestions[1];
      displayIndex = totalNormal + 2;
      totalDisplay = totalWithSpecial + 1;
    }

    var progress = (displayIndex / totalDisplay) * 100;
    document.getElementById('progress-bar').style.width = progress + '%';
    document.getElementById('progress-text').textContent = displayIndex + ' / ' + totalDisplay;

    var container = document.getElementById('question-container');
    var isForward = this.slideDirection !== 'backward';

    // 清除所有动画类
    container.classList.remove('slide-out-left', 'slide-out-right', 'slide-in-left', 'slide-in-right', 'slide-active', 'fade-out', 'fade-in');

    // 滑出动画：前进时向左滑出，后退时向右滑出
    container.classList.add(isForward ? 'slide-out-left' : 'slide-out-right');

    var self = this;
    setTimeout(function() {
      var optionsHtml = currentQ.options.map(function(opt, i) {
        return '<button class="option-btn" data-value="' + opt.value + '" data-index="' + i + '">' +
          '<span class="option-label">' + String.fromCharCode(65 + i) + '</span>' +
          '<span class="option-text">' + opt.label + '</span>' +
        '</button>';
      }).join('');

      container.innerHTML =
        '<div class="question-number">Q' + displayIndex + '</div>' +
        '<div class="question-text">' + currentQ.text + '</div>' +
        '<div class="options">' + optionsHtml + '</div>';

      container.querySelectorAll('.option-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var value = Number(btn.dataset.value);
          self.selectOption(currentQ, value, btn);
        });
      });

      // 移除滑出类，添加滑入起始位置
      container.classList.remove('slide-out-left', 'slide-out-right');
      container.classList.add(isForward ? 'slide-in-right' : 'slide-in-left');

      // 强制重排后添加动画目标类
      container.offsetHeight;
      container.classList.remove('slide-in-right', 'slide-in-left');
      container.classList.add('slide-active');

      // 动画结束后清理
      setTimeout(function() {
        container.classList.remove('slide-active');
        self.slideDirection = 'forward'; // 重置方向
      }, 350);
    }, 300);
  },

  selectOption: function(question, value, btnEl) {
    btnEl.closest('.options').querySelectorAll('.option-btn').forEach(function(b) { b.classList.remove('selected'); });
    btnEl.classList.add('selected');

    var self = this;
    setTimeout(function() {
      self.slideDirection = 'forward';
      var totalNormal = self.shuffledQuestions.length;

      if (question.special) {
        self.specialAnswers[question.id] = value;
        if (question.kind === 'drink_gate') {
          if (value === 3) {
            self.showDrinkFollow = true;
            self.currentIndex = totalNormal + 1;
            self.renderQuestion();
          } else {
            self.finishQuiz();
          }
        } else if (question.kind === 'drink_trigger') {
          self.finishQuiz();
        }
      } else {
        self.answers[question.id] = value;
        SBTI.EventBus.emit('quiz:answer', { questionId: question.id, value: value });
        self.currentIndex++;
        if (self.currentIndex < totalNormal) {
          self.renderQuestion();
        } else {
          self.currentIndex = totalNormal;
          self.renderQuestion();
        }
      }
    }, 350);
  },

  finishQuiz: function() {
    this.result = computeResult(this.answers, this.specialAnswers);
    this.switchPage('result');
    SBTI.renderResult(this.result);
    SBTI.EventBus.emit('result:computed', { result: this.result });
  },

  generatePoster: function() {
    if (this.result) {
      SBTI.EventBus.emit('poster:requested', { result: this.result });
    }
  },

  restart: function() {
    this.switchPage('home');
  },

  switchPage: function(page) {
    var prevState = this.state;
    this.state = page;
    [this.$home, this.$quiz, this.$result].forEach(function(el) { el.classList.remove('active'); });
    var target = page === 'home' ? this.$home : page === 'quiz' ? this.$quiz : this.$result;
    setTimeout(function() { target.classList.add('active'); }, 50);
    window.scrollTo(0, 0);
    SBTI.EventBus.emit('page:switched', { from: prevState, to: page });
  }
};

document.addEventListener('DOMContentLoaded', function() { App.init(); });
