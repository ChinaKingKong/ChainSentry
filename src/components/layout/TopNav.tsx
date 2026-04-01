import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { WalletConnectButton } from '../wallet/WalletConnectButton';
import { BrandLockup } from '../ui/BrandLockup';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import { MaterialIcon } from '../ui/MaterialIcon';

export type TopNavProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  activityIndex: number | null;
  rpcConnected: boolean;
  showSearch?: boolean;
  showRouteLinks?: boolean;
};

export function TopNav({
  searchQuery,
  onSearchChange,
  activityIndex,
  rpcConnected,
  showSearch = true,
  showRouteLinks = false,
}: TopNavProps) {
  const { t } = useTranslation();
  const tpsDisplay =
    activityIndex != null ? activityIndex.toLocaleString() : '—';

  return (
    /* Win2k menu bar */
    <nav
      className="shrink-0 flex w-full items-center justify-between px-1 py-0.5 gap-2 flex-wrap"
      style={{
        backgroundColor: '#D4D0C8',
        borderBottom: '1px solid #808080',
      }}
    >
      {/* Left: brand + route links */}
      <div className="flex items-center gap-0 min-w-0">
        <BrandLockup asLink />

        {showRouteLinks && (
          <div className="hidden items-center md:flex ml-2">
            {[
              { to: '/', end: true, label: t('nav.command') },
              { to: '/tokens', end: false, label: t('nav.tokens') },
              { to: '/whales', end: false, label: t('nav.whales') },
              { to: '/sentry', end: false, label: t('nav.sentry') },
            ].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `win-menuitem text-[11px] ${isActive ? 'win-menuitem-active' : ''}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>

      {/* Center: search box */}
      {showSearch && (
        <div className="hidden md:flex items-center gap-1 flex-1 max-w-xs min-w-0 mx-2">
          <label className="text-[11px] shrink-0 text-on-surface" htmlFor="top-search">
            {t('topNav.searchPlaceholder')}:
          </label>
          <div className="flex items-center flex-1 min-w-0" style={{
            border: '2px inset #808080',
            borderTopColor: '#808080',
            borderLeftColor: '#808080',
            borderRightColor: '#FFFFFF',
            borderBottomColor: '#FFFFFF',
            backgroundColor: '#FFFFFF',
            padding: '1px 3px',
          }}>
            <MaterialIcon name="search" className="shrink-0 text-on-surface/60" />
            <input
              id="top-search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="min-w-0 flex-1 border-0 bg-transparent text-[11px] text-on-surface outline-none placeholder:text-on-surface/40"
              placeholder={t('topNav.searchPlaceholder')}
              type="search"
              aria-label={t('topNav.searchAria')}
            />
          </div>
        </div>
      )}

      {/* Right: stats + controls */}
      <div className="flex shrink-0 items-center gap-1">
        {/* TPS display — Win2k status chip */}
        <div
          className="hidden lg:flex items-center gap-1 px-2 py-0.5 text-[11px]"
          style={{
            border: '1px solid #808080',
            borderRightColor: '#FFFFFF',
            borderBottomColor: '#FFFFFF',
            backgroundColor: '#D4D0C8',
          }}
        >
          <span className="text-on-surface/70">TPS:</span>
          <span className="font-bold text-primary">{tpsDisplay}</span>
        </div>

        {/* RPC status */}
        <div
          className="hidden xl:flex items-center gap-1 px-2 py-0.5 text-[11px]"
          style={{
            border: '1px solid #808080',
            borderRightColor: '#FFFFFF',
            borderBottomColor: '#FFFFFF',
            backgroundColor: '#D4D0C8',
          }}
        >
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: rpcConnected ? '#008000' : '#FF0000' }}
            aria-hidden
          />
          <span className={rpcConnected ? 'text-secondary' : 'text-error'}>
            {rpcConnected ? t('topNav.rpcLive') : t('topNav.rpcOffline')}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <button type="button" className="win-btn p-1" aria-label="Notifications">
            <MaterialIcon name="notifications" />
          </button>
          <button type="button" className="win-btn p-1" aria-label="Settings">
            <MaterialIcon name="settings" />
          </button>
          <WalletConnectButton />
        </div>
      </div>
    </nav>
  );
}
