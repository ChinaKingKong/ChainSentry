import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import type { AppOutletContext } from '../components/layout/AppLayout';
import { HeroStatsRow } from '../components/dashboard/HeroStatsRow';
import { HotTokensTable } from '../components/dashboard/HotTokensTable';
import { SentimentHeatmap } from '../components/dashboard/SentimentHeatmap';
import { QuickSwapPanel } from '../components/dashboard/QuickSwapPanel';
import { SentryScanModal } from '../components/dashboard/SentryScanModal';
import { CommandSelect } from '../components/ui/CommandSelect';
import { useSentryAudit } from '../hooks/useSentryAudit';
import { useTokens } from '../hooks/useTokens';
import { formatUsdCompact } from '../lib/format';
import { intlLocaleFor } from '../lib/intlLocale';
import type { Token, TokenFeedCategory } from '../types/token';

const DASH_FETCH_CAP = 200;
/** 与巨鲸页等一致：DexScreener 行情轮询间隔 */
const DASH_MARKET_REFRESH_MS = 25_000;

export function DashboardPage() {
  const { t, i18n } = useTranslation();
  const locale = intlLocaleFor(i18n.language);
  const { searchQuery, activityIndex, rpcConnected } =
    useOutletContext<AppOutletContext>();
  const [pageStep, setPageStep] = useState(20);
  const [fetchLimit, setFetchLimit] = useState(20);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [feedCategory, setFeedCategory] = useState<TokenFeedCategory>('meme');
  const [sentryModalOpen, setSentryModalOpen] = useState(false);
  const [sentryModalToken, setSentryModalToken] = useState<Token | null>(null);

  const {
    loading: sentryLoading,
    errorKey: sentryErrorKey,
    score: sentryScore,
    audit: sentryAuditData,
    pair: sentryPair,
    symbol: sentrySymbol,
    displayName: sentryDisplayName,
    liquidityUsd: sentryLiquidityUsd,
    tableRows: sentryTableRows,
    analyze: runSentryAnalyze,
    clear: clearSentryAudit,
  } = useSentryAudit();

  const { tokens, loading, error, lastUpdate, refetch } = useTokens(
    fetchLimit,
    autoRefresh,
    DASH_MARKET_REFRESH_MS,
    feedCategory
  );

  const handleFeedCategoryChange = useCallback(
    (c: TokenFeedCategory) => {
      if (c === feedCategory) return;
      setFeedCategory(c);
      setFetchLimit(pageStep);
    },
    [feedCategory, pageStep]
  );

  const handleSentryScan = useCallback(
    async (token: Token) => {
      clearSentryAudit();
      setSentryModalToken(token);
      setSentryModalOpen(true);
      await runSentryAnalyze(token.address);
    },
    [clearSentryAudit, runSentryAnalyze]
  );

  const closeSentryModal = useCallback(() => {
    setSentryModalOpen(false);
    setSentryModalToken(null);
    clearSentryAudit();
  }, [clearSentryAudit]);

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

  const canLoadMore =
    !loading &&
    tokens.length >= fetchLimit &&
    fetchLimit < DASH_FETCH_CAP;

  const handleLoadMore = useCallback(() => {
    setFetchLimit((n) => Math.min(n + pageStep, DASH_FETCH_CAP));
  }, [pageStep]);

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
            {t('dashboard.pageStep')}
          </span>
          <CommandSelect
            className="w-max min-w-[3.75rem] shrink-0"
            value={String(pageStep)}
            onChange={(e) => setPageStep(Number(e.target.value))}
            aria-label={t('dashboard.pageStep')}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
          </CommandSelect>
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
            category={feedCategory}
            onCategoryChange={handleFeedCategoryChange}
            onSentryScan={handleSentryScan}
            sentryScanBusy={sentryLoading}
          />
          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-outline-variant/10 pt-4">
            <button
              type="button"
              onClick={() => handleLoadMore()}
              disabled={!canLoadMore}
              className="rounded-sm border border-primary/30 bg-surface-container-high px-4 py-2 font-headline text-xs font-bold uppercase tracking-wider text-primary transition-colors hover:border-primary/50 hover:bg-surface-container-highest disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t('dashboard.loadMore')}
            </button>
            <span className="text-[11px] text-on-surface/50">
              {t('dashboard.loadedCount', {
                n: tokens.length,
                limit: fetchLimit,
              })}
            </span>
            {!loading && !canLoadMore && tokens.length > 0 ? (
              <span className="text-[11px] text-on-surface/35">
                {fetchLimit >= DASH_FETCH_CAP
                  ? t('dashboard.reachedFetchCap', { max: DASH_FETCH_CAP })
                  : t('dashboard.noMoreToLoad')}
              </span>
            ) : null}
          </div>
        </div>

        <div className="space-y-8">
          <SentimentHeatmap tokens={tokens} loading={loading} />
          <QuickSwapPanel />
        </div>
      </div>

      <SentryScanModal
        open={sentryModalOpen}
        onClose={closeSentryModal}
        token={sentryModalToken}
        loading={sentryLoading}
        errorKey={sentryErrorKey}
        score={sentryScore}
        audit={sentryAuditData}
        pair={sentryPair}
        symbol={sentrySymbol}
        displayName={sentryDisplayName}
        liquidityUsd={sentryLiquidityUsd}
        tableRows={sentryTableRows}
      />
    </>
  );
}
