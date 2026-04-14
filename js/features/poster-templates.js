// ==================== 海报模板 ====================
// [Session 3] 三套海报模板：赛博朋克 / 简约白 / 像素风

var SBTI_PosterTemplates = (function() {

  // ===================== 赛博朋克（默认深色霓虹风格） =====================
  var cyberpunk = {
    id: 'cyberpunk',
    name: '赛博朋克',
    preview: '#0a0a1a',
    theme: {
      footerText: 'rgba(255,255,255,0.3)',
      footerAccent: 'rgba(0, 255, 136, 0.4)',
      qrLabel: 'rgba(0, 255, 136, 0.6)'
    },

    render: function(ctx, W, H, result) {
      var t = result.type;

      // 渐变背景
      var grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#0a0a1a');
      grad.addColorStop(0.5, '#111128');
      grad.addColorStop(1, '#0a0a1a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // 装饰网格
      ctx.strokeStyle = 'rgba(0, 255, 136, 0.05)';
      ctx.lineWidth = 1;
      for (var x = 0; x <= W; x += 30) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (var y = 0; y <= H; y += 30) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // 装饰粒子
      for (var i = 0; i < 50; i++) {
        var px = Math.random() * W;
        var py = Math.random() * H;
        var pr = Math.random() * 2 + 0.5;
        ctx.beginPath();
        ctx.arc(px, py, pr, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 255, 136, ' + (Math.random() * 0.3) + ')';
        ctx.fill();
      }

      // 顶部标题
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(0, 255, 136, 0.6)';
      ctx.font = '600 18px "PingFang SC", "Microsoft YaHei", sans-serif';
      ctx.fillText('SBTI PERSONALITY TEST', W / 2, 60);
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '14px monospace';
      ctx.fillText('Silly Big Personality Test', W / 2, 85);

      // 人格代号
      ctx.fillStyle = '#00ff88';
      ctx.font = 'bold 80px "Courier New", monospace';
      ctx.fillText(t.code, W / 2, 180);

      // 中文名
      ctx.fillStyle = '#ffffff';
      ctx.font = '600 36px "PingFang SC", "Microsoft YaHei", sans-serif';
      ctx.fillText(t.cn, W / 2, 230);

      // 匹配度
      ctx.fillStyle = 'rgba(0, 255, 136, 0.8)';
      ctx.font = '20px monospace';
      ctx.fillText('MATCH ' + result.similarity + '%', W / 2, 270);

      // intro
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = '18px "PingFang SC", "Microsoft YaHei", sans-serif';
      ctx.fillText('\u201C' + t.intro + '\u201D', W / 2, 310);

      // 雷达图
      drawPosterRadar(ctx, W / 2, 490, 140, result.rawScores, {
        grid: 'rgba(0, 255, 136, 0.15)',
        axis: 'rgba(0, 255, 136, 0.08)',
        fill: 'rgba(0, 255, 136, 0.25)',
        stroke: '#00ff88',
        label: 'rgba(255,255,255,0.6)'
      });

      // 15维标签
      var labelY = 670;
      ctx.textAlign = 'center';
      var levelColors = { H: '#00ff88', M: '#ffaa00', L: '#ff4466' };
      dimensionOrder.forEach(function(dim, i) {
        var col = i % 5;
        var row = Math.floor(i / 5);
        var lx = 120 + col * 130;
        var ly = labelY + row * 50;
        var level = result.levels[dim];
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
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
        { name: '自我', dims: ['S1', 'S2', 'S3'], color: '#00ff88' },
        { name: '情感', dims: ['E1', 'E2', 'E3'], color: '#ff6699' },
        { name: '态度', dims: ['A1', 'A2', 'A3'], color: '#66ccff' },
        { name: '行动', dims: ['Ac1', 'Ac2', 'Ac3'], color: '#ffaa00' },
        { name: '社交', dims: ['So1', 'So2', 'So3'], color: '#cc66ff' }
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

        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        roundRect(ctx, 120, by - 8, 500, 16, 8);
        ctx.fill();

        ctx.fillStyle = model.color;
        roundRect(ctx, 120, by - 8, 500 * ratio, 16, 8);
        ctx.fill();

        ctx.textAlign = 'left';
        ctx.fillStyle = model.color;
        ctx.font = '12px monospace';
        ctx.fillText(totalScore + '/' + maxScore, 630, by + 4);
      });
    }
  };

  // ===================== 简约白（白色背景 + 黑色文字 + 彩色强调） =====================
  var minimalWhite = {
    id: 'minimal',
    name: '简约白',
    preview: '#ffffff',
    theme: {
      footerText: '#bbbbbb',
      footerAccent: '#667eea',
      qrLabel: '#999999'
    },

    render: function(ctx, W, H, result) {
      var t = result.type;

      // 白色背景
      ctx.fillStyle = '#fafafa';
      ctx.fillRect(0, 0, W, H);

      // 顶部渐变强调条
      var accentGrad = ctx.createLinearGradient(0, 0, W, 0);
      accentGrad.addColorStop(0, '#667eea');
      accentGrad.addColorStop(1, '#764ba2');
      ctx.fillStyle = accentGrad;
      ctx.fillRect(0, 0, W, 6);

      // 底部渐变强调条
      ctx.fillStyle = accentGrad;
      ctx.fillRect(0, H - 6, W, 6);

      // 标题
      ctx.textAlign = 'center';
      ctx.fillStyle = '#999999';
      ctx.font = '300 16px "PingFang SC", "Helvetica Neue", sans-serif';
      ctx.fillText('SBTI PERSONALITY TEST', W / 2, 55);

      // 分割线
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(W / 2 - 80, 70);
      ctx.lineTo(W / 2 + 80, 70);
      ctx.stroke();

      // 人格代号（渐变色）
      var codeGrad = ctx.createLinearGradient(W / 2 - 150, 140, W / 2 + 150, 140);
      codeGrad.addColorStop(0, '#667eea');
      codeGrad.addColorStop(1, '#764ba2');
      ctx.fillStyle = codeGrad;
      ctx.font = 'bold 76px "Helvetica Neue", "PingFang SC", sans-serif';
      ctx.fillText(t.code, W / 2, 170);

      // 中文名
      ctx.fillStyle = '#333333';
      ctx.font = '500 34px "PingFang SC", "Microsoft YaHei", sans-serif';
      ctx.fillText(t.cn, W / 2, 220);

      // 匹配度（胶囊样式）
      var matchText = 'MATCH ' + result.similarity + '%';
      ctx.font = '500 16px "Helvetica Neue", sans-serif';
      var mw = ctx.measureText(matchText).width;
      roundRect(ctx, W / 2 - mw / 2 - 16, 238, mw + 32, 30, 15);
      ctx.fillStyle = '#f0f0f0';
      ctx.fill();
      ctx.fillStyle = '#667eea';
      ctx.font = '500 16px "Helvetica Neue", sans-serif';
      ctx.fillText(matchText, W / 2, 258);

      // Intro
      ctx.fillStyle = '#666666';
      ctx.font = 'italic 17px "PingFang SC", "Microsoft YaHei", sans-serif';
      ctx.fillText('\u201C' + t.intro + '\u201D', W / 2, 305);

      // 雷达图
      drawPosterRadar(ctx, W / 2, 480, 135, result.rawScores, {
        grid: 'rgba(102, 126, 234, 0.2)',
        axis: 'rgba(102, 126, 234, 0.1)',
        fill: 'rgba(102, 126, 234, 0.15)',
        stroke: '#667eea',
        label: '#999999'
      });

      // 15维标签
      var labelY = 655;
      ctx.textAlign = 'center';
      var wLevelColors = { H: '#667eea', M: '#f5a623', L: '#e74c3c' };
      dimensionOrder.forEach(function(dim, i) {
        var col = i % 5;
        var row = Math.floor(i / 5);
        var lx = 120 + col * 130;
        var ly = labelY + row * 50;
        var level = result.levels[dim];
        ctx.fillStyle = '#aaaaaa';
        ctx.font = '12px "Helvetica Neue", sans-serif';
        ctx.fillText(dim, lx, ly);
        ctx.fillStyle = wLevelColors[level];
        ctx.font = 'bold 16px "Helvetica Neue", sans-serif';
        ctx.fillText(level, lx, ly + 20);
      });

      // 描述（卡片样式）
      var descCardY = 815;
      roundRect(ctx, 40, descCardY - 15, W - 80, 130, 12);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#e8e8e8';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.textAlign = 'left';
      ctx.fillStyle = '#555555';
      ctx.font = '15px "PingFang SC", "Microsoft YaHei", sans-serif';
      var descText = t.desc.substring(0, 120) + '...';
      wrapText(ctx, descText, 60, descCardY + 10, W - 120, 22);

      // 五大模型得分条
      var models = [
        { name: '自我', dims: ['S1', 'S2', 'S3'], color: '#667eea' },
        { name: '情感', dims: ['E1', 'E2', 'E3'], color: '#e74c3c' },
        { name: '态度', dims: ['A1', 'A2', 'A3'], color: '#3498db' },
        { name: '行动', dims: ['Ac1', 'Ac2', 'Ac3'], color: '#f5a623' },
        { name: '社交', dims: ['So1', 'So2', 'So3'], color: '#764ba2' }
      ];
      var barStartY = 990;
      models.forEach(function(model, idx) {
        var by = barStartY + idx * 40;
        var totalScore = model.dims.reduce(function(s, d) { return s + result.rawScores[d]; }, 0);
        var maxScore = 18;
        var ratio = totalScore / maxScore;

        ctx.textAlign = 'right';
        ctx.fillStyle = '#888888';
        ctx.font = '14px "PingFang SC", "Helvetica Neue", sans-serif';
        ctx.fillText(model.name, 100, by + 4);

        ctx.fillStyle = '#f0f0f0';
        roundRect(ctx, 120, by - 8, 500, 14, 7);
        ctx.fill();

        ctx.fillStyle = model.color;
        roundRect(ctx, 120, by - 8, 500 * ratio, 14, 7);
        ctx.fill();

        ctx.textAlign = 'left';
        ctx.fillStyle = '#888888';
        ctx.font = '12px "Helvetica Neue", sans-serif';
        ctx.fillText(totalScore + '/' + maxScore, 630, by + 4);
      });
    }
  };

  // ===================== 像素风（8bit 风格 + 马赛克元素） =====================
  var pixelArt = {
    id: 'pixel',
    name: '像素风',
    preview: '#1a1a2e',
    theme: {
      footerText: 'rgba(255,255,255,0.4)',
      footerAccent: 'rgba(233, 69, 96, 0.5)',
      qrLabel: 'rgba(233, 69, 96, 0.7)'
    },

    render: function(ctx, W, H, result) {
      var t = result.type;
      var ps = 10; // pixel size

      // 深蓝背景
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, W, H);

      // 随机马赛克装饰
      var mosaicColors = ['#e94560', '#0f3460', '#533483', '#16213e'];
      for (var mx = 0; mx < W; mx += ps) {
        for (var my = 0; my < H; my += ps) {
          if (Math.random() < 0.03) {
            ctx.fillStyle = mosaicColors[Math.floor(Math.random() * mosaicColors.length)];
            ctx.globalAlpha = 0.15;
            ctx.fillRect(mx, my, ps, ps);
          }
        }
      }
      ctx.globalAlpha = 1;

      // 像素边框
      ctx.fillStyle = '#e94560';
      for (var bx = 20; bx < W - 20; bx += ps) {
        ctx.fillRect(bx, 20, ps, ps);
        ctx.fillRect(bx, 35, ps, ps / 2);
      }
      for (var by = 20; by < 1210; by += ps) {
        ctx.fillRect(20, by, ps, ps);
        ctx.fillRect(W - 30, by, ps, ps);
      }

      // 标题
      ctx.textAlign = 'center';
      ctx.fillStyle = '#e94560';
      ctx.font = 'bold 20px "Courier New", monospace';
      ctx.fillText('\u2605 SBTI PERSONALITY TEST \u2605', W / 2, 70);

      // 像素下划线
      for (var ux = W / 2 - 150; ux < W / 2 + 150; ux += ps) {
        ctx.fillStyle = '#e94560';
        ctx.fillRect(ux, 80, ps, 4);
      }

      ctx.fillStyle = '#a0a0c0';
      ctx.font = '14px "Courier New", monospace';
      ctx.fillText('< Silly Big Personality Test >', W / 2, 105);

      // 人格代号（带像素阴影）
      ctx.fillStyle = 'rgba(233, 69, 96, 0.3)';
      ctx.font = 'bold 78px "Courier New", monospace';
      ctx.fillText(t.code, W / 2 + 3, 198);
      ctx.fillStyle = '#e94560';
      ctx.fillText(t.code, W / 2, 195);

      // 中文名
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 34px "PingFang SC", "Microsoft YaHei", sans-serif';
      ctx.fillText(t.cn, W / 2, 245);

      // 匹配度（像素括号）
      ctx.fillStyle = '#e94560';
      ctx.font = 'bold 18px "Courier New", monospace';
      ctx.fillText('[ MATCH ' + result.similarity + '% ]', W / 2, 280);

      // Intro
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = '16px "Courier New", monospace';
      var introText = '>> \u201C' + t.intro + '\u201D <<';
      ctx.fillText(introText, W / 2, 315);

      // 雷达图
      drawPosterRadar(ctx, W / 2, 490, 135, result.rawScores, {
        grid: 'rgba(233, 69, 96, 0.2)',
        axis: 'rgba(233, 69, 96, 0.1)',
        fill: 'rgba(233, 69, 96, 0.25)',
        stroke: '#e94560',
        label: 'rgba(255,255,255,0.6)'
      });

      // 15维标签
      var labelY = 665;
      ctx.textAlign = 'center';
      var pLevelColors = { H: '#e94560', M: '#feca57', L: '#533483' };
      dimensionOrder.forEach(function(dim, i) {
        var col = i % 5;
        var row = Math.floor(i / 5);
        var lx = 120 + col * 130;
        var ly = labelY + row * 50;
        var level = result.levels[dim];
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '12px "Courier New", monospace';
        ctx.fillText(dim, lx, ly);
        ctx.fillStyle = pLevelColors[level];
        ctx.font = 'bold 16px "Courier New", monospace';
        ctx.fillText(level, lx, ly + 20);
      });

      // 描述（虚线像素边框）
      var descCardY = 825;
      ctx.strokeStyle = '#e94560';
      ctx.lineWidth = 2;
      ctx.setLineDash([ps, ps / 2]);
      ctx.strokeRect(45, descCardY - 20, W - 90, 120);
      ctx.setLineDash([]);

      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = '15px "Courier New", monospace';
      var descText = t.desc.substring(0, 100) + '...';
      wrapText(ctx, descText, 65, descCardY + 5, W - 140, 22);

      // 五大模型得分条（像素方块风格）
      var models = [
        { name: '自我', dims: ['S1', 'S2', 'S3'], color: '#e94560' },
        { name: '情感', dims: ['E1', 'E2', 'E3'], color: '#ff6b81' },
        { name: '态度', dims: ['A1', 'A2', 'A3'], color: '#48dbfb' },
        { name: '行动', dims: ['Ac1', 'Ac2', 'Ac3'], color: '#feca57' },
        { name: '社交', dims: ['So1', 'So2', 'So3'], color: '#a29bfe' }
      ];
      var barStartY = 990;
      models.forEach(function(model, idx) {
        var by = barStartY + idx * 40;
        var totalScore = model.dims.reduce(function(s, d) { return s + result.rawScores[d]; }, 0);
        var maxScore = 18;
        var ratio = totalScore / maxScore;

        ctx.textAlign = 'right';
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = '14px "Courier New", monospace';
        ctx.fillText(model.name, 100, by + 4);

        // 像素方块进度条
        var barW = 500;
        var blockCount = 20;
        var filledBlocks = Math.round(ratio * blockCount);
        for (var b = 0; b < blockCount; b++) {
          ctx.fillStyle = b < filledBlocks ? model.color : 'rgba(255,255,255,0.1)';
          ctx.fillRect(120 + b * (barW / blockCount), by - 8, barW / blockCount - 2, 16);
        }

        ctx.textAlign = 'left';
        ctx.fillStyle = model.color;
        ctx.font = '12px "Courier New", monospace';
        ctx.fillText(totalScore + '/' + maxScore, 630, by + 4);
      });

      // 底部像素装饰点
      ctx.fillStyle = '#e94560';
      var dotPositions = [W / 2 - 80, W / 2 - 40, W / 2, W / 2 + 40, W / 2 + 80];
      dotPositions.forEach(function(dx) {
        ctx.fillRect(dx - 3, 1210, 6, 6);
      });
    }
  };

  // ========== 模板注册表 ==========
  var templates = [cyberpunk, minimalWhite, pixelArt];

  return {
    templates: templates,
    getTemplate: function(id) {
      for (var i = 0; i < templates.length; i++) {
        if (templates[i].id === id) return templates[i];
      }
      return templates[0];
    },
    getDefaultId: function() {
      return 'cyberpunk';
    }
  };
})();
