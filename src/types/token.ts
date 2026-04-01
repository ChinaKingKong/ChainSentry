/**
 * Token 类型定义
 */

/** 指挥台热门表：MEME / DeFi / LST 数据源切换 */
export type TokenFeedCategory = 'meme' | 'defi' | 'lst';

export interface Token {
  symbol: string;
  name: string;
  address: string;
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
  volume: {
    h24: number;
  };
  priceChange: {
    h24: number;
  };
  pairAge: number;
}

export interface DexScreenerResponse {
  schemaVersion: string;
  pairs: DexScreenerPair[];
}
