// ==================== 结果页渲染 ====================
// [Session 1] 独立的结果渲染模块

var SBTI = window.SBTI || {};

SBTI.renderResult = function(result) {
  var t = result.type;

  document.getElementById('result-code').textContent = t.code;
  document.getElementById('result-cn').textContent = t.cn;
  document.getElementById('result-intro').textContent = t.intro;
  document.getElementById('result-similarity').textContent = '\u5339\u914d\u5ea6 ' + result.similarity + '%';
  document.getElementById('result-desc').textContent = t.desc;

  // 15 维雷达图
  SBTI.drawRadarChart('radar-canvas', result.rawScores, result.levels);

  // 维度详情
  SBTI.renderDimensionDetails(result.rawScores, result.levels);
};

SBTI.renderDimensionDetails = function(rawScores, levels) {
  var container = document.getElementById('dimension-details');
  var models = [
    { name: '\u81ea\u6211\u6a21\u578b', dims: ['S1', 'S2', 'S3'] },
    { name: '\u60c5\u611f\u6a21\u578b', dims: ['E1', 'E2', 'E3'] },
    { name: '\u6001\u5ea6\u6a21\u578b', dims: ['A1', 'A2', 'A3'] },
    { name: '\u884c\u52a8\u9a71\u529b\u6a21\u578b', dims: ['Ac1', 'Ac2', 'Ac3'] },
    { name: '\u793e\u4ea4\u6a21\u578b', dims: ['So1', 'So2', 'So3'] }
  ];

  var html = '';
  models.forEach(function(model) {
    html += '<div class="model-group"><div class="model-name">' + model.name + '</div>';
    model.dims.forEach(function(dim) {
      var meta = dimensionMeta[dim];
      var level = levels[dim];
      var score = rawScores[dim];
      var explanation = DIM_EXPLANATIONS[dim][level];
      var barWidth = (score / 6) * 100;
      html += '<div class="dim-item">' +
        '<div class="dim-header">' +
          '<span class="dim-name">' + meta.name + '</span>' +
          '<span class="dim-level level-' + level + '">' + level + '</span>' +
        '</div>' +
        '<div class="dim-bar-bg"><div class="dim-bar" data-width="' + barWidth + '" style="width:0%"></div></div>' +
        '<div class="dim-explanation">' + explanation + '</div>' +
      '</div>';
    });
    html += '</div>';
  });
  container.innerHTML = html;

  // 使用 IntersectionObserver 触发进度条填充动画
  var bars = container.querySelectorAll('.dim-bar');
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var bar = entry.target;
          var targetWidth = bar.getAttribute('data-width');
          bar.style.width = targetWidth + '%';
          bar.classList.add('animate');
          observer.unobserve(bar);
        }
      });
    }, { threshold: 0.2 });

    bars.forEach(function(bar) { observer.observe(bar); });
  } else {
    // 降级：直接设置宽度
    bars.forEach(function(bar) {
      bar.style.width = bar.getAttribute('data-width') + '%';
    });
  }
};

window.SBTI = SBTI;
