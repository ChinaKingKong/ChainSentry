import { PublicKey } from '@solana/web3.js';
import { withTimeout } from '../lib/withTimeout';
import { getSolanaConnection } from './solanaRpc';

const WHALE_PAIR_TX_RPC_MS = 14_000;

export type PairActivityRow = {
  signature: string;
  blockTime: number | null;
  slot: number | null;
};

/** 拉取与流动性池（pair）相关的最近链上签名（无解析 swap 方向，仅作活动流） */
export async function fetchRecentPairSignatures(
  pairAddress: string,
  limit = 15
): Promise<PairActivityRow[]> {
  try {
    const pk = new PublicKey(pairAddress);
    const conn = getSolanaConnection();
    const sigs = await conn.getSignaturesForAddress(pk, { limit });
    const out: PairActivityRow[] = [];
    for (const s of sigs) {
      if (s.err) continue;
      out.push({
        signature: s.signature,
        blockTime: s.blockTime ?? null,
        slot: s.slot,
      });
    }
    return out;
  } catch {
    return [];
  }
}

async function fetchLatestTxForWhaleAlertInner(tkn: {
  pair_address: string;
  address: string;
}): Promise<string | null> {
  const pair = tkn.pair_address?.trim();
  if (pair) {
    const fromPool = await fetchRecentPairSignatures(pair, 25);
    if (fromPool[0]?.signature) return fromPool[0].signature;
  }
  const mint = tkn.address?.trim();
  if (!mint) return null;
  const fromMint = await fetchRecentPairSignatures(mint, 25);
  return fromMint[0]?.signature ?? null;
}

/** 优先池地址、否则 mint：最近一笔成功签名，供整行跳转 Solscan 交易页 */
export async function fetchLatestTxForWhaleAlert(tkn: {
  pair_address: string;
  address: string;
}): Promise<string | null> {
  try {
    return await withTimeout(
      fetchLatestTxForWhaleAlertInner(tkn),
      WHALE_PAIR_TX_RPC_MS
    );
  } catch {
    return null;
  }
}

