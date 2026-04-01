# 🛡️ ChainSentry Web - React + TypeScript + Vite

**你的链上哨兵 - 7×24 小时守卫你的 Alpha**

这是 ChainSentry 的现代化 Web 前端，使用 React + TypeScript + Vite 构建。

## ✨ 特性

- ⚡️ **Vite** - 极速的开发体验
- ⚛️ **React 18** - 最新的 React 特性
- 📘 **TypeScript** - 类型安全
- 🎨 **Tailwind CSS** - 现代化的 UI 设计
- 📊 **Chart.js** - 交互式图表
- 🔥 **实时数据** - 自动刷新链上数据

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

应用将在 `http://localhost:5173` 打开

### 构建

```bash
npm run build
```

### 预览构建

```bash
npm run preview
```

## 📁 项目结构

```
chainsentry-web/
├── src/
│   ├── components/       # React 组件
│   │   ├── Header.tsx
│   │   ├── Metrics.tsx
│   │   ├── TokenTable.tsx
│   │   ├── Charts.tsx
│   │   └── TokenDetails.tsx
│   ├── hooks/           # 自定义 Hooks
│   │   └── useTokens.ts
│   ├── services/        # API 服务
│   │   └── api.ts
│   ├── types/           # TypeScript 类型定义
│   │   └── token.ts
│   ├── App.tsx          # 主应用
│   ├── index.css        # 全局样式
│   └── main.tsx         # 入口文件
├── public/              # 静态资源
├── index.html           # HTML 模板
├── package.json         # 依赖配置
├── tsconfig.json        # TypeScript 配置
├── vite.config.ts       # Vite 配置
├── tailwind.config.js   # Tailwind 配置
└── README.md            # 本文件
```

## 🎨 技术栈

- **框架**: React 18
- **语言**: TypeScript 5
- **构建工具**: Vite 5
- **样式**: Tailwind CSS 3
- **图表**: Chart.js + react-chartjs-2
- **图标**: Lucide React
- **HTTP**: Axios

## 📊 功能

### MVP v1.0

- ✅ 热门代币列表
- ✅ 实时价格和流动性数据
- ✅ 风险评分系统
- ✅ 交互式图表
- ✅ 代币详情页面
- ✅ 快速交易链接（Jupiter）
- ✅ 自动数据刷新

### Roadmap v2.0

- 🔲 巨鲸地址追踪
- 🔲 新币合约监控
- 🔲 智能合约安全分析
- 🔲 历史价格图表
- 🔲 代币收藏功能

## 🔧 开发

### 添加新组件

```bash
# 在 src/components/ 目录创建新组件
touch src/components/MyComponent.tsx
```

### 添加新 Hook

```bash
# 在 src/hooks/ 目录创建新 Hook
touch src/hooks/useMyHook.ts
```

### 修改样式

全局样式在 `src/index.css` 中定义，组件样式使用 Tailwind CSS 类名。

## 📦 部署

### Vercel

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm run build
# 将 dist 目录部署到 Netlify
```

### GitHub Pages

1. 构建：`npm run build`
2. 推送到 gh-pages 分支
3. 在 GitHub 仓库设置中启用 GitHub Pages

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📝 许可证

MIT License

## 🙏 致谢

- [Vite](https://vitejs.dev/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [DexScreener](https://dexscreener.com/)
- [Jupiter](https://jup.ag/)

---

**#AgentTalentShow #Solana #DeFi #AI**

Built with ❤️ for the Agent Economy
