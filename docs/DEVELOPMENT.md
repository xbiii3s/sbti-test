# 开发指南

## 本地开发

```bash
# 方式一：直接打开浏览器（file:// 协议，部分功能如 PWA 可能受限）
open index.html

# 方式二：本地 HTTP 服务器（推荐）
npx serve . -l 3456
# 访问 http://localhost:3456

# 方式三：Python 简易服务器
python3 -m http.server 3456
```

## 多 Session 并行开发

项目支持在 Claude Code Desktop 中开 4 个 Session 并行工作。

### 准备工作

在 Claude Code Desktop 侧边栏点击 "+ New session"，选择 SBTI-Test 项目目录，分别创建：

| Session 名称 | 负责领域 |
|-------------|---------|
| SBTI-UI | 样式、动画、交互 |
| SBTI-Core | 算法、数据、存储 |
| SBTI-Poster | 海报、分享 |
| SBTI-Deploy | 统计、PWA、部署 |

### Session 1: UI/UX

**负责文件：**
- `css/base.css`, `css/themes.css`, `css/home.css`, `css/quiz.css`, `css/result.css`, `css/animations.css`, `css/responsive.css`
- `js/ui/app.js`, `js/ui/radar.js`, `js/ui/result-renderer.js`

**示例 Prompt：**
```
你是 SBTI 项目的 UI/UX 开发者。只修改 css/* 和 js/ui/* 文件。
请给答题页添加左右滑动切换动画。
```

### Session 2: Core

**负责文件：**
- `js/core/engine.js`, `js/core/event-bus.js`, `js/core/state.js`
- `js/data/dimensions.js`, `js/data/questions.js`, `js/data/types.js`, `js/data/explanations.js`
- `js/services/storage.js`, `js/services/history.js`

**示例 Prompt：**
```
你是 SBTI 项目的核心功能开发者。只修改 js/core/*、js/data/*、js/services/storage.js、js/services/history.js。
请实现 localStorage 断点续答功能。
```

### Session 3: Poster & Share

**负责文件：**
- `js/features/poster.js`, `js/features/poster-templates.js`, `js/features/share.js`
- `css/poster.css`
- `assets/*`

**示例 Prompt：**
```
你是 SBTI 项目的海报与分享开发者。只修改 js/features/*、css/poster.css、assets/*。
请添加一个新的渐变色海报模板。
```

### Session 4: Deploy & Ops

**负责文件：**
- `js/services/analytics.js`, `js/services/pwa.js`
- `sw.js`, `manifest.json`

**示例 Prompt：**
```
你是 SBTI 项目的部署运维开发者。只修改 js/services/analytics.js、js/services/pwa.js、sw.js、manifest.json。
请优化 Service Worker 的缓存策略。
```

### 关键原则

1. **文件隔离**：每个 Session 只修改自己负责的文件
2. **EventBus 通信**：模块间不直接引用，通过 `SBTI.EventBus.emit/on` 通信
3. **index.html 少动**：所有 script/link 标签已预设，一般不需要修改

## 常见开发任务

### 添加新题目

编辑 `js/data/questions.js`，在 `questions` 数组中添加：

```js
{
  id: 'q31', dim: 'S1',  // 维度代码
  text: '你的题目文本',
  options: [
    { label: '选项A文字', value: 1 },
    { label: '选项B文字', value: 2 },
    { label: '选项C文字', value: 3 }
  ]
}
```

注意：每个维度当前有 2 道题。如果增加题目数量，需要同步修改 `js/core/engine.js` 中的 `sumToLevel()` 阈值。

### 添加新人格类型

1. 在 `js/data/types.js` 的 `NORMAL_TYPES` 添加匹配模板
2. 在同文件 `TYPE_LIBRARY` 添加详细描述
3. desc 字段如果包含中文引号，使用 `\u201C` 和 `\u201D` 替代 `"`

### 添加新海报模板

在 `js/features/poster-templates.js` 中调用 `SBTI_PosterTemplates.register()`：

```js
SBTI_PosterTemplates.register('gradient', {
  name: '渐变风',
  theme: {
    bg1: '#667eea', bg2: '#764ba2',
    text: '#ffffff', accent: '#ffd700',
    footerText: 'rgba(255,255,255,0.5)',
    footerAccent: 'rgba(255,215,0,0.6)',
    qrLabel: 'rgba(255,255,255,0.7)'
  },
  render: function(ctx, W, H, result) {
    // 绘制背景
    var grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, this.theme.bg1);
    grad.addColorStop(1, this.theme.bg2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // 绘制标题、雷达图、数据...
    // 使用 drawPosterRadar() 和 wrapText() 等公共函数
  }
});
```

### 修改主题颜色

编辑 `css/base.css` 中的 `:root` 变量（暗色主题）或 `css/themes.css` 中的 `[data-theme="light"]`（亮色主题）。

## 调试技巧

### 快速跳过答题直接看结果

在浏览器控制台执行：

```js
questions.forEach(function(q) { App.answers[q.id] = 2; });
App.specialAnswers = { drink_gate_q1: 1, drink_gate_q2: 1 };
App.finishQuiz();
```

### 测试特定人格结果

```js
// 测试 DRUNK 酒鬼人格
questions.forEach(function(q) { App.answers[q.id] = 2; });
App.specialAnswers = { drink_gate_q1: 3, drink_gate_q2: 2 };
App.finishQuiz();
```

### 查看 EventBus 事件流

```js
// 监听所有事件
['quiz:started','quiz:answer','result:computed','poster:requested','page:switched'].forEach(function(e) {
  SBTI.EventBus.on(e, function(data) { console.log('[Event]', e, data); });
});
```

## 部署

### GitHub Pages（当前方案）

每次 `git push` 到 `main` 分支自动部署：

```bash
git add -A
git commit -m "feat: 你的改动描述"
git push
```

约 20 秒后访问 https://xbiii3s.github.io/sbti-test/ 查看更新。

### 自定义域名

1. 在仓库 Settings → Pages → Custom domain 输入你的域名
2. 在域名 DNS 添加 CNAME 记录指向 `xbiii3s.github.io`
3. 在项目根目录创建 `CNAME` 文件，内容为你的域名
