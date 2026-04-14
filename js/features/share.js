// ==================== 分享功能 ====================
// [Session 3] 微信分享卡片 meta 标签设置、Web Share API、复制链接

var SBTI_Share = (function() {

  // ========== 设置/更新 meta 标签 ==========
  function setMeta(property, content) {
    var isOg = property.indexOf('og:') === 0 || property.indexOf('twitter:') === 0;
    var attr = isOg ? 'property' : 'name';
    var selector = 'meta[' + attr + '="' + property + '"]';
    var meta = document.querySelector(selector);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute(attr, property);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  }

  // ========== 更新微信分享卡片所需的 meta 标签 ==========
  function updateShareMeta(result) {
    if (!result || !result.type) return;

    var t = result.type;
    var title = 'SBTI\u6D4B\u8BD5\u7ED3\u679C: ' + t.code + ' ' + t.cn;
    var desc = t.intro + ' \u2014\u2014 \u5339\u914D\u5EA6' + result.similarity + '%';
    var url = window.location.href.split('?')[0].split('#')[0];

    // Open Graph 标签（微信、Facebook、LinkedIn 等平台读取）
    setMeta('og:title', title);
    setMeta('og:description', desc);
    setMeta('og:url', url);
    setMeta('og:type', 'website');
    setMeta('og:site_name', 'SBTI \u4EBA\u683C\u6D4B\u8BD5');
    setMeta('og:image', url + 'assets/share-cover.png');
    setMeta('og:image:width', '600');
    setMeta('og:image:height', '600');

    // Twitter Card 标签
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', desc);

    // 通用 meta
    setMeta('description', desc);

    // 更新页面标题
    document.title = title + ' | SBTI \u4EBA\u683C\u6D4B\u8BD5';
  }

  // ========== 重置 meta 标签（回到首页时） ==========
  function resetShareMeta() {
    var defaultTitle = 'SBTI \u4EBA\u683C\u6D4B\u8BD5';
    var defaultDesc = 'SBTI \u4EBA\u683C\u6D4B\u8BD5 - 31\u9053\u9898\u6D4B\u51FA\u4F60\u7684\u9690\u85CF\u4EBA\u683C\u7C7B\u578B';
    var url = window.location.href.split('?')[0].split('#')[0];

    setMeta('og:title', defaultTitle);
    setMeta('og:description', defaultDesc);
    setMeta('og:url', url);
    setMeta('og:type', 'website');
    setMeta('og:site_name', defaultTitle);

    setMeta('twitter:card', 'summary');
    setMeta('twitter:title', defaultTitle);
    setMeta('twitter:description', defaultDesc);

    document.title = defaultTitle;
  }

  // ========== 获取分享链接 ==========
  function getShareUrl() {
    return window.location.href.split('?')[0].split('#')[0];
  }

  // ========== 生成分享文案 ==========
  function getShareText(result) {
    if (!result || !result.type) return '';
    var t = result.type;
    return '\u6211\u7684SBTI\u4EBA\u683C\u7C7B\u578B\u662F ' + t.code +
      '\uFF08' + t.cn + '\uFF09\uFF0C\u5339\u914D\u5EA6' + result.similarity +
      '%\uFF01\u6765\u6D4B\u6D4B\u4F60\u7684\uFF1F';
  }

  // ========== 调用系统分享 / 复制文本 ==========
  function share(result) {
    if (!result) return;

    var shareData = {
      title: 'SBTI\u6D4B\u8BD5\u7ED3\u679C: ' + result.type.code,
      text: getShareText(result),
      url: getShareUrl()
    };

    // 优先使用 Web Share API（移动端浏览器支持）
    if (navigator.share) {
      navigator.share(shareData).catch(function() {
        // 用户取消分享，静默处理
      });
    } else {
      // 降级：复制分享文本到剪贴板
      copyText(shareData.text + ' ' + shareData.url);
    }
  }

  // ========== 复制文本到剪贴板 ==========
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function() {
        showCopyTip('\u5DF2\u590D\u5236\u5206\u4EAB\u6587\u6848');
      }).catch(function() {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showCopyTip('\u5DF2\u590D\u5236\u5206\u4EAB\u6587\u6848');
    } catch (e) {
      // 复制失败静默处理
    }
    document.body.removeChild(textarea);
  }

  // ========== 显示复制成功提示 ==========
  function showCopyTip(msg) {
    var tip = document.createElement('div');
    tip.className = 'poster-copy-tip';
    tip.textContent = msg;
    document.body.appendChild(tip);
    setTimeout(function() {
      tip.classList.add('show');
    }, 10);
    setTimeout(function() {
      tip.classList.remove('show');
      setTimeout(function() {
        if (tip.parentNode) tip.parentNode.removeChild(tip);
      }, 300);
    }, 2000);
  }

  // ========== 监听事件 ==========
  if (typeof SBTI !== 'undefined' && SBTI.EventBus) {
    // 结果计算完成时更新分享 meta
    SBTI.EventBus.on('result:computed', function(data) {
      if (data && data.result) {
        updateShareMeta(data.result);
      }
    });

    // 重新测试时重置 meta
    SBTI.EventBus.on('quiz:started', function() {
      resetShareMeta();
    });
  }

  // ========== 公开 API ==========
  return {
    updateMeta: updateShareMeta,
    resetMeta: resetShareMeta,
    share: share,
    getShareUrl: getShareUrl,
    getShareText: getShareText,
    copyText: copyText
  };
})();
