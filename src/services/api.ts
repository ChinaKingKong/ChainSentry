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
/** 按 mint 批量拉池子，pair 上常有 `info.imageUrl`（search 结果常缺省） */
const DEX_TOKENS_V1_BASE = 'https://api.dexscreener.com/tokens/v1';
const SOLANA_CHAIN_ID = 'solana' as const;

/**
 * DexScreener GET /latest/dex/search 仅接受 `q`；与网页
 * `/solana?rankBy=trendingScoreH6&minLiq=100000` 对齐思路：
 * 多关键词合并 → 按池流动性 ≥ minLiq 过滤 → 按 6h 成交量降序（API 无 trendingScore 字段时的代理）。
 */
const CATEGORY_SEARCH_QUERIES: Record<TokenFeedCategory, readonly string[]> = {
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
    'grok',
    'wif',
    'popcat',
    'mog',
    'turbo',
    'book',
    'fart',
    'ai16z',
    'chill',
    'hood',
    'useless',
    'mini',
    'sigma',
    'based',
    'cult',
    'jeet',
    'moon',
    'vibe',
    'degen',
    'solana',
  ],
  defi: [
    'raydium',
    'orca',
    'meteora',
    'jupiter',
    'drift',
    'kamino',
    'marginfi',
    'tensor',
    'lifinity',
    'phoenix',
    'openbook',
    'zeta',
    'sanctum',
    'heaven',
    'shark',
    'save',
    'francium',
    'hubble',
    'solblaze',
    'loopscale',
    'flash',
    'perp',
    'dex',
    'amm',
    'clmm',
  ],
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
    'lst',
    'staked',
    'hubsol',
    'docsol',
    'strongsol',
    'pico',
    'superstate',
    'jito staked',
    'liquid',
    'stake',
    'validator',
    'solayer',
    'fragmetric',
  ],
};

/** 各类目都会并入，拉高 Solana 命中与去重后存量 */
const SHARED_SOLANA_SEARCH: readonly string[] = [
  'raydium',
  'orca',
  'pump',
  'meteora',
  'jupiter',
  'tensor',
  'magic eden',
];

/** 分类结果仍偏少时的兜底词 */
const FALLBACK_SOLANA_SEARCH: readonly string[] = [
  'raydium',
  'orca',
  'pump',
  'sol',
  'bonk',
];

/** 与 DexScreener 网页 minLiq=100000 一致：先按池子 USD 流动性过滤再排序 */
const MIN_PAIR_LIQUIDITY_USD = 100_000;

const MAX_TOP_TOKENS = 500;

/** 首屏仍不足 `cap` 条（过 minLiq 后）时追加搜索 */
const TOP_UP_SEARCH_QUERIES: readonly string[] = [
  'launch',
  'migration',
  'community',
  'viral',
  'clip',
  'stream',
  'trenches',
  'lab',
  'pf',
  'hold',
  'send',
  'nft',
  'game',
  'dao',
  'ai',
];

export class TokenService {
  /** 贴近网页 6h 热度：优先比 `volume.h6`，缺省回退 `h24` */
  private static pairTrendingVolumeKey(p: DexScreenerPair): number {
    const h6 = p.volume?.h6;
    if (typeof h6 === 'number' && Number.isFinite(h6) && h6 > 0) return h6;
    return p.volume?.h24 ?? 0;
  }

  private static pairTxnsH6(p: DexScreenerPair): number {
    const t = p.txns?.h6;
    if (!t) return 0;
    return (t.buys ?? 0) + (t.sells ?? 0);
  }

  /** 同一 mint 只保留 6h 成交量（代理热度）更高的池子 */
  private static dedupePairsByMint(pairs: DexScreenerPair[]): DexScreenerPair[] {
    const byMint = new Map<string, DexScreenerPair>();
    for (const p of pairs) {
      const mint = p.baseToken?.address?.trim();
      if (!mint) continue;
      const prev = byMint.get(mint);
      const k = this.pairTrendingVolumeKey(p);
      if (!prev || k > this.pairTrendingVolumeKey(prev)) byMint.set(mint, p);
    }
    return [...byMint.values()];
  }

  /** 关键词较多时分批请求，减轻瞬时 QPS（仍可能较慢） */
  private static readonly SEARCH_BATCH_SIZE = 10;
  private static readonly SEARCH_BATCH_GAP_MS = 100;

  private static async mergeSearchQueries(
    queries: readonly string[]
  ): Promise<Map<string, DexScreenerPair>> {
    const byPair = new Map<string, DexScreenerPair>();
    const n = queries.length;
    for (let i = 0; i < n; i += this.SEARCH_BATCH_SIZE) {
      const chunk = queries.slice(i, i + this.SEARCH_BATCH_SIZE);
      const settled = await Promise.allSettled(
        chunk.map((q) =>
          axios.get<DexScreenerResponse>(`${DEXSCREENER_BASE}/search`, {
            params: { q },
            timeout: 10000,
          })
        )
      );

      for (const result of settled) {
        if (result.status !== 'fulfilled') continue;
        const pairs = result.value.data.pairs || [];
        for (const p of pairs) {
          if (p.chainId !== SOLANA_CHAIN_ID) continue;
          const id = p.pairAddress;
          if (!id) continue;
          const prev = byPair.get(id);
          const k = this.pairTrendingVolumeKey(p);
          if (!prev || k > this.pairTrendingVolumeKey(prev)) byPair.set(id, p);
        }
      }

      if (i + this.SEARCH_BATCH_SIZE < n) {
        await new Promise((r) => setTimeout(r, this.SEARCH_BATCH_GAP_MS));
      }
    }

    return byPair;
  }

  /**
   * Solana 热门：多关键词 search 合并 → 流动性 ≥ 10 万 U → 按 6h 成交量降序（API 无 trendingScore 时的代理）。
   */
  static async getTopTokens(
    limit: number = 20,
    category: TokenFeedCategory = 'meme'
  ): Promise<Token[]> {
    try {
      const cap = Math.min(Math.max(1, limit), MAX_TOP_TOKENS);
      const querySet = new Set<string>([
        ...CATEGORY_SEARCH_QUERIES[category],
        ...SHARED_SOLANA_SEARCH,
        ...FALLBACK_SOLANA_SEARCH,
      ]);
      const byPair = await this.mergeSearchQueries([...querySet]);

      const buildFiltered = () => {
        const deduped = this.dedupePairsByMint([...byPair.values()]);
        return deduped.filter(
          (p) => (p.liquidity?.usd ?? 0) >= MIN_PAIR_LIQUIDITY_USD
        );
      };

      let liqFiltered = buildFiltered();

      if (liqFiltered.length < cap) {
        const extra = await this.mergeSearchQueries(TOP_UP_SEARCH_QUERIES);
        for (const [id, p] of extra) {
          if (!byPair.has(id)) byPair.set(id, p);
        }
        liqFiltered = buildFiltered();
      }

      liqFiltered.sort((a, b) => {
        const dv = this.pairTrendingVolumeKey(b) - this.pairTrendingVolumeKey(a);
        if (dv !== 0) return dv;
        return this.pairTxnsH6(b) - this.pairTxnsH6(a);
      });

      const topPairs = liqFiltered.slice(0, cap);
      const list = topPairs.map((pair) => this.formatTokenData(pair));
      return await this.enrichTokensWithDexLogos(list);
    } catch (error) {
      console.error('Error fetching tokens:', error);
      return [];
    }
  }

  /**
   * DexScreener `/search` 返回的 pair 往往没有 `info`；用 `tokens/v1/{chain}/{mints}` 补 `logo_uri`。
   */
  private static async enrichTokensWithDexLogos(tokens: Token[]): Promise<Token[]> {
    const missing = tokens.filter((t) => t.address.trim() && !t.logo_uri?.trim());
    if (missing.length === 0) return tokens;

    const mintToUrl = new Map<string, string>();
    const uniqueMints = [...new Set(missing.map((t) => t.address.trim()))];
    const CHUNK = 20;

    for (let i = 0; i < uniqueMints.length; i += CHUNK) {
      const chunk = uniqueMints.slice(i, i + CHUNK);
      const path = chunk.map((m) => encodeURIComponent(m)).join(',');
      try {
        const { data } = await axios.get<DexScreenerPair[]>(
          `${DEX_TOKENS_V1_BASE}/${SOLANA_CHAIN_ID}/${path}`,
          { timeout: 12000 }
        );
        if (!Array.isArray(data)) continue;
        for (const p of data) {
          const mint = p.baseToken?.address?.trim();
          const url = p.info?.imageUrl?.trim();
          if (mint && url && !mintToUrl.has(mint)) mintToUrl.set(mint, url);
        }
      } catch {
        /* 单批失败不阻塞列表 */
      }
    }

    if (mintToUrl.size === 0) return tokens;

    return tokens.map((t) => {
      const u = mintToUrl.get(t.address.trim());
      if (!u || t.logo_uri?.trim()) return t;
      return { ...t, logo_uri: u };
    });
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
      logo_uri: pair.info?.imageUrl || undefined,
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
   * DexScreener 上当前池的图表页（与 `Token.url` 一致；无则按 pair / mint 拼接）。
   */
  static getDexScreenerChartUrl(token: Pick<Token, 'url' | 'pair_address' | 'address'>): string {
    const direct = token.url?.trim();
    if (direct) return direct;
    const pair = token.pair_address?.trim();
    if (pair) {
      return `https://dexscreener.com/solana/${encodeURIComponent(pair)}`;
    }
    return `https://dexscreener.com/solana/${encodeURIComponent(token.address.trim())}`;
  }

  /**
   * OKX Web3 代币「交易与价格图表」页，形如
   * `https://web3.okx.com/zh-hans/token/solana/{mint}`
   */
  static getOkxSolanaTokenUrl(
    mintAddress: string,
    /** 与站内 i18n 一致：`zh` → zh-hans，其余 → en-us */
    uiLanguage: string = 'en'
  ): string {
    const mint = mintAddress.trim();
    const okxLocale = uiLanguage.startsWith('zh') ? 'zh-hans' : 'en-us';
    return `https://web3.okx.com/${okxLocale}/token/solana/${encodeURIComponent(mint)}`;
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
