/**
 * Solana JSON-RPC：仅通过环境变量 `VITE_SOLANA_RPC_URL` 配置（见根目录 `.env.example`）。
 * 未设置时使用主网公共端点（限速，仅适合本地试跑）；生产/正式环境务必在 .env 中填写自有节点或服务商 URL。
 */
const DEFAULT_PUBLIC_MAINNET_RPC = 'https://api.mainnet-beta.solana.com';

export const SOLANA_CLUSTER = 'mainnet-beta' as const;

export const SOLANA_RPC_URL: string =
  import.meta.env.VITE_SOLANA_RPC_URL?.trim() || DEFAULT_PUBLIC_MAINNET_RPC;
