// ==================== 雷达图绘制 ====================
// [Session 1] 独立的雷达图模块

var SBTI = window.SBTI || {};

SBTI.drawRadarChart = function(canvasId, rawScores, levels) {
  var canvas = document.getElementById(canvasId);
  var ctx = canvas.getContext('2d');
  var dpr = window.devicePixelRatio || 1;
  var size = 300;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = size + 'px';
  canvas.style.height = size + 'px';
  ctx.scale(dpr, dpr);

  var cx = size / 2;
  var cy = size / 2;
  var maxRadius = 120;
  var dims = dimensionOrder;
  var n = dims.length;
  var angleStep = (Math.PI * 2) / n;

  ctx.clearRect(0, 0, size, size);

  // 背景网格 (3层: L/M/H)
  [1/3, 2/3, 1].forEach(function(scale) {
    ctx.beginPath();
    for (var i = 0; i <= n; i++) {
      var angle = -Math.PI / 2 + i * angleStep;
      var x = cx + Math.cos(angle) * maxRadius * scale;
      var y = cy + Math.sin(angle) * maxRadius * scale;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  // 轴线
  for (var i = 0; i < n; i++) {
    var angle = -Math.PI / 2 + i * angleStep;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * maxRadius, cy + Math.sin(angle) * maxRadius);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // 数据多边形
  ctx.beginPath();
  dims.forEach(function(dim, i) {
    var score = rawScores[dim];
    var ratio = Math.min(score / 6, 1);
    var angle = -Math.PI / 2 + i * angleStep;
    var x = cx + Math.cos(angle) * maxRadius * ratio;
    var y = cy + Math.sin(angle) * maxRadius * ratio;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = 'rgba(0, 255, 136, 0.2)';
  ctx.fill();
  ctx.strokeStyle = '#00ff88';
  ctx.lineWidth = 2;
  ctx.stroke();

  // 数据点
  dims.forEach(function(dim, i) {
    var score = rawScores[dim];
    var ratio = Math.min(score / 6, 1);
    var angle = -Math.PI / 2 + i * angleStep;
    var x = cx + Math.cos(angle) * maxRadius * ratio;
    var y = cy + Math.sin(angle) * maxRadius * ratio;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#00ff88';
    ctx.fill();
  });

  // 维度标签
  ctx.font = '10px monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  dims.forEach(function(dim, i) {
    var angle = -Math.PI / 2 + i * angleStep;
    var labelR = maxRadius + 20;
    var x = cx + Math.cos(angle) * labelR;
    var y = cy + Math.sin(angle) * labelR;
    ctx.fillText(dim, x, y);
  });
};

window.SBTI = SBTI;
