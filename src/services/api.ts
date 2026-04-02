/**
 * API 服务层（仅 Solana；行情来自 DexScreener，链上状态见 solanaRpc）
 */

import axios from 'axios';
import { buildJupiterSwapUrl, JUPITER_SOL_MINT } from './jupiterQuote';
import type {
  Token,
  DexScreenerResponse,
  DexScreenerPair,
  TokenFeedCategory,
} from '../types/token';

const DEXSCREENER_BASE = 'https://api.dexscreener.com/latest/dex';
const SOLANA_CHAIN_ID = 'solana' as const;

/** DexScreener GET /latest/dex/search 仅接受查询参数 `q`；使用 `query` 会 400。文档：https://docs.dexscreener.com/api/reference */
const CATEGORY_SEARCH_QUERIES: Record<TokenFeedCategory, readonly string[]> = {
  /** 多关键词扩大覆盖面；同一 mint 多池子在下游按 mint 去重 */
  meme: [
    'pump',
    'bonk',
    'wen',
    'meme',
    'dog',
    'cat',
    'pepe',
    'sol',
    'trump',
  ],
  /** 含 raydium/orca/usdc 等，保证多数结果为 Solana 链上 DeFi 对 */
  defi: [
    'raydium',
    'orca',
    'meteora',
    'jupiter',
    'usdc',
    'drift',
    'kamino',
    'marginfi',
  ],
  /** 质押衍生：多关键词 + 常见 LST 符号，避免单一词无 Solana 结果 */
  lst: [
    'marinade',
    'msol',
    'jito',
    'jitosol',
    'jupsol',
    'bsol',
    'stsol',
    'blaze',
    'inf',
    'sanctum',
  ],
};

/** 分类搜索 Solana 条数过少时合并，避免 DeFi/LST Tab 空白 */
const FALLBACK_SOLANA_SEARCH: readonly string[] = ['raydium', 'orca', 'pump'];

const MAX_TOP_TOKENS = 200;

export class TokenService {
  /** 同一 mint 只保留 24h 成交量最高的池子，去掉 MEME 等分类下的重复代币行 */
  private static dedupePairsByMint(pairs: DexScreenerPair[]): DexScreenerPair[] {
    const byMint = new Map<string, DexScreenerPair>();
    for (const p of pairs) {
      const mint = p.baseToken?.address?.trim();
      if (!mint) continue;
      const prev = byMint.get(mint);
      const vol = p.volume?.h24 || 0;
      if (!prev || vol > (prev.volume?.h24 || 0)) byMint.set(mint, p);
    }
    return [...byMint.values()];
  }

  private static async mergeSearchQueries(
    queries: readonly string[]
  ): Promise<Map<string, DexScreenerPair>> {
    const settled = await Promise.allSettled(
      queries.map((q) =>
        axios.get<DexScreenerResponse>(`${DEXSCREENER_BASE}/search`, {
          params: { q },
          timeout: 10000,
        })
      )
    );

    const byPair = new Map<string, DexScreenerPair>();

    for (const result of settled) {
      if (result.status !== 'fulfilled') continue;
      const pairs = result.value.data.pairs || [];
      for (const p of pairs) {
        if (p.chainId !== SOLANA_CHAIN_ID) continue;
        const id = p.pairAddress;
        if (!id) continue;
        const prev = byPair.get(id);
        const vol = p.volume?.h24 || 0;
        if (!prev || vol > (prev.volume?.h24 || 0)) byPair.set(id, p);
      }
    }

    return byPair;
  }

  /**
   * 获取 Solana 热门代币：按指挥台分类合并若干 `q=` 搜索，按 24h 成交量排序。
   */
  static async getTopTokens(
    limit: number = 20,
    category: TokenFeedCategory = 'meme'
  ): Promise<Token[]> {
    try {
      const cap = Math.min(Math.max(1, limit), MAX_TOP_TOKENS);
      const primary = CATEGORY_SEARCH_QUERIES[category];
      const byPair = await this.mergeSearchQueries(primary);

      const minFill = Math.min(Math.max(cap, 12), 48);
      if (byPair.size < minFill) {
        const extra = await this.mergeSearchQueries(FALLBACK_SOLANA_SEARCH);
        for (const [id, p] of extra) {
          if (!byPair.has(id)) byPair.set(id, p);
        }
      }

      const deduped = this.dedupePairsByMint([...byPair.values()]);
      deduped.sort(
        (a, b) => (b.volume?.h24 || 0) - (a.volume?.h24 || 0)
      );

      const topPairs = deduped.slice(0, cap);
      return topPairs.map((pair) => this.formatTokenData(pair));
    } catch (error) {
      console.error('Error fetching tokens:', error);
      return [];
    }
  }

  /**
   * 按 Mint 拉取 DexScreener 上流动性最高的一条 Solana 交易对。
   */
  static async getBestPairForMint(mintAddress: string): Promise<DexScreenerPair | null> {
    try {
      const response = await axios.get<DexScreenerResponse>(
        `${DEXSCREENER_BASE}/tokens/${encodeURIComponent(mintAddress)}`,
        { timeout: 10000 }
      );
      const pairs = (response.data.pairs || []).filter(
        (p) => p.chainId === SOLANA_CHAIN_ID
      );
      if (pairs.length === 0) return null;
      pairs.sort(
        (a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0)
      );
      return pairs[0] ?? null;
    } catch (error) {
      console.error('Error fetching token pairs:', error);
      return null;
    }
  }

  /**
   * 格式化代币数据
   */
  static formatTokenData(pair: DexScreenerPair): Token {
    const liquidity = pair.liquidity?.usd || 0;
    const volume = pair.volume?.h24 || 0;
    const change = pair.priceChange?.h24 || 0;

    return {
      symbol: pair.baseToken?.symbol || 'N/A',
      name: pair.baseToken?.name || 'N/A',
      address: pair.baseToken?.address || '',
      price: parseFloat(pair.priceUsd || '0'),
      liquidity,
      volume_24h: volume,
      change_24h: change,
      risk_score: this.calculateRiskScore(liquidity, volume),
      pair_address: pair.pairAddress || '',
      dex: pair.dexId || 'N/A',
      url: pair.url || '',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 计算风险评分
   */
  static calculateRiskScore(
    liquidity: number,
    volume: number
  ): 'A' | 'B' | 'C' | 'D' {
    if (liquidity >= 1000000 && volume >= 500000) {
      return 'A';
    } else if (liquidity >= 100000 && volume >= 50000) {
      return 'B';
    } else if (liquidity >= 10000 && volume >= 10000) {
      return 'C';
    } else {
      return 'D';
    }
  }

  /**
   * 获取 Jupiter 交易链接
   */
  static getJupiterSwapUrl(tokenAddress: string): string {
    return buildJupiterSwapUrl(JUPITER_SOL_MINT, tokenAddress);
  }

  /**
   * 获取 Solscan 链接
   */
  static getSolscanUrl(tokenAddress: string): string {
    return `https://solscan.io/token/${tokenAddress}`;
  }

  /** 任意账户（钱包 / 铸币账户等）在 Solscan 上的账户页，可查看链上交易记录 */
  static getSolscanAccountUrl(address: string): string {
    return `https://solscan.io/account/${address}`;
  }

  static getSolscanTxUrl(signature: string): string {
    return `https://solscan.io/tx/${signature}`;
  }
}
