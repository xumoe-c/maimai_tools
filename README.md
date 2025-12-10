# Maimai Tools

一个基于 Vue 3 + Vite + Tailwind CSS 构建的 Maimai DX 工具集，旨在为玩家提供便捷的辅助功能。

## 🌟 主要功能

### 1. 生涯歌曲喜好表生成器

自定义生成您的 Maimai 歌曲喜好表，支持导出高清图片分享。

- **数据同步**：支持从 [水鱼查分器 (Diving Fish)](https://www.diving-fish.com/maimaidx/prober/) 导入玩家数据（昵称、Rating、B50/B15 成绩）。
- **智能筛选**：内置歌曲选择器，支持按流派、版本、搜索（标题/艺术家/ID）筛选歌曲。
- **自动匹配**：选择歌曲后自动显示您在该曲目的最高达成率（需导入数据）。
- **高度定制**：
  - 支持修改表格标题。
  - 提供多种主题配色（简约白、酷炫黑、萌系粉、清爽蓝）。
  - 支持自定义每个格子的标题。
- **本地存储**：自动保存您的配置和填写内容，防止数据丢失。
- **高清导出**：一键生成并下载高清 PNG 图片。

### 2. 设置与数据源

- 支持通过 **用户名/QQ号** 或 **Import Token** 两种方式连接水鱼查分器。
- 自动缓存玩家数据，减少重复请求。

## 🛠️ 技术栈

- **前端框架**: [Vue 3](https://vuejs.org/) (Composition API)
- **构建工具**: [Vite](https://vitejs.dev/)
- **状态管理**: [Pinia](https://pinia.vuejs.org/)
- **样式库**: [Tailwind CSS](https://tailwindcss.com/)
- **图标库**: [Lucide Vue](https://lucide.dev/)
- **图片生成**: [html-to-image](https://github.com/bubkoo/html-to-image)
- **HTTP 请求**: [Axios](https://axios-http.com/)

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm 或 yarn

### 安装依赖

```bash
npm install
# 或者
yarn install
```

### 开发模式运行

```bash
npm run dev
# 或者
yarn dev
```

访问 `http://localhost:5173` 即可看到项目。

### 构建生产版本

```bash
npm run build
# 或者
yarn build
```

## 📝 待办事项 / 计划中功能

- [ ]  更多样式的生成器模板
- [ ]  B50 成绩查询与可视化
- [ ]  牌子/段位进度计算器
- [ ]  ......

## 📄 关于本站

舞萌DX 实用工具站 (Maimai Tools) 是一个由社区驱动的开源项目，旨在为 Maimai 玩家提供便捷的辅助工具。

本项目完全开源，且为纯前端应用，不会上传您的任何个人数据到服务器。

## 📄 免责声明

本站与 SEGA 公司、华立科技无关，所有游戏相关素材版权归 SEGA 及相关公司所有。本站仅供学习交流使用，禁止商用。请遵守属地相关法律法规。本项目含有AI生成内容，准确性仅供参考。

## 📄 开源协议

MIT License

## 📄 外链

水鱼查分器 API 文档：https://github.com/Diving-Fish/maimaidx-prober/blob/main/doc/docs/developer/zh-api-document.md
