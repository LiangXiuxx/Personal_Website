// 博客文章数据
// 添加新文章：在数组开头添加新对象即可
// 分类：ai-llm = AI/LLM开发实践，project = 项目实战记录

const posts = [
  {
    id: "claude-code-workflow",
    title: "Claude Code: 我的 AI 辅助开发工作流",
    date: "2026-05-20",
    category: "ai-llm",
    tags: ["Claude Code", "AI工具", "开发效率"],
    summary: "使用 Claude Code 一个月后，总结如何将 AI 融入日常开发流程，从代码生成到调试再到部署的完整实践。",
    content: `## 为什么选择 Claude Code

在尝试了多个 AI 编程工具后，Claude Code 成为了我的主力开发助手。它不仅能理解上下文，还能直接操作文件系统和执行命令，这让它从一个"聊天机器人"变成了真正的"开发伙伴"。

## 核心工作流

### 1. 项目初始化

\`\`\`bash
# 让 Claude Code 分析现有项目结构
claude "帮我理解这个项目的架构"
\`\`\`

Claude Code 会自动扫描项目文件，分析依赖关系，给出架构概览。这比自己翻代码快得多。

### 2. 功能开发

最让我惊喜的是它的代码生成质量。不是简单的模板填充，而是真正理解项目风格后的"创作"：

\`\`\`javascript
// 告诉它"用和项目一样的风格写一个新组件"
// 它会自动参考现有组件的写法，保持一致性
import React from "react";

const NewFeature = () => {
  // 代码风格与项目完全一致
  return <div className="feature-container">...</div>;
};
\`\`\`

### 3. 调试与修复

遇到 bug 时，直接把错误信息贴给它：

\`\`\`bash
claude "这个报错怎么解决：TypeError: Cannot read property of undefined"
\`\`\`

它会定位问题根源，给出修复方案，甚至直接帮你改好。

## 实际效果

使用一个月后，我的开发效率提升了大约 40%。特别是：

- **重复性工作**：减少 80% 的样板代码编写
- **调试时间**：平均缩短 50%
- **学习新技术**：通过与 AI 对话快速理解新框架

## 注意事项

AI 不是万能的。以下几点需要记住：

1. **始终 review AI 生成的代码** — 它可能会引入安全漏洞
2. **不要盲目信任** — 特别是涉及并发、内存管理的场景
3. **保持自己的判断** — AI 是工具，不是决策者

## 总结

Claude Code 改变的不是我写代码的方式，而是我思考问题的方式。它让我更专注于架构设计和业务逻辑，把实现细节交给 AI 处理。这是人机协作的最佳状态。`
  },
  {
    id: "personal-website-build",
    title: "从零搭建赛博朋克个人网站",
    date: "2026-05-18",
    category: "project",
    tags: ["React", "Vite", "GitHub Pages", "赛博朋克"],
    summary: "记录搭建这个赛博朋克风格个人网站的全过程，包括技术选型、视觉设计思路和部署方案。",
    content: `## 项目起源

一直想要一个独特的个人网站，不想用千篇一律的模板。赛博朋克美学 — 霓虹灯、终端界面、3D 城市 — 完美契合我对"未来感"的想象。

## 技术栈

- **React 18** — 组件化开发
- **Vite** — 极速构建
- **CSS3** — 纯 CSS 实现霓虹效果，无 UI 框架
- **GitHub Pages** — 免费托管，自动部署

## 设计亮点

### 霓虹灯效果

\`\`\`css
.neon-text {
  color: #00f3ff;
  text-shadow:
    0 0 5px #00f3ff,
    0 0 10px #00f3ff,
    0 0 20px #00f3ff;
}
\`\`\`

简单的 CSS text-shadow 就能营造出逼真的霓虹灯效果。

### 3D 城市背景

使用 Three.js 构建了一个低多边形的赛博城市，作为网站的沉浸式背景。

## 部署

通过 GitHub Actions 实现自动部署：

\`\`\`yaml
- run: npm install
- run: npm run build
- uses: actions/deploy-pages@v4
\`\`\`

每次 push 到 main 分支，网站自动更新。

## 总结

这个项目让我深入理解了 React 组件设计、CSS 动画和 CI/CD 流程。最重要的是，它成为了我展示自己的窗口。`
  }
];

// 分类配置
export const categories = {
  "ai-llm": { name: "AI/LLM 开发实践", color: "var(--neon-cyan)" },
  "project": { name: "项目实战记录", color: "var(--neon-pink)" }
};

export default posts;
