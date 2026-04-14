// ==================== 匿名统计 ====================
// [Session 4] 匿名的人格分布统计

(function() {
  var stats = {
    typeCounts: {},    // { 'CTRL': 3, 'BOSS': 1, ... }
    totalTests: 0,
    totalStarts: 0,
    pageSwitches: 0
  };

  SBTI.EventBus.on('quiz:started', function() {
    stats.totalStarts += 1;
  });

  SBTI.EventBus.on('result:computed', function(data) {
    stats.totalTests += 1;
    var code = data.result && data.result.type && data.result.type.code;
    if (code) {
      stats.typeCounts[code] = (stats.typeCounts[code] || 0) + 1;
    }
  });

  SBTI.EventBus.on('page:switched', function() {
    stats.pageSwitches += 1;
  });

  SBTI.Analytics = {
    getStats: function() {
      return {
        typeCounts: JSON.parse(JSON.stringify(stats.typeCounts)),
        totalTests: stats.totalTests,
        totalStarts: stats.totalStarts,
        pageSwitches: stats.pageSwitches
      };
    }
  };
})();
