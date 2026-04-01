# 🚀 ChainSentry Web - 快速启动指南

## ⚡ 3 分钟快速启动

### Step 1: 进入项目目录

```bash
cd /Users/lizhigang/Documents/Works/Agents/Writer/chainsentry-web
```

### Step 2: 启动开发服务器

```bash
npm run dev
```

### Step 3: 打开浏览器

访问：`http://localhost:5173`

**就这么简单！**

---

## 🎯 你将看到

### 主界面

- 🛡️ **ChainSentry** 标题和Logo
- 📊 **4 个关键指标卡片**
  - 监控代币数量
  - 总流动性
  - 24h 交易量
  - 主要风险等级

### 控制面板

- 显示数量选择（10/20/30/50）
- 自动刷新开关
- 手动刷新按钮
- 最后更新时间

### 代币表格

- 热门代币列表
- 实时价格、流动性、交易量
- 24h 涨跌幅
- 风险评分（A/B/C/D）
- 查看详情按钮

### 交互式图表

- 💰 流动性分布柱状图
- ⚠️ 风险评分饼图

### 代币详情

- 完整的代币信息
- 快速交易链接（Jupiter）
- DexScreener 图表链接
- Solscan 浏览器链接

---

## 📸 准备演示材料（黑客松用）

### 必需截图（3 张）

1. **主界面完整截图**
   - 包含标题、指标、表格
   - 展示数据完整性

2. **图表截图**
   - 流动性分布图
   - 风险评分饼图

3. **代币详情截图**
   - 选择某个代币
   - 显示完整信息
   - 展示交易链接

### 可选：录制演示视频（30-60 秒）

**推荐工具**：
- macOS: Cmd + Shift + 5
- Loom: https://loom.com（免费）

**视频内容**：
1. 展示主界面（5 秒）
2. 解释关键指标（5 秒）
3. 点击刷新按钮（5 秒）
4. 查看代币详情（10 秒）
5. 展示图表（5 秒）
6. 展示交易链接（5 秒）

---

## 🔧 常见问题

### Q1: 启动失败？

```bash
# 清理缓存
rm -rf node_modules
rm package-lock.json
npm install

# 重新启动
npm run dev
```

### Q2: 样式不正常？

```bash
# 检查 Tailwind 配置
cat tailwind.config.js

# 确认 index.css 包含 Tailwind 指令
head src/index.css
```

### Q3: 数据无法加载？

- 检查网络连接
- 打开浏览器控制台查看错误
- API 可能限流，稍后重试

### Q4: 端口被占用？

```bash
# 使用其他端口
npm run dev -- --port 3000
```

---

## 🎨 自定义

### 修改配色

编辑 `tailwind.config.js`:

```js
export default {
  theme: {
    extend: {
      colors: {
        // 添加自定义颜色
      }
    }
  }
}
```

### 添加新功能

1. 在 `src/services/api.ts` 添加新 API
2. 在 `src/types/token.ts` 添加类型定义
3. 在 `src/hooks/` 创建新 Hook
4. 在 `src/components/` 创建新组件
5. 在 `App.tsx` 中使用

---

## 📦 部署到云端

### 方案 1: Vercel（推荐，免费）

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel

# 按提示操作即可
```

### 方案 2: Netlify（免费）

```bash
# 构建
npm run build

# 登录 Netlify
# 拖拽 dist 文件夹到 Netlify
```

### 方案 3: GitHub Pages（免费）

```bash
# 安装 gh-pages
npm install -D gh-pages

# 添加部署脚本
# 在 package.json 的 scripts 中添加：
# "deploy": "npm run build && gh-pages -d dist"

# 部署
npm run deploy
```

---

## ✅ 发布前检查

- [ ] 应用可以正常运行
- [ ] 所有功能正常工作
- [ ] 截图已准备（3+ 张）
- [ ] 视频已录制（可选）
- [ ] GitHub 仓库已创建
- [ ] README 已更新
- [ ] 推文内容已准备好

---

## 🎉 你已经完成了！

现在你有一个：
- ✅ 现代化的 React 应用
- ✅ TypeScript 类型安全
- ✅ Tailwind CSS 美观界面
- ✅ 实时数据更新
- ✅ 交互式图表
- ✅ 可运行的 MVP

**可以参加黑客松了！🚀**

---

## 💡 提示

1. **本地运行演示** - 截图时使用
2. **部署到云端** - 分享链接时使用
3. **准备讲解稿** - 1-2 分钟即可

---

**祝你在 #AgentTalentShow 中取得好成绩！🏆**
