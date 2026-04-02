import { PublicKey } from '@solana/web3.js';
import { getSolanaConnection } from './solanaRpc';

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

