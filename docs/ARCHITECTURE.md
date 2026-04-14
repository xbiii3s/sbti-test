# 架构设计文档

## 总体架构

SBTI 采用 5 层模块化架构，通过 EventBus 发布订阅实现模块间解耦。无需构建工具，所有模块通过 `<script>` 标签按顺序加载，使用全局变量（`var`）通信。

```
┌─────────────────────────────────────────────────────────┐
│                     index.html                           │
├─────────────────────────────────────────────────────────┤
│  services/    │ analytics.js  pwa.js  storage.js        │
│               │ history.js                               │
├───────────────┼──────────────────────────────────────────┤
│  features/    │ poster.js  poster-templates.js  share.js │
├───────────────┼──────────────────────────────────────────┤
│  ui/          │ app.js  radar.js  result-renderer.js     │
├───────────────┼──────────────────────────────────────────┤
│  data/        │ dimensions.js  questions.js  types.js    │
│               │ explanations.js                          │
├───────────────┼──────────────────────────────────────────┤
│  core/        │ event-bus.js  engine.js  state.js        │
└───────────────┴──────────────────────────────────────────┘
```

## 加载顺序

Script 加载顺序严格从下到上（core → data → ui → features → services）：

```html
<!-- 1. 核心层 -->
<script src="js/core/event-bus.js"></script>       <!-- 必须最先加载 -->

<!-- 2. 数据层 -->
<script src="js/data/dimensions.js"></script>
<script src="js/data/questions.js"></script>
<script src="js/data/types.js"></script>
<script src="js/data/explanations.js"></script>

<!-- 3. 引擎 + 状态 -->
<script src="js/core/engine.js"></script>
<script src="js/core/state.js"></script>

<!-- 4. 服务层（存储类，被 UI 依赖） -->
<script src="js/services/storage.js"></script>
<script src="js/services/history.js"></script>

<!-- 5. UI 层 -->
<script src="js/ui/radar.js"></script>
<script src="js/ui/result-renderer.js"></script>
<script src="js/ui/app.js"></script>               <!-- 包含 DOMContentLoaded 初始化 -->

<!-- 6. 功能层 -->
<script src="js/features/poster.js"></script>
<script src="js/features/poster-templates.js"></script>
<script src="js/features/share.js"></script>

<!-- 7. 服务层（后台类） -->
<script src="js/services/analytics.js"></script>
<script src="js/services/pwa.js"></script>
```

## 全局变量一览

### 数据层（只读）

| 变量 | 文件 | 类型 | 说明 |
|------|------|------|------|
| `dimensionMeta` | dimensions.js | Object | 15 维度元数据 `{S1: {name, model}, ...}` |
| `dimensionOrder` | dimensions.js | Array | 维度排序 `['S1','S2',...,'So3']` |
| `questions` | questions.js | Array[30] | 常规题 `{id, dim, text, options[]}` |
| `specialQuestions` | questions.js | Array[2] | 特殊题（酒鬼触发） |
| `NORMAL_TYPES` | types.js | Array[25] | 人格匹配模板 `{code, pattern}` |
| `TYPE_LIBRARY` | types.js | Object | 27 种人格详情 `{code, cn, intro, desc}` |
| `DIM_EXPLANATIONS` | explanations.js | Object | 维度 H/M/L 三级解释 |

### 核心层

| 变量/函数 | 文件 | 说明 |
|-----------|------|------|
| `SBTI.EventBus` | event-bus.js | 发布订阅：`on(event, cb)` / `emit(event, data)` / `off(event, cb)` |
| `computeResult(answers, specialAnswers)` | engine.js | 核心评分函数，返回匹配结果 |
| `calculateDimensions(answers)` | engine.js | 计算 15 维原始分和等级 |

### UI 层

| 变量/函数 | 文件 | 说明 |
|-----------|------|------|
| `App` | app.js | 应用单例，管理状态和页面切换 |
| `SBTI.drawRadarChart(canvasId, rawScores, levels)` | radar.js | Canvas 雷达图 |
| `SBTI.renderResult(result)` | result-renderer.js | 结果页 DOM 渲染 |
| `SBTI.renderDimensionDetails(rawScores, levels)` | result-renderer.js | 维度详情渲染 |

### 功能层

| 变量/函数 | 文件 | 说明 |
|-----------|------|------|
| `generatePosterCanvas(result)` | poster.js | 生成海报 Canvas |
| `renderPosterCanvas(result, templateId)` | poster.js | 按模板渲染海报 |
| `switchPosterTemplate(templateId)` | poster.js | 切换海报模板 |
| `SBTI_PosterTemplates` | poster-templates.js | 海报模板注册表 |

## EventBus 事件契约

```
quiz:started      →  {} 
quiz:answer       →  {questionId: string, value: number}
quiz:finished     →  {answers: Object, specialAnswers: Object}
result:computed   →  {result: ResultObject}
poster:requested  →  {result: ResultObject}
poster:generated  →  {canvas: HTMLCanvasElement}
page:switched     →  {from: string, to: string}
```

### ResultObject 结构

```js
{
  type: {code, cn, intro, desc},  // 匹配的人格类型
  similarity: 83,                  // 匹配度百分比
  exact: 8,                        // 精确命中维度数
  isDrunk: false,                  // 是否触发酒鬼人格
  rawScores: {S1: 4, S2: 5, ...}, // 15 维原始分
  levels: {S1: 'M', S2: 'H', ...},// 15 维等级
  allRanked: [{...}, ...]          // 前 5 名匹配结果
}
```

## 应用状态机

```
          startQuiz()              finishQuiz()
  [home] ───────────▶ [quiz] ──────────────▶ [result]
    ▲                   │                        │
    │                   │ goBack()               │
    │                   ◀───────┘                │
    │                                            │
    └──────────────── restart() ◀────────────────┘
```

## CSS 架构

CSS 拆分为 8 个文件，通过 CSS 自定义属性（变量）统一管理主题色：

```css
/* base.css 定义变量 */
:root {
  --bg-dark: #0a0a1a;
  --accent: #00ff88;
  --text-primary: #ffffff;
  ...
}

/* themes.css 覆盖变量实现主题切换 */
[data-theme="light"] {
  --bg-dark: #f5f5f5;
  --accent: #00cc6a;
  --text-primary: #1a1a2e;
  ...
}
```

主题切换通过 `document.documentElement.setAttribute('data-theme', 'light')` 实现。
