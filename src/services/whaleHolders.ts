import { PublicKey } from '@solana/web3.js';
import { getSolanaConnection } from './solanaRpc';

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
    const d = data as { program: string; parsed: { type?: string; info?: { owner?: string } } };
    const prog = d.program;
    if (prog !== 'spl-token' && prog !== 'spl-token-2022') return null;
    const p = d.parsed;
    if (p?.type === 'account' && typeof p.info?.owner === 'string') {
      return { owner: p.info.owner };
    }
  }
  return null;
}

/**
 * 巨鲸定义：指定 mint 在链上「最大单一 token 账户」的持有者（RPC 快照）。
 * 该账户可能是 LP 池、做市程序等，owner 仍为链上可查实体。
 */
export async function fetchWhaleHolderSnapshot(
  mintAddress: string
): Promise<WhaleHolderSnapshot | null> {
  const mintStr = mintAddress?.trim();
  if (!mintStr) return null;
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

/** 分块并发，减轻公共 RPC 瞬时压力 */
export async function fetchWhaleSnapshotsChunked(
  mints: string[],
  chunkSize = 4
): Promise<Record<string, WhaleHolderSnapshot>> {
  const out: Record<string, WhaleHolderSnapshot> = {};
  for (let i = 0; i < mints.length; i += chunkSize) {
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
