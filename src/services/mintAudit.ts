import {
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getEpochFee,
  getMint,
  getTransferFeeConfig,
} from '@solana/spl-token';
import { PublicKey, type ParsedAccountData } from '@solana/web3.js';
import { getSolanaConnection } from './solanaRpc';

export type MintAuditOnChain = {
  mint: string;
  decimals: number;
  supplyRaw: bigint;
  /** spl-token / spl-token-2022 */
  tokenProgram: 'spl-token' | 'spl-token-2022';
  /** true = 铸币权限已关闭（安全） */
  mintAuthorityDisabled: boolean;
  /** true = 无冻结权限（安全） */
  freezeAuthorityRemoved: boolean;
  /** 仍存在铸币权限时的地址；已关闭为 null */
  mintAuthorityAddress: string | null;
  /** 仍存在冻结权限时的地址；无冻结为 null */
  freezeAuthorityAddress: string | null;
  /** 前 10 大持仓占总供应量比例 0–100 */
  top10HolderPct: number;
  /**
   * Token-2022 转账费扩展在当前纪元的费率（基点，10000=100%）；
   * 标准 SPL 或无扩展时为 0。
   */
  transferFeeBasisPoints: number;
  /** 当前纪元单笔转账费上限（最小单位）；无扩展时 null */
  transferFeeMaximumRaw: bigint | null;
  /** Unix 秒 */
  fetchedAt: number;
};

const SPL_MINT_PROGRAMS = new Set(['spl-token', 'spl-token-2022']);

/**
 * 读取 SPL / Token-2022 Mint 账户及前十大持仓占比。
 * 非 Mint 或无法解析时返回 null。
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
  if (!SPL_MINT_PROGRAMS.has(data.program)) return null;
  const parsed = data.parsed as { type?: string };
  if (parsed.type !== 'mint') return null;

  const programId =
    data.program === 'spl-token-2022'
      ? TOKEN_2022_PROGRAM_ID
      : TOKEN_PROGRAM_ID;
  const tokenProgram: MintAuditOnChain['tokenProgram'] =
    data.program === 'spl-token-2022' ? 'spl-token-2022' : 'spl-token';

  let mintInfo;
  try {
    mintInfo = await getMint(conn, mintPk, undefined, programId);
  } catch {
    return null;
  }

  const decimals = mintInfo.decimals;
  const supplyRaw = mintInfo.supply;
  const mintAuthorityAddress = mintInfo.mintAuthority?.toBase58() ?? null;
  const freezeAuthorityAddress = mintInfo.freezeAuthority?.toBase58() ?? null;
  const mintAuthorityDisabled = mintAuthorityAddress == null;
  const freezeAuthorityRemoved = freezeAuthorityAddress == null;

  const { epoch } = await conn.getEpochInfo();
  const feeCfg = getTransferFeeConfig(mintInfo);
  let transferFeeBasisPoints = 0;
  let transferFeeMaximumRaw: bigint | null = null;
  if (feeCfg) {
    const active = getEpochFee(feeCfg, BigInt(epoch));
    transferFeeBasisPoints = active.transferFeeBasisPoints;
    transferFeeMaximumRaw = active.maximumFee;
  }

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
    tokenProgram,
    mintAuthorityDisabled,
    freezeAuthorityRemoved,
    mintAuthorityAddress,
    freezeAuthorityAddress,
    top10HolderPct,
    transferFeeBasisPoints,
    transferFeeMaximumRaw,
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
