import { Connection } from '@solana/web3.js';
import {
  getSolanaRpcUrlList,
  solanaRpcDisableRetryOnRateLimit,
} from '../config/solana';

let connection: Connection | null = null;

/**
 * 多 RPC：按请求轮询起点；若当前节点返回 429，立即用另一节点重试同一 POST。
 * 单节点时退化为原生 fetch。
 */
export function buildSolanaPooledFetch(
  urls: readonly string[]
): typeof fetch {
  const list = [...new Set(urls.filter((u) => u.length > 0))];
  if (list.length <= 1) {
    return (input, init) => fetch(input, init);
  }
  let rr = 0;
  return async (_input: RequestInfo | URL, init?: RequestInit) => {
    const i0 = rr % list.length;
    rr = (rr + 1) % list.length;
    const reqInit = init ?? {};
    let res = await fetch(list[i0], reqInit);
    if (res.status === 429) {
      const i1 = (i0 + 1) % list.length;
      if (i1 !== i0) {
        res = await fetch(list[i1], reqInit);
      }
    }
    return res;
  };
}

export function getSolanaConnection(): Connection {
  if (!connection) {
    const urls = getSolanaRpcUrlList();
    const base: ConstructorParameters<typeof Connection>[1] = {
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: 60_000,
      disableRetryOnRateLimit: solanaRpcDisableRetryOnRateLimit(),
    };
    if (urls.length > 1) {
      base.fetch = buildSolanaPooledFetch(urls);
    }
    connection = new Connection(urls[0], base);
  }
  return connection;
}

export type SolanaChainStats = {
  slot: number;
  epoch: number;
};

export async function fetchSolanaChainStats(): Promise<SolanaChainStats> {
  const c = getSolanaConnection();
  const slot = await c.getSlot('finalized');
  const epochInfo = await c.getEpochInfo();
  return {
    slot,
    epoch: epochInfo.epoch,
  };
}
