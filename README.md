# ChainSentry Web（SENTINEL）

面向 **Solana 主网** 的加密资产情报与哨兵分析前端：在深色「指挥台」风格界面中聚合行情、链上状态、流动性与合约侧风险提示，并支持通过 **Jupiter** 跳转兑换与 **浏览器钱包** 连接。

> 定位：**链上之眼** — 辅助观察热门标的、池子活动与 Mint 权限等信号；非投资建议，链上操作请以钱包与官方聚合器为准。

---

## 功能概览

### 指挥台（`/`）

- **热门代币表**：基于 [DexScreener](https://dexscreener.com/) 搜索接口，按 **Meme / DeFi / LST** 分类拉取 Solana 交易对，同一 Mint 保留 24h 成交量更高的池子。
- **Hero 指标**：由 RPC 推导的网络活跃度示意、**追踪流动性**（列表流动性汇总）、高风险数量等。
- **市场情绪热力**、**快捷兑换**入口、顶栏 **TPS/RPC 状态**（依赖 RPC 可达性）。
- **哨兵扫描**：对表中代币一键打开链上审计弹层（铸币/冻结、持仓集中度等）。

### 代币（`/tokens`）

- 从指挥台同源列表中切换 **关注交易对**（Mint），查看价格、估算市值、K 线示意、**池子近期签名**（Helius/RPC 维度数据，以实际接入为准）。
- **协议直连兑换**：使用 [Jupiter Lite Quote API](https://station.jup.ag/) 获取 **SOL/USDC ⇄ 目标代币** 的参考报价；支持 **买入/卖出方向切换**，展示两位小数与自适应字号；**执行兑换**跳转 `jup.ag` 带 Mint 与数量参数。
- 代币精度优先走 Jupiter 元数据，失败时回退 **链上 Parsed Mint**。

### 巨鲸（`/whales`）

- 大额资金流与相关展示的 **占位/演示布局**（可后续接入 Helius、索引器等）。

### 哨兵（`/sentry`）

- 输入 **Solana Mint** 后拉取 **SPL Mint 账户** 与大户持仓等链上审计摘要，生成 **威胁评估圆环**、Rug/所有权/流动性/税费等卡片文案，以及检查表行。
- **未分析前**：各数值与标题统一为 **—**，圆环无进度；分析成功后显示真实评分与说明。

### 全局

- **中 / 英** 界面（i18next）。
- **Phantom / Solflare** 等注入式钱包连接（`@solana/web3.js`）。
- **Toast** 复制反馈、**Material Symbols** 与 Lucide 混用。

---

## 技术栈

| 类别 | 选型 |
|------|------|
| 框架 | React 19、TypeScript 5.9 |
| 构建 | Vite 8 |
| 路由 | React Router 7 |
| 样式 | Tailwind CSS 4（`@theme` + PostCSS） |
| 链上 | `@solana/web3.js`（RPC、Parsed Account） |
| 行情 / 池 | DexScreener Latest DEX API（Axios） |
| 报价 | `lite-api.jup.ag` Swap Quote v1 |
| 图表 | Chart.js、react-chartjs-2 |
| 国际化 | i18next、react-i18next |

---

## 快速开始

```bash
npm install
npm run dev
```

默认开发地址：<http://localhost:5173>。

```bash
npm run build    # tsc -b && vite build
npm run preview  # 本地预览 dist
npm run lint     # ESLint
```

---

## 环境变量

在项目根目录复制 `cp .env.example .env` 后编辑（勿将含真实密钥的 `.env` 提交到公开仓库）：

```env
# Solana JSON-RPC（主网）。推荐 Helius / QuickNode / 自建节点等
VITE_SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
```

未配置时，会使用 **Solana 公共主网 RPC**（限速明显，仅适合本地试跑）。

Vite 仅暴露以 `VITE_` 开头的变量；类型见 `src/vite-env.d.ts`。

---

## 目录结构（摘要）

```
src/
├── App.tsx                 # 路由
├── main.tsx                # 入口 + i18n + Toast
├── index.css               # 全局与 @theme 色板
├── config/solana.ts        # RPC 读取
├── pages/                  # Dashboard、Tokens、Whales、Sentry
├── components/
│   ├── layout/             # 顶栏、侧栏、移动端底栏、FAB
│   ├── dashboard/          # 热门表、Hero、哨兵弹层、情绪图等
│   ├── ui/                 # CommandSelect、Brand、Toast、语言切换
│   └── wallet/             # 连接按钮
├── hooks/                  # useTokens、useSolanaChain、useJupiterSwapQuote、useSentryAudit…
├── services/               # api、solanaRpc、jupiterQuote、mintAudit、pairActivity
├── wallet/                 # Provider、Phantom/Solflare 注入
├── locales/                # zh.json / en.json
├── lib/                    # 格式化、地址校验、哨兵分等
└── types/token.ts          # Token、DexScreener 等类型
public/
└── favicon.svg             # 品牌图标（与顶栏 Logo 同源）
```

---

## 数据与免责声明

- **价格、成交量、流动性** 等来自 DexScreener 等第三方 API，存在延迟与误差。
- **RPC** 的槽位、余额、Mint 解析等依赖节点质量；**Jupiter 报价**为链下参考，以实际交易界面为准。
- 界面中的部分图表、巨鲸页、成交明细等可能为 **演示或占位**，接入真实数据源前请勿作为唯一决策依据。

---

## 部署

构建产物为 `dist/`，可部署至 **Vercel、Netlify、Cloudflare Pages** 等静态托管；确保在平台环境变量中配置 `VITE_SOLANA_RPC_URL`（若需稳定主网访问）。

---

## 许可证

MIT License

---

## 致谢

- [Vite](https://vitejs.dev/) · [React](https://react.dev/) · [Tailwind CSS](https://tailwindcss.com/)
- [DexScreener](https://dexscreener.com/) · [Jupiter](https://jup.ag/) · [Solana](https://solana.com/)
