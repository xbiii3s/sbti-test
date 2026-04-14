// ==================== Canvas 海报生成 ====================
// [Session 3] 独立海报模块，通过 EventBus 接收数据
// 支持多模板切换、二维码占位、分享集成

var _posterResult = null;
var _currentTemplateId = 'cyberpunk';
var _currentCanvas = null;

// 监听海报请求事件
if (typeof SBTI !== 'undefined' && SBTI.EventBus) {
  SBTI.EventBus.on('poster:requested', function(data) {
    _posterResult = data.result;
    _currentTemplateId = 'cyberpunk';
    _currentCanvas = renderPosterCanvas(data.result, _currentTemplateId);
    showPosterModal(_currentCanvas);
  });
}

// ========== 渲染海报画布 ==========
function renderPosterCanvas(result, templateId) {
  var template = SBTI_PosterTemplates.getTemplate(templateId);
  var canvas = document.createElement('canvas');
  var dpr = 2;
  var W = 750;
  var H = 1500;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  var ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  // 模板渲染主要内容（背景 → 标题 → 数据 → 得分条）
  template.render(ctx, W, H, result);

  // 绘制二维码占位（所有模板共享）
  drawQRPlaceholder(ctx, W / 2, 1290, 90);

  // 绘制底部文字
  drawPosterFooter(ctx, W, H, template.theme);

  return canvas;
}

// ========== 切换模板 ==========
function switchPosterTemplate(templateId) {
  if (!_posterResult) return;
  _currentTemplateId = templateId;
  _currentCanvas = renderPosterCanvas(_posterResult, templateId);

  // 更新弹窗中的图片
  var wrap = document.getElementById('poster-image-wrap');
  if (wrap) {
    wrap.innerHTML = '';
    var img = new Image();
    img.src = _currentCanvas.toDataURL('image/png');
    img.style.width = '100%';
    img.style.borderRadius = '8px';
    wrap.appendChild(img);
  }

  // 更新选中状态
  var btns = document.querySelectorAll('.poster-template-btn');
  for (var i = 0; i < btns.length; i++) {
    var isActive = btns[i].getAttribute('data-template') === templateId;
    if (isActive) btns[i].classList.add('active');
    else btns[i].classList.remove('active');
  }
}

// ========== 绘制雷达图（共享工具函数，模板调用） ==========
function drawPosterRadar(ctx, cx, cy, maxR, rawScores, colors) {
  var gridColor = (colors && colors.grid) || 'rgba(0, 255, 136, 0.15)';
  var fillColor = (colors && colors.fill) || 'rgba(0, 255, 136, 0.25)';
  var strokeColor = (colors && colors.stroke) || '#00ff88';
  var labelColor = (colors && colors.label) || 'rgba(255,255,255,0.6)';
  var axisColor = (colors && colors.axis) || gridColor;

  var n = dimensionOrder.length;
  var angleStep = (Math.PI * 2) / n;

  // 网格
  [1 / 3, 2 / 3, 1].forEach(function(scale) {
    ctx.beginPath();
    for (var i = 0; i <= n; i++) {
      var angle = -Math.PI / 2 + i * angleStep;
      var x = cx + Math.cos(angle) * maxR * scale;
      var y = cy + Math.sin(angle) * maxR * scale;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  // 轴线
  for (var i = 0; i < n; i++) {
    var angle = -Math.PI / 2 + i * angleStep;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * maxR, cy + Math.sin(angle) * maxR);
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

  // 数据多边形
  ctx.beginPath();
  dimensionOrder.forEach(function(dim, i) {
    var ratio = Math.min(rawScores[dim] / 6, 1);
    var angle = -Math.PI / 2 + i * angleStep;
    var x = cx + Math.cos(angle) * maxR * ratio;
    var y = cy + Math.sin(angle) * maxR * ratio;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = fillColor;
  ctx.fill();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;
  ctx.stroke();

  // 标签
  ctx.font = '11px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = labelColor;
  dimensionOrder.forEach(function(dim, i) {
    var angle = -Math.PI / 2 + i * angleStep;
    var x = cx + Math.cos(angle) * (maxR + 22);
    var y = cy + Math.sin(angle) * (maxR + 22);
    ctx.fillText(dim, x, y);
  });
}

// ========== 文字自动换行 ==========
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  var line = '';
  var currentY = y;
  for (var i = 0; i < text.length; i++) {
    var testLine = line + text[i];
    var metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && i > 0) {
      ctx.fillText(line, x, currentY);
      line = text[i];
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
  return currentY;
}

// ========== 圆角矩形 ==========
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ========== 二维码占位（Canvas 绘制简易 QR 码） ==========
function drawQRPlaceholder(ctx, cx, cy, size) {
  var moduleCount = 21; // QR Version 1
  var moduleSize = size / moduleCount;
  var startX = cx - size / 2;
  var startY = cy - size / 2;

  // 白色背景 + 边框
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, startX - 8, startY - 8, size + 16, size + 16, 6);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // 创建模块网格
  var grid = [];
  for (var r = 0; r < moduleCount; r++) {
    grid[r] = [];
    for (var c = 0; c < moduleCount; c++) {
      grid[r][c] = 0;
    }
  }

  // 定位图案（三个角的大方块）
  function setFinder(row, col) {
    for (var dr = 0; dr < 7; dr++) {
      for (var dc = 0; dc < 7; dc++) {
        var isOuter = dr === 0 || dr === 6 || dc === 0 || dc === 6;
        var isInner = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
        grid[row + dr][col + dc] = (isOuter || isInner) ? 1 : 0;
      }
    }
  }
  setFinder(0, 0);   // 左上
  setFinder(0, 14);  // 右上
  setFinder(14, 0);  // 左下

  // 定时图案（两个定位图案之间的交替线）
  for (var i = 8; i < 13; i++) {
    grid[6][i] = (i % 2 === 0) ? 1 : 0;
    grid[i][6] = (i % 2 === 0) ? 1 : 0;
  }

  // 暗模块
  grid[13][8] = 1;

  // 伪随机数据模块（模拟 QR 码数据区）
  var seed = 54321;
  for (var r = 0; r < moduleCount; r++) {
    for (var c = 0; c < moduleCount; c++) {
      var inFinderZone =
        (r < 9 && c < 9) ||
        (r < 9 && c > 12) ||
        (r > 12 && c < 9);
      var onTiming = (r === 6 || c === 6);

      if (!inFinderZone && !onTiming && grid[r][c] === 0) {
        seed = ((seed * 1103515245) + 12345) & 0x7fffffff;
        grid[r][c] = ((seed >> 16) & 1);
      }
    }
  }

  // 绘制黑色模块
  ctx.fillStyle = '#000000';
  for (var r = 0; r < moduleCount; r++) {
    for (var c = 0; c < moduleCount; c++) {
      if (grid[r][c] === 1) {
        ctx.fillRect(
          startX + c * moduleSize,
          startY + r * moduleSize,
          Math.ceil(moduleSize),
          Math.ceil(moduleSize)
        );
      }
    }
  }
}

// ========== 海报底部文字 ==========
function drawPosterFooter(ctx, W, H, theme) {
  var textColor = (theme && theme.footerText) || 'rgba(255,255,255,0.3)';
  var accentColor = (theme && theme.footerAccent) || 'rgba(0, 255, 136, 0.4)';
  var labelColor = (theme && theme.qrLabel) || 'rgba(255,255,255,0.5)';

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  // 二维码标签
  ctx.fillStyle = labelColor;
  ctx.font = '14px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText('\u626B\u7801\u5F00\u59CB\u6D4B\u8BD5', W / 2, 1360);

  // 网站名
  ctx.fillStyle = textColor;
  ctx.font = '14px monospace';
  ctx.fillText('SBTI Personality Test', W / 2, 1405);

  // 日期
  var today = new Date();
  var dateStr = today.getFullYear() + '.' +
    String(today.getMonth() + 1).padStart(2, '0') + '.' +
    String(today.getDate()).padStart(2, '0');
  ctx.fillText(dateStr, W / 2, 1430);

  // 免责声明
  ctx.fillStyle = accentColor;
  ctx.font = '12px monospace';
  ctx.fillText('\u4EC5\u4F9B\u5A31\u4E50 | FOR ENTERTAINMENT ONLY', W / 2, 1465);
}

// ========== 显示海报弹窗 ==========
function showPosterModal(canvas) {
  var modal = document.getElementById('poster-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'poster-modal';
    modal.innerHTML =
      '<div class="poster-modal-overlay">' +
        '<div class="poster-modal-content">' +
          '<div class="poster-modal-header">' +
            '<span>\u957F\u6309\u4FDD\u5B58\u6D77\u62A5</span>' +
            '<button class="poster-close-btn" id="poster-close">&times;</button>' +
          '</div>' +
          '<div class="poster-template-selector" id="poster-template-selector"></div>' +
          '<div class="poster-image-wrap" id="poster-image-wrap"></div>' +
          '<div class="poster-btn-group">' +
            '<button class="poster-download-btn" id="poster-download">\u4E0B\u8F7D\u6D77\u62A5</button>' +
            '<button class="poster-share-btn" id="poster-share">\u5206\u4EAB\u7ED3\u679C</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modal);
  }

  // 渲染模板选择器
  var selector = document.getElementById('poster-template-selector');
  selector.innerHTML = '';
  var templates = SBTI_PosterTemplates.templates;
  for (var i = 0; i < templates.length; i++) {
    var tpl = templates[i];
    var btn = document.createElement('button');
    btn.className = 'poster-template-btn' + (tpl.id === _currentTemplateId ? ' active' : '');
    btn.setAttribute('data-template', tpl.id);
    btn.innerHTML = '<span class="poster-template-dot" style="background:' + tpl.preview + '"></span>' + tpl.name;
    btn.onclick = (function(id) {
      return function() { switchPosterTemplate(id); };
    })(tpl.id);
    selector.appendChild(btn);
  }

  // 渲染海报图片
  var wrap = document.getElementById('poster-image-wrap');
  wrap.innerHTML = '';
  var img = new Image();
  img.src = canvas.toDataURL('image/png');
  img.style.width = '100%';
  img.style.borderRadius = '8px';
  wrap.appendChild(img);

  modal.style.display = 'flex';

  // 关闭
  document.getElementById('poster-close').onclick = function() {
    modal.style.display = 'none';
  };

  // 下载
  document.getElementById('poster-download').onclick = function() {
    var link = document.createElement('a');
    link.download = 'SBTI-' + (_posterResult ? _posterResult.type.code : 'result') + '.png';
    link.href = _currentCanvas.toDataURL('image/png');
    link.click();
  };

  // 分享
  document.getElementById('poster-share').onclick = function() {
    if (typeof SBTI_Share !== 'undefined') {
      SBTI_Share.share(_posterResult);
    }
  };

  // 点击遮罩关闭
  modal.querySelector('.poster-modal-overlay').onclick = function(e) {
    if (e.target === e.currentTarget) modal.style.display = 'none';
  };
}
