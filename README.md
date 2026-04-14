# SBTI 人格测试

> Silly Big Personality Test — 31 道题，15 个维度，27 种人格类型

在线体验：**https://xbiii3s.github.io/sbti-test/**

## 项目简介

SBTI 是一个纯前端的趣味人格测试应用，戏仿 MBTI 框架，通过 31 道荒诞场景化的选择题，从自我、情感、态度、行动、社交 5 大模型 × 15 个维度交叉分析，匹配出 27 种独特人格类型（如 CTRL 拿捏者、DEAD 死者、MALO 吗喽等），并生成可分享的海报图片。

## 功能特性

- 30 道常规题 + 2 道隐藏触发题（酒鬼人格）
- 曼哈顿距离匹配算法，25 个标准人格模板 + 2 个特殊人格
- 15 维 Canvas 雷达图实时绘制
- 3 套海报模板（赛博朋克 / 简约白 / 像素风）+ Canvas 二维码占位
- 暗色 / 亮色主题切换
- 答题滑动手势 + 动画效果
- 维度进度条 IntersectionObserver 懒加载动画
- localStorage 测试历史记录 + 断点续答
- PWA 离线支持（Service Worker 缓存）
- GitHub Pages 自动部署

## 快速开始

```bash
# 克隆仓库
git clone https://github.com/xbiii3s/sbti-test.git
cd sbti-test

# 方式一：直接打开
open index.html

# 方式二：本地服务器
npx serve . -l 3456
# 访问 http://localhost:3456
```

无需安装任何依赖，无需构建工具。

## 技术栈

| 技术 | 说明 |
|------|------|
| HTML5 / CSS3 / ES5+ | 纯前端，无框架依赖 |
| Canvas API | 雷达图绘制 + 海报生成 |
| EventBus | 自定义发布订阅系统，模块间解耦 |
| localStorage | 主题偏好 + 测试历史持久化 |
| Service Worker | PWA 离线缓存 |
| GitHub Actions | CI/CD 自动部署到 GitHub Pages |

## 项目结构

```
SBTI-Test/
├── index.html                      # 入口文件
├── manifest.json                   # PWA 清单
├── sw.js                           # Service Worker
├── css/
│   ├── base.css                    # CSS 变量、重置、页面容器
│   ├── themes.css                  # 暗色/亮色主题变量
│   ├── home.css                    # 首页样式
│   ├── quiz.css                    # 答题页样式
│   ├── result.css                  # 结果页样式
│   ├── poster.css                  # 海报弹窗样式
│   ├── animations.css              # 动画 keyframes
│   └── responsive.css              # 响应式媒体查询
├── js/
│   ├── core/
│   │   ├── event-bus.js            # SBTI.EventBus 发布订阅
│   │   ├── engine.js               # 评分匹配算法
│   │   └── state.js                # 集中状态管理
│   ├── data/
│   │   ├── dimensions.js           # 维度定义（15 维度 × 5 模型）
│   │   ├── questions.js            # 30 道常规题 + 2 道特殊题
│   │   ├── types.js                # 25 个匹配模板 + 27 种人格详情
│   │   └── explanations.js         # 维度 H/M/L 三级解释文案
│   ├── ui/
│   │   ├── app.js                  # 应用主逻辑（状态机、答题流程）
│   │   ├── radar.js                # Canvas 雷达图绘制
│   │   └── result-renderer.js      # 结果页渲染 + 维度详情
│   ├── features/
│   │   ├── poster.js               # Canvas 海报生成
│   │   ├── poster-templates.js     # 3 套海报模板定义
│   │   └── share.js                # 分享功能 + 微信 meta 标签
│   └── services/
│       ├── storage.js              # localStorage 封装
│       ├── history.js              # 测试历史记录
│       ├── analytics.js            # 匿名人格分布统计
│       └── pwa.js                  # Service Worker 注册
├── assets/                         # 图片资源
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Pages 自动部署
└── ppt/                            # 教学 PPT 生成器
```

## 核心算法

### 评分流程

```
31 道选择题 → 每维度 2 题（原始分 2-6）→ 等级转换 → 15 维向量 → 曼哈顿距离匹配
```

1. **原始分累加**：每维度 2 道题，每题 3 个选项（value: 1/2/3），原始分范围 2-6
2. **等级转换**：`score ≤ 3 → L`，`score = 4 → M`，`score ≥ 5 → H`
3. **向量化**：`L=1, M=2, H=3`，生成 15 维数值向量
4. **模板匹配**：与 25 个标准人格模板计算曼哈顿距离
5. **排序**：距离升序 → 精确命中数降序 → 相似度降序
6. **特殊判定**：DRUNK（隐藏题触发） > 正常匹配 > HHHH（匹配率 <60% 兜底）

### 匹配模板格式

```
CTRL:  HHH-HMH-MHH-HHH-MHM
       |||  |||  |||  |||  |||
       S1   E1   A1   Ac1  So1
       S2   E2   A2   Ac2  So2
       S3   E3   A3   Ac3  So3
```

## 模块通信

模块之间通过 `SBTI.EventBus` 发布订阅通信，避免直接引用：

| 事件名 | 发出方 | 载荷 | 消费方 |
|--------|--------|------|--------|
| `quiz:started` | app.js | `{}` | analytics, state |
| `quiz:answer` | app.js | `{questionId, value}` | state |
| `quiz:finished` | app.js | `{answers, specialAnswers}` | state |
| `result:computed` | app.js | `{result}` | result-renderer, history, analytics |
| `poster:requested` | app.js | `{result}` | poster.js |
| `poster:generated` | poster.js | `{canvas}` | share.js |
| `page:switched` | app.js | `{from, to}` | analytics |

## 27 种人格类型

| 代号 | 中文 | 代号 | 中文 | 代号 | 中文 |
|------|------|------|------|------|------|
| CTRL | 拿捏者 | ATM-er | 送钱者 | Dior-s | 屌丝 |
| BOSS | 领导者 | THAN-K | 感恩者 | OH-NO | 哦不人 |
| GOGO | 行者 | SEXY | 尤物 | LOVE-R | 多情者 |
| MUM | 妈妈 | FAKE | 伪人 | OJBK | 无所谓人 |
| MALO | 吗喽 | JOKE-R | 小丑 | WOC! | 握草人 |
| THIN-K | 思考者 | SHIT | 愤世者 | ZZZZ | 装死者 |
| POOR | 贫困者 | MONK | 僧人 | IMSB | 傻者 |
| SOLO | 孤儿 | FUCK | 草者 | DEAD | 死者 |
| IMFW | 废物 | HHHH | 傻乐者 | DRUNK | 酒鬼 |

## 部署

项目通过 GitHub Actions 自动部署到 GitHub Pages。每次推送到 `main` 分支会自动触发部署，约 20 秒完成。

手动部署到其他平台：

```bash
# Vercel
npx vercel --prod

# Netlify
npx netlify deploy --prod --dir=.

# 任意静态服务器
# 直接将整个目录上传即可，无需构建
```

## 开发指南

### 并行开发架构

项目支持 4 个 Claude Code Session 并行开发，文件所有权划分如下：

| Session | 负责模块 | 文件范围 |
|---------|---------|---------|
| Session 1: UI/UX | 样式、动画、雷达图 | `css/*`, `js/ui/*` |
| Session 2: Core | 算法、数据、状态 | `js/core/*`, `js/data/*`, `js/services/storage.js`, `js/services/history.js` |
| Session 3: Poster | 海报、分享 | `js/features/*`, `css/poster.css` |
| Session 4: Deploy | 统计、PWA、部署 | `js/services/analytics.js`, `js/services/pwa.js`, `sw.js`, `manifest.json` |

### 添加新人格类型

1. 在 `js/data/types.js` 的 `NORMAL_TYPES` 数组添加模板：
   ```js
   { code: 'NEW', pattern: 'HHH-MMM-LLL-HML-MHL' }
   ```
2. 在同文件的 `TYPE_LIBRARY` 对象添加详情：
   ```js
   "NEW": { code: "NEW", cn: "新类型", intro: "介绍语", desc: "详细描述" }
   ```
3. 在 `js/data/explanations.js` 无需修改（维度解释与人格类型无关）

### 添加新海报模板

在 `js/features/poster-templates.js` 中注册新模板：

```js
SBTI_PosterTemplates.register('my-template', {
  name: '我的模板',
  theme: { bg: '#ffffff', text: '#000000', accent: '#00ff88' },
  render: function(ctx, W, H, result) {
    // Canvas 绘制逻辑
  }
});
```

## 免责声明

本测试仅供娱乐，不具有任何心理学或科学依据。请勿过于认真对待测试结果。

原始 SBTI 测试由 B 站 UP 主「蛆肉儿串儿」于 2026 年 4 月 9 日发布。本项目为学习目的的技术复现。

## License

MIT
