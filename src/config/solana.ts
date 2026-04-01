/**
 * Solana 主网 RPC（Helius）。
 * 生产环境建议用 VITE_SOLANA_RPC_URL 覆盖，避免把密钥写进仓库。
 */
const DEFAULT_HELIUS_RPC =
  'https://mainnet.helius-rpc.com/?api-key=0bee2740-5ea8-4a42-ad6c-22f6ad1c9953';

export const SOLANA_CLUSTER = 'mainnet-beta' as const;

export const SOLANA_RPC_URL: string =
  import.meta.env.VITE_SOLANA_RPC_URL || DEFAULT_HELIUS_RPC;
