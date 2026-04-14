// ==================== 扩展海报模板 ====================
// [Session 1] 新增渐变极光 + 中国风模板，注入到 SBTI_PosterTemplates

(function() {

  // ===================== 渐变极光（深色 + 紫蓝粉极光弧线） =====================
  var aurora = {
    id: 'aurora',
    name: '渐变极光',
    preview: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
    theme: {
      footerText: 'rgba(255,255,255,0.35)',
      footerAccent: 'rgba(168, 85, 247, 0.5)',
      qrLabel: 'rgba(200, 160, 255, 0.7)'
    },

    render: function(ctx, W, H, result) {
      var t = result.type;

      // 深色渐变背景
      var bgGrad = ctx.createLinearGradient(0, 0, 0, H);
      bgGrad.addColorStop(0, '#0f0c29');
      bgGrad.addColorStop(0.4, '#1a1145');
      bgGrad.addColorStop(0.7, '#0d1b2a');
      bgGrad.addColorStop(1, '#0f0c29');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // 极光弧线效果 — 多层半透明渐变弧
      ctx.save();
      var auroraLayers = [
        { y: 80, h: 300, colors: ['rgba(168,85,247,0)', 'rgba(168,85,247,0.12)', 'rgba(99,102,241,0.08)', 'rgba(6,182,212,0)'] },
        { y: 150, h: 250, colors: ['rgba(236,72,153,0)', 'rgba(236,72,153,0.08)', 'rgba(168,85,247,0.1)', 'rgba(99,102,241,0)'] },
        { y: 50, h: 350, colors: ['rgba(6,182,212,0)', 'rgba(6,182,212,0.06)', 'rgba(34,211,238,0.08)', 'rgba(168,85,247,0)'] }
      ];
      auroraLayers.forEach(function(layer) {
        var aGrad = ctx.createLinearGradient(0, layer.y, 0, layer.y + layer.h);
        layer.colors.forEach(function(c, i) {
          aGrad.addColorStop(i / (layer.colors.length - 1), c);
        });
        ctx.fillStyle = aGrad;
        // 用椭圆形绘制极光弧
        ctx.beginPath();
        ctx.ellipse(W / 2, layer.y + layer.h / 2, W * 0.6, layer.h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // 星星点缀
      for (var i = 0; i < 80; i++) {
        var sx = Math.random() * W;
        var sy = Math.random() * H * 0.5;
        var sr = Math.random() * 1.5 + 0.3;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,' + (Math.random() * 0.5 + 0.1) + ')';
        ctx.fill();
      }
      ctx.restore();

      // 顶部标题
      ctx.textAlign = 'center';
      var titleGrad = ctx.createLinearGradient(W / 2 - 120, 0, W / 2 + 120, 0);
      titleGrad.addColorStop(0, '#a855f7');
      titleGrad.addColorStop(0.5, '#6366f1');
      titleGrad.addColorStop(1, '#06b6d4');
      ctx.fillStyle = titleGrad;
      ctx.font = '600 18px "PingFang SC", "Microsoft YaHei", sans-serif';
      ctx.fillText('SBTI PERSONALITY TEST', W / 2, 60);

      ctx.fillStyle = 'rgba(200, 160, 255, 0.5)';
      ctx.font = '14px monospace';
      ctx.fillText('Silly Big Personality Test', W / 2, 85);

      // 人格代号 — 渐变色
      var codeGrad = ctx.createLinearGradient(W / 2 - 150, 170, W / 2 + 150, 170);
      codeGrad.addColorStop(0, '#c084fc');
      codeGrad.addColorStop(0.5, '#818cf8');
      codeGrad.addColorStop(1, '#22d3ee');
      ctx.fillStyle = codeGrad;
      ctx.font = 'bold 80px "Courier New", monospace';
      ctx.fillText(t.code, W / 2, 180);

      // 中文名
      ctx.fillStyle = '#ffffff';
      ctx.font = '600 36px "PingFang SC", "Microsoft YaHei", sans-serif';
      ctx.fillText(t.cn, W / 2, 230);

      // 匹配度 — 带发光效果
      ctx.fillStyle = '#c084fc';
      ctx.font = '20px monospace';
      ctx.shadowColor = 'rgba(168, 85, 247, 0.6)';
      ctx.shadowBlur = 15;
      ctx.fillText('MATCH ' + result.similarity + '%', W / 2, 270);
      ctx.shadowBlur = 0;

      // Intro
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = '18px "PingFang SC", "Microsoft YaHei", sans-serif';
      ctx.fillText('\u201C' + t.intro + '\u201D', W / 2, 310);

      // 雷达图
      drawPosterRadar(ctx, W / 2, 490, 140, result.rawScores, {
        grid: 'rgba(168, 85, 247, 0.15)',
        axis: 'rgba(99, 102, 241, 0.1)',
        fill: 'rgba(139, 92, 246, 0.2)',
        stroke: '#a78bfa',
        label: 'rgba(200, 180, 255, 0.7)'
      });

      // 15 维标签
      var labelY = 670;
      ctx.textAlign = 'center';
      var levelColors = { H: '#a78bfa', M: '#fbbf24', L: '#f472b6' };
      dimensionOrder.forEach(function(dim, i) {
        var col = i % 5;
        var row = Math.floor(i / 5);
        var lx = 120 + col * 130;
        var ly = labelY + row * 50;
        var level = result.levels[dim];
        ctx.fillStyle = 'rgba(200, 180, 255, 0.5)';
        ctx.font = '12px monospace';
        ctx.fillText(dim, lx, ly);
        ctx.fillStyle = levelColors[level];
        ctx.font = 'bold 16px monospace';
        ctx.fillText(level, lx, ly + 20);
      });

      // 描述文字
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = '16px "PingFang SC", "Microsoft YaHei", sans-serif';
      var descText = t.desc.substring(0, 120) + '...';
      wrapText(ctx, descText, 60, 830, W - 120, 24);

      // 五大模型得分条
      var models = [
        { name: '自我', dims: ['S1', 'S2', 'S3'], color: '#a78bfa' },
        { name: '情感', dims: ['E1', 'E2', 'E3'], color: '#f472b6' },
        { name: '态度', dims: ['A1', 'A2', 'A3'], color: '#38bdf8' },
        { name: '行动', dims: ['Ac1', 'Ac2', 'Ac3'], color: '#fbbf24' },
        { name: '社交', dims: ['So1', 'So2', 'So3'], color: '#34d399' }
      ];
      var barStartY = 1000;
      models.forEach(function(model, idx) {
        var by = barStartY + idx * 40;
        var totalScore = model.dims.reduce(function(s, d) { return s + result.rawScores[d]; }, 0);
        var maxScore = 18;
        var ratio = totalScore / maxScore;

        ctx.textAlign = 'right';
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = '14px "PingFang SC", "Microsoft YaHei", sans-serif';
        ctx.fillText(model.name, 100, by + 4);

        // 背景条
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        roundRect(ctx, 120, by - 8, 500, 16, 8);
        ctx.fill();

        // 渐变前景条
        var barGrad = ctx.createLinearGradient(120, 0, 120 + 500 * ratio, 0);
        barGrad.addColorStop(0, model.color);
        barGrad.addColorStop(1, shiftColor(model.color, 30));
        ctx.fillStyle = barGrad;
        roundRect(ctx, 120, by - 8, 500 * ratio, 16, 8);
        ctx.fill();

        ctx.textAlign = 'left';
        ctx.fillStyle = model.color;
        ctx.font = '12px monospace';
        ctx.fillText(totalScore + '/' + maxScore, 630, by + 4);
      });
    }
  };

  // 辅助函数：颜色偏移（简单地增加亮度）
  function shiftColor(hex, amount) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    r = Math.min(255, r + amount);
    g = Math.min(255, g + amount);
    b = Math.min(255, b + amount);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  // ===================== 中国风（宣纸底 + 朱红墨黑金色） =====================
  var chinese = {
    id: 'chinese',
    name: '中国风',
    preview: '#f5e6c8',
    theme: {
      footerText: 'rgba(100, 60, 30, 0.4)',
      footerAccent: 'rgba(192, 57, 43, 0.5)',
      qrLabel: 'rgba(100, 60, 30, 0.6)'
    },

    render: function(ctx, W, H, result) {
      var t = result.type;
      var red = '#b83b2e';
      var gold = '#d4a849';
      var inkBlack = '#2c1810';
      var inkGray = 'rgba(44, 24, 16, 0.6)';

      // 宣纸背景
      var paperGrad = ctx.createLinearGradient(0, 0, 0, H);
      paperGrad.addColorStop(0, '#f5e6c8');
      paperGrad.addColorStop(0.3, '#f0dbb8');
      paperGrad.addColorStop(0.7, '#ecdaaf');
      paperGrad.addColorStop(1, '#f2e0bc');
      ctx.fillStyle = paperGrad;
      ctx.fillRect(0, 0, W, H);

      // 宣纸纹理 — 随机淡色噪点
      for (var i = 0; i < 2000; i++) {
        var nx = Math.random() * W;
        var ny = Math.random() * H;
        ctx.fillStyle = 'rgba(180, 150, 100, ' + (Math.random() * 0.08) + ')';
        ctx.fillRect(nx, ny, Math.random() * 3 + 1, Math.random() * 3 + 1);
      }

      // 回字纹边框
      drawChineseBorder(ctx, W, H, red);

      // 水墨晕染装饰圆 — 右上角
      drawInkBlob(ctx, W - 100, 120, 80, 'rgba(44, 24, 16, 0.04)');
      // 左下角
      drawInkBlob(ctx, 100, H - 300, 60, 'rgba(192, 57, 43, 0.03)');

      // 顶部装饰线
      ctx.strokeStyle = gold;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(W / 2 - 100, 45);
      ctx.lineTo(W / 2 + 100, 45);
      ctx.stroke();

      // 顶部标题
      ctx.textAlign = 'center';
      ctx.fillStyle = red;
      ctx.font = '600 18px "PingFang SC", "SimSun", "STSong", serif';
      ctx.fillText('\u4eba\u683c\u6d4b\u8bd5  \u00b7  SBTI', W / 2, 70);

      // 装饰线
      ctx.strokeStyle = gold;
      ctx.beginPath();
      ctx.moveTo(W / 2 - 100, 82);
      ctx.lineTo(W / 2 + 100, 82);
      ctx.stroke();

      // 人格代号 — 朱红大字
      ctx.fillStyle = red;
      ctx.font = 'bold 78px "Courier New", monospace';
      ctx.fillText(t.code, W / 2, 175);

      // 印章风格装饰 — 代号下方的方框
      var stampW = 160;
      var stampH = 46;
      ctx.strokeStyle = red;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(W / 2 - stampW / 2, 192, stampW, stampH);

      // 中文名（印章内）
      ctx.fillStyle = red;
      ctx.font = '600 30px "PingFang SC", "SimSun", "STSong", serif';
      ctx.fillText(t.cn, W / 2, 225);

      // 匹配度
      ctx.fillStyle = gold;
      ctx.font = '18px "PingFang SC", "SimSun", serif';
      ctx.fillText('\u5339\u914d\u5ea6 ' + result.similarity + '%', W / 2, 270);

      // Intro — 书法引用风格
      ctx.fillStyle = inkGray;
      ctx.font = 'italic 17px "PingFang SC", "SimSun", "STSong", serif';
      ctx.fillText('\u300C' + t.intro + '\u300D', W / 2, 310);

      // 雷达图
      drawPosterRadar(ctx, W / 2, 490, 140, result.rawScores, {
        grid: 'rgba(184, 59, 46, 0.15)',
        axis: 'rgba(184, 59, 46, 0.08)',
        fill: 'rgba(184, 59, 46, 0.15)',
        stroke: red,
        label: 'rgba(44, 24, 16, 0.6)'
      });

      // 15 维标签
      var labelY = 670;
      ctx.textAlign = 'center';
      var cLevelColors = { H: red, M: gold, L: 'rgba(44, 24, 16, 0.5)' };
      dimensionOrder.forEach(function(dim, i) {
        var col = i % 5;
        var row = Math.floor(i / 5);
        var lx = 120 + col * 130;
        var ly = labelY + row * 50;
        var level = result.levels[dim];
        ctx.fillStyle = 'rgba(44, 24, 16, 0.45)';
        ctx.font = '12px monospace';
        ctx.fillText(dim, lx, ly);
        ctx.fillStyle = cLevelColors[level];
        ctx.font = 'bold 16px monospace';
        ctx.fillText(level, lx, ly + 20);
      });

      // 描述（宣纸卡片）
      var descCardY = 815;
      roundRect(ctx, 45, descCardY - 15, W - 90, 130, 4);
      ctx.fillStyle = 'rgba(255, 250, 240, 0.6)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(184, 59, 46, 0.25)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.textAlign = 'left';
      ctx.fillStyle = inkGray;
      ctx.font = '15px "PingFang SC", "SimSun", "STSong", serif';
      var descText = t.desc.substring(0, 120) + '...';
      wrapText(ctx, descText, 65, descCardY + 10, W - 140, 22);

      // 五大模型得分条（水墨风格 — 实心条 + 墨色系配色）
      var models = [
        { name: '自我', dims: ['S1', 'S2', 'S3'], color: red },
        { name: '情感', dims: ['E1', 'E2', 'E3'], color: '#c0392b' },
        { name: '态度', dims: ['A1', 'A2', 'A3'], color: gold },
        { name: '行动', dims: ['Ac1', 'Ac2', 'Ac3'], color: '#8b6914' },
        { name: '社交', dims: ['So1', 'So2', 'So3'], color: inkBlack }
      ];
      var barStartY = 1000;
      models.forEach(function(model, idx) {
        var by = barStartY + idx * 40;
        var totalScore = model.dims.reduce(function(s, d) { return s + result.rawScores[d]; }, 0);
        var maxScore = 18;
        var ratio = totalScore / maxScore;

        ctx.textAlign = 'right';
        ctx.fillStyle = inkGray;
        ctx.font = '14px "PingFang SC", "SimSun", serif';
        ctx.fillText(model.name, 100, by + 4);

        // 背景条
        ctx.fillStyle = 'rgba(44, 24, 16, 0.08)';
        roundRect(ctx, 120, by - 8, 500, 16, 3);
        ctx.fill();

        // 前景条
        ctx.fillStyle = model.color;
        roundRect(ctx, 120, by - 8, 500 * ratio, 16, 3);
        ctx.fill();

        ctx.textAlign = 'left';
        ctx.fillStyle = model.color;
        ctx.font = '12px monospace';
        ctx.fillText(totalScore + '/' + maxScore, 630, by + 4);
      });

      // 底部装饰 — 金色分隔线
      ctx.strokeStyle = gold;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(W / 2 - 80, 1220);
      ctx.lineTo(W / 2 + 80, 1220);
      ctx.stroke();
    }
  };

  // ========== 中国风辅助函数 ==========

  // 回字纹边框
  function drawChineseBorder(ctx, W, H, color) {
    var m = 30;  // 边距
    var s = 12;  // 回字纹单元大小
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.3;

    // 外框
    ctx.strokeRect(m, m, W - m * 2, 1200 - m);

    // 内框
    ctx.strokeRect(m + s, m + s, W - (m + s) * 2, 1200 - m - s * 2);

    // 四角回字纹装饰
    var corners = [
      { x: m, y: m },
      { x: W - m - s * 3, y: m },
      { x: m, y: 1200 - m - s * 3 },
      { x: W - m - s * 3, y: 1200 - m - s * 3 }
    ];
    corners.forEach(function(c) {
      ctx.strokeRect(c.x, c.y, s * 3, s * 3);
      ctx.strokeRect(c.x + s * 0.5, c.y + s * 0.5, s * 2, s * 2);
    });

    ctx.globalAlpha = 1;
  }

  // 水墨晕染效果
  function drawInkBlob(ctx, cx, cy, maxR, color) {
    for (var i = 5; i > 0; i--) {
      ctx.beginPath();
      ctx.arc(cx, cy, maxR * (i / 5), 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }
  }

  // ========== 注入到模板注册表 ==========
  if (typeof SBTI_PosterTemplates !== 'undefined') {
    SBTI_PosterTemplates.templates.push(aurora);
    SBTI_PosterTemplates.templates.push(chinese);
  }

})();
