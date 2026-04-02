/**
 * Token 类型定义
 */

/** 指挥台热门表：MEME / DeFi / LST 数据源切换 */
export type TokenFeedCategory = 'meme' | 'defi' | 'lst';

export interface Token {
  symbol: string;
  name: string;
  address: string;
  /** DexScreener pair `info.imageUrl`，无则缺省 */
  logo_uri?: string;
  price: number;
  liquidity: number;
  volume_24h: number;
  change_24h: number;
  risk_score: 'A' | 'B' | 'C' | 'D';
  pair_address: string;
  dex: string;
  url: string;
  timestamp: string;
}

export interface DexScreenerPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    symbol: string;
  };
  priceUsd: string;
  liquidity: {
    usd: number;
  };
  /** DexScreener 常含 h6/h1/m5，用于贴近网页「6h 热度」排序 */
  volume?: {
    h24?: number;
    h6?: number;
    h1?: number;
    m5?: number;
  };
  txns?: {
    m5?: { buys?: number; sells?: number };
    h1?: { buys?: number; sells?: number };
    h6?: { buys?: number; sells?: number };
    h24?: { buys?: number; sells?: number };
  };
  priceChange?: {
    h24?: number;
    h6?: number;
    h1?: number;
    m5?: number;
  };
  pairAge: number;
  /** 含代币图标等，见 DexScreener search/pairs 响应 */
  info?: {
    imageUrl?: string;
  } | null;
}

export interface DexScreenerResponse {
  schemaVersion: string;
  pairs: DexScreenerPair[];
}
