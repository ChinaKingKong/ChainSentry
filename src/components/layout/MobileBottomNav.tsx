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
      className="fixed left-0 right-0 z-50 flex items-center justify-around px-1 py-1 md:hidden"
      style={{
        bottom: 'env(safe-area-inset-bottom, 0px)',
        backgroundColor: '#D4D0C8',
        borderTop: '2px solid #FFFFFF',
        boxShadow: '0 -2px 0 #808080',
      }}
    >
      {tabs.map((tab) => (
        <NavLink
          key={tab.id}
          to={tab.to}
          end={tab.end}
          className="flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-1"
          style={({ isActive }) => ({
            backgroundColor: isActive ? '#000080' : 'transparent',
            color: isActive ? '#FFFFFF' : '#000000',
          })}
        >
          {({ isActive }) => (
            <>
              <MaterialIcon name={tab.icon} filled={isActive} />
              <span className="max-w-full truncate" style={{ fontSize: '9px', fontWeight: 'bold' }}>
                {t(`nav.${tab.id}`)}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
