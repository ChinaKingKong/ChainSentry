import { useMemo, useState, useEffect, useRef } from 'react';
import { TopNav } from './components/layout/TopNav';
import { SideNav, type SideNavTab } from './components/layout/SideNav';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { HeroStatsRow } from './components/dashboard/HeroStatsRow';
import { HotTokensTable } from './components/dashboard/HotTokensTable';
import { SentimentHeatmap } from './components/dashboard/SentimentHeatmap';
import { QuickSwapPanel } from './components/dashboard/QuickSwapPanel';
import { WhaleWatcher } from './components/dashboard/WhaleWatcher';
import { DashboardFAB } from './components/dashboard/DashboardFAB';
import { TokenDetails } from './components/TokenDetails';
import { useTokens } from './hooks/useTokens';
import { useSolanaChain } from './hooks/useSolanaChain';
import { formatUsdCompact } from './lib/format';
import type { Token } from './types/token';

function App() {
  const [limit, setLimit] = useState(20);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [navTab, setNavTab] = useState<SideNavTab>('command');
  const [searchQuery, setSearchQuery] = useState('');

  const hotRef = useRef<HTMLDivElement>(null);

  const { tokens, loading, error, lastUpdate, refetch } = useTokens(
    limit,
    autoRefresh,
    30000
  );

  const { stats, loading: chainLoading, activityIndex } = useSolanaChain(8000);

  const rpcConnected = !chainLoading && stats != null;

  const totalLiquidity = useMemo(
    () => tokens.reduce((s, t) => s + t.liquidity, 0),
    [tokens]
  );

  const avgChange = useMemo(() => {
    if (tokens.length === 0) return null;
    return (
      tokens.reduce((s, t) => s + t.change_24h, 0) / tokens.length
    );
  }, [tokens]);

  const highRiskCount = useMemo(
    () => tokens.filter((t) => t.risk_score === 'C' || t.risk_score === 'D').length,
    [tokens]
  );

  useEffect(() => {
    if (navTab === 'tokens' && hotRef.current) {
      hotRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [navTab]);

  const slotDisplay = stats != null ? stats.slot.toLocaleString() : '…';

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <TopNav
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activityIndex={activityIndex}
        rpcConnected={rpcConnected}
      />

      <div className="flex min-h-[calc(100vh-56px)]">
        <SideNav
          active={navTab}
          onActiveChange={setNavTab}
          nodeActive={rpcConnected}
          slotDisplay={slotDisplay}
        />

        <main
          id="dashboard-main"
          className="w-full max-w-[1600px] flex-1 px-4 py-6 pb-28 md:px-6 md:py-10 lg:px-10"
        >
          <div id="dashboard-top" className="mb-8 flex flex-wrap items-center gap-4 rounded border border-outline-variant/10 bg-surface-container-low/40 px-4 py-3">
            <label className="flex items-center gap-2 text-xs text-on-surface/70">
              <span className="font-headline uppercase tracking-wider">Rows</span>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="rounded border border-outline-variant/20 bg-surface-container-lowest px-2 py-1 text-on-surface"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-xs text-on-surface/70">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-outline-variant/30"
              />
              <span>Auto refresh 30s</span>
            </label>
            <button
              type="button"
              onClick={() => void refetch()}
              disabled={loading}
              className="rounded-sm bg-primary-container px-4 py-1.5 font-headline text-xs font-bold uppercase tracking-wider text-on-primary-container disabled:opacity-50"
            >
              {loading ? 'Sync…' : 'Refresh'}
            </button>
            {lastUpdate && (
              <span className="ml-auto text-[10px] text-on-surface/40">
                Updated {lastUpdate.toLocaleTimeString()}
              </span>
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
            <div ref={hotRef} className="xl:col-span-2">
              <HotTokensTable
                tokens={tokens}
                loading={loading}
                searchQuery={searchQuery}
                onSentryScan={setSelectedToken}
                maxRows={limit}
              />
            </div>

            <div className="space-y-8">
              <SentimentHeatmap />
              <QuickSwapPanel />
            </div>
          </div>

          {selectedToken && (
            <div className="mt-10 max-w-3xl">
              <TokenDetails token={selectedToken} />
            </div>
          )}

          <WhaleWatcher />
        </main>
      </div>

      <MobileBottomNav active={navTab} onActiveChange={setNavTab} />

      <DashboardFAB
        onClick={() =>
          document
            .getElementById('dashboard-top')
            ?.scrollIntoView({ behavior: 'smooth' })
        }
      />
    </div>
  );
}

export default App;
