import { PublicKey, type ParsedAccountData } from '@solana/web3.js';
import { getSolanaConnection } from './solanaRpc';

export type MintAuditOnChain = {
  mint: string;
  decimals: number;
  supplyRaw: bigint;
  /** true = 铸币权限已关闭（安全） */
  mintAuthorityDisabled: boolean;
  /** true = 无冻结权限（安全） */
  freezeAuthorityRemoved: boolean;
  /** 前 10 大持仓占总供应量比例 0–100 */
  top10HolderPct: number;
  /** Unix 秒 */
  fetchedAt: number;
};

/**
 * 读取 SPL Token Mint 账户及前十大持仓占比（标准 Token Program）。
 * Token-2022 / 非 Mint 会返回 null。
 */
export async function fetchMintAuditOnChain(
  mintAddress: string
): Promise<MintAuditOnChain | null> {
  const conn = getSolanaConnection();
  let mintPk: PublicKey;
  try {
    mintPk = new PublicKey(mintAddress);
  } catch {
    return null;
  }

  const { value } = await conn.getParsedAccountInfo(mintPk);
  if (!value?.data || typeof value.data === 'string') return null;

  const data = value.data as ParsedAccountData;
  if (data.program !== 'spl-token') return null;
  const parsed = data.parsed as {
    type?: string;
    info?: {
      decimals?: number;
      supply?: string;
      mintAuthority?: string | null;
      freezeAuthority?: string | null;
    };
  };
  if (parsed.type !== 'mint' || !parsed.info) return null;

  const info = parsed.info;
  const decimals = info.decimals ?? 0;
  const supplyRaw = BigInt(info.supply ?? '0');
  const mintAuthorityDisabled = info.mintAuthority == null;
  const freezeAuthorityRemoved = info.freezeAuthority == null;

  let top10HolderPct = 0;
  if (supplyRaw > 0n) {
    try {
      const largest = await conn.getTokenLargestAccounts(mintPk);
      let top10 = 0n;
      for (const a of largest.value.slice(0, 10)) {
        top10 += BigInt(a.amount);
      }
      top10HolderPct = Number((top10 * 10000n) / supplyRaw) / 100;
    } catch {
      top10HolderPct = 0;
    }
  }

  return {
    mint: mintPk.toBase58(),
    decimals,
    supplyRaw,
    mintAuthorityDisabled,
    freezeAuthorityRemoved,
    top10HolderPct,
    fetchedAt: Math.floor(Date.now() / 1000),
  };
}

/** 根据链上结果估算 0–100 安全分 */
export function computeSecurityScore(
  audit: MintAuditOnChain,
  liquidityUsd: number | null
): number {
  let s = 0;
  if (audit.mintAuthorityDisabled) s += 28;
  if (audit.freezeAuthorityRemoved) s += 27;
  if (audit.top10HolderPct <= 25) s += 25;
  else if (audit.top10HolderPct <= 45) s += 15;
  else if (audit.top10HolderPct <= 60) s += 8;

  if (liquidityUsd != null) {
    if (liquidityUsd >= 500_000) s += 20;
    else if (liquidityUsd >= 100_000) s += 14;
    else if (liquidityUsd >= 20_000) s += 8;
    else s += 4;
  } else {
    s += 5;
  }
  return Math.min(100, Math.round(s));
}
