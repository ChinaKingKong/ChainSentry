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
    <div className="flex h-dvh max-h-dvh flex-col overflow-hidden bg-background text-on-surface">
      <div
        className="pointer-events-none fixed left-0 top-0 z-0 h-32 w-32 border-l border-t border-primary/20"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed bottom-0 right-0 z-0 h-32 w-32 border-r border-b border-primary/20"
        aria-hidden
      />

      {/* 参照 Hero 流动性卡：右下角钱币装饰底图 + 渐变融入背景 */}
      <div
        className="pointer-events-none fixed bottom-0 right-0 z-0 overflow-hidden"
        style={{
          width: 'min(48vw, 440px)',
          height: 'min(48vh, 440px)',
        }}
        aria-hidden
      >
        <div
          className="absolute inset-0 bg-contain bg-right-bottom bg-no-repeat opacity-[0.16]" 
        />
        <div className="absolute inset-0 bg-gradient-to-tl from-background from-[22%] via-background/88 to-transparent" />
      </div>

      <TopNav
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activityIndex={activityIndex}
        rpcConnected={rpcConnected}
        showSearch={showSearch}
        showRouteLinks
      />

      <div className="flex min-h-0 min-w-0 flex-1">
        <SideNav nodeActive={rpcConnected} slotDisplay={slotDisplay} />
        <main
          id="app-main-scroll"
          className="max-w-[1600px] min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-6 pb-36 md:px-6 md:py-10 md:pb-10 lg:px-10"
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

      <MobileBottomNav />
      <DashboardFAB onClick={scrollFab} />
    </div>
  );
}
