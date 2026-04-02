/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SOLANA_RPC_URL?: string;
  /** 备 RPC：与主节点轮询；主节点 429 时同请求内切换 */
  readonly VITE_SOLANA_RPC_URL_SECONDARY?: string;
  readonly VITE_SOLANA_RPC_RETRY_429?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
