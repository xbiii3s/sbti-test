# Changelog

## v1.0.0 (2026-04-14)

### Features

- 30 道常规题 + 2 道隐藏触发题的完整答题流程
- 15 维度曼哈顿距离匹配算法，27 种人格类型
- 深色赛博朋克风格 UI，绿色霓虹主题
- 15 维 Canvas 雷达图
- Canvas 海报生成 + PNG 下载
- 题目随机排序
- 特殊人格触发（DRUNK 酒鬼、HHHH 傻乐者兜底）

### Modular Architecture

- 从 4 文件单体架构重构为 26 文件 5 层模块化架构
- 实现 SBTI.EventBus 发布订阅系统
- 支持 4 个 Claude Code Session 并行开发
- 文件所有权划分：UI / Core / Poster / Deploy

### UI/UX (Session 1)

- 暗色 / 亮色主题切换（localStorage 记忆）
- 答题页左右滑动手势 + 切换动画
- 维度进度条 IntersectionObserver 懒加载动画
- 移动端 375px 响应式适配

### Core (Session 2)

- SBTI.Storage localStorage 封装
- SBTI.History 测试历史记录
- SBTI.State 集中状态管理 + 断点续答

### Poster & Share (Session 3)

- 3 套海报模板（赛博朋克 / 简约白 / 像素风）
- Canvas 绘制 QR 码占位
- 海报模板切换 UI
- 微信分享 meta 标签适配

### Deploy (Session 4)

- SBTI.Analytics 匿名人格分布统计
- PWA manifest.json + Service Worker 离线缓存
- GitHub Actions CI/CD 自动部署
- 上线地址：https://xbiii3s.github.io/sbti-test/
