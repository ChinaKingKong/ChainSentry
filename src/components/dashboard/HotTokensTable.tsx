import { useMemo, useState } from 'react';
import type { Token } from '../../types/token';
import { formatTokenPrice, formatUsdCompact, shortenAddress } from '../../lib/format';
import {
  riskToSentryScore,
  sentryScoreBarColor,
  sentryScoreTextColor,
} from '../../lib/sentryScore';
import { MaterialIcon } from '../ui/MaterialIcon';

export type HotTokensCategory = 'meme' | 'defi' | 'lst';

export type HotTokensTableProps = {
  tokens: Token[];
  loading: boolean;
  searchQuery: string;
  onSentryScan: (token: Token) => void;
  maxRows?: number;
};

export function HotTokensTable({
  tokens,
  loading,
  searchQuery,
  onSentryScan,
  maxRows = 12,
}: HotTokensTableProps) {
  const [category, setCategory] = useState<HotTokensCategory>('meme');

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = tokens;
    if (q) {
      list = list.filter(
        (t) =>
          t.symbol.toLowerCase().includes(q) ||
          t.name.toLowerCase().includes(q) ||
          t.address.toLowerCase().includes(q)
      );
    }
    return list.slice(0, maxRows);
  }, [tokens, searchQuery, maxRows]);

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded bg-surface-container-low/80 p-12 text-on-surface/50">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-container border-t-transparent" />
          <span className="font-headline text-sm">Syncing Solana pairs…</span>
        </div>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="rounded bg-surface-container-low/80 p-12 text-center text-on-surface/50">
        No tokens match your scan.
      </div>
    );
  }

  const cats: { id: HotTokensCategory; label: string }[] = [
    { id: 'meme', label: 'Meme' },
    { id: 'defi', label: 'DeFi' },
    { id: 'lst', label: 'LST' },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h3 className="font-headline flex items-center gap-2 text-xl font-bold text-on-surface">
          <MaterialIcon name="local_fire_department" className="text-primary" />
          Hot Tokens
        </h3>
        <div className="flex gap-2">
          {cats.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              className={`rounded px-3 py-1 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                category === c.id
                  ? 'bg-surface-container-high text-primary'
                  : 'text-on-surface/40 hover:text-on-surface'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-outline-variant/10 text-[10px] uppercase tracking-widest text-on-surface/40">
              <th className="pb-4 font-bold">Asset</th>
              <th className="pb-4 font-bold">Price</th>
              <th className="pb-4 font-bold">24h Vol</th>
              <th className="pb-4 font-bold">Sentry Score</th>
              <th className="pb-4 font-bold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {filtered.map((token) => {
              const score = riskToSentryScore(token.risk_score);
              const barColor = sentryScoreBarColor(score);
              const textColor = sentryScoreTextColor(score);
              return (
                <tr
                  key={token.address}
                  className="group transition-colors hover:bg-surface-container-low/80"
                >
                  <td className="py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded bg-surface-container-highest">
                        <span className="font-headline text-sm font-bold text-primary">
                          {token.symbol.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-headline text-sm font-bold tracking-tight text-on-surface">
                          {token.symbol}
                        </p>
                        <p className="font-mono text-[10px] text-on-surface/40">
                          {shortenAddress(token.address)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 font-headline font-medium text-on-surface">
                    {formatTokenPrice(token.price)}{' '}
                    <span
                      className={`ml-1 text-xs ${
                        token.change_24h >= 0 ? 'text-secondary' : 'text-error'
                      }`}
                    >
                      {token.change_24h >= 0 ? '+' : ''}
                      {token.change_24h.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-5 font-headline text-on-surface">
                    {formatUsdCompact(token.volume_24h)}
                  </td>
                  <td className="py-5">
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-12 overflow-hidden rounded-full bg-surface-container-highest">
                        <div
                          className={`h-full ${barColor}`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                      <span className={`text-xs font-bold ${textColor}`}>
                        {score}
                      </span>
                    </div>
                  </td>
                  <td className="py-5">
                    <button
                      type="button"
                      onClick={() => onSentryScan(token)}
                      className="rounded border border-primary/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary transition-all hover:bg-primary/10"
                    >
                      Sentry Scan
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
