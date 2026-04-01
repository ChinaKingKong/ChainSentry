import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation } from 'react-router-dom';
import { TopNav } from './TopNav';
import { SideNav } from './SideNav';
import { MobileBottomNav } from './MobileBottomNav';
import { DashboardFAB } from '../dashboard/DashboardFAB';
import { useSolanaChain } from '../../hooks/useSolanaChain';

export type AppOutletContext = {
  searchQuery: string;
  activityIndex: number | null;
  rpcConnected: boolean;
};

export function AppLayout() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const showSearch = location.pathname === '/';

  useEffect(() => {
    if (
      location.pathname !== '/tokens' &&
      location.pathname !== '/whales' &&
      location.pathname !== '/sentry'
    ) {
      document.title = t('meta.defaultTitle');
    }
  }, [location.pathname, t]);

  const { stats, loading: chainLoading, activityIndex } = useSolanaChain(8000);
  const rpcConnected = !chainLoading && stats != null;
  const slotDisplay = stats != null ? stats.slot.toLocaleString() : '…';

  const scrollFab = () => {
    const id =
      location.pathname === '/'
        ? 'dashboard-top'
        : location.pathname === '/whales'
          ? 'whales-page-top'
          : location.pathname === '/sentry'
            ? 'sentry-page-top'
            : 'tokens-page-top';
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    /* Win2k desktop — teal background */
    <div className="flex h-dvh max-h-dvh flex-col overflow-hidden bg-background text-on-surface">

      {/* Win2k application window frame */}
      <div className="flex flex-1 flex-col overflow-hidden m-0 md:m-2"
        style={{
          border: '2px solid #FFFFFF',
          borderRightColor: '#808080',
          borderBottomColor: '#808080',
          backgroundColor: '#D4D0C8',
        }}
      >
        {/* Window title bar */}
        <div className="win-titlebar shrink-0 flex items-center justify-between pr-1">
          <div className="flex items-center gap-1.5">
            {/* App icon placeholder */}
            <div
              className="flex h-4 w-4 shrink-0 items-center justify-center text-[9px] font-bold"
              style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)' }}
              aria-hidden
            >
              S
            </div>
            <span style={{ fontSize: '11px', fontWeight: 'bold' }}>
              ChainSentry — Solana Dashboard
            </span>
          </div>
          {/* Title bar controls */}
          <div className="flex items-center gap-0.5" aria-hidden>
            {['_', '□', '✕'].map((c) => (
              <div
                key={c}
                className="win-btn flex h-4 w-5 items-center justify-center text-[10px] font-bold leading-none"
                style={{ padding: '0', minWidth: '18px', height: '14px' }}
              >
                {c}
              </div>
            ))}
          </div>
        </div>

        {/* Menu bar */}
        <TopNav
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activityIndex={activityIndex}
          rpcConnected={rpcConnected}
          showSearch={showSearch}
          showRouteLinks
        />

        {/* App body */}
        <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
          <SideNav nodeActive={rpcConnected} slotDisplay={slotDisplay} />
          <main
            id="app-main-scroll"
            className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-y-contain p-3 pb-24 md:p-4 md:pb-8"
            style={{ backgroundColor: '#ECE9D8' }}
          >
            <Outlet
              context={
                {
                  searchQuery,
                  activityIndex,
                  rpcConnected,
                } satisfies AppOutletContext
              }
            />
          </main>
        </div>

        {/* Win2k status bar at bottom */}
        <div
          className="win-statusbar shrink-0 flex items-center gap-2"
          style={{ borderTop: '2px solid #808080' }}
        >
          <span className="win-statusbar-cell">
            {rpcConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </span>
          <span className="win-statusbar-cell">
            Slot: {slotDisplay}
          </span>
          <span className="win-statusbar-cell ml-auto">
            ChainSentry v2.0
          </span>
        </div>
      </div>

      <MobileBottomNav />
      <DashboardFAB onClick={scrollFab} />
    </div>
  );
}
