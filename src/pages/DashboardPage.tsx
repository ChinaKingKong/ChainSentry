import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import type { AppOutletContext } from '../components/layout/AppLayout';
import { HeroStatsRow } from '../components/dashboard/HeroStatsRow';
import { HotTokensTable } from '../components/dashboard/HotTokensTable';
import { SentimentHeatmap } from '../components/dashboard/SentimentHeatmap';
import { QuickSwapPanel } from '../components/dashboard/QuickSwapPanel';
import { TokenDetails } from '../components/TokenDetails';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import { useTokens } from '../hooks/useTokens';
import { formatUsdCompact } from '../lib/format';
import { intlLocaleFor } from '../lib/intlLocale';
import type { Token } from '../types/token';

export function DashboardPage() {
  const { t, i18n } = useTranslation();
  const locale = intlLocaleFor(i18n.language);
  const { searchQuery, activityIndex, rpcConnected } =
    useOutletContext<AppOutletContext>();
  const [limit, setLimit] = useState(20);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const { tokens, loading, error, lastUpdate, refetch } = useTokens(
    limit,
    autoRefresh,
    30000
  );

  const totalLiquidity = useMemo(
    () => tokens.reduce((s, t) => s + t.liquidity, 0),
    [tokens]
  );

  const avgChange = useMemo(() => {
    if (tokens.length === 0) return null;
    return tokens.reduce((s, t) => s + t.change_24h, 0) / tokens.length;
  }, [tokens]);

  const highRiskCount = useMemo(
    () => tokens.filter((t) => t.risk_score === 'C' || t.risk_score === 'D').length,
    [tokens]
  );

  const updatedStr =
    lastUpdate != null
      ? t('dashboard.updated', {
          time: lastUpdate.toLocaleTimeString(locale, {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
        })
      : null;

  return (
    <>
      <div
        id="dashboard-top"
        className="mb-8 flex flex-wrap items-center gap-4 rounded border border-outline-variant/10 bg-surface-container-low/40 px-4 py-3"
      >
        <label className="flex items-center gap-2.5 text-xs text-on-surface/70">
          <span className="shrink-0 font-headline uppercase tracking-wider">
            {t('dashboard.rows')}
          </span>
          <div className="relative inline-flex items-center">
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              aria-label={t('dashboard.rows')}
              className="scheme-dark min-w-[3.75rem] cursor-pointer appearance-none rounded-md border border-primary/20 bg-surface-container-low py-[calc(0.25rem+2.5px)] pl-2.5 pr-7 font-headline text-xs font-semibold tabular-nums leading-none text-on-surface shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-[border-color,box-shadow,background-color] hover:border-primary/35 hover:bg-surface-container-high focus:border-primary-container/55 focus:bg-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary-container/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
            </select>
            <MaterialIcon
              name="expand_more"
              className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-base text-primary-container/80"
              aria-hidden
            />
          </div>
        </label>
        <label className="flex items-center gap-2 text-xs text-on-surface/70">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="rounded border-outline-variant/30"
          />
          <span>{t('dashboard.autoRefresh')}</span>
        </label>
        <button
          type="button"
          onClick={() => void refetch()}
          disabled={loading}
          className="rounded-sm bg-primary-container px-4 py-1.5 font-headline text-xs font-bold uppercase tracking-wider text-on-primary-container disabled:opacity-50"
        >
          {loading ? t('dashboard.syncing') : t('dashboard.refresh')}
        </button>
        {updatedStr && (
          <span className="ml-auto text-[10px] text-on-surface/40">{updatedStr}</span>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      <HeroStatsRow
        activityIndex={activityIndex}
        liquidityLabel={formatUsdCompact(totalLiquidity)}
        liquidityChangePct={avgChange}
        highRiskCount={highRiskCount}
        rpcLive={rpcConnected}
      />

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <HotTokensTable
            tokens={tokens}
            loading={loading}
            searchQuery={searchQuery}
            onSentryScan={setSelectedToken}
            maxRows={limit}
          />
        </div>

        <div className="space-y-8">
          <SentimentHeatmap tokens={tokens} loading={loading} />
          <QuickSwapPanel />
        </div>
      </div>

      {selectedToken && (
        <div className="mt-10 max-w-3xl">
          <TokenDetails token={selectedToken} />
        </div>
      )}
    </>
  );
}
