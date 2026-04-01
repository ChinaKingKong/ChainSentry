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

const routeLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'px-3 py-1 font-headline text-sm tracking-tight transition-all',
    isActive
      ? 'border-b-2 border-primary-container text-primary'
      : 'text-on-surface/70 hover:bg-surface-container-low hover:text-primary hover:opacity-100',
  ].join(' ');

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
    <nav className="z-50 flex w-full shrink-0 items-center justify-between border-b border-outline-variant/15 bg-background/80 px-6 py-3 shadow-[0_0_40px_-10px_rgba(7,13,31,0.6)] backdrop-blur-xl">
      <div className="flex min-w-0 flex-1 items-center gap-4 lg:gap-8">
        <BrandLockup asLink />
        {showRouteLinks && (
          <div className="hidden items-center gap-2 md:flex lg:gap-4">
            <NavLink to="/" end className={routeLinkClass}>
              {t('nav.command')}
            </NavLink>
            <NavLink to="/tokens" className={routeLinkClass}>
              {t('nav.tokens')}
            </NavLink>
            <NavLink to="/whales" className={routeLinkClass}>
              {t('nav.whales')}
            </NavLink>
          </div>
        )}
        {showSearch && (
          <div className="hidden min-w-0 flex-1 items-center rounded-lg border border-outline-variant/15 bg-surface-container-low px-4 py-1.5 md:flex md:max-w-xs lg:max-w-sm">
            <MaterialIcon name="search" className="mr-2 shrink-0 text-sm text-primary" />
            <input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="min-w-0 flex-1 border-none bg-transparent text-sm text-on-surface placeholder:text-on-surface/30 focus:ring-0"
              placeholder={t('topNav.searchPlaceholder')}
              type="search"
              aria-label={t('topNav.searchAria')}
            />
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-3 sm:gap-6">
        <div className="hidden items-center gap-3 rounded-sm border border-outline-variant/15 bg-surface-container-low px-3 py-1.5 lg:flex">
          <span className="font-label text-[10px] text-primary/60">
            {t('topNav.tps')}
          </span>
          <span className="font-label text-sm font-bold tracking-tighter text-primary">
            {tpsDisplay}
          </span>
        </div>
        <div className="hidden items-center gap-4 font-headline text-xs tracking-wider xl:flex">
          <span className="text-on-surface/50">
            {t('topNav.fee')}{' '}
            <span className="text-secondary">{t('topNav.feeValue')}</span>
          </span>
          <span
            className={
              rpcConnected ? 'text-[10px] text-secondary' : 'text-[10px] text-error'
            }
          >
            {rpcConnected ? t('topNav.rpcLive') : t('topNav.rpcOffline')}
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher />
          <MaterialIcon
            name="notifications"
            className="cursor-pointer text-on-surface opacity-70 transition-all hover:opacity-100"
          />
          <MaterialIcon
            name="settings"
            className="cursor-pointer text-on-surface opacity-70 transition-all hover:opacity-100"
          />
          <WalletConnectButton />
        </div>
      </div>
    </nav>
  );
}
