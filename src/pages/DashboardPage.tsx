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

export function DashboardPage() {
  const { t, i18n } = useTranslation();
  const locale = intlLocaleFor(i18n.language);
  const { searchQuery, activityIndex, rpcConnected } =
    useOutletContext<AppOutletContext>();
  const [pageStep, setPageStep] = useState(20);
  const [fetchLimit, setFetchLimit] = useState(20);
  const [autoRefresh, setAutoRefresh] = useState(false);
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
    30000,
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
      {/* ── Win2k toolbar strip ─────────────────────────────────────────── */}
      <div
        id="dashboard-top"
        className="mb-3 flex flex-wrap items-center gap-3 px-2 py-1.5"
        style={{
          backgroundColor: '#D4D0C8',
          borderTop: '2px solid #FFFFFF',
          borderLeft: '2px solid #FFFFFF',
          borderRight: '2px solid #808080',
          borderBottom: '2px solid #808080',
        }}
      >
        {/* Separator label */}
        <span
          className="text-[11px] font-bold mr-1"
          style={{ color: '#000080' }}
        >
          Dashboard Controls
        </span>

        {/* Vertical separator */}
        <div
          style={{
            width: '2px',
            height: '18px',
            borderLeft: '1px solid #808080',
            borderRight: '1px solid #FFFFFF',
          }}
          aria-hidden
        />

        <label className="flex items-center gap-1.5 text-[11px] text-on-surface">
          <span className="shrink-0 font-bold">{t('dashboard.pageStep')}:</span>
          <select
            className="win-select"
            value={String(pageStep)}
            onChange={(e) => setPageStep(Number(e.target.value))}
            aria-label={t('dashboard.pageStep')}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
          </select>
        </label>

        <label className="flex items-center gap-1.5 text-[11px] text-on-surface cursor-pointer">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
          />
          <span>{t('dashboard.autoRefresh')}</span>
        </label>

        <button
          type="button"
          onClick={() => void refetch()}
          disabled={loading}
          className="win-btn text-[11px]"
        >
          {loading ? t('dashboard.syncing') : t('dashboard.refresh')}
        </button>

        {updatedStr && (
          <span className="ml-auto text-[10px]" style={{ color: '#444444' }}>
            {updatedStr}
          </span>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div
          className="mb-3 flex items-center gap-2 px-3 py-2 text-[11px]"
          style={{
            backgroundColor: '#FFF0F0',
            border: '2px solid #CC0000',
            color: '#CC0000',
          }}
        >
          <span className="font-bold">Error:</span>
          {error}
        </div>
      )}

      {/* Hero stats */}
      <HeroStatsRow
        activityIndex={activityIndex}
        liquidityLabel={formatUsdCompact(totalLiquidity)}
        liquidityChangePct={avgChange}
        highRiskCount={highRiskCount}
        rpcLive={rpcConnected}
      />

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
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

          {/* Pagination / Load more strip */}
          <div
            className="mt-2 flex flex-wrap items-center gap-2 px-2 py-1.5"
            style={{
              backgroundColor: '#D4D0C8',
              borderTop: '1px solid #808080',
              borderTopColor: '#808080',
            }}
          >
            <button
              type="button"
              onClick={() => handleLoadMore()}
              disabled={!canLoadMore}
              className="win-btn text-[11px]"
            >
              {t('dashboard.loadMore')}
            </button>
            <span className="text-[11px] text-on-surface">
              {t('dashboard.loadedCount', {
                n: tokens.length,
                limit: fetchLimit,
              })}
            </span>
            {!loading && !canLoadMore && tokens.length > 0 ? (
              <span className="text-[11px]" style={{ color: '#444444' }}>
                {fetchLimit >= DASH_FETCH_CAP
                  ? t('dashboard.reachedFetchCap', { max: DASH_FETCH_CAP })
                  : t('dashboard.noMoreToLoad')}
              </span>
            ) : null}
          </div>
        </div>

        {/* Sidebar panels */}
        <div className="space-y-3">
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
