import { PublicKey } from '@solana/web3.js';
import { withTimeout } from '../lib/withTimeout';
import { getSolanaConnection } from './solanaRpc';

/** 单 mint 链上拉取上限；公共 RPC 常无 fetch 超时，避免整页永远「拉取持仓中」 */
const WHALE_HOLDER_RPC_MS = 22_000;

export type WhaleHolderSnapshot = {
  /** SPL token account（最大持仓） */
  tokenAccount: string;
  /** 该 token 账户的 owner，一般为钱包或程序 PDA */
  ownerWallet: string;
  uiAmount: number;
  decimals: number;
  /** 该 owner 最近一笔成功上链签名，用于打开 Solscan 交易页 */
  recentSignature: string | null;
};

function splTokenAccountOwner(
  data: unknown
): { owner: string } | null {
  if (
    data &&
    typeof data === 'object' &&
    'parsed' in data &&
    'program' in data
  ) {
    const d = data as {
      program: string;
      parsed: { type?: string; info?: Record<string, unknown> };
    };
    const prog = d.program;
    if (prog !== 'spl-token' && prog !== 'spl-token-2022') return null;
    const p = d.parsed;
    if (p?.type !== 'account' || !p.info || typeof p.info !== 'object')
      return null;
    const ow = p.info.owner;
    if (typeof ow === 'string' && ow.length > 0) return { owner: ow };
  }
  return null;
}

/**
 * 巨鲸定义：指定 mint 在链上「最大单一 token 账户」的持有者（RPC 快照）。
 * 该账户可能是 LP 池、做市程序等，owner 仍为链上可查实体。
 */
async function fetchWhaleHolderSnapshotInner(
  mintStr: string
): Promise<WhaleHolderSnapshot | null> {
  try {
    const conn = getSolanaConnection();
    const mintPk = new PublicKey(mintStr);
    const { value: largestList } = await conn.getTokenLargestAccounts(
      mintPk,
      'confirmed'
    );
    const top = largestList[0];
    if (!top) return null;

    const acc = await conn.getParsedAccountInfo(top.address);
    const raw = acc.value?.data;
    if (!raw || typeof raw !== 'object' || !('parsed' in raw)) return null;
    const own = splTokenAccountOwner(raw);
    if (!own) return null;

    const uiAmount =
      top.uiAmount ??
      (top.uiAmountString != null ? Number(top.uiAmountString) : NaN);
    const safeUi = Number.isFinite(uiAmount) ? uiAmount : 0;

    let recentSignature: string | null = null;
    try {
      const ownerPk = new PublicKey(own.owner);
      const sigs = await conn.getSignaturesForAddress(ownerPk, { limit: 12 });
      const ok = sigs.find((s) => !s.err);
      recentSignature = ok?.signature ?? null;
    } catch {
      recentSignature = null;
    }

    return {
      tokenAccount: top.address.toBase58(),
      ownerWallet: own.owner,
      uiAmount: safeUi,
      decimals: top.decimals,
      recentSignature,
    };
  } catch {
    return null;
  }
}

export async function fetchWhaleHolderSnapshot(
  mintAddress: string
): Promise<WhaleHolderSnapshot | null> {
  const mintStr = mintAddress?.trim();
  if (!mintStr) return null;
  try {
    return await withTimeout(
      fetchWhaleHolderSnapshotInner(mintStr),
      WHALE_HOLDER_RPC_MS
    );
  } catch {
    return null;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * 分小块 + 块间停顿，降低公共 RPC 429（每 mint 多路 RPC，并发 4 很容易打满限额）。
 */
export async function fetchWhaleSnapshotsChunked(
  mints: string[],
  chunkSize = 2,
  delayMsBetweenChunks = 400
): Promise<Record<string, WhaleHolderSnapshot>> {
  const out: Record<string, WhaleHolderSnapshot> = {};
  for (let i = 0; i < mints.length; i += chunkSize) {
    if (i > 0 && delayMsBetweenChunks > 0) {
      await sleep(delayMsBetweenChunks);
    }
    const slice = mints.slice(i, i + chunkSize);
    const part = await Promise.all(
      slice.map(async (mint) => {
        const snap = await fetchWhaleHolderSnapshot(mint);
        return { mint, snap };
      })
    );
    for (const { mint, snap } of part) {
      if (snap) out[mint] = snap;
    }
  }
  return out;
}
