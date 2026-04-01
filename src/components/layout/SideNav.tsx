import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MaterialIcon } from '../ui/MaterialIcon';

export type SideNavTab = 'command' | 'tokens' | 'whales' | 'sentry';

const items: {
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

export type SideNavProps = {
  nodeActive: boolean;
  slotDisplay: string;
};

export function SideNav({ nodeActive, slotDisplay }: SideNavProps) {
  const { t } = useTranslation();

  return (
    <aside
      className="hidden h-full min-h-0 w-48 shrink-0 flex-col pb-2 pt-0 md:flex overflow-y-auto"
      style={{
        backgroundColor: '#D4D0C8',
        borderRight: '2px solid #808080',
        borderRightColor: '#808080',
      }}
    >
      {/* Explorer-style nav panel title */}
      <div
        className="win-titlebar mb-0 shrink-0 text-[11px]"
        style={{ fontSize: '11px', padding: '3px 8px' }}
      >
        <MaterialIcon name="folder_open" />
        <span>Navigation</span>
      </div>

      {/* Nav items — Windows Explorer left-panel style */}
      <nav className="flex-1 py-1">
        {items.map((item) => (
          <NavLink
            key={item.id}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              [
                'flex w-full items-center gap-2 px-3 py-1.5 text-[11px] cursor-pointer select-none',
                isActive
                  ? 'text-on-primary'
                  : 'text-on-surface hover:text-on-primary',
              ].join(' ')
            }
            style={({ isActive }) => ({
              backgroundColor: isActive ? '#000080' : 'transparent',
              color: isActive ? '#FFFFFF' : '#000000',
            })}
          >
            {({ isActive }) => (
              <>
                <MaterialIcon
                  name={item.icon}
                  className="shrink-0"
                  filled={isActive}
                />
                <span>{t(`nav.${item.id}`)}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Separator */}
      <div
        style={{
          height: '2px',
          backgroundColor: '#808080',
          borderBottom: '1px solid #FFFFFF',
          margin: '4px 4px',
        }}
      />

      {/* Node status group box */}
      <div className="mx-2 mb-2 shrink-0">
        {/* Group box label */}
        <div
          className="relative mb-1 text-[10px] font-bold text-on-surface px-1"
          style={{ color: '#000080' }}
        >
          {t('sideNav.nodeStatus')}
        </div>
        <div
          className="win-groupbox text-[11px] space-y-1"
          style={{ padding: '6px 8px' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-on-surface/80">{t('sideNav.solanaMainnet')}</span>
            <span
              className="font-bold"
              style={{ color: nodeActive ? '#008000' : '#CC0000' }}
            >
              {nodeActive ? t('sideNav.active') : t('sideNav.down')}
            </span>
          </div>
          <div className="truncate text-[10px]" style={{ color: '#444444' }}>
            {t('sideNav.slot', { value: slotDisplay })}
          </div>
          <button
            type="button"
            className="win-btn w-full mt-1 text-[10px] py-1"
          >
            {t('sideNav.upgradeNode')}
          </button>
        </div>
      </div>

      {/* Links */}
      <div
        className="mx-2 pt-2 space-y-1"
        style={{ borderTop: '1px solid #808080', borderTopColor: '#808080' }}
      >
        <a
          className="flex items-center gap-2 text-[11px] text-primary hover:underline cursor-pointer"
          href="https://docs.solana.com/"
          target="_blank"
          rel="noreferrer"
        >
          <MaterialIcon name="menu_book" />
          {t('sideNav.docs')}
        </a>
        <a
          className="flex items-center gap-2 text-[11px] text-primary hover:underline cursor-pointer"
          href="https://helius.dev/"
          target="_blank"
          rel="noreferrer"
        >
          <MaterialIcon name="contact_support" />
          {t('sideNav.support')}
        </a>
      </div>
    </aside>
  );
}
