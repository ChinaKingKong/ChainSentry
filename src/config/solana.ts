/**
 * Solana JSON-RPC：主节点 `VITE_SOLANA_RPC_URL`；可选备节点 `VITE_SOLANA_RPC_URL_SECONDARY`。
 * 双节点时请求按调用轮询，若响应 429 则同一请求内改打另一节点（见 solanaRpc 自定义 fetch）。
 * 未设置主节点时使用主网公共端点（限速，仅适合本地试跑）。
 */
const DEFAULT_PUBLIC_MAINNET_RPC = 'https://api.mainnet-beta.solana.com';

export const SOLANA_CLUSTER = 'mainnet-beta' as const;

export const SOLANA_RPC_URL: string =
  import.meta.env.VITE_SOLANA_RPC_URL?.trim() || DEFAULT_PUBLIC_MAINNET_RPC;

/** 与主节点不同且非空的备 RPC，用于轮询与 429 切换 */
export const SOLANA_RPC_URL_SECONDARY: string | undefined = (() => {
  const s = import.meta.env.VITE_SOLANA_RPC_URL_SECONDARY?.trim();
  if (!s) return undefined;
  if (s === SOLANA_RPC_URL) return undefined;
  return s;
})();

/** 主节点优先；有备节点时追加（去重） */
export function getSolanaRpcUrlList(): string[] {
  const primary = SOLANA_RPC_URL;
  const sec = SOLANA_RPC_URL_SECONDARY;
  if (sec) return [primary, sec];
  return [primary];
}

/** 未配置自有主节点时走公共端，极易 429 */
export const SOLANA_RPC_IS_DEFAULT_PUBLIC: boolean =
  SOLANA_RPC_URL === DEFAULT_PUBLIC_MAINNET_RPC;

/**
 * 默认关闭 web3.js 对 429 的指数退避重试（否则会连打多次请求并刷 console.error）。
 * 需要重试时再设 VITE_SOLANA_RPC_RETRY_429=true。
 */
export function solanaRpcDisableRetryOnRateLimit(): boolean {
  const v = import.meta.env.VITE_SOLANA_RPC_RETRY_429;
  if (v === 'true' || v === '1') return false;
  return true;
}
