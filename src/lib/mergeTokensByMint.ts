import type { Token } from '../types/token';

/** 多路行情合并为按 mint 去重，保留 24h 成交量更高的一条，再按成交量排序截断 */
export function mergeTokensByMint(lists: Token[][], cap: number): Token[] {
  const map = new Map<string, Token>();
  for (const list of lists) {
    for (const t of list) {
      const mint = t.address?.trim();
      if (!mint) continue;
      const prev = map.get(mint);
      if (!prev || t.volume_24h > prev.volume_24h) map.set(mint, t);
    }
  }
  return [...map.values()]
    .sort((a, b) => b.volume_24h - a.volume_24h)
    .slice(0, Math.max(1, cap));
}
