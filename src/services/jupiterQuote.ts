/**
 * Jupiter Swap Quote（公开，无需密钥）
 * 旧版 quote-api.jup.ag/v6 已不可用，改用 lite-api swap v1。
 */

import { PublicKey } from '@solana/web3.js';
import { getSolanaConnection } from './solanaRpc';

export const JUPITER_SOL_MINT =
  'So11111111111111111111111111111111111111112' as const;
export const JUPITER_USDC_MINT =
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' as const;

const QUOTE_API = 'https://lite-api.jup.ag/swap/v1/quote';

export type JupiterQuoteResult = {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  priceImpactPct: string;
};

export const JUPITER_PAY_ASSETS = {
  SOL: { mint: JUPITER_SOL_MINT, decimals: 9, symbol: 'SOL' as const },
  USDC: { mint: JUPITER_USDC_MINT, decimals: 6, symbol: 'USDC' as const },
} as const;

export type JupiterPayAssetKey = keyof typeof JUPITER_PAY_ASSETS;

/** 人类可读数量 → 链上最小单位（避免极大数额的浮点误差，一般 swap 金额足够用） */
export function parseHumanToRawAmount(
  human: string,
  decimals: number
): bigint {
  const t = human.replace(/,/g, '.').trim();
  if (!t || t === '.') return 0n;
  const n = Number(t);
  if (!Number.isFinite(n) || n <= 0) return 0n;
  const mult = 10 ** decimals;
  return BigInt(Math.round(n * mult));
}

export type FormatRawDecimalOptions = {
  /** 固定显示小数位数（如兑换 UI 用 2）；不传则按代币精度最多 12 位 */
  fractionDigits?: number;
};

export function formatRawAsDecimal(
  raw: string,
  decimals: number,
  locale: string,
  options?: FormatRawDecimalOptions
): string {
  try {
    const v = BigInt(raw);
    if (decimals <= 0) return v.toLocaleString(locale);
    const neg = v < 0n;
    const abs = neg ? -v : v;
    const base = 10n ** BigInt(decimals);
    const int = abs / base;
    const frac = abs % base;
    const fracStr = frac.toString().padStart(decimals, '0').replace(/0+$/, '');
    const core = fracStr ? `${int.toString()}.${fracStr}` : int.toString();
    const num = Number(core);
    if (!Number.isFinite(num)) return core;

    const fixed = options?.fractionDigits;
    if (fixed != null && fixed >= 0) {
      return num.toLocaleString(locale, {
        minimumFractionDigits: fixed,
        maximumFractionDigits: fixed,
      });
    }
    return num.toLocaleString(locale, {
      maximumFractionDigits: Math.min(12, decimals),
    });
  } catch {
    return raw;
  }
}

/**
 * 从 Jupiter 代币元数据读取精度（失败时返回 null）
 */
async function fetchMintDecimalsFromRpc(mint: string): Promise<number | null> {
  try {
    const conn = getSolanaConnection();
    const info = await conn.getParsedAccountInfo(new PublicKey(mint));
    const data = info.value?.data;
    if (
      data &&
      typeof data === 'object' &&
      'parsed' in data &&
      data.parsed &&
      typeof data.parsed === 'object' &&
      'type' in data.parsed &&
      data.parsed.type === 'mint' &&
      'info' in data.parsed &&
      data.parsed.info &&
      typeof data.parsed.info === 'object' &&
      'decimals' in data.parsed.info
    ) {
      const d = (data.parsed.info as { decimals?: number }).decimals;
      return typeof d === 'number' ? d : null;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * 代币精度：优先 Jupiter 元数据，失败则用链上 Mint 账户（避免精度错导致报价失败）。
 */
export async function fetchJupiterTokenDecimals(
  mint: string,
  signal?: AbortSignal
): Promise<number | null> {
  try {
    const res = await fetch(`https://tokens.jup.ag/token/${mint}`, {
      signal,
    });
    if (res.ok) {
      const j = (await res.json()) as { decimals?: number };
      if (typeof j.decimals === 'number') return j.decimals;
    }
  } catch {
    /* fall through */
  }
  if (signal?.aborted) return null;
  return fetchMintDecimalsFromRpc(mint);
}

export async function fetchJupiterQuote(
  inputMint: string,
  outputMint: string,
  amountRaw: bigint,
  slippageBps: number,
  signal?: AbortSignal
): Promise<JupiterQuoteResult | null> {
  if (amountRaw <= 0n || inputMint === outputMint) return null;
  const u = new URL(QUOTE_API);
  u.searchParams.set('inputMint', inputMint);
  u.searchParams.set('outputMint', outputMint);
  u.searchParams.set('amount', amountRaw.toString());
  u.searchParams.set('slippageBps', String(slippageBps));
  u.searchParams.set('swapMode', 'ExactIn');
  u.searchParams.set('maxAccounts', '64');
  const res = await fetch(u.toString(), { signal });
  if (!res.ok) return null;
  const data = (await res.json()) as JupiterQuoteResult;
  if (data?.outAmount == null || data.outAmount === '') return null;
  return data;
}

/** 打开 Jupiter 前端并预填 mint / 数量（ExactIn 原始数量） */
export function buildJupiterSwapUrl(
  inputMint: string,
  outputMint: string,
  amountRaw?: bigint
): string {
  const u = new URL('https://jup.ag/swap');
  u.searchParams.set('inputMint', inputMint);
  u.searchParams.set('outputMint', outputMint);
  if (amountRaw != null && amountRaw > 0n) {
    u.searchParams.set('amount', amountRaw.toString());
  }
  return u.toString();
}
