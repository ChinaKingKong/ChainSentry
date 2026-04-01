/**
 * API 服务层（仅 Solana；行情来自 DexScreener，链上状态见 solanaRpc）
 */

import axios from 'axios';
import type { Token, DexScreenerResponse, DexScreenerPair } from '../types/token';

const DEXSCREENER_BASE = 'https://api.dexscreener.com/latest/dex';
const SOLANA_CHAIN_ID = 'solana' as const;

export class TokenService {
  /**
   * 获取 Solana 热门代币
   */
  static async getTopTokens(limit: number = 20): Promise<Token[]> {
    try {
      const response = await axios.get<DexScreenerResponse>(
        `${DEXSCREENER_BASE}/search/?query=solana`,
        { timeout: 10000 }
      );

      const pairs = response.data.pairs || [];

      const solanaPairs = pairs.filter(p => p.chainId === SOLANA_CHAIN_ID);

      // 按交易量排序
      solanaPairs.sort(
        (a, b) => (b.volume?.h24 || 0) - (a.volume?.h24 || 0)
      );

      // 取前 N 个
      const topPairs = solanaPairs.slice(0, limit);

      // 格式化数据
      return topPairs.map(pair => this.formatTokenData(pair));
    } catch (error) {
      console.error('Error fetching tokens:', error);
      return [];
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
    return `https://quote.jup.ag/v6/swap?outputMint=${tokenAddress}`;
  }

  /**
   * 获取 Solscan 链接
   */
  static getSolscanUrl(tokenAddress: string): string {
    return `https://solscan.io/token/${tokenAddress}`;
  }
}
