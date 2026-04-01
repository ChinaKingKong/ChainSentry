import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MaterialIcon } from '../ui/MaterialIcon';
import type { SideNavTab } from './SideNav';

const tabs: {
  id: SideNavTab;
  icon: string;
  to: string;
  end?: boolean;
}[] = [
  { id: 'command', icon: 'dashboard', to: '/', end: true },
  { id: 'tokens', icon: 'token', to: '/tokens' },
  { id: 'whales', icon: 'monitoring', to: '/whales' },
  { id: 'sentry', icon: 'security', to: '/sentry' },
];

export function MobileBottomNav() {
  const { t } = useTranslation();

  return (
    <nav
      className="glass-panel-strong fixed left-3 right-3 z-50 mx-auto flex max-w-lg items-center justify-around rounded-2xl border border-outline-variant/20 px-2 py-2.5 shadow-[0_-8px_32px_rgba(7,13,31,0.55)] md:hidden"
      style={{
        bottom: 'calc(1.35rem + env(safe-area-inset-bottom, 0px))',
      }}
    >
      {tabs.map((tab) => (
        <NavLink
          key={tab.id}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) =>
            `flex min-w-0 flex-1 flex-col items-center gap-1 px-1 ${
              isActive ? 'text-primary' : 'text-on-surface/50'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <MaterialIcon name={tab.icon} filled={isActive} />
              <span className="max-w-full truncate text-[9px] font-bold uppercase tracking-widest sm:text-[10px]">
                {t(`nav.${tab.id}`)}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
