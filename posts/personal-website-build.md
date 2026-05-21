---
id: personal-website-build
title: "从零搭建赛博朋克个人网站"
date: "2026-05-18"
category: project
tags: ["React", "Vite", "GitHub Pages", "赛博朋克"]
summary: "记录搭建这个赛博朋克风格个人网站的全过程，包括技术选型、视觉设计思路和部署方案。"
---

## 项目起源

一直想要一个独特的个人网站，不想用千篇一律的模板。赛博朋克美学 — 霓虹灯、终端界面、3D 城市 — 完美契合我对"未来感"的想象。

## 技术栈

- **React 18** — 组件化开发
- **Vite** — 极速构建
- **CSS3** — 纯 CSS 实现霓虹效果，无 UI 框架
- **GitHub Pages** — 免费托管，自动部署

## 设计亮点

### 霓虹灯效果

```css
.neon-text {
  color: #00f3ff;
  text-shadow:
    0 0 5px #00f3ff,
    0 0 10px #00f3ff,
    0 0 20px #00f3ff;
}
```

简单的 CSS text-shadow 就能营造出逼真的霓虹灯效果。

### 3D 城市背景

使用 Three.js 构建了一个低多边形的赛博城市，作为网站的沉浸式背景。

## 部署

通过 GitHub Actions 实现自动部署：

```yaml
- run: npm install
- run: npm run build
- uses: actions/deploy-pages@v4
```

每次 push 到 main 分支，网站自动更新。

## 总结

这个项目让我深入理解了 React 组件设计、CSS 动画和 CI/CD 流程。最重要的是，它成为了我展示自己的窗口。
