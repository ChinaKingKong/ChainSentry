import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Token, TokenFeedCategory } from '../../types/token';
import { formatTokenPrice, formatUsdCompact, shortenAddress } from '../../lib/format';
import {
  riskToSentryScore,
  sentryScoreBarColor,
  sentryScoreTextColor,
} from '../../lib/sentryScore';
import { MaterialIcon } from '../ui/MaterialIcon';

export type HotTokensTableProps = {
  tokens: Token[];
  loading: boolean;
  searchQuery: string;
  category: TokenFeedCategory;
  onCategoryChange: (c: TokenFeedCategory) => void;
  onSentryScan: (token: Token) => void | Promise<void>;
  /** 哨兵分析进行中时禁用扫描按钮，避免重复请求 */
  sentryScanBusy?: boolean;
  /** 不传则展示当前传入的全部 tokens（仅受搜索过滤） */
  maxRows?: number;
};

const CATS: { id: TokenFeedCategory; labelKey: string }[] = [
  { id: 'meme', labelKey: 'hotTable.meme' },
  { id: 'defi', labelKey: 'hotTable.defi' },
  { id: 'lst', labelKey: 'hotTable.lst' },
];

export function HotTokensTable({
  tokens,
  loading,
  searchQuery,
  category,
  onCategoryChange,
  onSentryScan,
  sentryScanBusy = false,
  maxRows,
}: HotTokensTableProps) {
  const { t } = useTranslation();

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = tokens;
    if (q) {
      list = list.filter(
        (tok) =>
          tok.symbol.toLowerCase().includes(q) ||
          tok.name.toLowerCase().includes(q) ||
          tok.address.toLowerCase().includes(q)
      );
    }
    return maxRows == null ? list : list.slice(0, maxRows);
  }, [tokens, searchQuery, maxRows]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h3 className="font-headline flex items-center gap-2 text-xl font-bold text-on-surface">
          <MaterialIcon name="local_fire_department" className="text-primary" />
          {t('hotTable.title')}
        </h3>
        <div className="flex flex-wrap gap-2">
          {CATS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onCategoryChange(c.id)}
              className={`rounded px-3 py-1 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                category === c.id
                  ? 'bg-surface-container-high text-primary'
                  : 'text-on-surface/40 hover:text-on-surface'
              }`}
            >
              {t(c.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[200px] items-center justify-center rounded bg-surface-container-low/80 p-12 text-on-surface/50">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-container border-t-transparent" />
            <span className="font-headline text-sm">{t('hotTable.syncing')}</span>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded border border-outline-variant/10 bg-surface-container-low/80 px-6 py-14 text-center text-on-surface/55">
          <p className="font-headline text-sm">{t('hotTable.noMatch')}</p>
          {searchQuery.trim() ? (
            <p className="mt-2 text-xs text-on-surface/40">
              {t('hotTable.clearSearchHint')}
            </p>
          ) : null}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-outline-variant/10 text-[10px] uppercase tracking-widest text-on-surface/40">
                <th className="pb-4 font-bold">{t('hotTable.asset')}</th>
                <th className="pb-4 font-bold">{t('hotTable.price')}</th>
                <th className="pb-4 font-bold">{t('hotTable.vol24h')}</th>
                <th className="pb-4 font-bold">{t('hotTable.sentryScore')}</th>
                <th className="pb-4 font-bold">{t('hotTable.action')}</th>
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
                        disabled={sentryScanBusy}
                        onClick={() => void onSentryScan(token)}
                        className="rounded border border-primary/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary transition-all hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        {t('hotTable.sentryScan')}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
