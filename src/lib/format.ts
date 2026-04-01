export function shortenAddress(addr: string, chars = 4): string {
  if (!addr || addr.length < chars * 2 + 3) return addr || '—';
  return `${addr.slice(0, chars)}…${addr.slice(-chars)}`;
}

export function formatUsdCompact(n: number): string {
  if (!Number.isFinite(n) || n < 0) return '—';
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

export function formatTokenPrice(price: number): string {
  if (!Number.isFinite(price) || price <= 0) return '—';
  if (price < 0.0001) return `$${price.toExponential(2)}`;
  if (price < 1) return `$${price.toFixed(6)}`;
  return `$${price.toFixed(4)}`;
}
